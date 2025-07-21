import mensagensRepository from "../repositories/mensagensRepository.js";
import solicitacoesRepository from "../repositories/solicitacoesRepository.js";
import clientesRepository from "../repositories/clientesRepository.js";
import prestadoresRepository from "../repositories/prestadoresRepository.js";

const mensagensControllers = {
    /**
     * @description Envia uma nova mensagem. O remetente é o usuário logado.
     * Pode incluir texto e/ou uma foto.
     * @param {Object} req - Objeto de requisição (body: { solicitacao_id, conteudo }, file: imagem).
     * @param {Object} res - Objeto de resposta.
     */
    createMensagem: async (req, res) => {
        const remetente_id = req.user.id; // ID do usuário logado (cliente ou prestador)
        const remetente_tipo = req.user.tipo; // Tipo do usuário logado (cliente ou prestador)
        const { solicitacao_id, conteudo } = req.body;
        const file = req.file; // O arquivo da imagem (se houver, Multer já o salvou)

        const erros = [];
        if (!solicitacao_id || isNaN(parseInt(solicitacao_id))) {
            erros.push("ID da solicitação é obrigatório e deve ser um número.");
        }
        // Validação: Pelo menos um entre conteúdo ou foto deve existir
        if (!conteudo && !file) {
            erros.push("A mensagem deve conter texto ou uma imagem.");
        }
        if (conteudo && conteudo.trim().length > 1000) {
            erros.push("O conteúdo da mensagem não pode exceder 1000 caracteres.");
        }

        if (erros.length > 0) {
            // Se houver erros e um arquivo foi enviado, remova o arquivo para evitar lixo
            if (file) {
                // Importe 'fs' para remover o arquivo
                const fs = await import('fs/promises');
                await fs.unlink(file.path).catch(err => console.error("Erro ao deletar arquivo de upload falho:", err));
            }
            return res.status(400).json({ status: 400, ok: false, message: erros });
        }

        let foto_url = null;
        try {
            // Se houver um arquivo, construa a URL para acesso público
            if (file) {
                // A URL será baseada no caminho onde o Express está servindo arquivos estáticos
                // Ex: http://localhost:3000/uploads/nome-do-arquivo.jpg
                foto_url = `/uploads/${file.filename}`; // O Multer já define file.filename
            }

            // 1. Verificar se a solicitação existe e se o remetente é participante dela
            const solicitacaoResult = await solicitacoesRepository.getById(solicitacao_id);
            if (!solicitacaoResult.ok || !solicitacaoResult.data) {
                // Se a solicitação não for encontrada, remova o arquivo
                if (file) {
                    const fs = await import('fs/promises');
                    await fs.unlink(file.path).catch(err => console.error("Erro ao deletar arquivo de upload falho:", err));
                }
                return res.status(404).json({ status: 404, ok: false, message: "Solicitação de serviço não encontrada." });
            }
            const solicitacao = solicitacaoResult.data;

            // Determinar o destinatário da mensagem
            let destinatario_id;
            let destinatario_tipo;

            if (remetente_tipo === 'cliente') {
                // Se o remetente é cliente, o destinatário deve ser o prestador aceito na solicitação
                if (!solicitacao.prestador_id_aceito) {
                    if (file) {
                        const fs = await import('fs/promises');
                        await fs.unlink(file.path).catch(err => console.error("Erro ao deletar arquivo de upload falho:", err));
                    }
                    return res.status(400).json({ status: 400, ok: false, message: "Não é possível enviar mensagem: esta solicitação ainda não foi aceita por um prestador." });
                }
                destinatario_id = solicitacao.prestador_id_aceito;
                destinatario_tipo = 'prestador';
            } else if (remetente_tipo === 'prestador') {
                // Se o remetente é prestador, o destinatário deve ser o cliente da solicitação
                destinatario_id = solicitacao.cliente_id;
                destinatario_tipo = 'cliente';
            } else {
                if (file) {
                    const fs = await import('fs/promises');
                    await fs.unlink(file.path).catch(err => console.error("Erro ao deletar arquivo de upload falho:", err));
                }
                return res.status(400).json({ status: 400, ok: false, message: "Tipo de remetente inválido." });
            }

            // Validação de que o remetente é um participante válido da conversa
            const isParticipant =
                (remetente_tipo === 'cliente' && solicitacao.cliente_id === remetente_id) ||
                (remetente_tipo === 'prestador' && solicitacao.prestador_id_aceito === remetente_id);

            if (!isParticipant) {
                if (file) {
                    const fs = await import('fs/promises');
                    await fs.unlink(file.path).catch(err => console.error("Erro ao deletar arquivo de upload falho:", err));
                }
                return res.status(403).json({ status: 403, ok: false, message: "Acesso negado: Você não é participante desta solicitação." });
            }

            const newMensagem = {
                solicitacao_id: parseInt(solicitacao_id),
                remetente_id: remetente_id,
                remetente_tipo: remetente_tipo,
                destinatario_id: destinatario_id,
                destinatario_tipo: destinatario_tipo,
                conteudo: conteudo ? conteudo.trim() : null, // Conteúdo pode ser nulo se for só foto
                foto_url: foto_url // Passa a URL da foto local
            };

            const result = await mensagensRepository.create(newMensagem);
            res.status(result.status).json(result);
        } catch (error) {
            console.error("Erro no controller ao criar mensagem:", error);
            // Se o erro ocorreu após o upload, remova o arquivo
            if (file && file.path) {
                const fs = await import('fs/promises');
                await fs.unlink(file.path).catch(err => console.error("Erro ao deletar arquivo de upload falho:", err));
            }
            res.status(500).json({ status: 500, ok: false, message: "Erro interno do servidor ao criar mensagem ou fazer upload da foto." });
        }
    },

    /**
     * @description Obtém todas as mensagens para uma solicitação específica.
     * Apenas participantes da solicitação podem ver as mensagens.
     * @param {Object} req - Objeto de requisição (params: { solicitacao_id }).
     * @param {Object} res - Objeto de resposta.
     */
    getMensagensBySolicitacao: async (req, res) => {
        const solicitacao_id = parseInt(req.params.solicitacao_id);
        if (isNaN(solicitacao_id)) {
            return res.status(400).json({ status: 400, ok: false, message: "ID da solicitação inválido." });
        }

        const userId = req.user.id;
        const userTipo = req.user.tipo;

        try {
            // 1. Verificar se a solicitação existe
            const solicitacaoResult = await solicitacoesRepository.getById(solicitacao_id);
            if (!solicitacaoResult.ok || !solicitacaoResult.data) {
                return res.status(404).json({ status: 404, ok: false, message: "Solicitação de serviço não encontrada." });
            }
            const solicitacao = solicitacaoResult.data;

            // 2. Verificar se o usuário logado é participante da solicitação
            const isParticipant =
                (userTipo === 'cliente' && solicitacao.cliente_id === userId) ||
                (userTipo === 'prestador' && solicitacao.prestador_id_aceito === userId);

            if (!isParticipant) {
                return res.status(403).json({ status: 403, ok: false, message: "Acesso negado: Você não é participante desta solicitação." });
            }

            const result = await mensagensRepository.getAll({ solicitacao_id: solicitacao_id });
            res.status(result.status).json(result);
        } catch (error) {
            console.error("Erro no controller ao obter mensagens por solicitação:", error);
            res.status(500).json({ status: 500, ok: false, message: "Erro interno do servidor ao obter mensagens." });
        }
    },

    /**
     * @description Marca uma mensagem como lida.
     * @param {Object} req - Objeto de requisição (params: { id }).
     * @param {Object} res - Objeto de resposta.
     */
    markMensagemAsRead: async (req, res) => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ status: 400, ok: false, message: "ID da mensagem inválido." });
        }

        const userId = req.user.id;
        const userTipo = req.user.tipo;

        try {
            const mensagemResult = await mensagensRepository.getById(id);
            if (!mensagemResult.ok || !mensagemResult.data) {
                return res.status(mensagemResult.status).json(mensagemResult);
            }
            const mensagem = mensagemResult.data;

            // Apenas o destinatário da mensagem pode marcá-la como lida
            if (mensagem.destinatario_id !== userId || mensagem.destinatario_tipo !== userTipo) {
                return res.status(403).json({ status: 403, ok: false, message: "Acesso negado: Você não é o destinatário desta mensagem." });
            }

            const result = await mensagensRepository.markAsRead(id);
            res.status(result.status).json(result);
        } catch (error) {
            console.error("Erro no controller ao marcar mensagem como lida:", error);
            res.status(500).json({ status: 500, ok: false, message: "Erro interno do servidor ao marcar mensagem como lida." });
        }
    },

    /**
     * @description Deleta uma mensagem. Apenas o remetente pode deletar.
     * @param {Object} req - Objeto de requisição (params: { id }).
     * @param {Object} res - Objeto de resposta.
     */
    deleteMensagem: async (req, res) => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ status: 400, ok: false, message: "ID da mensagem inválido." });
        }

        const userId = req.user.id;
        const userTipo = req.user.tipo;

        try {
            const mensagemResult = await mensagensRepository.getById(id);
            if (!mensagemResult.ok || !mensagemResult.data) {
                return res.status(mensagemResult.status).json(mensagemResult);
            }
            const mensagem = mensagemResult.data;

            // Apenas o remetente da mensagem pode deletá-la
            if (mensagem.remetente_id !== userId || mensagem.remetente_tipo !== userTipo) {
                return res.status(403).json({ status: 403, ok: false, message: "Acesso negado: Você não tem permissão para deletar esta mensagem." });
            }

            const result = await mensagensRepository.delete(id);
            // Se a mensagem deletada tinha uma foto, remova o arquivo do disco
            if (result.ok && mensagem.foto_url) {
                const fs = await import('fs/promises');
                // Extrai o nome do arquivo da URL para deletar
                const filename = path.basename(mensagem.foto_url);
                const filePath = path.join(path.resolve(__dirname, '../../'), 'uploads', filename);
                await fs.unlink(filePath).catch(err => console.error("Erro ao deletar arquivo de foto:", err));
            }
            res.status(result.status).json(result);
        } catch (error) {
            console.error("Erro no controller ao deletar mensagem:", error);
            res.status(500).json({ status: 500, ok: false, message: "Erro interno do servidor ao deletar mensagem." });
        }
    }
};

export default mensagensControllers;
