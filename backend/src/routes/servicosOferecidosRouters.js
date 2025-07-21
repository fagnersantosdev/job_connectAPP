import express from 'express';
import servicosOferecidosControllers from '../controllers/servicosOferecidosControllers.js';
import authMiddleware from '../middlewares/authMiddleware.js'; // Caminho ajustado para middleware

const router = express.Router();

// --- Rotas para Serviços Oferecidos ---
// Algumas rotas podem ser públicas para consulta, outras protegidas para criação/edição.
// Ajuste a proteção (authMiddleware) conforme a necessidade do seu app.

// GET / - Obtém todos os serviços (pode ter filtros por query params) - Pode ser público ou protegido
router.get('/', servicosOferecidosControllers.getAllServicosOferecidos); // Exemplo: Público para listagem

// GET /:id - Obtém um serviço específico pelo ID - Pode ser público ou protegido
router.get('/:id', servicosOferecidosControllers.getServicosOferecidoById); // Exemplo: Público para detalhes

// POST / - Cria um novo serviço - GERALMENTE PROTEGIDO (apenas prestadores logados)
router.post('/', authMiddleware, servicosOferecidosControllers.createServicosOferecido);

// PUT /:id - Atualiza um serviço existente - GERALMENTE PROTEGIDO (apenas o prestador dono)
router.put('/:id', authMiddleware, servicosOferecidosControllers.updateServicosOferecido);

// DELETE /:id - Deleta um serviço - GERALMENTE PROTEGIDO (apenas o prestador dono)
router.delete('/:id', authMiddleware, servicosOferecidosControllers.deleteServicosOferecido);

export default router;