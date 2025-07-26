import express from 'express';
//import categoriasController from '../controllers/categoriasController.js';
import categoriasController from '../controllers/categoriasController.js';

const router = express.Router();

// --- Rotas de Categorias de Serviço ---

// GET /categorias - Obtém todas as categorias
router.get('/', categoriasController.getAllCategorias);

// GET /categorias/:id - Obtém uma categoria específica pelo ID
router.get('/:id', categoriasController.getCategoriasById);

// POST /categorias - Cria uma nova categoria
router.post('/', categoriasController.createCategorias);

// PUT /categorias/:id - Atualiza uma categoria existente
router.put('/:id', categoriasController.updateCategorias);

// DELETE /categorias/:id - Deleta uma categoria
router.delete('/:id', categoriasController.deleteCategorias);

export default router;
