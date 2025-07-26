import express from 'express';
import PrestadoresController from '../controllers/PrestadoresController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// --- Rotas Públicas de Prestadores ---
router.post('/login', PrestadoresController.loginPrestador);
router.post('/', PrestadoresController.createPrestadores);
router.get('/', PrestadoresController.getAllPrestadores);
router.get('/id/:id', PrestadoresController.getPrestadores);
router.get('/nome/:nome', PrestadoresController.getPrestadoresByName);
router.get('/foto/:id', PrestadoresController.getFotoById);

// NOVO: GET /prestadores/nearby - Buscar prestadores por proximidade e filtros de serviço
router.get('/nearby', PrestadoresController.getNearbyPrestadores);


// --- Rotas Protegidas de Prestadores (exigem JWT) ---

// PUT - Atualizar prestador (apenas o próprio prestador logado pode atualizar seus dados)
router.put('/:id', authMiddleware, PrestadoresController.updateUser);

// DELETE - Excluir prestador (apenas o próprio prestador logado pode excluir sua conta)
router.delete('/:id', authMiddleware, PrestadoresController.deleteUser);

// PUT /prestadores/:id/status-disponibilidade - Atualiza o status de disponibilidade do prestador
router.put('/:id/status-disponibilidade', authMiddleware, PrestadoresController.updatePrestadorAvailability);

export default router;
