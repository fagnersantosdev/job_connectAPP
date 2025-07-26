import conexao from "../database/conexao.js";

const pagamentosRepository = {
    /**
     * @description Cria uma nova transação no banco de dados.
     * @param {Object} obj - Dados da transação.
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|string}>}
     */
    createTransacao: async (obj) => {
        const sql = `INSERT INTO transacoes (solicitacao_id, conta_custodia_id, remetente_id, remetente_tipo,
                                            destinatario_id, destinatario_tipo, tipo_transacao, valor, moeda,
                                            metodo_pagamento, status, id_externo_gateway)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *;`;
        try {
            const newTransacao = await conexao.one(sql, [
                obj.solicitacao_id,
                obj.conta_custodia_id,
                obj.remetente_id,
                obj.remetente_tipo,
                obj.destinatario_id,
                obj.destinatario_tipo,
                obj.tipo_transacao,
                obj.valor,
                obj.moeda,
                obj.metodo_pagamento,
                obj.status,
                obj.id_externo_gateway
            ]);
            return {
                status: 201,
                ok: true,
                message: 'Transação registrada com sucesso',
                data: newTransacao
            };
        } catch (error) {
            console.error('Erro ao criar transação:', error);
            if (error.code === '23505') { // unique_violation (id_externo_gateway)
                return {
                    status: 409,
                    ok: false,
                    message: 'Erro: ID externo do gateway já registrado para outra transação.',
                    sqlMessage: error.message
                };
            }
            if (error.code === '23503') { // foreign_key_violation
                return {
                    status: 400,
                    ok: false,
                    message: 'ID de solicitação ou conta de custódia inválido(a).',
                    sqlMessage: error.message
                };
            }
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao criar transação',
                sqlMessage: error.message
            };
        }
    },

    /**
     * @description Atualiza o status de uma transação.
     * @param {number} id - ID da transação.
     * @param {string} status - Novo status da transação.
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|null}>}
     */
    updateTransacaoStatus: async (id, status) => {
        const sql = `UPDATE transacoes SET status = $1, data_atualizacao = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *;`;
        try {
            const updatedTransacao = await conexao.oneOrNone(sql, [status, id]);
            if (updatedTransacao) {
                return {
                    status: 200,
                    ok: true,
                    message: 'Status da transação atualizado com sucesso',
                    data: updatedTransacao
                };
            } else {
                return {
                    status: 404,
                    ok: false,
                    message: 'Transação não encontrada para atualização de status',
                    data: null
                };
            }
        } catch (error) {
            console.error('Erro ao atualizar status da transação:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao atualizar status da transação',
                sqlMessage: error.message
            };
        }
    },

    /**
     * @description Obtém uma transação pelo ID.
     * @param {number} id - ID da transação.
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|null}>}
     */
    getTransacaoById: async (id) => {
        const sql = `SELECT * FROM transacoes WHERE id = $1;`;
        try {
            const transacao = await conexao.oneOrNone(sql, [id]);
            if (transacao) {
                return {
                    status: 200,
                    ok: true,
                    message: 'Transação encontrada com sucesso',
                    data: transacao
                };
            } else {
                return {
                    status: 404,
                    ok: false,
                    message: 'Transação não encontrada',
                    data: null
                };
            }
        } catch (error) {
            console.error('Erro ao buscar transação por ID:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao buscar transação por ID',
                sqlMessage: error.message
            };
        }
    },

    /**
     * @description NOVO MÉTODO: Obtém uma transação pelo ID externo do gateway (Stark Bank).
     * @param {string} externalId - ID da transação no gateway de pagamento.
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|null}>}
     */
    getTransacaoByExternalId: async (externalId) => {
        const sql = `SELECT * FROM transacoes WHERE id_externo_gateway = $1;`;
        try {
            const transacao = await conexao.oneOrNone(sql, [externalId]);
            if (transacao) {
                return {
                    status: 200,
                    ok: true,
                    message: 'Transação encontrada pelo ID externo com sucesso',
                    data: transacao
                };
            } else {
                return {
                    status: 404,
                    ok: false,
                    message: 'Transação não encontrada pelo ID externo',
                    data: null
                };
            }
        } catch (error) {
            console.error('Erro ao buscar transação por ID externo:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao buscar transação por ID externo',
                sqlMessage: error.message
            };
        }
    },

    /**
     * @description Cria uma nova conta de custódia (escrow) para uma solicitação de serviço.
     * @param {Object} obj - Dados da conta de custódia (solicitacao_id, valor_total).
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|string}>}
     */
    createContaCustodia: async (obj) => {
        const sql = `INSERT INTO contas_custodia (solicitacao_id, valor_total, valor_em_custodia, status)
                     VALUES ($1, $2, $3, $4) RETURNING *;`;
        try {
            const newConta = await conexao.one(sql, [
                obj.solicitacao_id,
                obj.valor_total,
                obj.valor_em_custodia || 0,
                obj.status || 'pendente'
            ]);
            return {
                status: 201,
                ok: true,
                message: 'Conta de custódia criada com sucesso',
                data: newConta
            };
        } catch (error) {
            console.error('Erro ao criar conta de custódia:', error);
            if (error.code === '23505') { // unique_violation (solicitacao_id)
                return {
                    status: 409,
                    ok: false,
                    message: 'Erro: Já existe uma conta de custódia para esta solicitação.',
                    sqlMessage: error.message
                };
            }
            if (error.code === '23503') { // foreign_key_violation
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
                message: 'Erro de servidor ao criar conta de custódia',
                sqlMessage: error.message
            };
        }
    },

    /**
     * @description Atualiza o valor e/ou status de uma conta de custódia.
     * @param {number} id - ID da conta de custódia.
     * @param {Object} obj - Dados para atualização (valor_em_custodia, status).
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|null}>}
     */
    updateContaCustodia: async (id, obj) => {
        const fields = [];
        const params = [];
        let paramCount = 1;

        if (obj.valor_em_custodia !== undefined) {
            fields.push(`valor_em_custodia = $${paramCount++}`);
            params.push(obj.valor_em_custodia);
        }
        if (obj.status !== undefined) {
            fields.push(`status = $${paramCount++}`);
            params.push(obj.status);
        }
        fields.push(`data_ultima_atualizacao = CURRENT_TIMESTAMP`); // Sempre atualiza timestamp

        if (fields.length === 0) {
            return { status: 400, ok: false, message: "Nenhum campo para atualizar fornecido para conta de custódia." };
        }

        params.push(id); // O último parâmetro é o ID
        const sql = `UPDATE contas_custodia SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *;`;

        try {
            const updatedConta = await conexao.oneOrNone(sql, params);
            if (updatedConta) {
                return {
                    status: 200,
                    ok: true,
                    message: 'Conta de custódia atualizada com sucesso',
                    data: updatedConta
                };
            } else {
                return {
                    status: 404,
                    ok: false,
                    message: 'Conta de custódia não encontrada para atualização',
                    data: null
                };
            }
        } catch (error) {
            console.error('Erro ao atualizar conta de custódia:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao atualizar conta de custódia',
                sqlMessage: error.message
            };
        }
    },

    /**
     * @description Obtém uma conta de custódia pelo ID da solicitação.
     * @param {number} solicitacao_id - ID da solicitação de serviço.
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|null}>}
     */
    getContaCustodiaBySolicitacaoId: async (solicitacao_id) => {
        const sql = `SELECT * FROM contas_custodia WHERE solicitacao_id = $1;`;
        try {
            const conta = await conexao.oneOrNone(sql, [solicitacao_id]);
            if (conta) {
                return {
                    status: 200,
                    ok: true,
                    message: 'Conta de custódia encontrada com sucesso',
                    data: conta
                };
            } else {
                return {
                    status: 404,
                    ok: false,
                    message: 'Conta de custódia não encontrada para esta solicitação',
                    data: null
                };
            }
        } catch (error) {
            console.error('Erro ao buscar conta de custódia por ID da solicitação:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao buscar conta de custódia por ID da solicitação',
                sqlMessage: error.message
            };
        }
    },

    /**
     * @description Obtém um plano de assinatura pelo ID.
     * @param {number} id - ID do plano.
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|null}>}
     */
    getPlanoAssinaturaById: async (id) => {
        const sql = `SELECT * FROM planos_assinatura WHERE id = $1;`;
        try {
            const plano = await conexao.oneOrNone(sql, [id]);
            if (plano) {
                return {
                    status: 200,
                    ok: true,
                    message: 'Plano de assinatura encontrado com sucesso',
                    data: plano
                };
            } else {
                return {
                    status: 404,
                    ok: false,
                    message: 'Plano de assinatura não encontrado',
                    data: null
                };
            }
        } catch (error) {
            console.error('Erro ao buscar plano de assinatura por ID:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao buscar plano de assinatura por ID',
                sqlMessage: error.message
            };
        }
    },

    /**
     * @description NOVO MÉTODO: Obtém todos os planos de assinatura.
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Array<Object>|string}>}
     */
    getAllPlanosAssinatura: async () => {
        const sql = `SELECT * FROM planos_assinatura ORDER BY valor ASC;`;
        try {
            const planos = await conexao.any(sql);
            return {
                status: 200,
                ok: true,
                message: 'Planos de assinatura obtidos com sucesso',
                data: planos
            };
        } catch (error) {
            console.error('Erro ao buscar todos os planos de assinatura:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao buscar planos de assinatura',
                sqlMessage: error.message
            };
        }
    },

    /**
     * @description Cria uma nova assinatura para um prestador.
     * @param {Object} obj - Dados da assinatura (prestador_id, plano_id, data_inicio, data_fim, status, data_ultima_cobranca, proxima_cobranca).
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|string}>}
     */
    createAssinaturaPrestador: async (obj) => {
        const sql = `INSERT INTO assinaturas_prestadores (prestador_id, plano_id, data_inicio, data_fim, status, data_ultima_cobranca, proxima_cobranca)
                     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`;
        try {
            const newAssinatura = await conexao.one(sql, [
                obj.prestador_id,
                obj.plano_id,
                obj.data_inicio || new Date(),
                obj.data_fim,
                obj.status || 'ativo',
                obj.data_ultima_cobranca,
                obj.proxima_cobranca
            ]);
            return {
                status: 201,
                ok: true,
                message: 'Assinatura de prestador criada com sucesso',
                data: newAssinatura
            };
        } catch (error) {
            console.error('Erro ao criar assinatura de prestador:', error);
            if (error.code === '23505') { // unique_violation (prestador_id)
                return {
                    status: 409,
                    ok: false,
                    message: 'Erro: Este prestador já possui uma assinatura.',
                    sqlMessage: error.message
                };
            }
            if (error.code === '23503') { // foreign_key_violation
                return {
                    status: 400,
                    ok: false,
                    message: 'ID de prestador ou plano inválido(a).',
                    sqlMessage: error.message
                };
            }
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao criar assinatura de prestador',
                sqlMessage: error.message
            };
        }
    },

    /**
     * @description Obtém a assinatura de um prestador pelo ID do prestador.
     * @param {number} prestador_id - ID do prestador.
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|null}>}
     */
    getAssinaturaByPrestadorId: async (prestador_id) => {
        const sql = `SELECT ap.*, pa.nome AS plano_nome, pa.valor AS plano_valor, pa.periodicidade AS plano_periodicidade, pa.taxa_comissao AS plano_taxa_comissao
                     FROM assinaturas_prestadores ap
                     JOIN planos_assinatura pa ON ap.plano_id = pa.id
                     WHERE ap.prestador_id = $1;`;
        try {
            const assinatura = await conexao.oneOrNone(sql, [prestador_id]);
            if (assinatura) {
                return {
                    status: 200,
                    ok: true,
                    message: 'Assinatura de prestador encontrada com sucesso',
                    data: assinatura
                };
            } else {
                return {
                    status: 404,
                    ok: false,
                    message: 'Assinatura de prestador não encontrada',
                    data: null
                };
            }
        } catch (error) {
            console.error('Erro ao buscar assinatura de prestador por ID:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao buscar assinatura de prestador',
                sqlMessage: error.message
            };
        }
    },

    /**
     * @description Atualiza uma assinatura de prestador.
     * @param {number} id - ID da assinatura.
     * @param {Object} obj - Dados para atualização (plano_id, data_fim, status, data_ultima_cobranca, proxima_cobranca).
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|null}>}
     */
    updateAssinaturaPrestador: async (id, obj) => {
        const fields = [];
        const params = [];
        let paramCount = 1;

        if (obj.plano_id !== undefined) {
            fields.push(`plano_id = $${paramCount++}`);
            params.push(obj.plano_id);
        }
        if (obj.data_fim !== undefined) {
            fields.push(`data_fim = $${paramCount++}`);
            params.push(obj.data_fim);
        }
        if (obj.status !== undefined) {
            fields.push(`status = $${paramCount++}`);
            params.push(obj.status);
        }
        if (obj.data_ultima_cobranca !== undefined) {
            fields.push(`data_ultima_cobranca = $${paramCount++}`);
            params.push(obj.data_ultima_cobranca);
        }
        if (obj.proxima_cobranca !== undefined) {
            fields.push(`proxima_cobranca = $${paramCount++}`);
            params.push(obj.proxima_cobranca);
        }

        if (fields.length === 0) {
            return { status: 400, ok: false, message: "Nenhum campo para atualizar fornecido para assinatura do prestador." };
        }

        params.push(id);
        const sql = `UPDATE assinaturas_prestadores SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *;`;

        try {
            const updatedAssinatura = await conexao.oneOrNone(sql, params);
            if (updatedAssinatura) {
                return {
                    status: 200,
                    ok: true,
                    message: 'Assinatura de prestador atualizada com sucesso',
                    data: updatedAssinatura
                };
            } else {
                return {
                    status: 404,
                    ok: false,
                    message: 'Assinatura de prestador não encontrada para atualização',
                    data: null
                };
            }
        } catch (error) {
            console.error('Erro ao atualizar assinatura de prestador:', error);
            if (error.code === '23503') { // foreign_key_violation
                return {
                    status: 400,
                    ok: false,
                    message: 'ID de plano inválido.',
                    sqlMessage: error.message
                };
            }
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao atualizar assinatura de prestador',
                sqlMessage: error.message
            };
        }
    }
};

export default pagamentosRepository;
