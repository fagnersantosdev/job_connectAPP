import pagamentosRepository from "../repositories/pagamentosRepository.js";
import solicitacoesRepository from "../repositories/solicitacoesRepository.js";
import prestadoresRepository from "../repositories/prestadoresRepository.js";
import starkBankService from "../services/starkBankService.js"; // Serviço Stark Bank (mockado ou real)

const pagamentosController = {
    /**
     * @description Inicia um novo pagamento para uma solicitação de serviço.
     * O cliente logado paga o valor proposto ao prestador.
     * Este valor será inicialmente retido em uma conta de custódia.
     * @param {Object} req - Objeto de requisição (body: { solicitacao_id, metodo_pagamento, valor_pagamento }).
     * @param {Object} res - Objeto de resposta.
     */
    initiatePayment: async (req, res) => {
        const cliente_id = req.user.id; // ID do cliente logado (do JWT)
        const { solicitacao_id, metodo_pagamento, valor_pagamento } = req.body;

        const erros = [];
        if (!solicitacao_id || isNaN(parseInt(solicitacao_id))) {
            erros.push("ID da solicitação é obrigatório e deve ser um número.");
        }
        if (!metodo_pagamento || metodo_pagamento.trim().length === 0) {
            erros.push("Método de pagamento é obrigatório.");
        }
        if (!['pix', 'boleto', 'cartao_credito', 'transferencia'].includes(metodo_pagamento)) {
            erros.push("Método de pagamento inválido. Opções válidas: 'pix', 'boleto', 'cartao_credito', 'transferencia'.");
        }
        if (typeof valor_pagamento !== 'number' || valor_pagamento <= 0) {
            erros.push("Valor do pagamento é obrigatório e deve ser um número positivo.");
        }

        if (erros.length > 0) {
            return res.status(400).json({ status: 400, ok: false, message: erros });
        }

        try {
            // 1. Obter detalhes da solicitação para validação
            const solicitacaoResult = await solicitacoesRepository.getById(solicitacao_id);
            if (!solicitacaoResult.ok || !solicitacaoResult.data) {
                return res.status(404).json({ status: 404, ok: false, message: "Solicitação de serviço não encontrada." });
            }
            const solicitacao = solicitacaoResult.data;

            // 2. Validar se o cliente logado é o cliente da solicitação
            if (solicitacao.cliente_id !== cliente_id) {
                return res.status(403).json({ status: 403, ok: false, message: "Acesso negado: Você não é o cliente desta solicitação." });
            }

            // 3. Validar se a solicitação está em um status que permite pagamento (ex: 'aceita', 'aguardando_pagamento')
            // Adapte esta lógica conforme os status do seu fluxo de solicitação
            if (solicitacao.status !== 'aceita' && solicitacao.status !== 'aguardando_pagamento') {
                return res.status(400).json({ status: 400, ok: false, message: `Não é possível iniciar pagamento para solicitação com status '${solicitacao.status}'.` });
            }

            // 4. Obter detalhes do prestador para o pagamento (se necessário para o gateway)
            const prestadorResult = await prestadoresRepository.getById(solicitacao.prestador_id_aceito);
            if (!prestadorResult.ok || !prestadorResult.data) {
                return res.status(404).json({ status: 404, ok: false, message: "Prestador associado à solicitação não encontrado." });
            }
            const prestador = prestadorResult.data;

            // 5. Preparar dados para o gateway de pagamento (Stark Bank)
            const paymentData = {
                amount: valor_pagamento,
                description: `Pagamento para solicitação de serviço #${solicitacao_id}`,
                taxId: prestador.documento_identificacao, // Exemplo: CPF/CNPJ do prestador
                name: prestador.nome_completo, // Exemplo: Nome do prestador
                method: metodo_pagamento,
                // Adicione outros dados necessários para o Stark Bank, como dados do pagador, etc.
                // clientInfo: { id: cliente_id, name: req.user.nome, email: req.user.email },
                // metadata: { solicitacaoId: solicitacao_id }
            };

            let gatewayResponse;
            try {
                // Chamar o serviço Stark Bank para iniciar o pagamento
                gatewayResponse = await starkBankService.createPayment(paymentData);
            } catch (gatewayError) {
                console.error("Erro ao chamar o serviço Stark Bank:", gatewayError);
                return res.status(500).json({ status: 500, ok: false, message: "Erro ao processar pagamento com o gateway." });
            }

            if (!gatewayResponse || !gatewayResponse.ok) {
                // Erro retornado pelo serviço Stark Bank (não um erro de rede)
                return res.status(gatewayResponse.status || 500).json({
                    status: gatewayResponse.status || 500,
                    ok: false,
                    message: gatewayResponse.message || "Falha ao iniciar pagamento via gateway."
                });
            }

            // 6. Criar o registro de pagamento no seu banco de dados
            const newPayment = {
                solicitacao_id: solicitacao_id,
                cliente_id: cliente_id,
                prestador_id: solicitacao.prestador_id_aceito,
                valor: valor_pagamento,
                metodo_pagamento: metodo_pagamento,
                status: 'pendente', // Status inicial, aguardando confirmação do gateway
                id_externo_gateway: gatewayResponse.data.id, // ID da transação no Stark Bank
                url_pagamento: gatewayResponse.data.payment_url || null, // URL para PIX/Boleto, se aplicável
                // Adicione quaisquer outros dados relevantes do gateway, como código PIX, linha digitável, etc.
                // pix_code: gatewayResponse.data.pix_code,
                // barcode: gatewayResponse.data.barcode,
            };

            const result = await pagamentosRepository.createPayment(newPayment);

            if (result.ok) {
                // Opcional: Atualizar o status da solicitação para 'aguardando_pagamento' ou similar
                await solicitacoesRepository.updateStatus(solicitacao_id, 'aguardando_pagamento');

                res.status(result.status).json({
                    ...result,
                    gateway_data: gatewayResponse.data // Retorna dados do gateway para o frontend (ex: QR Code, URL)
                });
            } else {
                // Se falhar ao salvar no DB, idealmente você deveria tentar reverter a transação no gateway
                // Ou ter um sistema de reconciliação. Por simplicidade, apenas logamos o erro aqui.
                console.error("Erro ao salvar pagamento no DB após sucesso no gateway:", result.message);
                res.status(result.status).json(result);
            }

        } catch (error) {
            console.error("Erro no controller ao iniciar pagamento:", error);
            res.status(500).json({ status: 500, ok: false, message: "Erro interno do servidor ao iniciar pagamento." });
        }
    },

    /**
     * @description Confirma um pagamento (geralmente via webhook do gateway de pagamento).
     * Esta rota seria chamada pelo Stark Bank quando um pagamento é confirmado.
     * @param {Object} req - Objeto de requisição (body: dados do webhook do Stark Bank).
     * @param {Object} res - Objeto de resposta.
     */
    confirmPayment: async (req, res) => {
        // A lógica aqui dependerá da estrutura do webhook do Stark Bank.
        // Geralmente, você receberá um ID de transação e um status.
        const webhookData = req.body;
        console.log("Webhook de confirmação de pagamento recebido:", webhookData);

        // Exemplo hipotético:
        const externalPaymentId = webhookData.event.entity.id; // ID da transação no Stark Bank
        const statusFromGateway = webhookData.event.entity.status; // Status do pagamento ('paid', 'failed', etc.)

        if (!externalPaymentId || !statusFromGateway) {
            return res.status(400).json({ status: 400, ok: false, message: "Dados do webhook incompletos." });
        }

        try {
            // 1. Buscar o pagamento no seu DB pelo id_externo_gateway
            const paymentResult = await pagamentosRepository.getByExternalId(externalPaymentId);

            if (!paymentResult.ok || !paymentResult.data) {
                return res.status(404).json({ status: 404, ok: false, message: "Pagamento não encontrado no sistema." });
            }
            const payment = paymentResult.data;

            let newStatus;
            if (statusFromGateway === 'paid') { // Ou 'completed', 'success', dependendo do Stark Bank
                newStatus = 'confirmado';
            } else if (statusFromGateway === 'failed' || statusFromGateway === 'canceled') {
                newStatus = 'falhou';
            } else {
                newStatus = 'desconhecido'; // Ou outro status intermediário
            }

            // 2. Atualizar o status do pagamento no seu DB
            const updateResult = await pagamentosRepository.updatePaymentStatus(payment.id, newStatus);

            if (updateResult.ok) {
                // Opcional: Se o pagamento foi confirmado, atualizar o status da solicitação
                if (newStatus === 'confirmado') {
                    await solicitacoesRepository.updateStatus(payment.solicitacao_id, 'paga');
                    // Aqui você também pode notificar o prestador que o pagamento foi confirmado
                } else if (newStatus === 'falhou') {
                    // Opcional: Reverter status da solicitação ou notificar o cliente
                    await solicitacoesRepository.updateStatus(payment.solicitacao_id, 'pagamento_falhou');
                }
                res.status(200).json({ status: 200, ok: true, message: "Pagamento atualizado com sucesso." });
            } else {
                console.error("Erro ao atualizar status do pagamento no DB:", updateResult.message);
                res.status(500).json({ status: 500, ok: false, message: "Erro interno ao atualizar status do pagamento." });
            }

        } catch (error) {
            console.error("Erro no controller ao confirmar pagamento via webhook:", error);
            res.status(500).json({ status: 500, ok: false, message: "Erro interno do servidor ao processar webhook de pagamento." });
        }
    },

    /**
     * @description Inicia a cobrança de uma assinatura de prestador em um plano.
     * @param {Object} req - Objeto de requisição (body: { plano_id, valor_assinatura, metodo_pagamento }).
     * @param {Object} res - Objeto de resposta.
     */
    initiateAssinaturaPrestador: async (req, res) => {
        const prestador_id = req.user.id; // ID do prestador logado
        const { plano_id, valor_assinatura, metodo_pagamento } = req.body;

        const erros = [];
        if (!plano_id || isNaN(parseInt(plano_id))) {
            erros.push("ID do plano é obrigatório e deve ser um número.");
        }
        if (typeof valor_assinatura !== 'number' || valor_assinatura <= 0) {
            erros.push("Valor da assinatura é obrigatório e deve ser um número positivo.");
        }
        if (!metodo_pagamento || metodo_pagamento.trim().length === 0) {
            erros.push("Método de pagamento é obrigatório.");
        }
        if (!['pix', 'boleto', 'cartao_credito', 'transferencia'].includes(metodo_pagamento)) {
            erros.push("Método de pagamento inválido. Opções válidas: 'pix', 'boleto', 'cartao_credito', 'transferencia'.");
        }

        if (erros.length > 0) {
            return res.status(400).json({ status: 400, ok: false, message: erros });
        }

        try {
            // 1. Verificar se o prestador já possui uma assinatura ativa ou pendente para este plano
            const existingAssinatura = await pagamentosRepository.getAssinaturaByPrestadorId(prestador_id);
            if (existingAssinatura.ok && existingAssinatura.data &&
                (existingAssinatura.data.status === 'ativa' || existingAssinatura.data.status === 'pendente')) {
                return res.status(409).json({ status: 409, ok: false, message: "Prestador já possui uma assinatura ativa ou pendente." });
            }

            // 2. Preparar dados para o gateway de cobrança (Stark Bank - para assinatura)
            const chargeData = {
                amount: valor_assinatura,
                description: `Assinatura do Plano ${plano_id} para Prestador ${prestador_id}`,
                taxId: req.user.documento_identificacao, // Assumindo que o documento está no req.user ou buscar do DB
                name: req.user.nome, // Nome do prestador
                method: metodo_pagamento,
                // Adicione outros dados necessários para o Stark Bank para cobranças recorrentes
            };

            let starkBankChargeResponse;
            try {
                // Chamar o serviço Stark Bank para iniciar a cobrança da assinatura
                starkBankChargeResponse = await starkBankService.createSubscriptionCharge(chargeData);
            } catch (gatewayError) {
                console.error("Erro ao chamar o serviço Stark Bank para assinatura:", gatewayError);
                return res.status(500).json({ status: 500, ok: false, message: "Erro ao processar assinatura com o gateway." });
            }

            if (!starkBankChargeResponse || !starkBankChargeResponse.ok) {
                return res.status(starkBankChargeResponse.status || 500).json({
                    status: starkBankChargeResponse.status || 500,
                    ok: false,
                    message: starkBankChargeResponse.message || "Falha ao iniciar cobrança da assinatura via gateway."
                });
            }

            // 3. Criar o registro da assinatura no seu banco de dados
            const newAssinatura = {
                prestador_id: prestador_id,
                plano_id: plano_id,
                data_inicio: new Date(),
                data_fim_prevista: null, // Definir com base na duração do plano
                valor: valor_assinatura,
                metodo_pagamento: metodo_pagamento,
                status: 'pendente', // Marca como pendente até o pagamento ser confirmado
                id_externo_gateway: starkBankChargeResponse.data.id, // Salva o ID da cobrança
                url_pagamento: starkBankChargeResponse.data.payment_url || null, // URL para PIX/Boleto, se aplicável
            };

            const result = await pagamentosRepository.createAssinaturaPrestador(newAssinatura);

            if (result.ok) {
                res.status(result.status).json({
                    ...result,
                    gateway_data: starkBankChargeResponse.data // Retorna dados do gateway para o frontend
                });
            } else {
                console.error("Erro ao salvar assinatura no DB após sucesso no gateway:", result.message);
                res.status(result.status).json(result);
            }

        } catch (error) {
            console.error("Erro no controller ao assinar prestador em plano:", error);
            res.status(500).json({ status: 500, ok: false, message: "Erro interno do servidor ao assinar prestador em plano." });
        }
    },

    /**
     * @description Confirma uma assinatura de prestador (geralmente via webhook do gateway).
     * @param {Object} req - Objeto de requisição (body: dados do webhook do Stark Bank).
     * @param {Object} res - Objeto de resposta.
     */
    confirmAssinatura: async (req, res) => {
        const webhookData = req.body;
        console.log("Webhook de confirmação de assinatura recebido:", webhookData);

        const externalChargeId = webhookData.event.entity.id;
        const statusFromGateway = webhookData.event.entity.status;

        if (!externalChargeId || !statusFromGateway) {
            return res.status(400).json({ status: 400, ok: false, message: "Dados do webhook de assinatura incompletos." });
        }

        try {
            const assinaturaResult = await pagamentosRepository.getAssinaturaByExternalId(externalChargeId);

            if (!assinaturaResult.ok || !assinaturaResult.data) {
                return res.status(404).json({ status: 404, ok: false, message: "Assinatura não encontrada no sistema." });
            }
            const assinatura = assinaturaResult.data;

            let newStatus;
            if (statusFromGateway === 'paid') {
                newStatus = 'ativa'; // Assinatura confirmada e ativa
            } else if (statusFromGateway === 'failed' || statusFromGateway === 'canceled') {
                newStatus = 'cancelada'; // Ou 'falhou'
            } else {
                newStatus = 'pendente'; // Manter pendente ou outro status intermediário
            }

            const updateResult = await pagamentosRepository.updateAssinaturaStatus(assinatura.id, newStatus);

            if (updateResult.ok) {
                // Se a assinatura foi ativada, você pode querer registrar a data de fim prevista
                if (newStatus === 'ativa' && !assinatura.data_fim_prevista) {
                    // Exemplo: Se o plano for mensal, adicionar 1 mês à data_inicio
                    const dataFimPrevista = new Date(assinatura.data_inicio);
                    dataFimPrevista.setMonth(dataFimPrevista.getMonth() + 1); // Exemplo para plano mensal
                    await pagamentosRepository.updateAssinaturaDataFim(assinatura.id, dataFimPrevista);
                }
                res.status(200).json({ status: 200, ok: true, message: "Assinatura atualizada com sucesso." });
            } else {
                console.error("Erro ao atualizar status da assinatura no DB:", updateResult.message);
                res.status(500).json({ status: 500, ok: false, message: "Erro interno ao atualizar status da assinatura." });
            }

        } catch (error) {
            console.error("Erro no controller ao confirmar assinatura via webhook:", error);
            res.status(500).json({ status: 500, ok: false, message: "Erro interno do servidor ao processar webhook de assinatura." });
        }
    },

    /**
     * @description Obtém a assinatura de um prestador logado.
     * @param {Object} req - Objeto de requisição.
     * @param {Object} res - Objeto de resposta.
     */
    getPrestadorAssinatura: async (req, res) => {
        const prestador_id = req.user.id; // ID do prestador logado
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
        const payment_id = parseInt(req.params.id);
        if (isNaN(payment_id)) {
            return res.status(400).json({ status: 400, ok: false, message: "ID do pagamento inválido." });
        }
        try {
            const result = await pagamentosRepository.getPaymentById(payment_id);
            if (!result.ok || !result.data) {
                return res.status(404).json({ status: 404, ok: false, message: "Pagamento não encontrado." });
            }
            // Opcional: Validar se o usuário logado tem permissão para ver este pagamento
            // if (result.data.cliente_id !== req.user.id && result.data.prestador_id !== req.user.id) {
            //     return res.status(403).json({ status: 403, ok: false, message: "Acesso negado." });
            // }
            res.status(result.status).json(result);
        } catch (error) {
            console.error("Erro no controller ao obter pagamento por ID:", error);
            res.status(500).json({ status: 500, ok: false, message: "Erro interno do servidor ao obter pagamento por ID." });
        }
    }
};

export default pagamentosController;
