import express from 'express';
import conexao from '../database/conexao.js';
import clientesController from '../controllers/clientesControllers.js';


const router = express.Router();

// GET - Listar todos os clientes
router.get('/clientes', clientesControllers.getClientes);

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