import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env

const authMiddleware = (req, res, next) => {
    // 1. Obter o token do cabeçalho da requisição
    // O token geralmente vem no formato "Bearer SEU_TOKEN_AQUI"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Pega a segunda parte (o token em si)

    // 2. Verificar se o token existe
    if (!token) {
        return res.status(401).json({
            status: 401,
            ok: false,
            message: 'Acesso negado: Token não fornecido.'
        });
    }

    try {
        // 3. Verificar e decodificar o token
        // Usa a chave secreta do .env para verificar a validade do token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Anexar as informações do usuário (payload do token) ao objeto req
        // Isso permite que as rotas subsequentes acessem os dados do usuário logado
        req.user = decoded; // Ex: { id: 1, email: 'user@example.com', tipo: 'cliente' }
        next(); // Continua para a próxima função middleware ou para a rota
    } catch (error) {
        console.error('Erro na verificação do token:', error);
        // Lida com diferentes tipos de erros de token
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 401,
                ok: false,
                message: 'Acesso negado: Token expirado.'
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                status: 401,
                ok: false,
                message: 'Acesso negado: Token inválido.'
            });
        }
        return res.status(500).json({
            status: 500,
            ok: false,
            message: 'Erro interno do servidor ao autenticar token.'
        });
    }
};

export default authMiddleware;