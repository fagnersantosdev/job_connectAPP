import express, { Router } from 'express'
import conexao from '../database/conexao.js'
import PrestadoresController from '../controllers/PrestadoresController.js';

const router = express.Router();

//GET listar  todos os prestdores
router.get('/prestadores', PrestadoresController.getPrestadores);

//POST  cadastrar novo prestador
router.post('/prestador/novo', (req, res) =>{
   const {nome, cpf_cnpj, email, senha, cep, complemento, numero, foto, raioAutuacao} =req.body;

   conexao.query(
    'insert into prestadores (nome, cpf_cnpj, email, senha, cep, complemento, numero, foto, raioAtuacao) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [nome, cpf_cnpj, email, senha, cep, complemento, numero, foto, raioAutuacao],
    (err, results) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ id: results.insertID, ...req.body});
    });
});

export default router;