import express from 'express';
//import categoriasController from '../controllers/categoriasController.js';
import categoriasControllers from '../controllers/categoriasControllers.js';

const router = express.Router();

// --- Rotas de Categorias de Serviço ---

// GET /categorias - Obtém todas as categorias
router.get('/', categoriasControllers.getAllCategorias);

// GET /categorias/:id - Obtém uma categoria específica pelo ID
router.get('/:id', categoriasControllers.getCategoriasById);

// POST /categorias - Cria uma nova categoria
router.post('/', categoriasControllers.createCategorias);

// PUT /categorias/:id - Atualiza uma categoria existente
router.put('/:id', categoriasControllers.updateCategorias);

// DELETE /categorias/:id - Deleta uma categoria
router.delete('/:id', categoriasControllers.deleteCategorias);

export default router;
