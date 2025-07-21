import express from 'express';
import solicitacoesControllers from '../controllers/solicitacoesControllers.js';
import authMiddleware from '../middlewares/authMiddleware.js'; // Caminho ajustado para middleware

const router = express.Router();

// --- Rotas Protegidas para Solicitações de Serviço ---
// Todas as rotas de solicitação de serviço exigirão autenticação
router.post('/', authMiddleware, solicitacoesControllers.createSolicitacao); // Cliente cria solicitação
router.get('/', authMiddleware, solicitacoesControllers.getAllSolicitacoes); // Cliente/Prestador veem solicitações
router.get('/:id', authMiddleware, solicitacoesControllers.getSolicitacaoById); // Cliente/Prestador veem detalhes
router.put('/:id', authMiddleware, solicitacoesControllers.updateSolicitacao); // Cliente/Prestador atualizam status/valor
router.delete('/:id', authMiddleware, solicitacoesControllers.deleteSolicitacao); // Cliente deleta

export default router;