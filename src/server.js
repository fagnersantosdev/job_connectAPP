import express from 'express'
//importação "export default"
//import user from './database/usuarios.js'
//importação com "export"
import { PI , isNomeCompleto } from './shared/util.js'
//importação de arquivos json
import config from './database/conf.json' with {type:'json'}
import prestadoresRoutes from './routes/prestadores.routes.js';
import clientesRoutes from './routes/clientes.routes.js';

//importando rotas
import basic from './routes/basicRouters.js'
import userRouters from './routes/usuarioRouters.js'



const port = process.env.PORT 
const host = process.env.HOST 
const app = express()

//usar as rotas
app.use(express.json()) //para converter o corpo das requisiçoes em json
app.use(basic)
app.use(userRouters)
app.use('/prestadores', prestadoresRoutes);
app.use('/clientes', clientesRoutes);



app.listen(port,host,()=>{
    console.log("Servidor Rodando")
})

