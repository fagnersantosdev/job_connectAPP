import { Router } from 'express';
import servicosOferecidosController from '../controllers/servicosOferecidosController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// --- CORREÇÃO: A rota mais específica '/sugestoes' deve vir ANTES da rota genérica '/:id' ---

// Rota pública para buscar sugestões de serviços
// Ex: GET /servicos-oferecidos/sugestoes?q=instala
router.get('/sugestoes', servicosOferecidosController.getSugestoes);

// Rota pública para buscar todos os serviços (com filtros)
router.get('/', servicosOferecidosController.getAllServicosOferecidos);

// Rota pública para buscar um serviço por ID
router.get('/:id', servicosOferecidosController.getServicoOferecidoById);

// Rota privada para um prestador criar um novo serviço
router.post('/', authMiddleware, servicosOferecidosController.createServicoOferecido);

// Rota privada para um prestador atualizar seu serviço
router.put('/:id', authMiddleware, servicosOferecidosController.updateServicoOferecido);

// Rota privada para um prestador deletar seu serviço
router.delete('/:id', authMiddleware, servicosOferecidosController.deleteServicoOferecido);


export default router;
