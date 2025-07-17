import conexao from "../database/conexao.js";

const avaliacoesRepository = {
    /**
     * @description Cria uma nova avaliação para uma solicitação de serviço concluída.
     * @param {Object} obj - Dados da avaliação (solicitacao_id, cliente_id, prestador_id, nota, comentario).
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|string}>}
     */
    create: async (obj) => {
        const sql = `INSERT INTO avaliacoes (solicitacao_id, cliente_id, prestador_id, nota, comentario)
                     VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
        try {
            const newAvaliacao = await conexao.one(sql, [
                obj.solicitacao_id,
                obj.cliente_id,
                obj.prestador_id,
                obj.nota,
                obj.comentario
            ]);
            return {
                status: 201,
                ok: true,
                message: 'Avaliação criada com sucesso',
                data: newAvaliacao
            };
        } catch (error) {
            console.error('Erro ao criar avaliação:', error);
            // Erros comuns: foreign_key_violation (solicitação, cliente ou prestador não existe)
            // ou unique_violation (solicitacao_id já avaliada)
            if (error.code === '23503') { // foreign_key_violation
                return {
                    status: 400,
                    ok: false,
                    message: 'ID de solicitação, cliente ou prestador inválido(a).',
                    sqlMessage: error.message
                };
            }
            if (error.code === '23505') { // unique_violation
                return {
                    status: 409, // Conflict
                    ok: false,
                    message: 'Esta solicitação já foi avaliada.',
                    sqlMessage: error.message
                };
            }
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao criar avaliação',
                sqlMessage: error.message
            };
        }
    },

    /**
     * @description Obtém avaliações, com filtros por prestador, cliente ou solicitação.
     * @param {Object} filtros - Objeto com filtros (prestador_id, cliente_id, solicitacao_id).
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Array<Object>|string}>}
     */
    getAll: async (filtros = {}) => {
        let sql = 'SELECT a.id, a.solicitacao_id, a.cliente_id, a.prestador_id, a.nota, a.comentario, a.data_avaliacao, ' +
                  'c.nome AS nome_cliente, c.email AS email_cliente, ' +
                  'p.nome AS nome_prestador, p.email AS email_prestador, ' +
                  'so.titulo AS titulo_servico_solicitado ' + // Título do serviço oferecido na solicitação
                  'FROM avaliacoes a ' +
                  'JOIN clientes c ON a.cliente_id = c.id ' +
                  'JOIN prestadores p ON a.prestador_id = p.id ' +
                  'JOIN solicitacoes_servico ss ON a.solicitacao_id = ss.id ' +
                  'JOIN servicos_oferecidos so ON ss.servico_oferecido_id = so.id'; // Para pegar o título do serviço

        const params = [];
        const conditions = [];
        let paramCount = 1;

        if (filtros.prestador_id) {
            conditions.push(`a.prestador_id = $${paramCount++}`);
            params.push(filtros.prestador_id);
        }
        if (filtros.cliente_id) {
            conditions.push(`a.cliente_id = $${paramCount++}`);
            params.push(filtros.cliente_id);
        }
        if (filtros.solicitacao_id) {
            conditions.push(`a.solicitacao_id = $${paramCount++}`);
            params.push(filtros.solicitacao_id);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        sql += ' ORDER BY a.data_avaliacao DESC;';

        try {
            const list = await conexao.any(sql, params);
            return {
                status: 200,
                ok: true,
                message: 'Lista de avaliações obtida com sucesso',
                data: list
            };
        } catch (error) {
            console.error('Erro ao buscar avaliações:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao buscar avaliações',
                sqlMessage: error.message
            };
        }
    },

    /**
     * @description Obtém uma avaliação pelo ID.
     * @param {number} id - O ID da avaliação.
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|null|string}>}
     */
    getById: async (id) => {
        const sql = 'SELECT a.id, a.solicitacao_id, a.cliente_id, a.prestador_id, a.nota, a.comentario, a.data_avaliacao, ' +
                    'c.nome AS nome_cliente, c.email AS email_cliente, ' +
                    'p.nome AS nome_prestador, p.email AS email_prestador, ' +
                    'so.titulo AS titulo_servico_solicitado ' +
                    'FROM avaliacoes a ' +
                    'JOIN clientes c ON a.cliente_id = c.id ' +
                    'JOIN prestadores p ON a.prestador_id = p.id ' +
                    'JOIN solicitacoes_servico ss ON a.solicitacao_id = ss.id ' +
                    'JOIN servicos_oferecidos so ON ss.servico_oferecido_id = so.id ' +
                    'WHERE a.id=$1;';
        try {
            const avaliacao = await conexao.oneOrNone(sql, [id]);
            if (avaliacao) {
                return {
                    status: 200,
                    ok: true,
                    message: 'Avaliação encontrada com sucesso',
                    data: avaliacao
                };
            } else {
                return {
                    status: 404,
                    ok: false,
                    message: 'Avaliação não encontrada',
                    data: null
                };
            }
        } catch (error) {
            console.error('Erro ao buscar avaliação por ID:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao buscar avaliação por ID',
                sqlMessage: error.message
            };
        }
    },

    /**
     * @description Deleta uma avaliação.
     * @param {number} id - O ID da avaliação a ser deletada.
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|null|string}>}
     */
    delete: async (id) => {
        const sql = "DELETE FROM avaliacoes WHERE id=$1 RETURNING id;";
        try {
            const deletedRow = await conexao.oneOrNone(sql, [id]);
            if (deletedRow) {
                console.log(`Avaliação com ID ${id} deletada.`);
                return {
                    status: 200,
                    ok: true,
                    message: 'Avaliação deletada com sucesso',
                    data: { id: deletedRow.id }
                };
            } else {
                return {
                    status: 404,
                    ok: false,
                    message: 'Avaliação não encontrada para deletar',
                    data: null
                };
            }
        } catch (error) {
            console.error('Erro ao deletar avaliação:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao deletar avaliação',
                sqlMessage: error.message
            };
        }
    }
    // Não há método de 'update' para avaliações, pois geralmente não são alteradas após a criação.
    // Se precisar, você pode adicionar um método update aqui.
};

export default avaliacoesRepository;