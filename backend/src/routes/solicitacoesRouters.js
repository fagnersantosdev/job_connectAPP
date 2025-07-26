import express from 'express';
import solicitacoesController from '../controllers/solicitacoesController.js';
import authMiddleware from '../middlewares/authMiddleware.js'; // Caminho ajustado para middleware

const router = express.Router();

// --- Rotas Protegidas para Solicitações de Serviço ---
// Todas as rotas de solicitação de serviço exigirão autenticação
router.post('/', authMiddleware, solicitacoesController.createSolicitacao); // Cliente cria solicitação
router.get('/', authMiddleware, solicitacoesController.getAllSolicitacoes); // Cliente/Prestador veem solicitações
router.get('/:id', authMiddleware, solicitacoesController.getSolicitacaoById); // Cliente/Prestador veem detalhes
router.put('/:id', authMiddleware, solicitacoesController.updateSolicitacao); // Cliente/Prestador atualizam status/valor
router.delete('/:id', authMiddleware, solicitacoesController.deleteSolicitacao); // Cliente deleta

export default router;