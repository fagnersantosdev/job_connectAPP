import pagamentosRepository from "../repositories/pagamentosRepository.js";
import solicitacoesRepository from "../repositories/solicitacoesRepository.js";
import prestadoresRepository from "../repositories/prestadoresRepository.js";
import starkBankService from "../services/starkBankService.js";

const pagamentosController = {
    /**
     * @description Inicia um novo pagamento para uma solicitação de serviço.
     * O cliente logado paga o valor proposto ao prestador. Este valor será inicialmente retido em uma conta de custódia.
     * @param {Object} req - Objeto de requisição (body: { solicitacao_id, metodo_pagamento }).
     * @param {Object} res - Objeto de resposta.
     */
    initiatePayment: async (req, res) => {
        const cliente_id = req.user.id;
        const { solicitacao_id, metodo_pagamento } = req.body;

        const erros = [];
        if (!solicitacao_id || isNaN(parseInt(solicitacao_id))) {
            erros.push("ID da solicitação é obrigatório e deve ser um número.");
        }
        if (!metodo_pagamento || metodo_pagamento.trim().length === 0) {
            erros.push("Método de pagamento é obrigatório.");
        }
        if (!['pix', 'boleto', 'cartao_credito', 'transferencia'].includes(metodo_pagamento)) {
            erros.push("Método de pagamento inválido.");
        }

        if (erros.length > 0) {
            return res.status(400).json({ status: 400, ok: false, message: "Campos inválidos na requisição.", erros: erros });
        }

        try {
            // 1. Obter a solicitação de serviço
            const solicitacaoResult = await solicitacoesRepository.getById(solicitacao_id);
            if (!solicitacaoResult.ok) {
                return res.status(solicitacaoResult.status).json(solicitacaoResult);
            }
            const solicitacao = solicitacaoResult.data;

            // 2. Verificar se a solicitação foi aceita
            if (solicitacao.status !== 'aguardando_pagamento' || !solicitacao.prestador_id_aceito) {
                return res.status(400).json({ status: 400, ok: false, message: "A solicitação não está pronta para pagamento ou já foi paga." });
            }

            // 3. Obter dados do prestador aceito
            const prestadorResult = await prestadoresRepository.getById(solicitacao.prestador_id_aceito);
            if (!prestadorResult.ok) {
                return res.status(404).json({ status: 404, ok: false, message: "Prestador associado à solicitação não encontrado." });
            }
            const prestador = prestadorResult.data;

            // 4. Obter dados do cliente logado
            const cliente = req.user;

            // 5. Criar conta de custódia (escrow) se não existir
            const existingEscrowResult = await pagamentosRepository.getContaCustodiaBySolicitacaoId(solicitacao_id);
            let escrowAccountId = null;
            if (existingEscrowResult.ok) {
                 escrowAccountId = existingEscrowResult.data.id;
            } else {
                const newEscrowResult = await pagamentosRepository.createContaCustodia({
                    solicitacao_id: solicitacao.id,
                    valor_total: solicitacao.valor_proposto,
                    valor_em_custodia: 0,
                    status: 'pendente'
                });
                if (!newEscrowResult.ok) {
                    return res.status(newEscrowResult.status).json(newEscrowResult);
                }
                escrowAccountId = newEscrowResult.data.id;
            }

            // 6. Simular o pagamento no Stark Bank
            const starkBankChargeResponse = await starkBankService.createPayment({
                amount: solicitacao.valor_proposto,
                description: `Pagamento para solicitação de serviço #${solicitacao_id}`,
                taxId: prestador.cpf_cnpj, // A conta de custódia é vinculada ao taxId do prestador
                name: prestador.nome,
                method: metodo_pagamento,
                external_id: `solicitacao-${solicitacao_id}-cliente-${cliente_id}`
            });

            // 7. Salvar o registro do pagamento no nosso banco de dados
            const newPayment = {
                solicitacao_id: solicitacao.id,
                cliente_id: cliente.id,
                prestador_id: prestador.id,
                valor: solicitacao.valor_proposto,
                metodo_pagamento: metodo_pagamento,
                status: 'pendente',
                id_externo_gateway: starkBankChargeResponse.data.id,
                url_pagamento: starkBankChargeResponse.data.paymentLink || null, // URL para pagamento (PIX, boleto)
                conta_custodia_id: escrowAccountId
            };

            const result = await pagamentosRepository.createPayment(newPayment);

            // 8. Se o pagamento foi registrado com sucesso, retornamos a resposta
            if (result.ok) {
                // Não atualiza o status da solicitação ainda, pois o pagamento está pendente
                res.status(result.status).json({ ...result, gateway_data: starkBankChargeResponse.data });
            } else {
                // Em caso de erro, remove a conta de custódia recém-criada (se for o caso)
                if (escrowAccountId) {
                    // Lógica para reverter a criação da conta de custódia se o pagamento falhou
                }
                res.status(result.status).json(result);
            }

        } catch (error) {
            console.error("Erro no controller ao iniciar pagamento:", error);
            res.status(500).json({ status: 500, ok: false, message: "Erro interno do servidor ao iniciar pagamento." });
        }
    },

    /**
     * @description Endpoint de webhook para confirmar o pagamento de uma solicitação.
     * Esta rota é chamada pelo gateway de pagamento (Stark Bank).
     * @param {Object} req - Objeto de requisição (body: { event, data }).
     * @param {Object} res - Objeto de resposta.
     */
    confirmPayment: async (req, res) => {
        const { event, data } = req.body;

        // Verifica se a notificação é de um evento de pagamento concluído
        if (event !== 'payment_approved') {
            console.log(`[Webhook] Evento recebido não é de aprovação: ${event}`);
            return res.status(200).json({ ok: true, message: "Evento não é de aprovação, ignorado." });
        }

        const externalPaymentId = data.id;

        if (!externalPaymentId) {
            return res.status(400).json({ status: 400, ok: false, message: "ID de pagamento externo ausente na requisição do webhook." });
        }

        try {
            // 1. Encontrar o pagamento no nosso banco de dados pelo ID externo
            const paymentResult = await pagamentosRepository.getByExternalId(externalPaymentId);
            if (!paymentResult.ok) {
                console.error(`[Webhook] Pagamento não encontrado com ID externo: ${externalPaymentId}`);
                return res.status(404).json({ status: 404, ok: false, message: "Pagamento não encontrado." });
            }
            const payment = paymentResult.data;

            // 2. Verificar se o pagamento já foi processado para evitar duplicidade
            if (payment.status === 'concluida') {
                console.log(`[Webhook] Pagamento ${externalPaymentId} já foi processado.`);
                return res.status(200).json({ ok: true, message: "Pagamento já processado." });
            }

            // 3. Atualizar o status do pagamento para 'concluida'
            const updatedPaymentResult = await pagamentosRepository.updatePaymentStatus(payment.id, 'concluida');
            if (!updatedPaymentResult.ok) {
                console.error(`[Webhook] Erro ao atualizar status do pagamento ${payment.id}:`, updatedPaymentResult.message);
                return res.status(updatedPaymentResult.status).json(updatedPaymentResult);
            }

            // 4. Atualizar o status da solicitação para 'em_andamento'
            const updatedSolicitacaoResult = await solicitacoesRepository.updateStatus(payment.solicitacao_id, 'em_andamento');
            if (!updatedSolicitacaoResult.ok) {
                console.error(`[Webhook] Erro ao atualizar status da solicitação ${payment.solicitacao_id}:`, updatedSolicitacaoResult.message);
                return res.status(updatedSolicitacaoResult.status).json(updatedSolicitacaoResult);
            }

            // 5. Atualizar a conta de custódia (escrow)
            if (payment.conta_custodia_id) {
                const updatedEscrowResult = await pagamentosRepository.updateContaCustodia(payment.conta_custodia_id, {
                    status: 'em_custodia',
                    valor_em_custodia: payment.valor
                });
                if (!updatedEscrowResult.ok) {
                    console.error(`[Webhook] Erro ao atualizar conta de custódia ${payment.conta_custodia_id}:`, updatedEscrowResult.message);
                    return res.status(updatedEscrowResult.status).json(updatedEscrowResult);
                }
            }

            console.log(`[Webhook] Pagamento ${payment.id} de solicitação ${payment.solicitacao_id} confirmado e status atualizado.`);
            return res.status(200).json({ ok: true, message: "Pagamento processado com sucesso." });
        } catch (error) {
            console.error("Erro no controller de confirmação de pagamento:", error);
            res.status(500).json({ status: 500, ok: false, message: "Erro interno do servidor ao processar o webhook." });
        }
    },

    /**
     * @description Inicia a cobrança da assinatura para um prestador.
     * @param {Object} req - Objeto de requisição (body: { plano_id, metodo_pagamento }).
     * @param {Object} res - Objeto de resposta.
     */
    initiateAssinaturaPrestador: async (req, res) => {
        const prestador_id = req.user.id;
        const { plano_id, metodo_pagamento } = req.body;

        if (!plano_id || isNaN(parseInt(plano_id))) {
            return res.status(400).json({ status: 400, ok: false, message: "ID do plano é obrigatório e deve ser um número." });
        }
        if (!metodo_pagamento || !['pix', 'boleto', 'cartao_credito'].includes(metodo_pagamento)) {
            return res.status(400).json({ status: 400, ok: false, message: "Método de pagamento inválido." });
        }

        try {
            // 1. Obter os dados do plano de assinatura
            const planoResult = await pagamentosRepository.getPlanoAssinaturaById(plano_id);
            if (!planoResult.ok) {
                return res.status(planoResult.status).json(planoResult);
            }
            const plano = planoResult.data;

            // 2. Verificar se o prestador já possui uma assinatura
            const existingAssinaturaResult = await pagamentosRepository.getAssinaturaByPrestadorId(prestador_id);
            if (existingAssinaturaResult.ok) {
                return res.status(409).json({ status: 409, ok: false, message: "Prestador já possui uma assinatura ativa." });
            }

            // 3. Simular a cobrança no Stark Bank
            const starkBankChargeResponse = await starkBankService.createPayment({
                amount: plano.valor,
                description: `Assinatura do Plano ${plano.nome}`,
                taxId: req.user.documento_identificacao, // Usar o CPF/CNPJ do prestador
                name: req.user.nome,
                method: metodo_pagamento,
                external_id: `assinatura-${prestador_id}-plano-${plano_id}`
            });

            // 4. Salvar o registro da assinatura no nosso banco de dados
            const newAssinatura = {
                prestador_id: prestador_id,
                plano_id: plano_id,
                valor: plano.valor,
                metodo_pagamento: metodo_pagamento,
                status: 'pendente', // Marca como pendente até o pagamento ser confirmado
                id_externo_gateway: starkBankChargeResponse.data.id,
                url_pagamento: starkBankChargeResponse.data.paymentLink || null,
                data_fim_prevista: new Date(new Date().setMonth(new Date().getMonth() + 1)) // Exemplo: 1 mês
            };

            const result = await pagamentosRepository.createAssinaturaPrestador(newAssinatura);
            if (!result.ok) {
                 return res.status(result.status).json(result);
            }

            res.status(result.status).json({ ...result, gateway_data: starkBankChargeResponse.data });

        } catch (error) {
            console.error("Erro no controller ao assinar prestador em plano:", error);
            res.status(500).json({ status: 500, ok: false, message: "Erro interno do servidor ao assinar prestador em plano." });
        }
    },

    /**
     * @description Endpoint de webhook para confirmar o pagamento de uma assinatura.
     * @param {Object} req - Objeto de requisição (body: { event, data }).
     * @param {Object} res - Objeto de resposta.
     */
    confirmAssinatura: async (req, res) => {
        const { event, data } = req.body;

        if (event !== 'payment_approved') {
            console.log(`[Webhook] Evento de assinatura recebido não é de aprovação: ${event}`);
            return res.status(200).json({ ok: true, message: "Evento não é de aprovação, ignorado." });
        }

        const externalAssinaturaId = data.id;

        if (!externalAssinaturaId) {
            return res.status(400).json({ status: 400, ok: false, message: "ID da assinatura externa ausente na requisição do webhook." });
        }

        try {
            // 1. Encontrar a assinatura no nosso banco de dados pelo ID externo
            const assinaturaResult = await pagamentosRepository.getAssinaturaByExternalId(externalAssinaturaId);
            if (!assinaturaResult.ok) {
                console.error(`[Webhook] Assinatura não encontrada com ID externo: ${externalAssinaturaId}`);
                return res.status(404).json({ status: 404, ok: false, message: "Assinatura não encontrada." });
            }
            const assinatura = assinaturaResult.data;

            // 2. Verificar se a assinatura já foi ativada
            if (assinatura.status === 'ativa' || assinatura.status === 'concluida') { // Adiciona 'concluida' para consistência
                console.log(`[Webhook] Assinatura ${externalAssinaturaId} já foi ativada.`);
                return res.status(200).json({ ok: true, message: "Assinatura já ativada." });
            }

            // 3. Atualizar o status da assinatura para 'ativa'
            const updatedAssinaturaResult = await pagamentosRepository.updateAssinaturaStatus(assinatura.id, 'ativa');
            if (!updatedAssinaturaResult.ok) {
                console.error(`[Webhook] Erro ao atualizar status da assinatura ${assinatura.id}:`, updatedAssinaturaResult.message);
                return res.status(updatedAssinaturaResult.status).json(updatedAssinaturaResult);
            }
            
            // 4. (Opcional) Notificar o prestador que a assinatura foi ativada
            // ...

            console.log(`[Webhook] Assinatura ${assinatura.id} de prestador ${assinatura.prestador_id} ativada.`);
            return res.status(200).json({ ok: true, message: "Assinatura processada e ativada com sucesso." });
        } catch (error) {
            console.error("Erro no controller de confirmação de assinatura:", error);
            res.status(500).json({ status: 500, ok: false, message: "Erro interno do servidor ao processar o webhook de assinatura." });
        }
    },

    /**
     * @description Obtém a assinatura de um prestador logado.
     * @param {Object} req - Objeto de requisição.
     * @param {Object} res - Objeto de resposta.
     */
    getPrestadorAssinatura: async (req, res) => {
        const prestador_id = req.user.id;
        try {
            const result = await pagamentosRepository.getAssinaturaByPrestadorId(prestador_id);
            res.status(result.status).json(result);
        } catch (error) {
            console.error("Erro no controller ao obter assinatura do prestador:", error);
            res.status(500).json({ status: 500, ok: false, message: "Erro interno do servidor ao obter assinatura do prestador." });
        }
    },

    /**
     * @description Obtém um pagamento específico pelo ID.
     * @param {Object} req - Objeto de requisição (params: { id }).
     * @param {Object} res - Objeto de resposta.
     */
    getPaymentById: async (req, res) => {
        const { id } = req.params;
        try {
            const result = await pagamentosRepository.getPaymentById(id);
            res.status(result.status).json(result);
        } catch (error) {
            console.error("Erro no controller ao obter pagamento por ID:", error);
            res.status(500).json({ status: 500, ok: false, message: "Erro interno do servidor ao obter pagamento por ID." });
        }
    }
};

export default pagamentosController;
