import conexao from "../database/conexao.js";

const solicitacoesRepository = {
    /**
     * @description Cria uma nova solicitação de serviço.
     * @param {Object} obj - Dados da solicitação (cliente_id, servico_oferecido_id, data_preferencial, descricao_cliente).
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|string}>}
     */
    create: async (obj) => {
        const sql = `INSERT INTO solicitacoes_servico (cliente_id, servico_oferecido_id, data_preferencial, descricao_cliente)
                     VALUES ($1, $2, $3, $4) RETURNING *;`;
        try {
            const newSolicitacao = await conexao.one(sql, [
                obj.cliente_id,
                obj.servico_oferecido_id,
                obj.data_preferencial,
                obj.descricao_cliente
            ]);
            return {
                status: 201,
                ok: true,
                message: 'Solicitação de serviço criada com sucesso',
                data: newSolicitacao
            };
        } catch (error) {
            console.error('Erro ao criar solicitação de serviço:', error);
            if (error.code === '23503') { // foreign_key_violation
                return {
                    status: 400,
                    ok: false,
                    message: 'ID de cliente ou serviço oferecido inválido(a).',
                    sqlMessage: error.message
                };
            }
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao criar solicitação de serviço',
                sqlMessage: error.message
            };
        }
    },

    /**
     * @description Obtém solicitações de serviço, com filtros por cliente, prestador, status, etc.
     * @param {Object} filtros - Objeto com filtros (cliente_id, prestador_id, status, servico_oferecido_id).
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Array<Object>|string}>}
     */
    getAll: async (filtros = {}) => {
        let sql = 'SELECT ss.id, ss.cliente_id, ss.servico_oferecido_id, ss.data_solicitacao, ss.data_preferencial, ' +
                  'ss.descricao_cliente, ss.status, ss.valor_proposto, ss.prestador_id_aceito, ss.data_aceitacao, ss.data_conclusao, ' +
                  'c.nome AS nome_cliente, c.email AS email_cliente, ' + // Dados do cliente
                  'so.titulo AS titulo_servico, so.descricao AS descricao_servico, ' + // Dados do serviço oferecido
                  'p.nome AS nome_prestador_aceito, p.email AS email_prestador_aceito ' + // Dados do prestador que aceitou
                  'FROM solicitacoes_servico ss ' +
                  'JOIN clientes c ON ss.cliente_id = c.id ' +
                  'JOIN servicos_oferecidos so ON ss.servico_oferecido_id = so.id ' +
                  'LEFT JOIN prestadores p ON ss.prestador_id_aceito = p.id'; // LEFT JOIN pois prestador_id_aceito pode ser NULL

        const params = [];
        const conditions = [];
        let paramCount = 1;

        if (filtros.cliente_id) {
            conditions.push(`ss.cliente_id = $${paramCount++}`);
            params.push(filtros.cliente_id);
        }
        if (filtros.prestador_id) { // Para prestadores verem as solicitações que eles podem aceitar (baseado no servico_oferecido)
            conditions.push(`so.prestador_id = $${paramCount++}`);
            params.push(filtros.prestador_id);
        }
        if (filtros.status) {
            conditions.push(`ss.status = $${paramCount++}`);
            params.push(filtros.status);
        }
        if (filtros.servico_oferecido_id) {
            conditions.push(`ss.servico_oferecido_id = $${paramCount++}`);
            params.push(filtros.servico_oferecido_id);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        sql += ' ORDER BY ss.data_solicitacao DESC;';

        try {
            const list = await conexao.any(sql, params);
            return {
                status: 200,
                ok: true,
                message: 'Lista de solicitações de serviço obtida com sucesso',
                data: list
            };
        } catch (error) {
            console.error('Erro ao buscar solicitações de serviço:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao buscar solicitações de serviço',
                sqlMessage: error.message
            };
        }
    },

    /**
     * @description Obtém uma solicitação de serviço pelo ID.
     * @param {number} id - O ID da solicitação.
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|null|string}>}
     */
    getById: async (id) => {
        const sql = 'SELECT ss.id, ss.cliente_id, ss.servico_oferecido_id, ss.data_solicitacao, ss.data_preferencial, ' +
                    'ss.descricao_cliente, ss.status, ss.valor_proposto, ss.prestador_id_aceito, ss.data_aceitacao, ss.data_conclusao, ' +
                    'c.nome AS nome_cliente, c.email AS email_cliente, ' +
                    'so.titulo AS titulo_servico, so.descricao AS descricao_servico, ' +
                    'p.nome AS nome_prestador_aceito, p.email AS email_prestador_aceito ' +
                    'FROM solicitacoes_servico ss ' +
                    'JOIN clientes c ON ss.cliente_id = c.id ' +
                    'JOIN servicos_oferecidos so ON ss.servico_oferecido_id = so.id ' +
                    'LEFT JOIN prestadores p ON ss.prestador_id_aceito = p.id ' +
                    'WHERE ss.id=$1;';
        try {
            const solicitacao = await conexao.oneOrNone(sql, [id]);
            if (solicitacao) {
                return {
                    status: 200,
                    ok: true,
                    message: 'Solicitação de serviço encontrada com sucesso',
                    data: solicitacao
                };
            } else {
                return {
                    status: 404,
                    ok: false,
                    message: 'Solicitação de serviço não encontrada',
                    data: null
                };
            }
        } catch (error) {
            console.error('Erro ao buscar solicitação de serviço por ID:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao buscar solicitação de serviço por ID',
                sqlMessage: error.message
            };
        }
    },

    /**
     * @description Atualiza o status e/ou o prestador aceito de uma solicitação.
     * @param {number} id - O ID da solicitação.
     * @param {Object} obj - Objeto com os campos a serem atualizados (status, valor_proposto, prestador_id_aceito, data_aceitacao, data_conclusao).
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|null|string}>}
     */
    update: async (id, obj) => {
        const fieldsToUpdate = [];
        const params = [];
        let paramCount = 1;

        if (obj.status !== undefined) {
            fieldsToUpdate.push(`status = $${paramCount++}`);
            params.push(obj.status);
        }
        if (obj.valor_proposto !== undefined) {
            fieldsToUpdate.push(`valor_proposto = $${paramCount++}`);
            params.push(obj.valor_proposto);
        }
        if (obj.prestador_id_aceito !== undefined) {
            fieldsToUpdate.push(`prestador_id_aceito = $${paramCount++}`);
            params.push(obj.prestador_id_aceito);
            // Se um prestador aceitou, registrar a data de aceitação
            if (obj.prestador_id_aceito !== null) {
                fieldsToUpdate.push(`data_aceitacao = CURRENT_TIMESTAMP`);
            } else {
                fieldsToUpdate.push(`data_aceitacao = NULL`); // Se desaceitar, limpar data
            }
        }
        if (obj.data_conclusao !== undefined) {
            fieldsToUpdate.push(`data_conclusao = $${paramCount++}`);
            params.push(obj.data_conclusao);
        }

        if (fieldsToUpdate.length === 0) {
            return {
                status: 400,
                ok: false,
                message: 'Nenhum campo para atualizar fornecido.'
            };
        }

        params.push(id); // O último parâmetro é o ID para a cláusula WHERE
        const sql = `UPDATE solicitacoes_servico SET ${fieldsToUpdate.join(', ')} WHERE id=$${paramCount} RETURNING *;`;

        try {
            const updatedSolicitacao = await conexao.oneOrNone(sql, params);
            if (updatedSolicitacao) {
                return {
                    status: 200,
                    ok: true,
                    message: 'Solicitação de serviço atualizada com sucesso',
                    data: updatedSolicitacao
                };
            } else {
                return {
                    status: 404,
                    ok: false,
                    message: 'Solicitação de serviço não encontrada para atualização',
                    data: null
                };
            }
        } catch (error) {
            console.error('Erro ao atualizar solicitação de serviço:', error);
            if (error.code === '23503') { // foreign_key_violation
                return {
                    status: 400,
                    ok: false,
                    message: 'ID de prestador aceito inválido.',
                    sqlMessage: error.message
                };
            }
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao atualizar solicitação de serviço',
                sqlMessage: error.message
            };
        }
    },

    /**
     * @description Deleta uma solicitação de serviço.
     * @param {number} id - O ID da solicitação.
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|null|string}>}
     */
    delete: async (id) => {
        const sql = "DELETE FROM solicitacoes_servico WHERE id=$1 RETURNING id;";
        try {
            const deletedRow = await conexao.oneOrNone(sql, [id]);
            if (deletedRow) {
                console.log(`Solicitação de serviço com ID ${id} deletada.`);
                return {
                    status: 200,
                    ok: true,
                    message: 'Solicitação de serviço deletada com sucesso',
                    data: { id: deletedRow.id }
                };
            } else {
                return {
                    status: 404,
                    ok: false,
                    message: 'Solicitação de serviço não encontrada para deletar',
                    data: null
                };
            }
        } catch (error) {
            console.error('Erro ao deletar solicitação de serviço:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao deletar solicitação de serviço',
                sqlMessage: error.message
            };
        }
    }
};

export default solicitacoesRepository;