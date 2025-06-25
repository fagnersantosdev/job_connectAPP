import conexao from "../database/conexao.js";

const clientesRepository ={
    getAll : async ()=>{
        const sql = 'select * from clientes;'
        const list = await conexao.promise().query(sql).catch(erro=>{
            return [
                {
                    status:500,
                    ok:false,
                    message:'erro de servidor',
                    sqlMessage: erro.sqlMessage
                }
            ]
        })
        return list[0]
    },

    getById : async (id) =>{
        const sql = `select * from clientes where id=?;`
        const list = await conexao.promise().execute(sql,[id]).catch(erro=>{
            return [
                {
                    status:500,
                    ok:false,
                    message:'erro de servidor',
                    sqlMessage: erro.sqlMessage
                }
            ]
        })
        return list[0]
    },
    getByName : async (nome) =>{
        const sql = 'select id, nome, cpf_cnpj, email, telefone, cep, complemento, numero, foto from clientes where nome like ?;'
        const list = await conexao.promise().execute(sql,['%'+nome+'%']).catch(erro=>{
            return [
                {
                    status:500,
                    ok:false,
                    message:'erro de servidor',
                    sqlMessage: erro.sqlMessage
                }
            ]
        })
        return list[0]
    },
    get : async (email,senha) =>{
        const sql = "select id, nome, email, acesso, ativo from clientes where email=? and senha = md5(?);"
        const list = await conexao.promise().execute(sql,[email, senha]).catch(erro=>{
            return [
                {
                    status:500,
                    ok:false,
                    message:'erro de servidor',
                    sqlMessage: erro.sqlMessage
                }
            ]
        })
        return list[0][0]
    },

    create : async (obj) =>{
        const sql = "insert into clientes (nome,email,senha,acesso,ativo) values (?,?,md5(?),'user',?);"
        const list = await conexao.promise().execute(sql,[obj.nome,obj.email,obj.senha,obj.ativo]).catch(erro=>{
            return [
                {
                    status:500,
                    ok:false,
                    message:'erro de servidor',
                    sqlMessage: erro.sqlMessage
                }
            ]
        })
        return list[0]

    } ,
    update : async (id, obj)=>{
        const sql = "UPDATE clientes set nome=?,email=?,senha=md5(?),acesso=?, ativo=? where id=?;"
        const list = await conexao.promise().execute(sql,
            [
                obj.nome, 
                obj.email, 
                obj.senha, 
                obj.acesso, 
                obj.ativo,
                id
            ]).catch(erro=>{
            return [
                {
                    status:500,
                    ok:false,
                    message:'erro de servidor',
                    sqlMessage: erro.sqlMessage
                }
            ]
        })
        return list[0]
    } ,
    delete : async (id) =>{
        const sql = "delete from clientes where id=?;"
        const list = await conexao.promise().execute(sql,[id]).catch(erro=>{
            return [
                {
                    status:500,
                    ok:false,
                    message:'erro de servidor',
                    sqlMessage: erro.sqlMessage
                }
            ]
        })
        console.log(list)
        return list[0]
    } 

}

export default clientesRepository;