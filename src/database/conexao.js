/ database/conexao.js
const pgp = require('pg-promise')();

const db = pgp({
  user: 'postgres',       // <-- Deve ser o valor de POSTGRES_USER no seu docker-compose.yml
  host: 'localhost',         // <-- Geralmente 'localhost' se o Docker Desktop estiver na mesma máquina
                             //     Se o backend também estiver em Docker, pode ser 'db' (o nome do serviço do banco)
  database: 'jobconnect_db', // <-- Deve ser o valor de POSTGRES_DB no seu docker-compose.yml
  password: 'postegrenet',     // <-- Deve ser o valor de POSTGRES_PASSWORD no seu docker-compose.yml
  port: 5432,                // <-- A porta mapeada no seu docker-compose.yml (5432:5432)
});

//docker exec -it jobconnect_postgres_db psql -U postgres jobconnect_db
module.exports = db;