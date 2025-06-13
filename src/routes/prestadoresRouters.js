import express, { Router } from 'express'
import conexao from '../database/conexao.js'
import PrestadoresController from '../controllers/PrestadoresController.js';

const router = express.Router();

//GET listar  todos os prestdores
// GET - Todos os prestadores
router.get('/', PrestadoresController.getAllPrestadores);

// GET - Buscar por ID
router.get('/id/:id', PrestadoresController.getPrestadores);

// GET - Buscar por nome
router.get('/nome/:nome', PrestadoresController.getPrestadoresByName);

// GET - Buscar foto
router.get('/foto/:id', PrestadoresController.getFotoById);

// POST - Cadastrar novo prestador (usando o controller)
router.post('/', PrestadoresController.createPrestadores);

// PUT - Atualizar
router.put('/', PrestadoresController.updateUser);

// DELETE - Excluir
router.delete('/:id', PrestadoresController.deleteUser);


//POST  cadastrar novo prestador
router.post('/prestador/novo', (req, res) =>{
   const {nome, cpf_cnpj, email, senha, cep, complemento, numero, foto, raio_autuacao} =req.body;

   conexao.query(
    'insert into prestadores (nome, cpf_cnpj, email, senha, cep, complemento, numero, foto, raio_atuacao) values (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [nome, cpf_cnpj, email, senha, cep, complemento, numero, foto, raio_autuacao],
    (err, results) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ id: results.insertID, ...req.body});
    });
});

export default router;