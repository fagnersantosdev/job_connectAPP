import express from 'express';
import conexao from '../database/conexao.js';
import clientesController from '../controllers/clientesControllers.js';


const router = express.Router();

// GET - Listar todos os clientes
//router.get('/todos', clientesController.getAllClientes);
//router.get('/id/:id', clientesController.getClienteById);
//router.get('/foto/:id', clientesController.getFotoById);

//GET listar  todos os clientes
// GET - Todos os clientes
router.get('/', clientesController.getAllClientes);

// GET - Buscar por ID
router.get('/id/:id', clientesController.getClienteById);

// GET - Buscar por nome
router.get('/nome/:nome', clientesController.getClientesByName);

// GET - Buscar foto
router.get('/foto/:id', clientesController.getFotoById);

// POST - Cadastrar novo cliente (usando o controller)
router.post('/', clientesController.createClientes);

// PUT - Atualizar
router.put('/', clientesController.updateClientes);

// DELETE - Excluir
router.delete('/:id', clientesController.deleteClientes);


// POST - Cadastrar novo cliente
router.post('/', (req, res) => {
  const { nome, cpf, email, senha, cep, complemento, numero, foto } = req.body;

  conexao.query(
    'INSERT INTO clientes (nome, cpf, email, senha, cep, complemento, numero, foto) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [nome, cpf, email, senha, cep, complemento, numero, foto],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.status(201).json({ id: results.insertId, ...req.body });
    }
  );
});

export default router;