import usuarioRepository from "../repositories/usuarioRepository.js"

const PrestadorController = {
    getPrestadores: async (req, res)=>{
        const list = await usuarioRepository.getAll()

        if(list){
            res.status(200).json(list)
        }else{
            res.status(400).json({
                status: 400,
                ok:false,
                message: "Não Existem prestadores"
            })
        }
    },
    
}

export default PrestadorController