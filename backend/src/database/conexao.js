import pgPromise from 'pg-promise';
import dotenv from 'dotenv';

dotenv.config(); // Carrega as variáveis de ambiente do ficheiro .env

const initOptions = {
    error(err, e) {
        // Mostra um log detalhado se uma query falhar
        if (e.cn || e.query) {
            console.error('--- ERRO NA QUERY ---');
            console.error('QUERY:', e.query);
            if (e.params) {
                console.error('PARÂMETROS:', e.params);
            }
            console.error('DETALHES DO ERRO:', err);
            console.error('---------------------');
        }
    }
};

const pgp = pgPromise(initOptions);

// Configuração que lê os dados do seu ficheiro .env
const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT, // <-- Lê a porta 5433 do seu .env
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 10,
    idleTimeoutMillis: 30000,
};

// Cria e exporta a instância da ligação
const conexao = pgp(dbConfig);

// Testa a ligação no arranque para garantir que as credenciais estão corretas
conexao.connect()
    .then(obj => {
        const { user, host, port, database } = obj.client;
        console.log(`✅ Conectado à base de dados: ${database} em ${host}:${port} com o utilizador ${user}`);
        obj.done(); // Libera a conexão de teste
    })
    .catch(error => {
        console.error('❌ ERRO CRÍTICO AO CONECTAR À BASE DE DADOS:', error.message || error);
        console.error('--- VERIFIQUE AS SUAS CREDENCIAIS NO FICHEIRO .env ---');
    });

export default conexao;

