import servicosOferecidosRepository from "../repositories/servicosOferecidosRepository.js";
import prestadoresRepository from "../repositories/prestadoresRepository.js"; // Pode ser útil para futuras validações, mas não essencial aqui
import categoriasRepository from "../repositories/categoriasRepository.js";

const servicosOferecidosControllers = {
    /**
     * @description Cria um novo serviço oferecido por um prestador.
     * Requer autenticação de prestador, e o prestador_id é obtido do token JWT.
     * @param {Object} req - Objeto de requisição (body: { categoria_id, titulo, descricao, valor_estimado, disponibilidade }).
     * @param {Object} res - Objeto de resposta.
     */
    createServicoOferecido: async (req, res) => {
        // O ID do prestador logado é obtido do JWT, não do corpo da requisição
        const prestador_id = req.user.id;
        const prestador_tipo = req.user.tipo;

        // Apenas prestadores podem criar serviços
        if (prestador_tipo !== 'prestador') {
            return res.status(403).json({ status: 403, ok: false, message: "Acesso negado: Apenas prestadores podem criar serviços oferecidos." });
        }

        const { categoria_id, titulo, descricao, valor_estimado, disponibilidade } = req.body;

        const erros = [];
        if (!categoria_id || isNaN(parseInt(categoria_id))) {
            erros.push("ID da categoria é obrigatório e deve ser um número.");
        }
        if (!titulo || titulo.trim().length < 3 || titulo.trim().length > 100) {
            erros.push("Título do serviço é obrigatório e deve ter entre 3 e 100 caracteres.");
        }
        if (descricao && descricao.trim().length > 1000) {
            erros.push("Descrição do serviço não pode exceder 1000 caracteres.");
        }
        // Permite valor_estimado ser opcional (undefined) ou um número positivo
        if (valor_estimado !== undefined && (isNaN(parseFloat(valor_estimado)) || parseFloat(valor_estimado) <= 0)) {
            erros.push("Valor estimado deve ser um número positivo.");
        }
        // Validação da disponibilidade: deve ser um dos valores permitidos
        if (disponibilidade && !['disponivel', 'ocupado', 'ausente'].includes(disponibilidade.toLowerCase())) {
            erros.push("Disponibilidade inválida. Use 'disponivel', 'ocupado' ou 'ausente'.");
        }

        if (erros.length > 0) {
            return res.status(400).json({ status: 400, ok: false, message: erros });
        }

        try {
            // Verificar se a categoria existe
            const categoriaResult = await categoriasRepository.getById(categoria_id);
            if (!categoriaResult.ok || !categoriaResult.data) {
                return res.status(404).json({ status: 404, ok: false, message: "Categoria não encontrada." });
            }

            const novoServico = {
                prestador_id: prestador_id, // ID do prestador vem do JWT, não do body
                categoria_id: parseInt(categoria_id),
                titulo: titulo.trim(),
                descricao: descricao ? descricao.trim() : null,
                valor_estimado: valor_estimado !== undefined ? parseFloat(valor_estimado) : null,
                disponibilidade: disponibilidade ? disponibilidade.toLowerCase() : 'disponivel' // Define padrão se não fornecido
            };

            const result = await servicosOferecidosRepository.create(novoServico);
            res.status(result.status).json(result);
        } catch (error) {
            console.error("Erro no controller ao criar serviço oferecido:", error);
            res.status(500).json({ status: 500, ok: false, message: "Erro interno do servidor ao criar serviço oferecido." });
        }
    },

    /**
     * @description Obtém um serviço oferecido por ID.
     * Esta rota é pública.
     * @param {Object} req - Objeto de requisição (params: { id }).
     * @param {Object} res - Objeto de resposta.
     */
    getServicoOferecidoById: async (req, res) => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ status: 400, ok: false, message: "ID do serviço oferecido inválido." });
        }

        try {
            const result = await servicosOferecidosRepository.getById(id);
            res.status(result.status).json(result);
        } catch (error) {
            console.error("Erro no controller ao obter serviço oferecido por ID:", error);
            res.status(500).json({ status: 500, ok: false, message: "Erro interno do servidor ao obter serviço oferecido." });
        }
    },

    /**
     * @description Obtém todos os serviços oferecidos, com filtros opcionais.
     * Esta rota é pública.
     * Pode ser filtrado por prestador_id, categoria_id, status ativo e título.
     * @param {Object} req - Objeto de requisição (query: { prestador_id, categoria_id, ativo, titulo, disponibilidade }).
     * @param {Object} res - Objeto de resposta.
     */
    getAllServicosOferecidos: async (req, res) => {
        const filtros = {};
        if (req.query.prestador_id) {
            const prestador_id = parseInt(req.query.prestador_id);
            if (isNaN(prestador_id)) {
                return res.status(400).json({ status: 400, ok: false, message: "ID do prestador inválido." });
            }
            filtros.prestador_id = prestador_id;
        }
        if (req.query.categoria_id) {
            const categoria_id = parseInt(req.query.categoria_id);
            if (isNaN(categoria_id)) {
                return res.status(400).json({ status: 400, ok: false, message: "ID da categoria inválido." });
            }
            filtros.categoria_id = categoria_id;
        }
        if (req.query.ativo !== undefined) {
            filtros.ativo = req.query.ativo === 'true'; // Converte string 'true'/'false' para boolean
        }
        if (req.query.titulo) {
            filtros.titulo = req.query.titulo;
        }
        if (req.query.disponibilidade) {
            filtros.disponibilidade = req.query.disponibilidade.toLowerCase();
        }

        try {
            const result = await servicosOferecidosRepository.getAll(filtros);
            res.status(result.status).json(result);
        } catch (error) {
            console.error("Erro no controller ao obter todos os serviços oferecidos:", error);
            res.status(500).json({ status: 500, ok: false, message: "Erro interno do servidor ao obter serviços oferecidos." });
        }
    },

    /**
     * @description Atualiza um serviço oferecido.
     * Apenas o prestador que criou o serviço pode atualizá-lo.
     * O prestador_id é obtido do token JWT para autorização.
     * @param {Object} req - Objeto de requisição (params: { id }, body: { titulo, descricao, valor_estimado, ativo, disponibilidade }).
     * @param {Object} res - Objeto de resposta.
     */
    updateServicoOferecido: async (req, res) => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ status: 400, ok: false, message: "ID do serviço oferecido inválido." });
        }

        const prestador_id_logado = req.user.id; // ID do prestador logado (do JWT)
        const prestador_tipo_logado = req.user.tipo;

        // Apenas prestadores podem atualizar serviços
        if (prestador_tipo_logado !== 'prestador') {
            return res.status(403).json({ status: 403, ok: false, message: "Acesso negado: Apenas prestadores podem atualizar serviços oferecidos." });
        }

        const { titulo, descricao, valor_estimado, ativo, disponibilidade } = req.body;

        const erros = [];
        if (titulo && (titulo.trim().length < 3 || titulo.trim().length > 100)) {
            erros.push("Título do serviço deve ter entre 3 e 100 caracteres.");
        }
        if (descricao && descricao.trim().length > 1000) {
            erros.push("Descrição do serviço não pode exceder 1000 caracteres.");
        }
        if (valor_estimado !== undefined && (isNaN(parseFloat(valor_estimado)) || parseFloat(valor_estimado) <= 0)) {
            erros.push("Valor estimado deve ser um número positivo.");
        }
        if (ativo !== undefined && typeof ativo !== 'boolean') {
            erros.push("Ativo deve ser um valor booleano (true/false).");
        }
        // Validação da disponibilidade: deve ser um dos valores permitidos
        if (disponibilidade && !['disponivel', 'ocupado', 'ausente'].includes(disponibilidade.toLowerCase())) {
            erros.push("Disponibilidade inválida. Use 'disponivel', 'ocupado' ou 'ausente'.");
        }

        if (erros.length > 0) {
            return res.status(400).json({ status: 400, ok: false, message: erros });
        }

        try {
            // Verificar se o serviço existe e se pertence ao prestador logado
            const servicoResult = await servicosOferecidosRepository.getById(id);
            if (!servicoResult.ok || !servicoResult.data) {
                return res.status(servicoResult.status).json(servicoResult);
            }
            const servico = servicoResult.data;

            // Autorização: O serviço deve pertencer ao prestador logado
            if (servico.prestador_id !== prestador_id_logado) {
                return res.status(403).json({ status: 403, ok: false, message: "Acesso negado: Você não tem permissão para atualizar este serviço." });
            }

            const updatedData = {};
            if (titulo !== undefined) updatedData.titulo = titulo.trim();
            if (descricao !== undefined) updatedData.descricao = descricao ? descricao.trim() : null;
            if (valor_estimado !== undefined) updatedData.valor_estimado = parseFloat(valor_estimado);
            if (ativo !== undefined) updatedData.ativo = ativo;
            if (disponibilidade !== undefined) updatedData.disponibilidade = disponibilidade.toLowerCase();

            const result = await servicosOferecidosRepository.update(id, updatedData);
            res.status(result.status).json(result);
        } catch (error) {
            console.error("Erro no controller ao atualizar serviço oferecido:", error);
            res.status(500).json({ status: 500, ok: false, message: "Erro interno do servidor ao atualizar serviço oferecido." });
        }
    },

    /**
     * @description Deleta um serviço oferecido.
     * Apenas o prestador que criou o serviço pode deletá-lo.
     * O prestador_id é obtido do token JWT para autorização.
     * @param {Object} req - Objeto de requisição (params: { id }).
     * @param {Object} res - Objeto de resposta.
     */
    deleteServicoOferecido: async (req, res) => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ status: 400, ok: false, message: "ID do serviço oferecido inválido." });
        }

        const prestador_id_logado = req.user.id; // ID do prestador logado (do JWT)
        const prestador_tipo_logado = req.user.tipo;

        // Apenas prestadores podem deletar serviços
        if (prestador_tipo_logado !== 'prestador') {
            return res.status(403).json({ status: 403, ok: false, message: "Acesso negado: Apenas prestadores podem deletar serviços oferecidos." });
        }

        try {
            // Verificar se o serviço existe e se pertence ao prestador logado
            const servicoResult = await servicosOferecidosRepository.getById(id);
            if (!servicoResult.ok || !servicoResult.data) {
                return res.status(servicoResult.status).json(servicoResult);
            }
            const servico = servicoResult.data;

            // Autorização: O serviço deve pertencer ao prestador logado
            if (servico.prestador_id !== prestador_id_logado) {
                return res.status(403).json({ status: 403, ok: false, message: "Acesso negado: Você não tem permissão para deletar este serviço." });
            }

            const result = await servicosOferecidosRepository.delete(id);
            res.status(result.status).json(result);
        } catch (error) {
            console.error("Erro no controller ao deletar serviço oferecido:", error);
            res.status(500).json({ status: 500, ok: false, message: "Erro interno do servidor ao deletar serviço oferecido." });
        }
    }
};

export default servicosOferecidosControllers;
