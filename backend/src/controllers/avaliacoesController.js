import avaliacoesRepository from "../repositories/avaliacoesRepository.js";
import solicitacoesRepository from "../repositories/solicitacoesRepository.js"; // Para verificar o status da solicitação

const avaliacoesController = {
    /**
     * @description Cria uma nova avaliação. Apenas clientes podem avaliar serviços que foram concluídos.
     * @param {Object} req - Objeto de requisição (body: { solicitacao_id, nota, comentario }).
     * @param {Object} res - Objeto de resposta.
     */
    createAvaliacao: async (req, res) => {
        const cliente_id = req.user.id; // ID do cliente logado (do JWT)
        const { solicitacao_id, nota, comentario } = req.body;

        const erros = [];
        if (!solicitacao_id || isNaN(parseInt(solicitacao_id))) {
            erros.push("ID da solicitação é obrigatório e deve ser um número.");
        }
        if (nota === undefined || isNaN(parseInt(nota)) || parseInt(nota) < 1 || parseInt(nota) > 5) {
            erros.push("A nota é obrigatória e deve ser um número entre 1 e 5.");
        }
        if (comentario && comentario.trim().length > 1000) {
            erros.push("O comentário não pode exceder 1000 caracteres.");
        }

        if (erros.length > 0) {
            return res.status(400).json({ status: 400, ok: false, message: erros });
        }

        try {
            // 1. Verificar se a solicitação existe e se está concluída
            const solicitacaoResult = await solicitacoesRepository.getById(solicitacao_id);
            if (!solicitacaoResult.ok || !solicitacaoResult.data) {
                return res.status(404).json({ status: 404, ok: false, message: "Solicitação de serviço não encontrada." });
            }
            const solicitacao = solicitacaoResult.data;

            // 2. Verificar se o cliente logado é o cliente da solicitação
            if (solicitacao.cliente_id !== cliente_id) {
                return res.status(403).json({ status: 403, ok: false, message: "Acesso negado: Você não é o cliente desta solicitação." });
            }

            // 3. Verificar se a solicitação está no status 'concluida'
            if (solicitacao.status !== 'concluida') {
                return res.status(400).json({ status: 400, ok: false, message: "Só é possível avaliar serviços com status 'concluida'." });
            }

            // 4. Verificar se a solicitação já foi avaliada (a restrição UNIQUE no banco também fará isso, mas é bom ter uma checagem prévia)
            const existingAvaliacao = await avaliacoesRepository.getAll({ solicitacao_id: solicitacao_id });
            if (existingAvaliacao.ok && existingAvaliacao.data.length > 0) {
                return res.status(409).json({ status: 409, ok: false, message: "Esta solicitação já foi avaliada." });
            }

            // O prestador_id_aceito da solicitação é o prestador que será avaliado
            if (!solicitacao.prestador_id_aceito) {
                 return res.status(400).json({ status: 400, ok: false, message: "Não é possível avaliar: esta solicitação ainda não foi aceita por um prestador." });
            }
            const prestador_id = solicitacao.prestador_id_aceito;

            const newAvaliacao = {
                solicitacao_id: parseInt(solicitacao_id),
                cliente_id: cliente_id,
                prestador_id: prestador_id,
                nota: parseInt(nota),
                comentario: comentario ? comentario.trim() : null
            };

            const result = await avaliacoesRepository.create(newAvaliacao);
            res.status(result.status).json(result);
        } catch (error) {
            console.error("Erro no controller ao criar avaliação:", error);
            res.status(500).json({ status: 500, ok: false, message: "Erro interno do servidor ao criar avaliação." });
        }
    },

    /**
     * @description Obtém todas as avaliações, com filtros (por prestador, por cliente).
     * @param {Object} req - Objeto de requisição (query: { prestador_id, cliente_id }).
     * @param {Object} res - Objeto de resposta.
     */
    getAllAvaliacoes: async (req, res) => {
        const filtros = {};
        // Filtros opcionais da query string
        if (req.query.prestador_id) {
            filtros.prestador_id = parseInt(req.query.prestador_id);
            if (isNaN(filtros.prestador_id)) {
                return res.status(400).json({ status: 400, ok: false, message: "ID de prestador inválido." });
            }
        }
        if (req.query.cliente_id) {
            filtros.cliente_id = parseInt(req.query.cliente_id);
            if (isNaN(filtros.cliente_id)) {
                return res.status(400).json({ status: 400, ok: false, message: "ID de cliente inválido." });
            }
        }
        if (req.query.solicitacao_id) {
            filtros.solicitacao_id = parseInt(req.query.solicitacao_id);
            if (isNaN(filtros.solicitacao_id)) {
                return res.status(400).json({ status: 400, ok: false, message: "ID de solicitação inválido." });
            }
        }

        const result = await avaliacoesRepository.getAll(filtros);
        res.status(result.status).json(result);
    },

    /**
     * @description Obtém uma avaliação pelo ID.
     * @param {Object} req - Objeto de requisição (params: { id }).
     * @param {Object} res - Objeto de resposta.
     */
    getAvaliacaoById: async (req, res) => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ status: 400, ok: false, message: "ID da avaliação inválido." });
        }

        const result = await avaliacoesRepository.getById(id);

        // Opcional: Adicionar lógica de autorização se apenas o cliente que avaliou
        // ou o prestador avaliado puderem ver detalhes de uma avaliação específica.
        // Por enquanto, deixaremos público se o ID for conhecido.

        res.status(result.status).json(result);
    },

    /**
     * @description Deleta uma avaliação. Apenas o cliente que a criou pode deletar.
     * @param {Object} req - Objeto de requisição (params: { id }).
     * @param {Object} res - Objeto de resposta.
     */
    deleteAvaliacao: async (req, res) => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ status: 400, ok: false, message: "ID da avaliação inválido." });
        }

        const cliente_id = req.user.id; // ID do cliente logado (do JWT)

        try {
            const avaliacaoResult = await avaliacoesRepository.getById(id);
            if (!avaliacaoResult.ok || !avaliacaoResult.data) {
                return res.status(avaliacaoResult.status).json(avaliacaoResult);
            }
            const avaliacao = avaliacaoResult.data;

            // Verificar se o cliente logado é o autor da avaliação
            if (avaliacao.cliente_id !== cliente_id) {
                return res.status(403).json({ status: 403, ok: false, message: "Acesso negado: Você não tem permissão para deletar esta avaliação." });
            }

            const result = await avaliacoesRepository.delete(id);
            res.status(result.status).json(result);
        } catch (error) {
            console.error("Erro no controller ao deletar avaliação:", error);
            res.status(500).json({ status: 500, ok: false, message: "Erro interno do servidor ao deletar avaliação." });
        }
    }
};

export default avaliacoesController;
