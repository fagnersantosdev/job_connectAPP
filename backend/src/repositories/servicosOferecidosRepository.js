import conexao from "../database/conexao.js"; // Sua instância do pg-promise

const servicosOferecidosRepository = {
    /**
     * @description Obtém todos os serviços oferecidos, opcionalmente filtrando por ID de prestador ou categoria.
     * @param {Object} filtros - Objeto opcional com filtros (ex: { prestador_id: 1, categoria_id: 2 }).
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Array<Object>|string}>} Objeto de resposta padronizado.
     */
    getAll: async (filtros = {}) => {
        let sql = 'SELECT so.id, so.prestador_id, so.categoria_id, so.titulo, so.descricao, so.valor_estimado, so.disponibilidade, ' +
                  'p.nome AS nome_prestador, p.foto AS foto_prestador, ' + // Dados do prestador
                  'c.nome AS nome_categoria, c.icone_url AS icone_categoria ' + // Dados da categoria
                  'FROM servicos_oferecidos so ' +
                  'JOIN prestadores p ON so.prestador_id = p.id ' +
                  'JOIN categorias_servico c ON so.categoria_id = c.id';
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
        if (filtros.titulo) { // Busca por título (ILIKE para case-insensitive)
            conditions.push(`so.titulo ILIKE $${paramCount++}`);
            params.push(`%${filtros.titulo}%`);
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

    /**
     * @description Obtém um serviço oferecido pelo ID.
     * @param {number} id - O ID do serviço.
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|null|string}>} Objeto de resposta padronizado.
     */
    getById: async (id) => {
        const sql = 'SELECT so.id, so.prestador_id, so.categoria_id, so.titulo, so.descricao, so.valor_estimado, so.disponibilidade, ' +
                    'p.nome AS nome_prestador, p.foto AS foto_prestador, ' +
                    'c.nome AS nome_categoria, c.icone_url AS icone_categoria ' +
                    'FROM servicos_oferecidos so ' +
                    'JOIN prestadores p ON so.prestador_id = p.id ' +
                    'JOIN categorias_servico c ON so.categoria_id = c.id ' +
                    'WHERE so.id=$1;';
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
     * @description Cria um novo serviço oferecido.
     * @param {Object} obj - Objeto contendo os dados do serviço (prestador_id, categoria_id, titulo, descricao, valor_estimado, disponibilidade).
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|string}>} Objeto de resposta padronizado.
     */
    create: async (obj) => {
        const sql = `INSERT INTO servicos_oferecidos (prestador_id, categoria_id, titulo, descricao, valor_estimado, disponibilidade)
                     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`;
        try {
            const newServico = await conexao.one(sql, [
                obj.prestador_id,
                obj.categoria_id,
                obj.titulo,
                obj.descricao,
                obj.valor_estimado,
                obj.disponibilidade
            ]);
            return {
                status: 201, // 201 Created
                ok: true,
                message: 'Serviço oferecido criado com sucesso',
                data: newServico
            };
        } catch (error) {
            console.error('Erro ao criar serviço oferecido:', error);
            // Pode haver erros de FK (prestador_id ou categoria_id inexistente)
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
                message: 'Erro de servidor ao criar serviço oferecido',
                sqlMessage: error.message
            };
        }
    },

    /**
     * @description Atualiza um serviço oferecido existente.
     * @param {number} id - O ID do serviço a ser atualizado.
     * @param {Object} obj - Objeto contendo os dados atualizados do serviço.
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|null|string}>} Objeto de resposta padronizado.
     */
    update: async (id, obj) => {
        const sql = `UPDATE servicos_oferecidos SET
                     prestador_id=$1, categoria_id=$2, titulo=$3, descricao=$4, valor_estimado=$5, disponibilidade=$6,
                     data_atualizacao=CURRENT_TIMESTAMP
                     WHERE id=$7 RETURNING *;`;
        try {
            const updatedServico = await conexao.oneOrNone(sql, [
                obj.prestador_id,
                obj.categoria_id,
                obj.titulo,
                obj.descricao,
                obj.valor_estimado,
                obj.disponibilidade,
                id
            ]);
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
