import pagamentosRepository from "../repositories/pagamentosRepository.js";
import solicitacoesRepository from "../repositories/solicitacoesRepository.js";
import prestadoresRepository from "../repositories/prestadoresRepository.js";
import starkBankService from "../services/starkBankService.js"; // Importar o serviço Stark Bank (mockado ou real)

const pagamentosController = {
    /**
     * @description Inicia um novo pagamento para uma solicitação de serviço.
     * O cliente logado paga o valor proposto ao prestador.
     * Este valor será inicialmente retido em uma conta de custódia.
     * @param {Object} req - Objeto de requisição (body: { solicitacao_id, metodo_pagamento }).
     * @param {Object} res - Objeto de resposta.
     */
    initiatePayment: async (req, res) => {
        const cliente_id = req.user.id; // ID do cliente logado (do JWT)
        const { solicitacao_id, metodo_pagamento } = req.body;

        const erros = [];
        if (!solicitacao_id || isNaN(parseInt(solicitacao_id))) {
            erros.push("ID da solicitação é obrigatório e deve ser um número.");
        }
        if (!metodo_pagamento || metodo_pagamento.trim().length === 0) {
            erros.push("Método de pagamento é obrigatório.");
        }
        if (!['pix', 'boleto', 'cartao_credito', 'transferencia'].includes(metodo_pagamento)) {
            erros.push("Método de pagamento inválido. Opções: pix, boleto, cartao_credito, transferencia.");
        }

        if (erros.length > 0) {
            return res.status(400).json({ status: 400, ok: false, message: erros });
        }

        try {
            // 1. Obter detalhes da solicitação de serviço
            const solicitacaoResult = await solicitacoesRepository.getById(solicitacao_id);
            if (!solicitacaoResult.ok || !solicitacaoResult.data) {
                return res.status(404).json({ status: 404, ok: false, message: "Solicitação de serviço não encontrada." });
            }
            const solicitacao = solicitacaoResult.data;

            // 2. Validar se o cliente logado é o cliente da solicitação
            if (solicitacao.cliente_id !== cliente_id) {
                return res.status(403).json({ status: 403, ok: false, message: "Acesso negado: Você não é o cliente desta solicitação." });
            }

            // 3. Validar status da solicitação (deve estar 'aceita' ou 'proposta' para iniciar pagamento)
            if (!['aceita', 'proposta'].includes(solicitacao.status)) {
                return res.status(400).json({ status: 400, ok: false, message: "Não é possível iniciar pagamento para esta solicitação. Status inválido." });
            }

            // 4. Obter o valor do serviço (valor_proposto ou valor_estimado do serviço oferecido)
            const valorDoServico = solicitacao.valor_proposto || solicitacao.servico_valor_estimado;
            if (!valorDoServico || parseFloat(valorDoServico) <= 0) {
                return res.status(400).json({ status: 400, ok: false, message: "Valor do serviço inválido para pagamento." });
            }

            // 5. Criar ou obter a conta de custódia para esta solicitação
            let contaCustodiaResult = await pagamentosRepository.getContaCustodiaBySolicitacaoId(solicitacao_id);
            let contaCustodia;

            if (!contaCustodiaResult.ok || !contaCustodiaResult.data) {
                // Se não existe, cria uma nova conta de custódia
                const newContaCustodia = {
                    solicitacao_id: solicitacao_id,
                    valor_total: valorDoServico,
                    valor_em_custodia: 0,
                    status: 'pendente'
                };
                const createContaResult = await pagamentosRepository.createContaCustodia(newContaCustodia);
                if (!createContaResult.ok) {
                    return res.status(createContaResult.status).json(createContaResult);
                }
                contaCustodia = createContaResult.data;
            } else {
                contaCustodia = contaCustodiaResult.data;
                // Se já existe e já foi depositado, não permite novo pagamento
                if (contaCustodia.status === 'depositado') {
                    return res.status(400).json({ status: 400, ok: false, message: "Pagamento para esta solicitação já foi depositado." });
                }
                // Se o valor total da solicitação mudou, atualiza na conta de custódia
                if (parseFloat(contaCustodia.valor_total) !== parseFloat(valorDoServico)) {
                    await pagamentosRepository.updateContaCustodia(contaCustodia.id, { valor_total: valorDoServico });
                    contaCustodia.valor_total = valorDoServico; // Atualiza o objeto local
                }
            }

            // 6. Preparar dados para o Stark Bank (simulado)
            const paymentData = {
                amount: parseFloat(valorDoServico),
                description: `Pagamento serviço ${solicitacao.titulo_servico} (Solicitação #${solicitacao_id})`,
                taxId: solicitacao.cliente_cpf_cnpj, // CPF/CNPJ do cliente pagador
                name: solicitacao.nome_cliente, // Nome do cliente pagador
                // Outros dados específicos para Pix, Boleto, Cartão (chave Pix, dados do cartão, etc.)
                // Estes dados viriam do frontend de forma segura.
                metodo: metodo_pagamento
            };

            // 7. Chamar o serviço do Stark Bank para iniciar o pagamento
            const starkBankResponse = await starkBankService.createPayment(paymentData);

            if (!starkBankResponse.ok) {
                return res.status(500).json({ status: 500, ok: false, message: starkBankResponse.message, starkBankError: starkBankResponse.data });
            }

            // 8. Registrar a transação no seu banco de dados
            const transacaoObj = {
                solicitacao_id: solicitacao_id,
                conta_custodia_id: contaCustodia.id,
                remetente_id: cliente_id,
                remetente_tipo: 'cliente',
                destinatario_id: solicitacao.prestador_id_aceito,
                destinatario_tipo: 'prestador',
                tipo_transacao: 'pagamento_servico',
                valor: parseFloat(valorDoServico),
                moeda: 'BRL',
                metodo_pagamento: metodo_pagamento,
                status: 'pendente', // Status inicial, será atualizado pelo webhook
                id_externo_gateway: starkBankResponse.data.id // ID retornado pelo Stark Bank
            };

            const createTransacaoResult = await pagamentosRepository.createTransacao(transacaoObj);
            if (!createTransacaoResult.ok) {
                // Se a transação no seu DB falhar, você pode precisar reverter o pagamento no Stark Bank (se for possível)
                return res.status(createTransacaoResult.status).json(createTransacaoResult);
            }

            res.status(200).json({
                status: 200,
                ok: true,
                message: "Pagamento iniciado com sucesso. Aguardando confirmação do gateway.",
                data: {
                    transacao: createTransacaoResult.data,
                    starkBankInfo: starkBankResponse.data // Retorna informações do Stark Bank (ex: QR Code Pix, linha digitável)
                }
            });

        } catch (error) {
            console.error("Erro no controller ao iniciar pagamento:", error);
            res.status(500).json({ status: 500, ok: false, message: "Erro interno do servidor ao iniciar pagamento." });
        }
    },

    /**
     * @description Libera o pagamento de custódia para o prestador após a conclusão do serviço.
     * Apenas o cliente que solicitou o serviço pode liberar.
     * @param {Object} req - Objeto de requisição (params: { solicitacao_id }).
     * @param {Object} res - Objeto de resposta.
     */
    releasePayment: async (req, res) => {
        const cliente_id = req.user.id; // ID do cliente logado
        const solicitacao_id = parseInt(req.params.solicitacao_id);

        if (isNaN(solicitacao_id)) {
            return res.status(400).json({ status: 400, ok: false, message: "ID da solicitação inválido." });
        }

        try {
            // 1. Obter detalhes da solicitação
            const solicitacaoResult = await solicitacoesRepository.getById(solicitacao_id);
            if (!solicitacaoResult.ok || !solicitacaoResult.data) {
                return res.status(404).json({ status: 404, ok: false, message: "Solicitação de serviço não encontrada." });
            }
            const solicitacao = solicitacaoResult.data;

            // 2. Validar se o cliente logado é o cliente da solicitação
            if (solicitacao.cliente_id !== cliente_id) {
                return res.status(403).json({ status: 403, ok: false, message: "Acesso negado: Você não é o cliente desta solicitação." });
            }

            // 3. Validar status da solicitação (deve estar 'concluida')
            if (solicitacao.status !== 'concluida') {
                return res.status(400).json({ status: 400, ok: false, message: "Não é possível liberar pagamento: o serviço não está 'concluida'." });
            }

            // 4. Obter a conta de custódia
            const contaCustodiaResult = await pagamentosRepository.getContaCustodiaBySolicitacaoId(solicitacao_id);
            if (!contaCustodiaResult.ok || !contaCustodiaResult.data) {
                return res.status(404).json({ status: 404, ok: false, message: "Conta de custódia não encontrada para esta solicitação." });
            }
            const contaCustodia = contaCustodiaResult.data;

            // 5. Validar status da conta de custódia (deve estar 'depositado')
            if (contaCustodia.status !== 'depositado') {
                return res.status(400).json({ status: 400, ok: false, message: "Não é possível liberar pagamento: o valor não está em custódia ou já foi liberado/cancelado." });
            }
            if (parseFloat(contaCustodia.valor_em_custodia) !== parseFloat(contaCustodia.valor_total)) {
                 return res.status(400).json({ status: 400, ok: false, message: "Valor em custódia não corresponde ao valor total do serviço." });
            }

            // 6. Calcular a taxa da plataforma
            const prestadorResult = await prestadoresRepository.getById(solicitacao.prestador_id_aceito);
            if (!prestadorResult.ok || !prestadorResult.data) {
                return res.status(404).json({ status: 404, ok: false, message: "Prestador aceito não encontrado." });
            }
            const prestador = prestadorResult.data;

            const assinaturaPrestadorResult = await pagamentosRepository.getAssinaturaByPrestadorId(prestador.id);
            let taxaComissao = 0.15; // Taxa padrão se não houver assinatura ou plano
            if (assinaturaPrestadorResult.ok && assinaturaPrestadorResult.data) {
                taxaComissao = parseFloat(assinaturaPrestadorResult.data.plano_taxa_comissao);
            }

            const valorTotal = parseFloat(contaCustodia.valor_total);
            const valorTaxa = valorTotal * taxaComissao;
            const valorRepassePrestador = valorTotal - valorTaxa;

            // 7. Simular a criação da transferência para o prestador e a taxa para a plataforma
            // (Esta parte seria a integração real com o Stark Bank para transferências)
            console.log(`[StarkBankService - MOCK] Simulação de transferência para Prestador ${prestador.nome}: R$ ${valorRepassePrestador.toFixed(2)}`);
            console.log(`[StarkBankService - MOCK] Simulação de taxa para Plataforma: R$ ${valorTaxa.toFixed(2)}`);

            // Simular sucesso da transferência
            const mockTransferId = `mock-transfer-${Date.now()}`;
            const mockFeeId = `mock-fee-${Date.now()}-platform`;

            // 8. Registrar as transações de repasse e taxa no seu banco de dados
            // Transação de repasse para o prestador
            const repasseTransacao = {
                solicitacao_id: solicitacao_id,
                conta_custodia_id: contaCustodia.id,
                remetente_id: null, // A plataforma é a remetente (do escrow)
                remetente_tipo: 'plataforma',
                destinatario_id: prestador.id,
                destinatario_tipo: 'prestador',
                tipo_transacao: 'repasse_prestador',
                valor: valorRepassePrestador,
                moeda: 'BRL',
                metodo_pagamento: 'transferencia_interna', // Ou tipo de transferência do Stark Bank
                status: 'concluida',
                id_externo_gateway: mockTransferId
            };
            const repasseResult = await pagamentosRepository.createTransacao(repasseTransacao);
            if (!repasseResult.ok) {
                console.error("Erro ao registrar transação de repasse:", repasseResult.message);
                // Considerar rollback ou compensação
            }

            // Transação da taxa para a plataforma
            const taxaTransacao = {
                solicitacao_id: solicitacao_id,
                conta_custodia_id: contaCustodia.id,
                remetente_id: null, // A plataforma é a remetente (do escrow)
                remetente_tipo: 'plataforma',
                destinatario_id: null, // A plataforma é a destinatária
                destinatario_tipo: 'plataforma',
                tipo_transacao: 'taxa_plataforma',
                valor: valorTaxa,
                moeda: 'BRL',
                metodo_pagamento: 'deducao_interna',
                status: 'concluida',
                id_externo_gateway: mockFeeId
            };
            const taxaResult = await pagamentosRepository.createTransacao(taxaTransacao);
            if (!taxaResult.ok) {
                console.error("Erro ao registrar transação de taxa:", taxaResult.message);
                // Considerar rollback ou compensação
            }

            // 9. Atualizar o status da conta de custódia para 'liberado'
            const updateCustodiaResult = await pagamentosRepository.updateContaCustodia(contaCustodia.id, { status: 'liberado', valor_em_custodia: 0 });
            if (!updateCustodiaResult.ok) {
                console.error("Erro ao atualizar status da conta de custódia:", updateCustodiaResult.message);
                // Isso é crítico, pode indicar inconsistência.
            }

            res.status(200).json({
                status: 200,
                ok: true,
                message: "Pagamento liberado para o prestador e taxas processadas com sucesso.",
                data: {
                    solicitacao_id: solicitacao_id,
                    valor_repassado: valorRepassePrestador.toFixed(2),
                    valor_taxa: valorTaxa.toFixed(2),
                    conta_custodia_status: updateCustodiaResult.data ? updateCustodiaResult.data.status : 'erro_atualizacao'
                }
            });

        } catch (error) {
            console.error("Erro no controller ao liberar pagamento:", error);
            res.status(500).json({ status: 500, ok: false, message: "Erro interno do servidor ao liberar pagamento." });
        }
    },

    /**
     * @description Endpoint para receber notificações de webhook do Stark Bank.
     * Este endpoint seria chamado pelo Stark Bank para informar sobre o status de uma transação.
     * @param {Object} req - Objeto de requisição (body: payload do webhook).
     * @param {Object} res - Objeto de resposta.
     */
    handleWebhook: async (req, res) => {
        console.log("[Webhook] Recebido webhook do Stark Bank:", req.body);

        const webhookData = req.body;
        const externalId = webhookData.id;
        let newStatus = webhookData.status; // Usar let para poder reatribuir
        const type = webhookData.type;

        console.log(`[Webhook DEBUG] Processando webhook para externalId: ${externalId}, status: ${newStatus}, tipo: ${type}`);

        try {
            // Mapear status do Stark Bank para status interno do seu DB
            if (newStatus === 'paid') {
                newStatus = 'concluida'; // Mapeia 'paid' para 'concluida'
            } else if (newStatus === 'failed') {
                newStatus = 'falhou'; // Exemplo de mapeamento para falha
            } else if (newStatus === 'processing') {
                newStatus = 'processando'; // Mapeia 'processing' para 'processando'
            }
            // Adicione mais mapeamentos conforme a documentação do Stark Bank

            console.log(`[Webhook DEBUG] Status mapeado para DB interno: ${newStatus}`);


            // Buscar a transação correspondente no seu banco de dados pelo id_externo_gateway
            const transacaoResult = await pagamentosRepository.getTransacaoByExternalId(externalId);
            if (!transacaoResult.ok || !transacaoResult.data) {
                console.warn(`[Webhook DEBUG] Transação com ID externo ${externalId} não encontrada no DB interno.`);
                return res.status(404).json({ status: 404, ok: false, message: "Transação não encontrada no sistema." });
            }
            const transacao = transacaoResult.data;
            console.log(`[Webhook DEBUG] Transação interna encontrada: ID=${transacao.id}, Status Atual=${transacao.status}`);

            // Atualizar o status da transação
            const updateTransacaoResult = await pagamentosRepository.updateTransacaoStatus(transacao.id, newStatus);
            console.log(`[Webhook DEBUG] Resultado da atualização da transação:`, updateTransacaoResult);

            if (!updateTransacaoResult.ok) {
                console.error(`[Webhook DEBUG] Erro ao atualizar status da transação ${transacao.id}:`, updateTransacaoResult.message);
                return res.status(500).json({ status: 500, ok: false, message: "Erro ao atualizar status da transação interna." });
            }

            // Lógica adicional baseada no tipo e status da transação
            if (type === 'pix-payment' && newStatus === 'concluida') { // Usar 'concluida' aqui
                console.log(`[Webhook DEBUG] Pagamento Pix confirmado para solicitação ${transacao.solicitacao_id}.`);
                // Se o pagamento do cliente foi confirmado, atualiza a conta de custódia
                const contaCustodiaResult = await pagamentosRepository.getContaCustodiaBySolicitacaoId(transacao.solicitacao_id);
                if (contaCustodiaResult.ok && contaCustodiaResult.data) {
                    const contaCustodia = contaCustodiaResult.data;
                    console.log(`[Webhook DEBUG] Conta de custódia encontrada: ID=${contaCustodia.id}, Status Atual=${contaCustodia.status}`);

                    // Verifica se o valor da transação corresponde ao valor total da solicitação
                    const valorTransacao = parseFloat(transacao.valor);
                    const valorTotalCustodia = parseFloat(contaCustodia.valor_total);

                    if (valorTransacao !== valorTotalCustodia) {
                        console.warn(`[Webhook DEBUG] Discrepância de valor: Transação ${valorTransacao} vs Custódia ${valorTotalCustodia}.`);
                        // Você pode decidir como lidar com isso: erro, log, ou ajustar a custódia.
                        // Por enquanto, vamos prosseguir com o valor da transação.
                    }

                    const updateCustodia = await pagamentosRepository.updateContaCustodia(contaCustodia.id, {
                        valor_em_custodia: valorTransacao, // Valor total agora em custódia
                        status: 'depositado'
                    });
                    console.log(`[Webhook DEBUG] Resultado da atualização da custódia:`, updateCustodia);

                    if (updateCustodia.ok) {
                        // Opcional: Atualizar status da solicitação para 'aguardando_liberacao'
                        const updateSolicitacaoStatus = await solicitacoesRepository.update(transacao.solicitacao_id, { status: 'aguardando_liberacao' });
                        console.log(`[Webhook DEBUG] Resultado da atualização do status da solicitação:`, updateSolicitacaoStatus);
                    } else {
                        console.error(`[Webhook DEBUG] Erro ao atualizar conta de custódia para solicitação ${transacao.solicitacao_id}:`, updateCustodia.message);
                    }
                } else {
                    console.warn(`[Webhook DEBUG] Conta de custódia não encontrada para solicitação ${transacao.solicitacao_id}.`);
                }
            }
            // Você adicionaria lógica para 'transfer' (repasse), 'boleto', etc.

            res.status(200).json({ status: 200, ok: true, message: "Webhook processado com sucesso." });

        } catch (error) {
            console.error("[Webhook] Erro ao processar webhook:", error);
            res.status(500).json({ status: 500, ok: false, message: "Erro interno do servidor ao processar webhook." });
        }
    },

    /**
     * @description Obtém o status de uma transação específica.
     * @param {Object} req - Objeto de requisição (params: { id }).
     * @param {Object} res - Objeto de resposta.
     */
    getTransacaoStatus: async (req, res) => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ status: 400, ok: false, message: "ID da transação inválido." });
        }

        try {
            const transacaoResult = await pagamentosRepository.getTransacaoById(id);
            if (!transacaoResult.ok || !transacaoResult.data) {
                return res.status(transacaoResult.status).json(transacaoResult);
            }
            const transacao = transacaoResult.data;

            // Opcional: Chamar Stark Bank para obter o status mais recente, se necessário
            // const starkBankStatus = await starkBankService.getPaymentStatus(transacao.id_externo_gateway);
            // if (starkBankStatus.ok) {
            //     transacao.starkBankStatus = starkBankStatus.data.status;
            // }

            res.status(200).json({
                status: 200,
                ok: true,
                message: "Status da transação obtido com sucesso.",
                data: transacao
            });
        } catch (error) {
            console.error("Erro no controller ao obter status da transação:", error);
            res.status(500).json({ status: 500, ok: false, message: "Erro interno do servidor ao obter status da transação." });
        }
    },

    /**
     * @description Obtém os planos de assinatura disponíveis.
     * @param {Object} req - Objeto de requisição.
     * @param {Object} res - Objeto de resposta.
     */
    getPlanosAssinatura: async (req, res) => {
        try {
            const result = await pagamentosRepository.getAllPlanosAssinatura(); // Método a ser criado no repo
            res.status(result.status).json(result);
        } catch (error) {
            console.error("Erro no controller ao obter planos de assinatura:", error);
            res.status(500).json({ status: 500, ok: false, message: "Erro interno do servidor ao obter planos de assinatura." });
        }
    },

    /**
     * @description Assina um prestador em um plano.
     * @param {Object} req - Objeto de requisição (body: { plano_id }).
     * @param {Object} res - Objeto de resposta.
     */
    subscribePrestadorToPlan: async (req, res) => {
        const prestador_id = req.user.id; // ID do prestador logado
        const { plano_id } = req.body;

        if (!plano_id || isNaN(parseInt(plano_id))) {
            return res.status(400).json({ status: 400, ok: false, message: "ID do plano é obrigatório e deve ser um número." });
        }

        try {
            // 1. Verificar se o plano existe
            const planoResult = await pagamentosRepository.getPlanoAssinaturaById(plano_id);
            if (!planoResult.ok || !planoResult.data) {
                return res.status(404).json({ status: 404, ok: false, message: "Plano de assinatura não encontrado." });
            }
            const plano = planoResult.data;

            // 2. Verificar se o prestador já tem uma assinatura
            const existingAssinatura = await pagamentosRepository.getAssinaturaByPrestadorId(prestador_id);
            if (existingAssinatura.ok && existingAssinatura.data) {
                return res.status(409).json({ status: 409, ok: false, message: "Este prestador já possui uma assinatura ativa." });
            }

            // 3. Criar a assinatura
            const newAssinatura = {
                prestador_id: prestador_id,
                plano_id: parseInt(plano_id),
                data_inicio: new Date(),
                status: 'ativo'
            };

            // Para planos pagos, você iniciaria um processo de pagamento aqui
            if (plano.periodicidade !== 'gratuito') {
                // Lógica para cobrar o prestador pelo plano (ex: via Stark Bank)
                // Isso envolveria criar uma transação de 'cobranca_assinatura'
                // E talvez atualizar o status da assinatura para 'pendente' até a confirmação do pagamento
                console.log(`[PagamentosController] Iniciando cobrança para plano ${plano.nome} (R$ ${plano.valor}) para prestador ${prestador_id}`);
                // const starkBankChargeResponse = await starkBankService.createCharge({
                //     amount: plano.valor,
                //     description: `Assinatura Plano ${plano.nome}`,
                //     // ... dados do prestador para cobrança
                // });
                // if (!starkBankChargeResponse.ok) {
                //     return res.status(500).json({ status: 500, ok: false, message: "Falha ao iniciar cobrança da assinatura." });
                // }
                // newAssinatura.status = 'pendente'; // Marca como pendente até o pagamento ser confirmado
                // newAssinatura.id_externo_gateway = starkBankChargeResponse.data.id; // Salva o ID da cobrança
            }

            const result = await pagamentosRepository.createAssinaturaPrestador(newAssinatura);
            res.status(result.status).json(result);

        } catch (error) {
            console.error("Erro no controller ao assinar prestador em plano:", error);
            res.status(500).json({ status: 500, ok: false, message: "Erro interno do servidor ao assinar prestador em plano." });
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
    }
};

export default pagamentosController;
