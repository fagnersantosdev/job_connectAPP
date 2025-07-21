import servicosOferecidosRepository from "../repositories/servicosOferecidosRepository.js";

const servicosOferecidosControllers = {
    /**
     * @description Obtém todos os serviços oferecidos. Pode ser filtrado por prestador_id ou categoria_id.
     * @param {Object} req - Objeto de requisição (query: { prestador_id, categoria_id, titulo }).
     * @param {Object} res - Objeto de resposta.
     */
    getAllServicosOferecidos: async (req, res) => {
        const filtros = {};
        if (req.query.prestador_id) {
            filtros.prestador_id = parseInt(req.query.prestador_id);
            if (isNaN(filtros.prestador_id)) {
                return res.status(400).json({ status: 400, ok: false, message: "ID de prestador inválido." });
            }
        }
        if (req.query.categoria_id) {
            filtros.categoria_id = parseInt(req.query.categoria_id);
            if (isNaN(filtros.categoria_id)) {
                return res.status(400).json({ status: 400, ok: false, message: "ID de categoria inválido." });
            }
        }
        if (req.query.titulo) {
            filtros.titulo = req.query.titulo;
        }

        const result = await servicosOferecidosRepository.getAll(filtros);
        res.status(result.status).json(result);
    },

    /**
     * @description Obtém um serviço oferecido pelo ID.
     * @param {Object} req - Objeto de requisição (params: { id }).
     * @param {Object} res - Objeto de resposta.
     */
    getServicoOferecidoById: async (req, res) => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ status: 400, ok: false, message: "ID do serviço inválido." });
        }

        const result = await servicosOferecidosRepository.getById(id);
        res.status(result.status).json(result);
    },

    /**
     * @description Cria um novo serviço oferecido.
     * @param {Object} req - Objeto de requisição (body: { prestador_id, categoria_id, titulo, descricao, valor_estimado, disponibilidade }).
     * @param {Object} res - Objeto de resposta.
     */
    createServicosOferecido: async (req, res) => {
        const { prestador_id, categoria_id, titulo, descricao, valor_estimado, disponibilidade } = req.body;

        const erros = [];
        if (!prestador_id || isNaN(parseInt(prestador_id))) {
            erros.push("ID do prestador é obrigatório e deve ser um número.");
        }
        if (!categoria_id || isNaN(parseInt(categoria_id))) {
            erros.push("ID da categoria é obrigatório e deve ser um número.");
        }
        if (!titulo || titulo.trim().length < 3 || titulo.trim().length > 100) {
            erros.push("O título do serviço é obrigatório e deve ter entre 3 e 100 caracteres.");
        }
        if (descricao && descricao.trim().length > 1000) {
            erros.push("A descrição do serviço não pode exceder 1000 caracteres.");
        }
        if (valor_estimado === undefined || isNaN(parseFloat(valor_estimado)) || parseFloat(valor_estimado) < 0) {
            erros.push("Valor estimado é obrigatório e deve ser um número positivo.");
        }
        if (!disponibilidade || disponibilidade.trim().length === 0) {
            erros.push("A disponibilidade do serviço é obrigatória.");
        }

        if (erros.length > 0) {
            return res.status(400).json({ status: 400, ok: false, message: erros });
        }

        try {
            const newServico = {
                prestador_id: parseInt(prestador_id),
                categoria_id: parseInt(categoria_id),
                titulo: titulo.trim(),
                descricao: descricao ? descricao.trim() : null,
                valor_estimado: parseFloat(valor_estimado),
                disponibilidade: disponibilidade.trim()
            };
            const result = await servicosOferecidosRepository.create(newServico);
            res.status(result.status).json(result);
        } catch (error) {
            console.error("Erro no controller ao criar serviço oferecido:", error);
            res.status(500).json({ status: 500, ok: false, message: "Erro interno do servidor ao criar serviço oferecido." });
        }
    },

    /**
     * @description Atualiza um serviço oferecido existente.
     * @param {Object} req - Objeto de requisição (params: { id }, body: { prestador_id, categoria_id, titulo, descricao, valor_estimado, disponibilidade }).
     * @param {Object} res - Objeto de resposta.
     */
    updateServicosOferecido: async (req, res) => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ status: 400, ok: false, message: "ID do serviço inválido." });
        }

        const { prestador_id, categoria_id, titulo, descricao, valor_estimado, disponibilidade } = req.body;

        const erros = [];
        if (!prestador_id || isNaN(parseInt(prestador_id))) {
            erros.push("ID do prestador é obrigatório e deve ser um número.");
        }
        if (!categoria_id || isNaN(parseInt(categoria_id))) {
            erros.push("ID da categoria é obrigatório e deve ser um número.");
        }
        if (!titulo || titulo.trim().length < 3 || titulo.trim().length > 100) {
            erros.push("O título do serviço é obrigatório e deve ter entre 3 e 100 caracteres.");
        }
        if (descricao && descricao.trim().length > 1000) {
            erros.push("A descrição do serviço não pode exceder 1000 caracteres.");
        }
        if (valor_estimado === undefined || isNaN(parseFloat(valor_estimado)) || parseFloat(valor_estimado) < 0) {
            erros.push("Valor estimado é obrigatório e deve ser um número positivo.");
        }
        if (!disponibilidade || disponibilidade.trim().length === 0) {
            erros.push("A disponibilidade do serviço é obrigatória.");
        }

        if (erros.length > 0) {
            return res.status(400).json({ status: 400, ok: false, message: erros });
        }

        try {
            const updatedData = {
                prestador_id: parseInt(prestador_id),
                categoria_id: parseInt(categoria_id),
                titulo: titulo.trim(),
                descricao: descricao ? descricao.trim() : null,
                valor_estimado: parseFloat(valor_estimado),
                disponibilidade: disponibilidade.trim()
            };
            const result = await servicosOferecidosRepository.update(id, updatedData);
            res.status(result.status).json(result);
        } catch (error) {
            console.error("Erro no controller ao atualizar serviço oferecido:", error);
            res.status(500).json({ status: 500, ok: false, message: "Erro interno do servidor ao atualizar serviço oferecido." });
        }
    },

    /**
     * @description Deleta um serviço oferecido.
     * @param {Object} req - Objeto de requisição (params: { id }).
     * @param {Object} res - Objeto de resposta.
     */
    deleteServicosOferecido: async (req, res) => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ status: 400, ok: false, message: "ID do serviço inválido." });
        }

        const result = await servicosOferecidosRepository.delete(id);
        res.status(result.status).json(result);
    }
};

export default servicosOferecidosControllers;
