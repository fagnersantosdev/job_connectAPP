import usuarioRepository from "../repositories/usuarioRepository.js";

const AuthMiddleware = {
  authAdmin: async (req, res, next) => {
    const { email, senha } = req.body;

    const user = await usuarioRepository.get(email, senha);
    if (!user) {
      return res.status(401).json({
        ok: false,
        message: "Email ou senha incorretos",
      });
    }

    if (user.acesso !== "admin") {
      return res.status(403).json({
        ok: false,
        message: "Usuário não autorizado",
      });
    }

    // liberado
    next();
  },

  auth: async (req, res, next) => {
    const { email, senha } = req.body;

    const user = await usuarioRepository.get(email, senha);
    if (!user) {
      return res.status(401).json({
        ok: false,
        message: "Email ou senha incorretos",
      });
    }

    if (user.acesso !== "user") {
      return res.status(403).json({
        ok: false,
        message: "Usuário não autorizado",
      });
    }

    // liberado
    next();
  },
};

export default AuthMiddleware;
