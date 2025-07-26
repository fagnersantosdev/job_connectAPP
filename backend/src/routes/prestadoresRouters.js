import express from 'express';
import PrestadoresControllers from '../controllers/PrestadoresControllers.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// --- Rotas Públicas de Prestadores ---
router.post('/login', PrestadoresControllers.loginPrestador);
router.post('/', PrestadoresControllers.createPrestadores);
router.get('/', PrestadoresControllers.getAllPrestadores);
router.get('/id/:id', PrestadoresControllers.getPrestadores);
router.get('/nome/:nome', PrestadoresControllers.getPrestadoresByName);
router.get('/foto/:id', PrestadoresControllers.getFotoById);

// NOVO: GET /prestadores/nearby - Buscar prestadores por proximidade e filtros de serviço
router.get('/nearby', PrestadoresControllers.getNearbyPrestadores);


// --- Rotas Protegidas de Prestadores (exigem JWT) ---

// PUT - Atualizar prestador (apenas o próprio prestador logado pode atualizar seus dados)
router.put('/:id', authMiddleware, PrestadoresControllers.updateUser);

// DELETE - Excluir prestador (apenas o próprio prestador logado pode excluir sua conta)
router.delete('/:id', authMiddleware, PrestadoresControllers.deleteUser);

// PUT /prestadores/:id/status-disponibilidade - Atualiza o status de disponibilidade do prestador
router.put('/:id/status-disponibilidade', authMiddleware, PrestadoresControllers.updatePrestadorAvailability);

export default router;
