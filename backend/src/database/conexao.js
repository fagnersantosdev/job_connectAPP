import pgPromise from 'pg-promise';
import dotenv from 'dotenv';

dotenv.config(); // Carrega as variáveis de ambiente do ficheiro .env

// Opções de inicialização do pg-promise para adicionar logs de eventos
const initOptions = {
    // Evento para cada query que é executada, útil para depuração
    query(e) {
        console.log('QUERY:', e.query);
        if (e.params) {
            console.log('PARAMS:', e.params);
        }
    },
    // Evento de erro de query
    error(err, e) {
        console.error('--- ERRO NA QUERY ---');
        console.error('QUERY:', e.query);
        if (e.params) {
            console.error('PARÂMETROS:', e.params);
        }
        console.error('DETALHES DO ERRO:', err);
        console.error('---------------------');
    }
};

const pgp = pgPromise(initOptions);

// Configuração da ligação à base de dados a partir das variáveis de ambiente
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_DATABASE || 'jobconnect_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD, // A senha DEVE vir do seu ficheiro .env
    max: 10,
    idleTimeoutMillis: 30000,
};

// Cria e exporta a instância da ligação
const conexao = pgp(dbConfig);

// Teste de conexão inicial para verificar as credenciais no arranque
conexao.connect()
    .then(obj => {
        console.log(`✅ Conectado à base de dados: ${obj.client.database}`);
        obj.done(); // Libera a conexão de teste
    })
    .catch(error => {
        console.error('❌ ERRO AO CONECTAR À BASE DE DADOS:', error.message || error);
        console.error('--- VERIFIQUE AS SUAS CREDENCIAIS NO FICHEIRO .env ---');
    });

export default conexao;

