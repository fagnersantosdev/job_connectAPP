import conexao from "../database/conexao.js";

const pagamentosRepository = {
    /**
     * @description Cria um novo registro de pagamento no banco de dados.
     * Corresponde à transação inicial do cliente para a custódia.
     * @param {Object} obj - Dados do pagamento (solicitacao_id, cliente_id, prestador_id, valor, metodo_pagamento, status, id_externo_gateway, url_pagamento).
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|string}>}
     */
    createPayment: async (obj) => {
        const sql = `INSERT INTO transacoes (solicitacao_id, remetente_id, remetente_tipo, destinatario_id, destinatario_tipo,
                                            tipo_transacao, valor, moeda, metodo_pagamento, status, id_externo_gateway, url_pagamento)
                     VALUES ($1, $2, 'cliente', $3, 'prestador', 'pagamento_servico', $4, 'BRL', $5, $6, $7, $8) RETURNING *;`;
        try {
            const newPayment = await conexao.one(sql, [
                obj.solicitacao_id,
                obj.cliente_id,
                obj.prestador_id,
                obj.valor,
                obj.metodo_pagamento,
                obj.status,
                obj.id_externo_gateway,
                obj.url_pagamento
            ]);
            return {
                status: 201,
                ok: true,
                message: 'Pagamento registrado com sucesso',
                data: newPayment
            };
        } catch (error) {
            console.error('Erro ao criar pagamento:', error);
            if (error.code === '23505') { // unique_violation (id_externo_gateway)
                return {
                    status: 409,
                    ok: false,
                    message: 'Erro: ID externo do gateway já registrado para outro pagamento.',
                    sqlMessage: error.message
                };
            }
            if (error.code === '23503') { // foreign_key_violation
                return {
                    status: 400,
                    ok: false,
                    message: 'ID de solicitação, cliente ou prestador inválido(a).',
                    sqlMessage: error.message
                };
            }
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao criar pagamento',
                sqlMessage: error.message
            };
        }
    },

    /**
     * @description Obtém um pagamento pelo ID interno.
     * @param {number} id - ID do pagamento.
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|null}>}
     */
    getPaymentById: async (id) => {
        const sql = `SELECT * FROM transacoes WHERE id = $1 AND tipo_transacao = 'pagamento_servico';`;
        try {
            const payment = await conexao.oneOrNone(sql, [id]);
            if (payment) {
                return {
                    status: 200,
                    ok: true,
                    message: 'Pagamento encontrado com sucesso',
                    data: payment
                };
            } else {
                return {
                    status: 404,
                    ok: false,
                    message: 'Pagamento não encontrado',
                    data: null
                };
            }
        } catch (error) {
            console.error('Erro ao buscar pagamento por ID:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao buscar pagamento por ID',
                sqlMessage: error.message
            };
        }
    },

    /**
     * @description Obtém um pagamento pelo ID externo do gateway.
     * @param {string} externalId - ID da transação no gateway de pagamento.
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|null}>}
     */
    getByExternalId: async (externalId) => {
        const sql = `SELECT * FROM transacoes WHERE id_externo_gateway = $1 AND tipo_transacao = 'pagamento_servico';`;
        try {
            const payment = await conexao.oneOrNone(sql, [externalId]);
            if (payment) {
                return {
                    status: 200,
                    ok: true,
                    message: 'Pagamento encontrado pelo ID externo com sucesso',
                    data: payment
                };
            } else {
                return {
                    status: 404,
                    ok: false,
                    message: 'Pagamento não encontrado pelo ID externo',
                    data: null
                };
            }
        } catch (error) {
            console.error('Erro ao buscar pagamento por ID externo:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao buscar pagamento por ID externo',
                sqlMessage: error.message
            };
        }
    },

    /**
     * @description Atualiza o status de um pagamento.
     * @param {number} id - ID do pagamento.
     * @param {string} status - Novo status do pagamento.
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|null}>}
     */
    updatePaymentStatus: async (id, status) => {
        const sql = `UPDATE transacoes SET status = $1, data_atualizacao = CURRENT_TIMESTAMP WHERE id = $2 AND tipo_transacao = 'pagamento_servico' RETURNING *;`;
        try {
            const updatedPayment = await conexao.oneOrNone(sql, [status, id]);
            if (updatedPayment) {
                return {
                    status: 200,
                    ok: true,
                    message: 'Status do pagamento atualizado com sucesso',
                    data: updatedPayment
                };
            } else {
                return {
                    status: 404,
                    ok: false,
                    message: 'Pagamento não encontrado para atualização de status',
                    data: null
                };
            }
        } catch (error) {
            console.error('Erro ao atualizar status do pagamento:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao atualizar status do pagamento',
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
     * @description Obtém todos os planos de assinatura.
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
     * @param {Object} obj - Dados da assinatura (prestador_id, plano_id, data_inicio, data_fim_prevista, valor, metodo_pagamento, status, id_externo_gateway, url_pagamento).
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|string}>}
     */
    createAssinaturaPrestador: async (obj) => {
        const sql = `INSERT INTO assinaturas_prestadores (prestador_id, plano_id, data_inicio, data_fim, status, data_ultima_cobranca, proxima_cobranca, valor, metodo_pagamento, id_externo_gateway, url_pagamento)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *;`;
        try {
            const newAssinatura = await conexao.one(sql, [
                obj.prestador_id,
                obj.plano_id,
                obj.data_inicio || new Date(),
                obj.data_fim_prevista, // data_fim agora é data_fim_prevista
                obj.status || 'pendente',
                obj.data_ultima_cobranca || null,
                obj.proxima_cobranca || null,
                obj.valor,
                obj.metodo_pagamento,
                obj.id_externo_gateway,
                obj.url_pagamento
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
     * @description Obtém uma assinatura pelo ID externo do gateway.
     * @param {string} externalId - ID da cobrança no gateway de pagamento.
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|null}>}
     */
    getAssinaturaByExternalId: async (externalId) => {
        const sql = `SELECT * FROM assinaturas_prestadores WHERE id_externo_gateway = $1;`;
        try {
            const assinatura = await conexao.oneOrNone(sql, [externalId]);
            if (assinatura) {
                return {
                    status: 200,
                    ok: true,
                    message: 'Assinatura encontrada pelo ID externo com sucesso',
                    data: assinatura
                };
            } else {
                return {
                    status: 404,
                    ok: false,
                    message: 'Assinatura não encontrada pelo ID externo',
                    data: null
                };
            }
        } catch (error) {
            console.error('Erro ao buscar assinatura por ID externo:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao buscar assinatura por ID externo',
                sqlMessage: error.message
            };
        }
    },

    /**
     * @description Atualiza o status de uma assinatura de prestador.
     * @param {number} id - ID da assinatura.
     * @param {string} status - Novo status da assinatura.
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|null}>}
     */
    updateAssinaturaStatus: async (id, status) => {
        const sql = `UPDATE assinaturas_prestadores SET status = $1, data_ultima_atualizacao = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *;`;
        try {
            const updatedAssinatura = await conexao.oneOrNone(sql, [status, id]);
            if (updatedAssinatura) {
                return {
                    status: 200,
                    ok: true,
                    message: 'Status da assinatura atualizado com sucesso',
                    data: updatedAssinatura
                };
            } else {
                return {
                    status: 404,
                    ok: false,
                    message: 'Assinatura não encontrada para atualização de status',
                    data: null
                };
            }
        } catch (error) {
            console.error('Erro ao atualizar status da assinatura:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao atualizar status da assinatura',
                sqlMessage: error.message
            };
        }
    },

    /**
     * @description Atualiza a data de fim prevista de uma assinatura de prestador.
     * @param {number} id - ID da assinatura.
     * @param {Date} dataFim - Nova data de fim prevista.
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|null}>}
     */
    updateAssinaturaDataFim: async (id, dataFim) => {
        const sql = `UPDATE assinaturas_prestadores SET data_fim = $1, data_ultima_atualizacao = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *;`;
        try {
            const updatedAssinatura = await conexao.oneOrNone(sql, [dataFim, id]);
            if (updatedAssinatura) {
                return {
                    status: 200,
                    ok: true,
                    message: 'Data de fim da assinatura atualizada com sucesso',
                    data: updatedAssinatura
                };
            } else {
                return {
                    status: 404,
                    ok: false,
                    message: 'Assinatura não encontrada para atualização da data de fim',
                    data: null
                };
            }
        } catch (error) {
            console.error('Erro ao atualizar data de fim da assinatura:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao atualizar data de fim da assinatura',
                sqlMessage: error.message
            };
        }
    }
};

export default pagamentosRepository;
