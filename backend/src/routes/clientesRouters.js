
import express from 'express';
import clientesController from '../controllers/clientesController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// --- Rotas Públicas de Clientes ---
// A rota de login não deve ser protegida
router.post('/login', clientesController.loginCliente);

// ** Rota de cadastro agora é '/register' para corresponder à sua requisição **
router.post('/register', clientesController.createClientes); // Rota para cadastrar novo cliente

// GET - Todos os clientes
router.get('/', clientesController.getAllClientes);

// GET - Buscar por ID
router.get('/id/:id', clientesController.getClientes);

// GET - Buscar por nome
router.get('/nome/:nome', clientesController.getClientesByName);

// GET - Buscar foto
router.get('/foto/:id', clientesController.getFotoById);


// --- Rotas Protegidas de Clientes (exigem JWT) ---
router.put('/:id', authMiddleware, clientesController.updateCliente);
router.delete('/:id', authMiddleware, clientesController.deleteCliente);

export default router;
