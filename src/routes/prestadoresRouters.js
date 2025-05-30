import express, { Router } from 'express'
import conexao from '../database/conexao.js'

const router = express.Router();

//GET listar  todos os prestdores
router.get('/', (req, res) =>{
    conexao.query('select * from prestadores', (err, results) =>{
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

//POST  cadastrar novo prestador
router.post('/', (req, res) =>{
   const {nome, cpf_cnpj, email, senha, cep, complemento, numero, foto, raioAtuacao} =req.body;

   conexao.query(
    'insert into prestadores (nome, cpf_cnpj, email, senha, cep, complemento, numero, foto, raioAtuacao) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [nome, cpf_cnpj, email, senha, cep, complemento, numero, foto, raioAutuacao],
    (err, results) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ id: results.insertID, ...req.body});
    });
});

export default router;