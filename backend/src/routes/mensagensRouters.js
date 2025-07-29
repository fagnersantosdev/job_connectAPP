import express from 'express';
import mensagensController from '../controllers/mensagensController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rota para enviar uma nova mensagem (HTTP POST)
router.post('/', authMiddleware, mensagensController.sendMensagem);

// Rota para obter todas as mensagens de uma solicitação (HTTP GET)
router.get('/:solicitacao_id', authMiddleware, mensagensController.getMensagensBySolicitacao);

export default router;
