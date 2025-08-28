import conexao from "../database/conexao.js"; // Sua instância do pg-promise

const servicosOferecidosRepository = {
    /**
     * @description Cria um novo serviço oferecido por um prestador.
     * @param {Object} obj - Dados do serviço (prestador_id, categoria_id, titulo, descricao, valor_estimado, ativo, disponibilidade).
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|string}>} Objeto de resposta padronizado.
     */
    create: async (obj) => {
        // Incluído 'ativo' no INSERT
        const sql = `INSERT INTO servicos_oferecidos (prestador_id, categoria_id, titulo, descricao, valor_estimado, ativo, disponibilidade)
                         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`;
        try {
            const newServico = await conexao.one(sql, [
                obj.prestador_id,
                obj.categoria_id,
                obj.titulo,
                obj.descricao,
                obj.valor_estimado,
                obj.ativo, // Passando o valor de 'ativo'
                obj.disponibilidade
            ]);
            return {
                status: 201,
                ok: true,
                message: 'Serviço oferecido criado com sucesso',
                data: newServico
            };
        } catch (error) {
            console.error('Erro ao criar serviço oferecido:', error);
            if (error.code === '23503') { // foreign_key_violation (prestador_id ou categoria_id inválida)
                return {
                    status: 400,
                    ok: false,
                    message: 'ID de prestador ou categoria inválido(a).',
                    sqlMessage: error.message
                };
            }
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao criar serviço oferecido',
                sqlMessage: error.message
            };
        }
    },

    /**
     * @description Obtém um serviço oferecido por ID.
     * @param {number} id - O ID do serviço oferecido.
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|null|string}>}
     */
    getById: async (id) => {
        // Incluído 'so.ativo' no SELECT
        const sql = `SELECT so.*, p.nome AS nome_prestador, p.foto AS foto_prestador,
                         c.nome AS nome_categoria, c.icone_url AS icone_categoria
                         FROM servicos_oferecidos so
                         JOIN prestadores p ON so.prestador_id = p.id
                         JOIN categorias_servico c ON so.categoria_id = c.id
                         WHERE so.id = $1;`;
        try {
            const servico = await conexao.oneOrNone(sql, [id]);
            if (servico) {
                return {
                    status: 200,
                    ok: true,
                    message: 'Serviço oferecido encontrado com sucesso',
                    data: servico
                };
            } else {
                return {
                    status: 404,
                    ok: false,
                    message: 'Serviço oferecido não encontrado',
                    data: null
                };
            }
        } catch (error) {
            console.error('Erro ao buscar serviço oferecido por ID:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao buscar serviço oferecido por ID',
                sqlMessage: error.message
            };
        }
    },

    /**
     * @description Obtém todos os serviços oferecidos, com filtros opcionais.
     * @param {Object} filtros - Objeto com filtros (prestador_id, categoria_id, ativo, titulo, disponibilidade).
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Array<Object>|string}>}
     */
    getAll: async (filtros = {}) => {
        // Incluído 'so.ativo' no SELECT
        let sql = `SELECT so.*, p.nome AS nome_prestador, p.foto AS foto_prestador,
                      c.nome AS nome_categoria, c.icone_url AS icone_categoria
                      FROM servicos_oferecidos so
                      JOIN prestadores p ON so.prestador_id = p.id
                      JOIN categorias_servico c ON so.categoria_id = c.id`;
        const params = [];
        const conditions = [];
        let paramCount = 1;

        if (filtros.prestador_id) {
            conditions.push(`so.prestador_id = $${paramCount++}`);
            params.push(filtros.prestador_id);
        }
        if (filtros.categoria_id) {
            conditions.push(`so.categoria_id = $${paramCount++}`);
            params.push(filtros.categoria_id);
        }
        if (filtros.ativo !== undefined) { // Filtro por status 'ativo'
            conditions.push(`so.ativo = $${paramCount++}`);
            params.push(filtros.ativo);
        }
        if (filtros.titulo) { // Busca por título (ILIKE para case-insensitive)
            conditions.push(`so.titulo ILIKE $${paramCount++}`);
            params.push(`%${filtros.titulo}%`);
        }
        if (filtros.disponibilidade) { // Filtro por disponibilidade
            conditions.push(`so.disponibilidade = $${paramCount++}`);
            params.push(filtros.disponibilidade);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        sql += ' ORDER BY so.data_criacao DESC;'; // Ordena pelos mais recentes

        try {
            const list = await conexao.any(sql, params);
            return {
                status: 200,
                ok: true,
                message: 'Lista de serviços oferecidos obtida com sucesso',
                data: list
            };
        } catch (error) {
            console.error('Erro ao buscar serviços oferecidos:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao buscar serviços oferecidos',
                sqlMessage: error.message
            };
        }
    },

    // --- NOVO MÉTODO PARA BUSCAR SUGESTÕES ---
    getSugestoes: async (query) => {
        const sql = `
            SELECT DISTINCT titulo 
            FROM servicos_oferecidos 
            WHERE titulo ILIKE $1 
            LIMIT 5;
        `;
        try {
            const result = await conexao.any(sql, [`${query}%`]);
            const sugestoes = result.map(item => item.titulo);
            return { status: 200, ok: true, data: sugestoes };
        } catch (error) {
            console.error('Erro no repositório ao buscar sugestões:', error);
            return { status: 500, ok: false, message: 'Erro interno do servidor.' };
        }
    },

    /**
     * @description Atualiza um serviço oferecido existente.
     * @param {number} id - O ID do serviço a ser atualizado.
     * @param {Object} obj - Objeto contendo os dados atualizados do serviço.
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|null|string}>} Objeto de resposta padronizado.
     */
    update: async (id, obj) => {
        const fields = [];
        const params = [id]; // O primeiro parâmetro é o ID para o WHERE
        let paramCount = 2; // Começa a contagem para os campos a serem atualizados

        if (obj.prestador_id !== undefined) { // Embora o prestador_id não deva ser alterado via UPDATE, mantido para flexibilidade se necessário
            fields.push(`prestador_id = $${paramCount++}`);
            params.push(obj.prestador_id);
        }
        if (obj.categoria_id !== undefined) {
            fields.push(`categoria_id = $${paramCount++}`);
            params.push(obj.categoria_id);
        }
        if (obj.titulo !== undefined) {
            fields.push(`titulo = $${paramCount++}`);
            params.push(obj.titulo);
        }
        if (obj.descricao !== undefined) {
            fields.push(`descricao = $${paramCount++}`);
            params.push(obj.descricao);
        }
        if (obj.valor_estimado !== undefined) {
            fields.push(`valor_estimado = $${paramCount++}`);
            params.push(obj.valor_estimado);
        }
        if (obj.ativo !== undefined) { // Incluído 'ativo' no UPDATE
            fields.push(`ativo = $${paramCount++}`);
            params.push(obj.ativo);
        }
        if (obj.disponibilidade !== undefined) { // Incluído 'disponibilidade' no UPDATE
            fields.push(`disponibilidade = $${paramCount++}`);
            params.push(obj.disponibilidade);
        }

        if (fields.length === 0) {
            return { status: 400, ok: false, message: "Nenhum campo para atualizar fornecido." };
        }

        // Adiciona data_atualizacao automaticamente
        const sql = `UPDATE servicos_oferecidos SET ${fields.join(', ')}, data_atualizacao = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *;`;

        try {
            const updatedServico = await conexao.oneOrNone(sql, params);
            if (updatedServico) {
                return {
                    status: 200,
                    ok: true,
                    message: 'Serviço oferecido atualizado com sucesso',
                    data: updatedServico
                };
            } else {
                return {
                    status: 404,
                    ok: false,
                    message: 'Serviço oferecido não encontrado para atualização',
                    data: null
                };
            }
        } catch (error) {
            console.error('Erro ao atualizar serviço oferecido:', error);
            if (error.code === '23503') { // foreign_key_violation
                return {
                    status: 400,
                    ok: false,
                    message: 'ID de prestador ou categoria inválido(a).',
                    sqlMessage: error.message
                };
            }
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao atualizar serviço oferecido',
                sqlMessage: error.message
            };
        }
    },

    /**
     * @description Deleta um serviço oferecido.
     * @param {number} id - O ID do serviço a ser deletado.
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|null|string}>} Objeto de resposta padronizado.
     */
    delete: async (id) => {
        const sql = "DELETE FROM servicos_oferecidos WHERE id=$1 RETURNING id;";
        try {
            const deletedRow = await conexao.oneOrNone(sql, [id]);
            if (deletedRow) {
                console.log(`Serviço oferecido com ID ${id} deletado.`);
                return {
                    status: 200,
                    ok: true,
                    message: 'Serviço oferecido deletado com sucesso',
                    data: { id: deletedRow.id }
                };
            } else {
                return {
                    status: 404,
                    ok: false,
                    message: 'Serviço oferecido não encontrado para deletar',
                    data: null
                };
            }
        } catch (error) {
            console.error('Erro ao deletar serviço oferecido:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao deletar serviço oferecido',
                sqlMessage: error.message
            };
        }
    }
};

export default servicosOferecidosRepository;
