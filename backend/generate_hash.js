import bcrypt from 'bcrypt';

const saltRounds = 10; // O mesmo custo que você usa no seu controller

async function generateHash(password) {
    try {
        const hash = await bcrypt.hash(password, saltRounds);
        console.log(`Senha original: "${password}"`);
        console.log(`Hash Bcrypt: "${hash}"`);
    } catch (error) {
        console.error("Erro ao gerar hash:", error);
    }
}

// Chame a função com a senha que você quer hashear
generateHash("senha"); // Substitua por sua senha de teste
// generateHash("outrasenha");
