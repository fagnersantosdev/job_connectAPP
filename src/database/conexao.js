const { Pool } = require('pg-promise'); // Importa o Pool do pacote 'pg'

const pool = new Pool({
  user: 'seu_usuario_postgresql',
  host: 'localhost', // Ou o IP/hostname do seu servidor PostgreSQL
  database: 'seu_banco_de_dados_postgresql',
  password: 'postegrenet',
  port: 5432, // Porta padrão do PostgreSQL. Altere se for diferente.
});

// Testar a conexão (opcional, mas boa prática)
pool.on('connect', () => {
  console.log('Conectado ao PostgreSQL!');
});

pool.on('error', (err) => {
  console.error('Erro na conexão com o PostgreSQL:', err);
});

module.exports = db;