import { Router } from "express";

const loginRouter = Router();

// Rota de login
loginRouter.post('/api/login', (req, res) => {
  // A requisição do frontend envia email e password no corpo
  const { email, password } = req.body;

  // LOGICA DE AUTENTICAÇÃO SIMPLES E TEMPORÁRIA
  // Substitua isso pela sua verificação real no banco de dados.
  // Por exemplo:
  // const user = await findUserByEmail(email);
  // if (user && user.password === password) { ... }

  // Verificação de credenciais fixas para o teste
  const userExists = email === 'teste@email.com' && password === '123456';

  if (userExists) {
    // Se as credenciais estiverem corretas, envie uma resposta de sucesso
    // Você pode incluir um token de autenticação aqui
    res.status(200).json({
      message: 'Login bem-sucedido!',
      user: { email: email } // Exemplo de dados do usuário
    });
  } else {
    // Se as credenciais estiverem incorretas, envie uma resposta de erro 401
    res.status(401).json({
      message: 'E-mail ou senha incorretos.'
    });
  }
});

export default loginRouter;
