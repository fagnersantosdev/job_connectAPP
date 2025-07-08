// database/conexao.js
const pgp = require('pg-promise')();

const db = pgp({
  user: 'seu_usuario', // Deve ser o mesmo de POSTGRES_USER no docker-compose.yml
  host: 'localhost',   // Ou 'db' se o backend também estiver em um contêiner Docker
  database: 'jobconnect_db', // Deve ser o mesmo de POSTGRES_DB no docker-compose.yml
  password: 'sua_senha', // Deve ser o mesmo de POSTGRES_PASSWORD no docker-compose.yml
  port: 5432, // A porta mapeada no docker-compose.yml
});

module.exports = db;