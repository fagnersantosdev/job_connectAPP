import conexao from "../database/conexao.js";

const prestadoresRepository ={
    getAll : async ()=>{
        const sql = 'select id, nome, cpf_cnpj, email, telefone, cep, complemento, numero, foto, raioAtuacao from prestadores;'
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
        const sql = `select id, nome, cpf_cnpj, email, telefone, cep, complemento, numero, foto, raioAtuacao from prestadores where id=?;`
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
        const sql = 'select id, nome, cpf_cnpj, email, telefone, cep, complemento, numero, foto, raioAtuacao from prestadores where nome like ?;'
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
        const sql = "select id, nome, cpf_cnpj, email, telefone, cep, complemento, numero, foto, raioAtuacao from prestadores where email=? and senha = md5(?);"
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
        const sql = "insert into prestadores (nome, cpf_cnpj, email, senha, telefone, cep, complemento, numero, foto, raioAtuacao) values (?,?,?,md5(?),?,?,?,?,?,?);"
        const list = await conexao.promise().execute(sql,[obj.nome,obj.email,obj.senha,obj.cep,obj.complemento,obj.numero,obj.foto,obj.raioAtuacao]).catch(erro=>{
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
        const sql = "UPDATE prestadores set nome=?,email=?,senha=md5(?), telefone=?, cep=?, c omplemento=?, numero=?, foto=?, raioAtuacao=? where id=?;"
        const list = await conexao.promise().execute(sql,
            [
                obj.nome, 
                obj.email, 
                obj.senha, 
                obj.telefone,
                obj.cep,
                obj.complemento,
                obj.numero,
                obj.foto,
                obj.raioAtuacao,
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
        const sql = "delete from prestadores where id=?;"
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

export default prestadoresRepository