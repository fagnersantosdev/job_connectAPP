import jwt from 'jsonwebtoken';
import clientesRepository from '../repositories/clientesRepository.js';
import prestadoresRepository from '../repositories/prestadoresRepository.js';

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        console.log("[DEBUG - AuthMiddleware] Token ausente");
        return res.status(401).json({ status: 401, ok: false, message: "Acesso negado: Token não fornecido." });
    }

    try {
        console.log("[DEBUG - AuthMiddleware] Token recebido: Token presente");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("[DEBUG - AuthMiddleware] Token decodificado:", decoded);

        // Anexar informações básicas do token
        req.user = {
            id: decoded.id,
            email: decoded.email,
            tipo: decoded.tipo
        };

        // Buscar o nome e CPF/CNPJ do usuário com base no tipo
        let userDetailsResult;
        if (decoded.tipo === 'cliente') {
            userDetailsResult = await clientesRepository.getById(decoded.id);
            if (userDetailsResult && userDetailsResult.ok && userDetailsResult.data) {
                req.user.nome = userDetailsResult.data.nome;
                req.user.documento_identificacao = userDetailsResult.data.cpf_cnpj; // Anexar CPF/CNPJ
            }
        } else if (decoded.tipo === 'prestador') {
            userDetailsResult = await prestadoresRepository.getById(decoded.id);
            if (userDetailsResult && userDetailsResult.ok && userDetailsResult.data) {
                req.user.nome = userDetailsResult.data.nome;
                req.user.documento_identificacao = userDetailsResult.data.cpf_cnpj; // Anexar CPF/CNPJ
            }
        }

        if (!req.user.nome || !req.user.documento_identificacao) {
            console.warn(`[DEBUG - AuthMiddleware] Nome ou documento de identificação não encontrado para ID ${decoded.id}, Tipo ${decoded.tipo}`);
            // Opcional: Você pode decidir se quer retornar um erro 404 aqui
            // return res.status(404).json({ status: 404, ok: false, message: "Detalhes do usuário associado ao token não encontrados." });
        }

        next(); // Continua para a próxima middleware/rota
    } catch (error) {
        console.log("[DEBUG - AuthMiddleware] Token inválido ou expirado:", error.message);
        return res.status(401).json({ status: 401, ok: false, message: "Acesso negado: Token inválido ou expirado." });
    }
};

export default authMiddleware;
