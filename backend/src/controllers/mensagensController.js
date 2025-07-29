import mensagensRepository from "../repositories/mensagensRepository.js";
import solicitacoesRepository from "../repositories/solicitacoesRepository.js";
import { Server } from 'socket.io'; // Importar Server do socket.io

// A instância do io precisa ser passada para o controller.
// Uma forma comum é exportar uma função que inicializa o controller com o io.
let ioInstance;

const mensagensController = {
    // Método para injetar a instância do Socket.IO
    setIoInstance: (io) => {
        ioInstance = io;
    },

    /**
     * @description Envia uma nova mensagem para uma solicitação de serviço.
     * Esta rota será chamada via HTTP (REST) e também emitirá a mensagem via Socket.IO.
     * @param {Object} req - Objeto de requisição (body: { solicitacao_id, conteudo, foto_url }).
     * @param {Object} res - Objeto de resposta.
     */
    sendMensagem: async (req, res) => {
        const { solicitacao_id, conteudo, foto_url } = req.body;
        const remetente_id = req.user.id; // ID do usuário logado (cliente ou prestador)
        const remetente_tipo = req.user.tipo; // Tipo do usuário logado ('cliente' ou 'prestador')

        const erros = [];
        if (!solicitacao_id || isNaN(parseInt(solicitacao_id))) {
            erros.push("ID da solicitação é obrigatório e deve ser um número.");
        }
        if (!conteudo && !foto_url) {
            erros.push("Conteúdo ou URL da foto é obrigatório.");
        }
        if (conteudo && conteudo.trim().length === 0 && !foto_url) {
            erros.push("Conteúdo não pode ser vazio se não houver foto.");
        }

        if (erros.length > 0) {
            return res.status(400).json({ status: 400, ok: false, message: erros });
        }

        try {
            // 1. Validar se a solicitação existe e obter os IDs dos participantes
            const solicitacaoResult = await solicitacoesRepository.getById(solicitacao_id);
            if (!solicitacaoResult.ok || !solicitacaoResult.data) {
                return res.status(404).json({ status: 404, ok: false, message: "Solicitação de serviço não encontrada." });
            }
            const solicitacao = solicitacaoResult.data;

            // Determinar o destinatário da mensagem
            let destinatario_id;
            let destinatario_tipo;

            if (remetente_tipo === 'cliente' && solicitacao.prestador_id_aceito) {
                destinatario_id = solicitacao.prestador_id_aceito;
                destinatario_tipo = 'prestador';
            } else if (remetente_tipo === 'prestador' && solicitacao.cliente_id) {
                destinatario_id = solicitacao.cliente_id;
                destinatario_tipo = 'cliente';
            } else {
                return res.status(400).json({ status: 400, ok: false, message: "Não foi possível determinar o destinatário da mensagem. Verifique se a solicitação tem um prestador aceito." });
            }

            // 2. Criar a mensagem no banco de dados
            const mensagemObj = {
                solicitacao_id: solicitacao_id,
                remetente_id: remetente_id,
                remetente_tipo: remetente_tipo,
                destinatario_id: destinatario_id,
                destinatario_tipo: destinatario_tipo,
                conteudo: conteudo,
                foto_url: foto_url
            };

            const result = await mensagensRepository.createMensagem(mensagemObj);

            if (result.ok) {
                // 3. Emitir a mensagem via Socket.IO para a sala da solicitação
                if (ioInstance) {
                    const messageData = {
                        ...result.data, // Dados da mensagem salva no DB
                        remetente_nome: req.user.nome, // Adiciona o nome do remetente para exibição no frontend
                        // Você pode adicionar mais dados do remetente/destinatário aqui se precisar
                    };
                    ioInstance.to(solicitacao_id.toString()).emit('message', messageData);
                    console.log(`[Socket.IO] Mensagem emitida para sala ${solicitacao_id}:`, messageData);
                } else {
                    console.warn("[Socket.IO] Instância do Socket.IO não disponível no controller. Mensagem não emitida em tempo real.");
                }
                res.status(result.status).json(result);
            } else {
                res.status(result.status).json(result);
            }

        } catch (error) {
            console.error("Erro no controller ao enviar mensagem:", error);
            res.status(500).json({ status: 500, ok: false, message: "Erro interno do servidor ao enviar mensagem." });
        }
    },

    /**
     * @description Obtém todas as mensagens para uma solicitação de serviço específica.
     * @param {Object} req - Objeto de requisição (params: { solicitacao_id }).
     * @param {Object} res - Objeto de resposta.
     */
    getMensagensBySolicitacao: async (req, res) => {
        const solicitacao_id = parseInt(req.params.solicitacao_id);
        const user_id = req.user.id;
        const user_tipo = req.user.tipo;

        if (isNaN(solicitacao_id)) {
            return res.status(400).json({ status: 400, ok: false, message: "ID da solicitação inválido." });
        }

        try {
            // 1. Validar se o usuário logado pertence a esta solicitação
            const solicitacaoResult = await solicitacoesRepository.getById(solicitacao_id);
            if (!solicitacaoResult.ok || !solicitacaoResult.data) {
                return res.status(404).json({ status: 404, ok: false, message: "Solicitação de serviço não encontrada." });
            }
            const solicitacao = solicitacaoResult.data;

            if (user_tipo === 'cliente' && solicitacao.cliente_id !== user_id) {
                return res.status(403).json({ status: 403, ok: false, message: "Acesso negado: Você não é o cliente desta solicitação." });
            }
            if (user_tipo === 'prestador' && solicitacao.prestador_id_aceito !== user_id) {
                return res.status(403).json({ status: 403, ok: false, message: "Acesso negado: Você não é o prestador desta solicitação." });
            }

            // 2. Obter as mensagens do banco de dados
            const result = await mensagensRepository.getMensagensBySolicitacaoId(solicitacao_id);

            if (result.ok) {
                // 3. Marcar as mensagens como lidas para o usuário que está buscando
                await mensagensRepository.markMessagesAsRead(solicitacao_id, user_id, user_tipo);
                res.status(result.status).json(result);
            } else {
                res.status(result.status).json(result);
            }

        } catch (error) {
            console.error("Erro no controller ao obter mensagens por solicitação:", error);
            res.status(500).json({ status: 500, ok: false, message: "Erro interno do servidor ao obter mensagens." });
        }
    }
};

export default mensagensController;
