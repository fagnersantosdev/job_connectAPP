import { Router } from "express";

import usuarioController from "../controllers/usuarioController.js";
import ValidMiddleware from "../middlewares/ValidMiddleware.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import AuthController from "../controllers/AuthController.js";

const userRouters = Router()


userRouters.post("/login",AuthController.login)
userRouters.get("/admin/usuario/:id",ValidMiddleware.validId,AuthMiddleware.authAdmin,usuarioController.getUser)
userRouters.get("/admin/usuarios/nome/:nome",AuthMiddleware.authAdmin,usuarioController.getUserByName)
userRouters.get("/admin/usuarios",AuthMiddleware.authAdmin,usuarioController.getAllUser)
userRouters.post("/admin/usuario/novo",usuarioController.createUser)
userRouters.put("/admin/usuario/update",AuthMiddleware.authAdmin,usuarioController.updateUser)
userRouters.delete("/admin/usuario/delete/:id",AuthMiddleware.authAdmin,usuarioController.deleteUser)

export default userRouters