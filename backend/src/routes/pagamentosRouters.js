import express from 'express';
import pagamentosController from '../controllers/pagamentosController.js';
import authMiddleware from '../middlewares/authMiddleware.js'; // Certifique-se de que este caminho está correto

const router = express.Router();

// Rotas para pagamentos de serviços (cliente pagando prestador)
// Rota para iniciar um novo pagamento para uma solicitação de serviço.
router.post('/', authMiddleware, pagamentosController.initiatePayment);

// Rota para confirmar um pagamento (geralmente via webhook do gateway de pagamento).
// Esta rota não precisa de authMiddleware, pois é chamada pelo gateway (Stark Bank).
router.post('/confirm', pagamentosController.confirmPayment);

// Rotas para assinatura de prestador (prestador assinando plano)
// Rota para iniciar a cobrança de uma assinatura de prestador em um plano.
router.post('/assinatura', authMiddleware, pagamentosController.initiateAssinaturaPrestador);

// Rota para confirmar uma assinatura de prestador (geralmente via webhook do gateway).
// Esta rota não precisa de authMiddleware, pois é chamada pelo gateway (Stark Bank).
router.post('/assinatura/confirm', pagamentosController.confirmAssinatura);

// Rotas para obter informações de pagamentos/assinaturas
// Rota para obter a assinatura de um prestador logado.
router.get('/assinatura/prestador', authMiddleware, pagamentosController.getPrestadorAssinatura);

// Rota para obter um pagamento específico pelo ID.
router.get('/:id', authMiddleware, pagamentosController.getPaymentById);

export default router;
