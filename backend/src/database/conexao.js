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

// docker exec -it jobconnect_postgres_db psql -U postgres jobconnect_db (PARA EXECUTAR O BANCO)
// \dt (PARA LISTAR TABELAS DO BA)
// SELECT * FROM nome_da_tabela; (MOSTRA TODOS OS DADOS INSERIDOS DA TABELA)
// DROP TABLE IF EXISTS nome_da_tabela CASCADE; (Remover tabelas existentes (para um setup limpo))
// docker exec -i jobconnect_postgres_db psql -U postgres jobconnect_db < database/schema.sql (cript SQL para criar as tabelas e inserir os dados EM UMA NOVA MÁQUINA)
// \c (cancelar o buffer da query atual)
// \q (desconectá-lo do banco de dados e fechar o cliente)
