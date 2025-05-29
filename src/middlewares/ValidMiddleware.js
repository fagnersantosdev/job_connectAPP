const ValidMiddleware = {
    validId: (req, res, next) =>{
        const id= req.params["id"]
        if(isNaN(id)){
            res.status(400).json({
                ok:false,
                erro: "O id do usuário deve ser um número"
            })
        }else{
            next()
        }
    }
}
export default ValidMiddleware