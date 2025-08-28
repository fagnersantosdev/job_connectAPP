import express from 'express';
import servicosOferecidosController from '../controllers/servicosOferecidosController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rotas para Serviços Oferecidos

// POST /servicos-oferecidos - Criar um novo serviço oferecido (apenas prestadores)
router.post('/', authMiddleware, servicosOferecidosController.createServicoOferecido);

// GET /servicos-oferecidos - Obter todos os serviços oferecidos (com filtros opcionais)
// Pode ser acessado por qualquer um (público)
router.get('/', servicosOferecidosController.getAllServicosOferecidos);

// GET /servicos-oferecidos/:id - Obter um serviço oferecido por ID
// Pode ser acessado por qualquer um (público)
router.get('/:id', servicosOferecidosController.getServicoOferecidoById);

// PUT /servicos-oferecidos/:id - Atualizar um serviço oferecido (apenas o prestador dono)
router.put('/:id', authMiddleware, servicosOferecidosController.updateServicoOferecido);

// DELETE /servicos-oferecidos/:id - Deletar um serviço oferecido (apenas o prestador dono)
router.delete('/:id', authMiddleware, servicosOferecidosController.deleteServicoOferecido);

// Rota para sugestões: GET /servicos-oferecidos/sugestoes?q=texto
router.get('/sugestoes', servicosOferecidosController.getSugestoes);

export default router;
