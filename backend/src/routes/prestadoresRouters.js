import express from 'express';
import prestadoresController from '../controllers/prestadoresController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// --- Rotas Públicas de Prestadores ---
router.post('/login', prestadoresController.loginPrestador);
router.post('/', prestadoresController.createPrestadores);
router.get('/', prestadoresController.getAllPrestadores);
router.get('/id/:id', prestadoresController.getPrestadores);
router.get('/nome/:nome', prestadoresController.getPrestadoresByName);
router.get('/foto/:id', prestadoresController.getFotoById);
router.get("/destaques", prestadoresController.getFeatured);
router.get("/proximos", prestadoresController.getProximos);

// --- Rotas Protegidas de Prestadores (exigem JWT) ---

// PUT - Atualizar prestador (apenas o próprio prestador logado pode atualizar seus dados)
router.put('/:id', authMiddleware, prestadoresController.updateUser);

// DELETE - Excluir prestador (apenas o próprio prestador logado pode excluir sua conta)
router.delete('/:id', authMiddleware, prestadoresController.deleteUser);

// PUT /prestadores/:id/status-disponibilidade - Atualiza o status de disponibilidade do prestador
router.put('/:id/status-disponibilidade', authMiddleware, prestadoresController.updatePrestadorAvailability);

export default router;
