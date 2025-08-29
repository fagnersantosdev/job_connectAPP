    // src/database/conexao.js
    import pgPromise from 'pg-promise';
    import dotenv from 'dotenv';

    dotenv.config(); // Carrega as variáveis de ambiente

    
    console.log('DEBUG DB_HOST:', process.env.DB_HOST);
    console.log('DEBUG DB_PORT:', process.env.DB_PORT);
    console.log('DEBUG DB_DATABASE:', process.env.DB_DATABASE);
    console.log('DEBUG DB_USER:', process.env.DB_USER);
    
    // --------------------------------------------------

    const pgp = pgPromise();

    const config = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_DATABASE || 'jobconnect_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgrenet',
        max: 10, // Máximo de conexões no pool
        idleTimeoutMillis: 30000, // Tempo de inatividade antes de fechar uma conexão
    };

    const db = pgp(config);

    // Teste de conexão (opcional, mas bom para depuração)
    db.connect()
        .then(obj => {
            console.log('Conectado ao banco de dados PostgreSQL!');
            obj.done(); // Libera a conexão
        })
        .catch(error => {
            console.error('Erro ao conectar ao banco de dados:', error.message || error);
        });

    export default db;
    
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