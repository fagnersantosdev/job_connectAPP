import pgPromise from 'pg-promise';
import dotenv from 'dotenv';

dotenv.config(); // Carrega as variáveis de ambiente do ficheiro .env

// Opções de inicialização do pg-promise para adicionar logs de eventos
const initOptions = {
    // Evento para cada query que é executada
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

// Teste de conexão inicial
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


    
// (PARA EXECUTAR O BANCO)
// docker exec -it jobconnect_postgres_db psql -U postgres jobconnect_db 

// \dt (PARA LISTAR TABELAS DO BA)

// (MOSTRA TODOS OS DADOS INSERIDOS DA TABELA)
// SELECT * FROM nome_da_tabela; 

// (Remover tabelas existentes (para um setup limpo))
// DROP TABLE IF EXISTS nome_da_tabela CASCADE; 

// \c (cancelar o buffer da query atual)
// \q (desconectá-lo do banco de dados e fechar o cliente)

// (comando para atualizar senha, email ou algum outro dado do cliente ou prestador direto no terminal:)
// echo "UPDATE clientes SET senha = 'SEU_NOVO_HASH_BCRYPT_AQUI' WHERE id = 1;" | docker exec -i jobconnect_postgres_db psql -U postgres jobconnect_db
// echo "UPDATE prestadores SET senha = 'SEU_NOVO_HASH_BCRYPT_AQUI' WHERE id = 1;" | docker exec -i jobconnect_postgres_db psql -U postgres jobconnect_db

// (comando para selecionar verificar dados de uma determinada tabela)
// echo "SELECT id, nome, email, senha, cpf_cnpj FROM clientes;" | docker exec -i jobconnect_postgres_db psql -U postgres jobconnect_db (COMANDO PARA LISTAR TODOS OS DADOS DO CLIENTE DE UMA TABELA ESPECÍFICA)

//(comandos para excluir o banco local e criar um novo)
// docker-compose down --volumes --rmi all
// docker rm -f jobconnect_postgres_db # Garante que o contêiner seja removido
// docker volume rm jobconnect-app_db_data # Garante que o volume de dados seja removido

// (comando PARA EXECUTAR O SCRIPT.DB E CRIAR O NOVO BANCO COM OS DADOS)
//type src/database/scriptdb.sql | docker exec -i jobconnect_postgres_db psql -U postgres jobconnect_db]
//ou
//Get-Content -Path src\database\seed.sql -Encoding UTF8 | docker exec -i jobconnect_postgres_db psql -U postgres jobconnect_db

// (comando PARA CONFIRMAR SE O VALOR DO SERVIÇO FOI DEPOSITADO)
// echo "SELECT * FROM contas_custodia WHERE solicitacao_id = 1;" | docker exec -i jobconnect_postgres_db psql -U postgres jobconnect_db