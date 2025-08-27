import { Router } from 'express';
import clientesController from '../controllers/clientesController.js';
import prestadoresController from '../controllers/PrestadoresController.js';

const router = Router();

// Rota principal de login: POST /login
router.post('/login', (req, res, next) => {
    // O frontend envia 'role', 'email' e 'password'
    const { role, email, password } = req.body;

    // Cria um novo objeto de requisição para garantir que os controllers
    // recebam o campo 'senha' como esperado.
    const newReq = {
        ...req,
        body: {
            email: email,
            senha: password, // <-- Converte 'password' para 'senha'
        }
    };

    // Direciona para o controller apropriado com base no 'role'
    if (role === 'cliente') {
        return clientesController.loginCliente(newReq, res, next);
    } 
    else if (role === 'prestador') {
        return prestadoresController.loginPrestador(newReq, res, next);
    } 
    else {
        // Se nenhum 'role' for fornecido, retorna um erro claro.
        return res.status(400).json({
            status: 400,
            ok: false,
            message: "O campo 'role' ('cliente' ou 'prestador') é obrigatório."
        });
    }
});

export default router;
