import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const STARK_BANK_PROJECT_ID = process.env.STARK_BANK_PROJECT_ID;
const STARK_BANK_PRIVATE_KEY = process.env.STARK_BANK_PRIVATE_KEY;
const STARK_BANK_ENVIRONMENT = process.env.STARK_BANK_ENVIRONMENT || 'sandbox';

// URL base da API do Stark Bank (real, para quando você tiver as credenciais)
const STARK_BANK_API_BASE_URL = STARK_BANK_ENVIRONMENT === 'sandbox'
    ? 'https://sandbox.starkbank.com/v2'
    : 'https://api.starkbank.com/v2';

// Flag para controlar se o mock está ativo
// Em um ambiente de produção, esta flag seria 'false' ou não existiria.
// Para desenvolvimento local sem CNPJ, defina como 'true'.
const USE_MOCK_STARK_BANK = true; // Mude para 'false' quando for integrar com a API real


const starkBankService = {
    /**
     * @description Simula ou cria um pagamento real no Stark Bank.
     * @param {Object} paymentData - Dados do pagamento (valor, descrição, dados do recebedor, etc.).
     * @returns {Promise<{ok: boolean, message: string, data: Object|null}>}
     */
    createPayment: async (paymentData) => {
        if (USE_MOCK_STARK_BANK) {
            console.log("[StarkBankService - MOCK] Simulação de criação de pagamento:", paymentData);
            // Simula um atraso para parecer mais real
            await new Promise(resolve => setTimeout(resolve, 500));

            // Retorna uma resposta simulada de sucesso
            return {
                ok: true,
                message: "Pagamento simulado iniciado com sucesso no Stark Bank (MOCK).",
                data: {
                    id: `mock-payment-${Date.now()}`, // ID único simulado
                    status: "processing", // Ou "paid", "pending"
                    amount: paymentData.amount,
                    description: paymentData.description,
                    // Outros campos que a API real retornaria
                }
            };
        }

        // --- Lógica para a API real do Stark Bank (quando USE_MOCK_STARK_BANK for false) ---
        try {
            // A autenticação real do Stark Bank pode ser mais complexa (assinatura de requisições, etc.)
            // Você precisaria consultar a documentação oficial do Stark Bank para a autenticação exata.
            // Exemplo de endpoint para Pix no Stark Bank (pode variar)
            const endpoint = `${STARK_BANK_API_BASE_URL}/pix-payments`;

            // Esta é uma simplificação. Em um ambiente real, você usaria a SDK do Stark Bank
            // ou implementaria a assinatura conforme a documentação deles.
            const credentials = Buffer.from(`${STARK_BANK_PROJECT_ID}:${STARK_BANK_PRIVATE_KEY}`).toString('base64');
            const authHeaders = {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${credentials}`
            };

            console.log("[StarkBankService - REAL] Tentando criar pagamento:", paymentData);
            const response = await axios.post(endpoint, paymentData, {
                headers: authHeaders
            });

            console.log("[StarkBankService - REAL] Resposta da API Stark Bank:", response.data);

            return {
                ok: true,
                message: "Pagamento iniciado com sucesso no Stark Bank.",
                data: response.data
            };
        } catch (error) {
            console.error("[StarkBankService - REAL] Erro ao criar pagamento:", error.response ? error.response.data : error.message);
            return {
                ok: false,
                message: "Falha ao iniciar pagamento no Stark Bank.",
                data: error.response ? error.response.data : error.message
            };
        }
    },

    /**
     * @description Simula ou verifica o status de um pagamento real.
     * @param {string} externalId - ID da transação no Stark Bank.
     * @returns {Promise<{ok: boolean, message: string, data: Object|null}>}
     */
    getPaymentStatus: async (externalId) => {
        if (USE_MOCK_STARK_BANK) {
            console.log("[StarkBankService - MOCK] Simulação de verificação de status para ID:", externalId);
            await new Promise(resolve => setTimeout(resolve, 300));

            // Simule diferentes status com base no ID, se quiser testar cenários
            const status = externalId.includes('fail') ? 'failed' : 'paid'; // Exemplo simples
            return {
                ok: true,
                message: `Status do pagamento simulado: ${status}.`,
                data: {
                    id: externalId,
                    status: status,
                    // Outros campos
                }
            };
        }

        // --- Lógica para a API real do Stark Bank ---
        try {
            const endpoint = `${STARK_BANK_API_BASE_URL}/pix-payments/${externalId}`; // Exemplo

            const credentials = Buffer.from(`${STARK_BANK_PROJECT_ID}:${STARK_BANK_PRIVATE_KEY}`).toString('base64');
            const authHeaders = {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${credentials}`
            };

            const response = await axios.get(endpoint, {
                headers: authHeaders
            });

            return {
                ok: true,
                message: "Status do pagamento obtido com sucesso.",
                data: response.data
            };
        } catch (error) {
            console.error("[StarkBankService - REAL] Erro ao obter status do pagamento:", error.response ? error.response.data : error.message);
            return {
                ok: false,
                message: "Falha ao obter status do pagamento no Stark Bank.",
                data: error.response ? error.response.data : error.message
            };
        }
    }
};

export default starkBankService;
