import usuarioRepository from "../repositories/usuarioRepository.js"
import { isEmail } from "../shared/util.js"

const usuarioController = {
    getUser : async (req,res)=>{
        const id = req.params.id
        const user = await usuarioRepository.getById(id)
        console.log(user)
        if(user){
            res.status(200).json(user)
        }else{
            res.status(400).json({
                status: 400,
                ok:false,
                message: "Usuário não encontrado"
            })
        }
    },
    getUserByName : async (req,res)=>{
        const nome = req.params.nome
        const user = await usuarioRepository.getByName(nome)
        if(user){
            res.status(200).json(user)
        }else{
            res.status(400).json({
                status: 400,
                ok:false,
                message: "Usuários não encontrados"
            })
        }
    },

    getAllUser : async (req, res) =>{
        const users = await usuarioRepository.getAll()
        if(users){
            res.status(200).json(users)
        }else{
            res.status(400).json({
                status: 400,
                ok:false,
                message: "Usuários não encontrados"
            })
        }
    },

    createUser : async (req,res) =>{
        const {nome, email, senha, confirma} = req.body
        //validar
        const erros = []
        if(nome.length<3 || nome.length>30){
            erros.push("O nome deve ter entre 3 e 30 caracteres")
        }
        if(!isEmail(email)){
            erros.push("Email inválido")
        }
        if(senha.length<8){
            erros.push("A senha deve ter no mínimo 8 caracteres")
        }
        if(confirma!=senha){
            erros.push("A senha e a confirmação não conferem")
        }

        if(erros.length>0){
            return res.status(400).json({
                status: 400,
                ok:false,
                message: erros
            })
        }

        const novo = {
            nome: nome,
            email: email,
            senha: senha,
            ativo: true
        }
        const resp =await usuarioRepository.create(novo)
        res.status(200).json(resp)
    },
    updateUser: async (req,res)=>{
        const {id, nome, email, senha, confirma, acesso, ativo} = req.body
        //validar
        const erros = []
        if(nome.length<3 || nome.length>30){
            erros.push("O nome deve ter entre 3 e 30 caracteres")
        }
        if(!isEmail(email)){
            erros.push("Email inválido")
        }
        if(senha.length<8){
            erros.push("A senha deve ter no mínimo 8 caracteres")
        }
        if(confirma!=senha){
            erros.push("A senha e a confirmação não conferem")
        }
        if(acesso!='admin' && acesso!='user'){
            erros.push("Acesso inválido (admin ou user)")
        }
        if(erros.length>0){
            return res.status(400).json({
                status: 400,
                ok:false,
                message: erros
            })
        }
        const novo = {
            nome: nome,
            email: email,
            senha: senha,
            acesso: acesso,
            ativo: ativo
        }
        const resp = await usuarioRepository.update(id, novo)
        res.status(200).json(resp)
    },
    deleteUser: async (req, res)=>{
        const id = req.params.id
        const resp = await usuarioRepository.delete(id)
        res.status(200).json(resp)
    }
}

export default usuarioController
