import express from 'express';
import avaliacoesController from '../controllers/avaliacoesController.js';
import authMiddleware from '../middlewares/authMiddleware.js'; // Importar o middleware de autenticação

const router = express.Router();

// --- Rotas Protegidas para Avaliações ---
// A criação e exclusão de avaliações devem ser protegidas.
// A consulta de avaliações (GET) pode ser pública ou protegida, dependendo da sua regra de negócio.

// POST /avaliacoes - Cria uma nova avaliação (apenas clientes logados)
router.post('/', authMiddleware, avaliacoesController.createAvaliacao);

// GET /avaliacoes - Obtém todas as avaliações (pode ser público para exibir reputação, ou protegido)
router.get('/', avaliacoesController.getAllAvaliacoes); // Exemplo: Público para consulta geral

// GET /avaliacoes/:id - Obtém uma avaliação específica pelo ID (pode ser público)
router.get('/:id', avaliacoesController.getAvaliacaoById); // Exemplo: Público para consulta individual

// DELETE /avaliacoes/:id - Deleta uma avaliação (apenas o cliente que a criou)
router.delete('/:id', authMiddleware, avaliacoesController.deleteAvaliacao);

export default router;
