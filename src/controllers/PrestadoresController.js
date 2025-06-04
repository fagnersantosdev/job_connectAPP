import prestadoresRepository from "../repositories/prestadoresRepository.js"
import { isEmail } from "../shared/util.js"

const prestadoresController = {
    getUser : async (req,res)=>{
        const id = req.params.id
        const user = await prestadoresRepository.getById(id)
        console.log(user)
        if(user){
            res.status(200).json(user)
        }else{
            res.status(400).json({
                status: 400,
                ok:false,
                message: "Prestador não encontrado"
            })
        }
    },
    getUserByName : async (req,res)=>{
        const nome = req.params.nome
        const user = await prestadoresRepository.getByName(nome)
        if(user){
            res.status(200).json(user)
        }else{
            res.status(400).json({
                status: 400,
                ok:false,
                message: "Prestador não encontrado"
            })
        }
    },

    getAllUser : async (req, res) =>{
        const users = await prestadoresRepository.getAll()
        if(users){
            res.status(200).json(users)
        }else{
            res.status(400).json({
                status: 400,
                ok:false,
                message: "Prestadores não encontrados"
            })
        }
    },

    createUser : async (req,res) =>{
        const {nome, cpf_cnpj, email, senha, cep, complemento, numero, foto, telefone} = req.body
        //validar
        const erros = []
        if(nome.length<3 || nome.length>30){
            erros.push("O nome deve ter entre 3 e 30 caracteres")
        }
        // CPF ou CNPJ (simples validação de tamanho)
        if (!cpf_cnpj || (cpf_cnpj.length !== 11 && cpf_cnpj.length !== 14)) {
        erros.push("CPF/CNPJ inválido. Deve conter 11 (CPF) ou 14 (CNPJ) dígitos");
        }
        if(!isEmail(email)){
            erros.push("Email inválido")
        }
        if(senha.length<8){
            erros.push("A senha deve ter no mínimo 8 caracteres")
        }
        // CEP (esperado com 8 números, sem hífen)
        if (!cep || !/^\d{8}$/.test(cep)) {
        erros.push("CEP inválido. Use apenas 8 dígitos numéricos");
        }
        // Telefone (aceita formato simples, ex: 11999999999)
        if (!telefone || !/^\d{10,11}$/.test(telefone)) {
        erros.push("Telefone inválido. Use DDD + número (10 ou 11 dígitos)");
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
            cpf_cnpj: cpf_cnpj,
            email: email,
            senha: senha,
            cep: cep,
            complemento: complemento,
            numero: numero,
            foto: foto,
            telefone: telefone
            
        }
        const resp =await prestadoresRepository.create(novo)
        res.status(200).json(resp)
    },
    updateUser: async (req,res)=>{
        const {id, nome, cpf_cnpj, email, senha, cep, complemento, numero, foto, telefone } = req.body
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
            cpf_cnpj: cpf_cnpj,
            email: email,
            senha: senha,
            cep: cep,
            complemento: complemento,
            numero: numero,
            foto: foto,
            telefone: telefone,
            
        }
        const resp = await prestadoresRepository.update(id, novo)
        res.status(200).json(resp)
    },
    deleteUser: async (req, res)=>{
        const id = req.params.id
        const resp = await prestadoresRepository.delete(id)
        res.status(200).json(resp)
    }
}

export default prestadoresController;
