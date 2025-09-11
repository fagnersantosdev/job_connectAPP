import { Router } from 'express';
import clientesController from '../controllers/clientesController.js';
import prestadoresController from '../controllers/prestadoresController.js';

// Middleware para verificar se as variáveis de ambiente essenciais estão carregadas
const checkEnvVars = (req, res, next) => {
    if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_IN) {
        console.error('❗️ ERRO CRÍTICO: As variáveis JWT_SECRET e JWT_EXPIRES_IN não estão definidas no ficheiro .env');
        return res.status(500).json({
            status: 500,
            ok: false,
            message: 'Erro de configuração interna do servidor.'
        });
    }
    next();
};

const router = Router();

// A rota de login agora usa o middleware de verificação primeiro
router.post('/login', checkEnvVars, (req, res, next) => {
    const { role, email, password } = req.body;

    // Converte 'password' (do frontend) para 'senha' (esperado pelo controller)
    const newReq = {
        ...req,
        body: {
            email: email,
            senha: password, 
        }
    };

    if (role === 'cliente') {
        return clientesController.loginCliente(newReq, res, next);
    } 
    else if (role === 'prestador') {
        return prestadoresController.loginPrestador(newReq, res, next);
    } 
    else {
        return res.status(400).json({
            status: 400,
            ok: false,
            message: "O campo 'role' ('cliente' ou 'prestador') é obrigatório."
        });
    }
});

export default router;
