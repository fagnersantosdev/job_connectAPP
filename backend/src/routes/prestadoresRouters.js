import express from 'express';
import PrestadoresController from '../controllers/PrestadoresController.js';
import authMiddleware from '../middlewares/authMiddleware.js'; // Importar o middleware de autenticação

const router = express.Router();

// --- Rotas Públicas de Prestadores ---
// A rota de login não deve ser protegida
router.post('/login', PrestadoresController.loginPrestador); // Rota de login do prestador

// A rota de cadastro (POST /) geralmente é pública para permitir novos registros
router.post('/', PrestadoresController.createPrestadores); // Cadastrar novo prestador

// GET - Todos os prestadores (pode ser público para listagem geral, ou protegido se só logados puderem ver)
// Por enquanto, deixaremos público para facilitar a visualização de serviços, mas pode ser protegido depois.
router.get('/', PrestadoresController.getAllPrestadores);

// GET - Buscar por ID (pode ser público para visualização de perfil, ou protegido)
router.get('/id/:id', PrestadoresController.getPrestadores);

// GET - Buscar por nome (pode ser público)
router.get('/nome/:nome', PrestadoresController.getPrestadoresByName);

// GET - Buscar foto (pode ser público)
router.get('/foto/:id', PrestadoresController.getFotoById);


// --- Rotas Protegidas de Prestadores (exigem JWT) ---
// Aplica o authMiddleware a todas as rotas abaixo dele neste roteador.
// Isso significa que qualquer requisição para estas rotas precisará de um token JWT válido.

// PUT - Atualizar prestador (apenas o próprio prestador logado pode atualizar seus dados)
// A rota PUT para atualização deve ser específica para o ID do prestador logado, ou o ID deve vir no parâmetro.
// Se o ID for extraído do token (req.user.id), a rota pode ser '/meu-perfil' ou '/'.
// Se o ID vier na URL, o middleware de autorização no controller deve verificar se o ID corresponde ao do token.
router.put('/:id', authMiddleware, PrestadoresController.updateUser); // Protegida

// DELETE - Excluir prestador (apenas o próprio prestador logado pode excluir sua conta)
router.delete('/:id', authMiddleware, PrestadoresController.deleteUser); // Protegida

export default router;
