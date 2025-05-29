import usuarioRepository from "../repositories/usuarioRepository.js"

const AuthMiddleware = {

    authAdmin: async (req, res, next) =>{
        const {email, senha} = req.body
        const user = await usuarioRepository.get(email,senha)
        if(!user){
            res.status(200).json({
                ok:false,
                mensage: "email ou senha incorretos"
            })
        }else{
            if(user.acesso=='admin'){
                //liberado
                next()
            }else{
                res.status(200).json({
                ok:false,
                mensage: "usuário não autorizado"
            })
            }
            
        }
        
    },
    auth: async (req, res, next) =>{
        const {email, senha} = req.body
        const user = await usuarioRepository.get(email,senha)
        if(!user){
            res.status(200).json({
                ok:false,
                mensage: "email ou senha incorretos"
            })
        }else{
            if(user.acesso=='user'){
                //liberado
                next()
            }else{
                res.status(200).json({
                ok:false,
                mensage: "usuário não autorizado"
            })
            }
            
        }
        
    }
}

export default AuthMiddleware