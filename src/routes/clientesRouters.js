import express from 'express';
import clientesControllers from '../controllers/clientesControllers.js'; // Ajustado para clientesController

const router = express.Router();

// --- Rotas de Clientes ---

// GET - Listar todos os clientes
router.get('/', clientesControllers.getAllClientes);

// GET - Buscar cliente por ID
router.get('/id/:id', clientesControllers.getClientes); // Usando getClientes que busca por ID

// GET - Buscar cliente por nome
router.get('/nome/:nome', clientesControllers.getClientesByName);

// GET - Buscar foto do cliente por ID
router.get('/foto/:id', clientesControllers.getFotoById);

// POST - Cadastrar novo cliente
router.post('/', clientesControllers.createClientes);

// POST - Login do cliente (NOVA ROTA)
router.post('/login', clientesControllers.loginCliente); // Adicionada rota para o novo método de login

// PUT - Atualizar cliente (o ID deve vir na URL para ser mais RESTful)
router.put('/:id', clientesControllers.updateCliente); // Ajustado para updateCliente e ID na URL

// DELETE - Excluir cliente
router.delete('/:id', clientesControllers.deleteCliente); // Ajustado para deleteCliente

export default router;
