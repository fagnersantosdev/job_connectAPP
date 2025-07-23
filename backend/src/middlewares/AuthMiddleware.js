import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authMiddleware = (req, res, next) => {
    // 1. Obter o token do cabeçalho Authorization
    const authHeader = req.headers['authorization'];
    // O token vem no formato "Bearer SEU_TOKEN_AQUI", então precisamos dividir
    const token = authHeader && authHeader.split(' ')[1];

    console.log("[DEBUG - AuthMiddleware] Token recebido:", token ? "Token presente" : "Token ausente");

    if (!token) {
        console.warn("[DEBUG - AuthMiddleware] Acesso negado: Token não fornecido.");
        return res.status(401).json({ status: 401, ok: false, message: "Acesso negado. Token não fornecido." });
    }

    // 2. Verificar o token
    try {
        // O JWT_SECRET deve ser o mesmo usado para assinar o token no login
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log("[DEBUG - AuthMiddleware] Token decodificado:", decoded);

        // 3. Anexar as informações do usuário ao objeto de requisição
        req.user = decoded; // decoded deve conter { id, email, tipo }

        // 4. Continuar para a próxima função middleware ou rota
        next();
    } catch (error) {
        console.error("[DEBUG - AuthMiddleware] Token inválido ou expirado:", error.message);
        return res.status(403).json({ status: 403, ok: false, message: "Token inválido ou expirado." });
    }
};

export default authMiddleware;
