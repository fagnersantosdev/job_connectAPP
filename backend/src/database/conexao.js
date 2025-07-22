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
    
    
// docker exec -it jobconnect_postgres_db psql -U postgres jobconnect_db (PARA EXECUTAR O BANCO)
// \dt (PARA LISTAR TABELAS DO BA)
// SELECT * FROM nome_da_tabela; (MOSTRA TODOS OS DADOS INSERIDOS DA TABELA)
// DROP TABLE IF EXISTS nome_da_tabela CASCADE; (Remover tabelas existentes (para um setup limpo))
// docker exec -i jobconnect_postgres_db psql -U postgres jobconnect_db < database/schema.sql (cript SQL para criar as tabelas e inserir os dados EM UMA NOVA MÁQUINA)
// \c (cancelar o buffer da query atual)
// \q (desconectá-lo do banco de dados e fechar o cliente)

// comando para atualizar senha do cliente ou prestador direto no terminal:
// echo "UPDATE clientes SET senha = 'SEU_NOVO_HASH_BCRYPT_AQUI' WHERE id = 1;" | docker exec -i jobconnect_postgres_db psql -U postgres jobconnect_db
// echo "UPDATE prestadores SET senha = 'SEU_NOVO_HASH_BCRYPT_AQUI' WHERE id = 1;" | docker exec -i jobconnect_postgres_db psql -U postgres jobconnect_db