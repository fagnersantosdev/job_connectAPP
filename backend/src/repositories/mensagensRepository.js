import conexao from "../database/conexao.js";

const mensagensRepository = {
    /**
     * @description Cria uma nova mensagem.
     * @param {Object} obj - Dados da mensagem (solicitacao_id, remetente_id, remetente_tipo, destinatario_id, destinatario_tipo, conteudo).
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|string}>}
     */
    create: async (obj) => {
        const sql = `INSERT INTO mensagens (solicitacao_id, remetente_id, remetente_tipo, destinatario_id, destinatario_tipo, conteudo)
                     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`;
        try {
            const newMensagem = await conexao.one(sql, [
                obj.solicitacao_id,
                obj.remetente_id,
                obj.remetente_tipo,
                obj.destinatario_id,
                obj.destinatario_tipo,
                obj.conteudo
            ]);
            return {
                status: 201,
                ok: true,
                message: 'Mensagem enviada com sucesso',
                data: newMensagem
            };
        } catch (error) {
            console.error('Erro ao criar mensagem:', error);
            if (error.code === '23503') { // foreign_key_violation (solicitacao_id inválida)
                return {
                    status: 400,
                    ok: false,
                    message: 'ID de solicitação inválido.',
                    sqlMessage: error.message
                };
            }
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao enviar mensagem',
                sqlMessage: error.message
            };
        }
    },

    /**
     * @description Obtém mensagens para uma solicitação específica, ou entre dois usuários.
     * @param {Object} filtros - Objeto com filtros (solicitacao_id, remetente_id, destinatario_id).
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Array<Object>|string}>}
     */
    getAll: async (filtros = {}) => {
        let sql = 'SELECT m.id, m.solicitacao_id, m.remetente_id, m.remetente_tipo, m.destinatario_id, m.destinatario_tipo, ' +
                  'm.conteudo, m.data_envio, m.lida, ' +
                  'ss.descricao_cliente AS solicitacao_descricao, ' + // Dados da solicitação
                  'c_remetente.nome AS nome_remetente_cliente, p_remetente.nome AS nome_remetente_prestador, ' + // Nomes dos remetentes
                  'c_destinatario.nome AS nome_destinatario_cliente, p_destinatario.nome AS nome_destinatario_prestador ' + // Nomes dos destinatários
                  'FROM mensagens m ' +
                  'JOIN solicitacoes_servico ss ON m.solicitacao_id = ss.id ' +
                  'LEFT JOIN clientes c_remetente ON m.remetente_id = c_remetente.id AND m.remetente_tipo = \'cliente\' ' +
                  'LEFT JOIN prestadores p_remetente ON m.remetente_id = p_remetente.id AND m.remetente_tipo = \'prestador\' ' +
                  'LEFT JOIN clientes c_destinatario ON m.destinatario_id = c_destinatario.id AND m.destinatario_tipo = \'cliente\' ' +
                  'LEFT JOIN prestadores p_destinatario ON m.destinatario_id = p_destinatario.id AND m.destinatario_tipo = \'prestador\'';

        const params = [];
        const conditions = [];
        let paramCount = 1;

        if (filtros.solicitacao_id) {
            conditions.push(`m.solicitacao_id = $${paramCount++}`);
            params.push(filtros.solicitacao_id);
        }
        if (filtros.remetente_id && filtros.remetente_tipo) {
            conditions.push(`m.remetente_id = $${paramCount++} AND m.remetente_tipo = $${paramCount++}`);
            params.push(filtros.remetente_id, filtros.remetente_tipo);
        }
        if (filtros.destinatario_id && filtros.destinatario_tipo) {
            conditions.push(`m.destinatario_id = $${paramCount++} AND m.destinatario_tipo = $${paramCount++}`);
            params.push(filtros.destinatario_id, filtros.destinatario_tipo);
        }
        // Para buscar conversas entre dois usuários específicos, independentemente de quem enviou primeiro
        if (filtros.user1_id && filtros.user1_tipo && filtros.user2_id && filtros.user2_tipo) {
            conditions.push(`((m.remetente_id = $${paramCount} AND m.remetente_tipo = $${paramCount + 1} AND m.destinatario_id = $${paramCount + 2} AND m.destinatario_tipo = $${paramCount + 3}) OR (m.remetente_id = $${paramCount + 2} AND m.remetente_tipo = $${paramCount + 3} AND m.destinatario_id = $${paramCount} AND m.destinatario_tipo = $${paramCount + 1}))`);
            params.push(filtros.user1_id, filtros.user1_tipo, filtros.user2_id, filtros.user2_tipo);
            paramCount += 4;
        }


        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        sql += ' ORDER BY m.data_envio ASC;'; // Ordena as mensagens por data de envio

        try {
            const list = await conexao.any(sql, params);
            return {
                status: 200,
                ok: true,
                message: 'Lista de mensagens obtida com sucesso',
                data: list
            };
        } catch (error) {
            console.error('Erro ao buscar mensagens:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao buscar mensagens',
                sqlMessage: error.message
            };
        }
    },

    /**
     * @description Marca uma mensagem como lida.
     * @param {number} id - O ID da mensagem a ser marcada como lida.
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|null|string}>}
     */
    markAsRead: async (id) => {
        const sql = `UPDATE mensagens SET lida=TRUE WHERE id=$1 RETURNING *;`;
        try {
            const updatedMensagem = await conexao.oneOrNone(sql, [id]);
            if (updatedMensagem) {
                return {
                    status: 200,
                    ok: true,
                    message: 'Mensagem marcada como lida com sucesso',
                    data: updatedMensagem
                };
            } else {
                return {
                    status: 404,
                    ok: false,
                    message: 'Mensagem não encontrada para marcar como lida',
                    data: null
                };
            }
        } catch (error) {
            console.error('Erro ao marcar mensagem como lida:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao marcar mensagem como lida',
                sqlMessage: error.message
            };
        }
    },

    /**
     * @description Deleta uma mensagem.
     * @param {number} id - O ID da mensagem a ser deletada.
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|null|string}>}
     */
    delete: async (id) => {
        const sql = "DELETE FROM mensagens WHERE id=$1 RETURNING id;";
        try {
            const deletedRow = await conexao.oneOrNone(sql, [id]);
            if (deletedRow) {
                console.log(`Mensagem com ID ${id} deletada.`);
                return {
                    status: 200,
                    ok: true,
                    message: 'Mensagem deletada com sucesso',
                    data: { id: deletedRow.id }
                };
            } else {
                return {
                    status: 404,
                    ok: false,
                    message: 'Mensagem não encontrada para deletar',
                    data: null
                };
            }
        } catch (error) {
            console.error('Erro ao deletar mensagem:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao deletar mensagem',
                sqlMessage: error.message
            };
        }
    }
};

export default mensagensRepository;
