import conexao from "../database/conexao.js";

const mensagensRepository = {
    /**
     * @description Cria uma nova mensagem no banco de dados.
     * @param {Object} obj - Objeto com os dados da mensagem (solicitacao_id, remetente_id, remetente_tipo, destinatario_id, destinatario_tipo, conteudo, foto_url).
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|string}>}
     */
    createMensagem: async (obj) => {
        const sql = `INSERT INTO mensagens (solicitacao_id, remetente_id, remetente_tipo, destinatario_id, destinatario_tipo, conteudo, foto_url)
                     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`;
        try {
            const novaMensagem = await conexao.one(sql, [
                obj.solicitacao_id,
                obj.remetente_id,
                obj.remetente_tipo,
                obj.destinatario_id,
                obj.destinatario_tipo,
                obj.conteudo,
                obj.foto_url
            ]);
            return {
                status: 201,
                ok: true,
                message: 'Mensagem enviada com sucesso.',
                data: novaMensagem
            };
        } catch (error) {
            console.error('Erro ao criar mensagem:', error);
            if (error.code === '23503') { // foreign_key_violation
                return {
                    status: 400,
                    ok: false,
                    message: 'ID de solicitação, remetente ou destinatário inválido(a).',
                    sqlMessage: error.message
                };
            }
            return {
                status: 500,
                ok: false,
                message: 'Erro interno do servidor ao enviar mensagem.',
                sqlMessage: error.message
            };
        }
    },

    /**
     * @description Obtém todas as mensagens para uma solicitação de serviço específica.
     * @param {number} solicitacao_id - ID da solicitação de serviço.
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Array<Object>|null}>}
     */
    getMensagensBySolicitacaoId: async (solicitacao_id) => {
        const sql = `SELECT * FROM mensagens WHERE solicitacao_id = $1 ORDER BY data_envio ASC;`;
        try {
            const mensagens = await conexao.any(sql, [solicitacao_id]);
            return {
                status: 200,
                ok: true,
                message: 'Mensagens obtidas com sucesso.',
                data: mensagens
            };
        } catch (error) {
            console.error('Erro ao buscar mensagens por solicitação ID:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro interno do servidor ao buscar mensagens.',
                sqlMessage: error.message
            };
        }
    },

    /**
     * @description Marca mensagens como lidas.
     * @param {number} solicitacao_id - ID da solicitação.
     * @param {number} destinatario_id - ID do destinatário que leu as mensagens.
     * @param {string} destinatario_tipo - Tipo do destinatário ('cliente' ou 'prestador').
     * @returns {Promise<{status: number, ok: boolean, message: string}>}
     */
    markMessagesAsRead: async (solicitacao_id, destinatario_id, destinatario_tipo) => {
        const sql = `UPDATE mensagens SET lida = TRUE
                     WHERE solicitacao_id = $1 AND destinatario_id = $2 AND destinatario_tipo = $3 AND lida = FALSE;`;
        try {
            await conexao.none(sql, [solicitacao_id, destinatario_id, destinatario_tipo]);
            return {
                status: 200,
                ok: true,
                message: 'Mensagens marcadas como lidas com sucesso.'
            };
        } catch (error) {
            console.error('Erro ao marcar mensagens como lidas:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro interno do servidor ao marcar mensagens como lidas.',
                sqlMessage: error.message
            };
        }
    }
};

export default mensagensRepository;