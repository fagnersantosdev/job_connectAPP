import conexao from "../database/conexao.js";

const solicitacoesRepository = {
    /**
     * @description Cria uma nova solicitação de serviço.
     * @param {Object} obj - Dados da solicitação.
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|string}>}
     */
    create: async (obj) => {
        const sql = `INSERT INTO solicitacoes_servico (cliente_id, categoria_id, descricao, valor_proposto,
                                                  endereco_id, data_solicitacao, status)
                     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`;
        try {
            const newSolicitacao = await conexao.one(sql, [
                obj.cliente_id,
                obj.categoria_id,
                obj.descricao,
                obj.valor_proposto,
                obj.endereco_id,
                obj.data_solicitacao,
                'pendente'
            ]);
            return { status: 201, ok: true, message: 'Solicitação de serviço criada com sucesso', data: newSolicitacao };
        } catch (error) {
            console.error("Erro ao criar solicitação de serviço:", error);
            if (error.code === '23503') { // foreign_key_violation
                return { status: 400, ok: false, message: 'ID de cliente, categoria ou endereço inválido.' };
            }
            return { status: 500, ok: false, message: 'Erro de servidor ao criar solicitação.' };
        }
    },

    /**
     * @description Obtém uma solicitação pelo seu ID.
     * @param {number} id - ID da solicitação.
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|null}>}
     */
    getById: async (id) => {
        const sql = `SELECT * FROM solicitacoes_servico WHERE id = $1;`;
        try {
            const solicitacao = await conexao.oneOrNone(sql, [id]);
            if (solicitacao) {
                return { status: 200, ok: true, message: 'Solicitação de serviço encontrada.', data: solicitacao };
            } else {
                return { status: 404, ok: false, message: 'Solicitação de serviço não encontrada.', data: null };
            }
        } catch (error) {
            console.error("Erro ao obter solicitação de serviço por ID:", error);
            return { status: 500, ok: false, message: 'Erro de servidor ao obter solicitação.' };
        }
    },

    /**
     * @description Atualiza o status de uma solicitação de serviço.
     * @param {number} solicitacao_id - ID da solicitação.
     * @param {string} newStatus - Novo status da solicitação.
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|null}>}
     */
    updateStatus: async (solicitacao_id, newStatus) => {
        const sql = `UPDATE solicitacoes_servico SET status = $1 WHERE id = $2 RETURNING *;`;
        try {
            const updatedSolicitacao = await conexao.oneOrNone(sql, [newStatus, solicitacao_id]);
            if (updatedSolicitacao) {
                return { status: 200, ok: true, message: 'Status da solicitação atualizado com sucesso.', data: updatedSolicitacao };
            } else {
                return { status: 404, ok: false, message: 'Solicitação de serviço não encontrada para atualização de status.', data: null };
            }
        } catch (error) {
            console.error("Erro ao atualizar status da solicitação de serviço:", error);
            return { status: 500, ok: false, message: 'Erro de servidor ao atualizar status da solicitação.' };
        }
    },

    /**
     * @description Atualiza o prestador aceito para uma solicitação de serviço.
     * @param {number} solicitacao_id - ID da solicitação.
     * @param {number} prestador_id - ID do prestador que aceitou a solicitação.
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|null}>}
     */
    updatePrestadorAceito: async (solicitacao_id, prestador_id) => {
        const sql = `UPDATE solicitacoes_servico SET prestador_id_aceito = $1, status = 'aguardando_pagamento', data_atualizacao = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *;`;
        try {
            const updatedSolicitacao = await conexao.oneOrNone(sql, [prestador_id, solicitacao_id]);
            if (updatedSolicitacao) {
                return { status: 200, ok: true, message: 'Prestador da solicitação aceito com sucesso.', data: updatedSolicitacao };
            } else {
                return { status: 404, ok: false, message: 'Solicitação de serviço não encontrada para aceitar prestador.', data: null };
            }
        } catch (error) {
            console.error("Erro ao atualizar prestador aceito da solicitação:", error);
            return { status: 500, ok: false, message: 'Erro de servidor ao atualizar prestador aceito.' };
        }
    }
    // Outros métodos como 'getAll', 'getByClienteId', 'getByPrestadorId', etc. podem ser adicionados aqui
};

export default solicitacoesRepository;
