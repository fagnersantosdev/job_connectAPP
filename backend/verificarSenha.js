// verificarSenha.js
import bcrypt from "bcrypt";

// 🔑 Coloque aqui o hash copiado do banco (tabela clientes.senha)
const hashDoBanco = "$2a$08$77X0K1d47KOZvi4TWsnvpeQpity/CaI3hqYVvR0MPNbMzaoludP8m";

// 🔑 Coloque aqui a senha que você quer testar
const senhaDigitada = "senha123";

async function verificarSenha() {
  try {
    const ok = await bcrypt.compare(senhaDigitada, hashDoBanco);
    console.log("Hash do banco:", hashDoBanco);
    console.log("Senha digitada:", senhaDigitada);
    console.log("Senha válida?", ok);
  } catch (err) {
    console.error("Erro ao verificar senha:", err);
  }
}

verificarSenha();
