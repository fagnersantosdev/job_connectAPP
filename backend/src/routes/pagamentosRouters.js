import express from 'express';
import pagamentosController from '../controllers/pagamentosController.js';
import authMiddleware from '../middlewares/authMiddleware.js'; // Importar o middleware de autenticação

const router = express.Router();

// --- Rotas Protegidas para Pagamentos e Assinaturas ---
// Todas as rotas de pagamento e assinatura devem ser protegidas, pois envolvem transações financeiras e dados sensíveis.

// POST /pagamentos/initiate - Inicia um novo pagamento para uma solicitação de serviço (Cliente)
router.post('/initiate', authMiddleware, pagamentosController.initiatePayment);

// POST /pagamentos/release/:solicitacao_id - Libera o pagamento de custódia para o prestador (Cliente)
router.post('/release/:solicitacao_id', authMiddleware, pagamentosController.releasePayment);

// GET /pagamentos/transacao/:id - Obtém o status de uma transação específica (Cliente/Prestador)
router.get('/transacao/:id', authMiddleware, pagamentosController.getTransacaoStatus);

// POST /pagamentos/webhook - Endpoint para webhooks do Stark Bank (PÚBLICO, mas com validação interna de segurança)
// Este endpoint deve ser acessível publicamente para o Stark Bank enviar notificações.
router.post('/webhook', pagamentosController.handleWebhook); // Não precisa de authMiddleware aqui, a validação é interna do webhook.

// GET /pagamentos/planos - Obtém todos os planos de assinatura disponíveis (PÚBLICO ou PROTEGIDO, dependendo da regra)
router.get('/planos', pagamentosController.getPlanosAssinatura); // Deixando público para facilitar a consulta de planos.

// POST /pagamentos/subscribe - Assina um prestador em um plano (Prestador)
router.post('/subscribe', authMiddleware, pagamentosController.subscribePrestadorToPlan);

// GET /pagamentos/assinatura/me - Obtém a assinatura do prestador logado (Prestador)
router.get('/assinatura/me', authMiddleware, pagamentosController.getPrestadorAssinatura);


export default router;
