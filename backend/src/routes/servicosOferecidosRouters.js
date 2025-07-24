import express from 'express';
import servicosOferecidosControllers from '../controllers/servicosOferecidosControllers.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rotas para Serviços Oferecidos

// POST /servicos-oferecidos - Criar um novo serviço oferecido (apenas prestadores)
router.post('/', authMiddleware, servicosOferecidosControllers.createServicoOferecido);

// GET /servicos-oferecidos - Obter todos os serviços oferecidos (com filtros opcionais)
// Pode ser acessado por qualquer um (público)
router.get('/', servicosOferecidosControllers.getAllServicosOferecidos);

// GET /servicos-oferecidos/:id - Obter um serviço oferecido por ID
// Pode ser acessado por qualquer um (público)
router.get('/:id', servicosOferecidosControllers.getServicoOferecidoById);

// PUT /servicos-oferecidos/:id - Atualizar um serviço oferecido (apenas o prestador dono)
router.put('/:id', authMiddleware, servicosOferecidosControllers.updateServicoOferecido);

// DELETE /servicos-oferecidos/:id - Deletar um serviço oferecido (apenas o prestador dono)
router.delete('/:id', authMiddleware, servicosOferecidosControllers.deleteServicoOferecido);

export default router;
