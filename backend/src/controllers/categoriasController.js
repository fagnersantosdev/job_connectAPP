import categoriasRepository from "../repositories/categoriasRepository.js";

const categoriasController = {
    /**
     * @description Obtém todas as categorias de serviço.
     * @param {Object} req - Objeto de requisição.
     * @param {Object} res - Objeto de resposta.
     */
    getAllCategorias: async (req, res) => {
        const result = await categoriasRepository.getAll();
        res.status(result.status).json(result); // O repositório já retorna o objeto de resposta completo
    },

    /**
     * @description Obtém uma categoria de serviço pelo ID.
     * @param {Object} req - Objeto de requisição.
     * @param {Object} res - Objeto de resposta.
     */
    getCategoriasById: async (req, res) => {
        const id = parseInt(req.params.id); // Converte o ID para número inteiro
        if (isNaN(id)) {
            return res.status(400).json({
                status: 400,
                ok: false,
                message: "ID da categoria inválido."
            });
        }

        const result = await categoriasRepository.getById(id);
        res.status(result.status).json(result);
    },

    /**
     * @description Cria uma nova categoria de serviço.
     * @param {Object} req - Objeto de requisição (body: { nome, icone_url }).
     * @param {Object} res - Objeto de resposta.
     */
    createCategorias: async (req, res) => {
        const { nome, icone_url } = req.body;

        // Validações básicas
        const erros = [];
        if (!nome || nome.trim().length === 0) {
            erros.push("O nome da categoria é obrigatório.");
        }
        if (nome && (nome.length < 3 || nome.length > 100)) {
            erros.push("O nome da categoria deve ter entre 3 e 100 caracteres.");
        }
        // Validação simples de URL para icone_url, se fornecido
        if (icone_url && !/^https?:\/\/.+\..+/.test(icone_url)) {
            erros.push("A URL do ícone é inválida.");
        }

        if (erros.length > 0) {
            return res.status(400).json({
                status: 400,
                ok: false,
                message: erros
            });
        }

        try {
            const newCategoria = { nome: nome.trim(), icone_url: icone_url || null }; // Trim no nome e null se icone_url for vazio
            const result = await categoriasRepository.create(newCategoria);
            res.status(result.status).json(result);
        } catch (error) {
            console.error("Erro no controller ao criar categoria:", error);
            res.status(500).json({
                status: 500,
                ok: false,
                message: "Erro interno do servidor ao criar categoria."
            });
        }
    },

    /**
     * @description Atualiza uma categoria de serviço existente.
     * @param {Object} req - Objeto de requisição (params: { id }, body: { nome, icone_url }).
     * @param {Object} res - Objeto de resposta.
     */
    updateCategorias: async (req, res) => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                status: 400,
                ok: false,
                message: "ID da categoria inválido."
            });
        }

        const { nome, icone_url } = req.body;

        // Validações básicas
        const erros = [];
        if (!nome || nome.trim().length === 0) {
            erros.push("O nome da categoria é obrigatório.");
        }
        if (nome && (nome.length < 3 || nome.length > 100)) {
            erros.push("O nome da categoria deve ter entre 3 e 100 caracteres.");
        }
        if (icone_url && !/^https?:\/\/.+\..+/.test(icone_url)) {
            erros.push("A URL do ícone é inválida.");
        }

        if (erros.length > 0) {
            return res.status(400).json({
                status: 400,
                ok: false,
                message: erros
            });
        }

        try {
            const updatedData = { nome: nome.trim(), icone_url: icone_url || null };
            const result = await categoriasRepository.update(id, updatedData);
            res.status(result.status).json(result);
        } catch (error) {
            console.error("Erro no controller ao atualizar categoria:", error);
            res.status(500).json({
                status: 500,
                ok: false,
                message: "Erro interno do servidor ao atualizar categoria."
            });
        }
    },

    /**
     * @description Deleta uma categoria de serviço.
     * @param {Object} req - Objeto de requisição (params: { id }).
     * @param {Object} res - Objeto de resposta.
     */
    deleteCategorias: async (req, res) => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                status: 400,
                ok: false,
                message: "ID da categoria inválido."
            });
        }

        const result = await categoriasRepository.delete(id);
        res.status(result.status).json(result);
    }
};

export default categoriasController;
