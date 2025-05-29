import { Router } from "express";
import user from '../database/usuarios.js'
import config from '../database/conf.json' with {type:'json'}


const basic = Router()

basic.get("/",(req,res)=>{
    res.send("<h1>OK</h1>")
})
basic.get("/conf",(req,res)=>{
    res.send(config)
})

export default basic
