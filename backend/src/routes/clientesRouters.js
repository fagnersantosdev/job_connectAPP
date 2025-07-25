import express from 'express';
import clientesController from '../controllers/clientesController.js'; // Ajustado para clientesController.js
import authMiddleware from '../middlewares/authMiddleware.js'; // Importar o middleware de autenticação


const router = express.Router();

// --- Rotas Públicas de Clientes ---
// A rota de login não deve ser protegida
router.post('/login', clientesController.loginCliente); // Rota de login do cliente

// A rota de cadastro (POST /) geralmente é pública para permitir novos registros
router.post('/', clientesController.createClientes); // Cadastrar novo cliente

// GET - Todos os clientes (pode ser público para listagem geral, ou protegido se só logados puderem ver)
// Por enquanto, deixaremos público para facilitar a visualização de serviços, mas pode ser protegido depois.
router.get('/', clientesController.getAllClientes);

// GET - Buscar por ID (pode ser público para visualização de perfil, ou protegido)
router.get('/id/:id', clientesController.getClientes);

// GET - Buscar por nome (pode ser público)
router.get('/nome/:nome', clientesController.getClientesByName);

// GET - Buscar foto (pode ser público)
router.get('/foto/:id', clientesController.getFotoById);


// --- Rotas Protegidas de Clientes (exigem JWT) ---
// Aplica o authMiddleware a todas as rotas abaixo dele neste roteador.
// Isso significa que qualquer requisição para estas rotas precisará de um token JWT válido.

// PUT - Atualizar cliente (apenas o próprio cliente logado pode atualizar seus dados)
// A rota PUT para atualização deve ser específica para o ID do cliente logado, ou o ID deve vir no parâmetro.
// Se o ID for extraído do token (req.user.id), a rota pode ser '/meu-perfil' ou '/'.
// Se o ID vier na URL, o middleware de autorização no controller deve verificar se o ID corresponde ao do token.
router.put('/:id', authMiddleware, clientesController.updateCliente); // CORRIGIDO: de updateUser para updateCliente

// DELETE - Excluir cliente (apenas o próprio cliente logado pode excluir sua conta)
router.delete('/:id', authMiddleware, clientesController.deleteCliente); // CORRIGIDO: de deleteUser para deleteCliente

export default router;

