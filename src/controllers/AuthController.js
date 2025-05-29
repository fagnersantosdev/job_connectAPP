import usuarioRepository from "../repositories/usuarioRepository.js"
import jwt from 'jsonwebtoken'

const AuthController ={
    login: async (req, res)=>{
        const {email, senha} = req.body
        const user = await usuarioRepository.get(email,senha)
        if(!user){
            res.status(200).json({
                ok:false,
                mensage: "email ou senha incorretos"
            })
        }else{
            const token = jwt.sign(user,process.env.SECRET)
            res.status(200).json({
                ok:true,
                message: 'usuário logado com sucesso',
                token: token
            })
        }
    }
}

export default AuthController