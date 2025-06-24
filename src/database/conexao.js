import { createConnection } from "mysql2";

const conexao = createConnection(
    {
        user: 'root',
        password: '',
        host:'localhost',
        port: 3307,
        database: 'connect'
    }
)

export default conexao