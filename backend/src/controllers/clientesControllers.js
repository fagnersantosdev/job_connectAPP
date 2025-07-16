import clientesRepository from "../repositories/clientesRepository.js";
import { isEmail } from "../shared/util.js"; // Supondo que blobToBase64 não será mais necessário aqui, ou será adaptado.
import bcrypt from 'bcrypt'; // Importe a biblioteca bcrypt
import jwt from 'jsonwebtoken'; // Importar jsonwebtoken
import dotenv from 'dotenv'; // Importar dotenv

// Configuração do custo do Bcrypt. 10 é um bom valor inicial.
const saltRounds = 10;

dotenv.config(); // Carregar variáveis de ambiente

const clientesController = {
    // --- Obter Cliente por ID ---
    getClientes: async (req, res) => {
        const id = req.params.id;
        const result = await clientesRepository.getById(id);

        if (result.ok) {
            res.status(result.status).json(result.data);
        } else {
            res.status(result.status).json({
                status: result.status,
                ok: result.ok,
                message: result.message
            });
        }
    },

    // --- Obter Clientes por Nome ---
    getClientesByName: async (req, res) => {
        const nome = req.params.nome;
        const result = await clientesRepository.getByName(nome);

        if (result.ok) {
            res.status(result.status).json(result.data);
        } else {
            res.status(result.status).json({
                status: result.status,
                ok: result.ok,
                message: result.message
            });
        }
    },

    // --- Obter Todos os Clientes ---
    getAllClientes: async (req, res) => {
        const result = await clientesRepository.getAll();

        if (result.ok) {
            res.status(result.status).json(result.data);
        } else {
            res.status(result.status).json({
                status: result.status,
                ok: result.ok,
                message: result.message
            });
        }
    },

    // --- Criar Novo Cliente ---
    createClientes: async (req, res) => {
        // Removido 'raioAtuacao' do destructuring, pois não é campo de cliente
        const { nome, cpf_cnpj, email, senha, cep, complemento, numero, foto, telefone } = req.body;

        // Validações
        const erros = [];
        if (nome.length < 3 || nome.length > 30) {
            erros.push("O nome deve ter entre 3 e 30 caracteres");
        }
        if (!cpf_cnpj || (cpf_cnpj.length !== 11 && cpf_cnpj.length !== 14)) {
            erros.push("CPF/CNPJ inválido. Deve conter 11 (CPF) ou 14 (CNPJ) dígitos");
        }
        if (!isEmail(email)) {
            erros.push("Email inválido");
        }
        if (senha.length < 8) {
            erros.push("A senha deve ter no mínimo 8 caracteres");
        }
        if (!cep || !/^\d{8}$/.test(cep)) {
            erros.push("CEP inválido. Use apenas 8 dígitos numéricos");
        }
        if (!telefone || !/^\d{10,11}$/.test(telefone)) {
            erros.push("Telefone inválido. Use DDD + número (10 ou 11 dígitos)");
        }
        if (!foto || !foto.buffer) {
            erros.push("Foto não enviada ou inválida. Envie uma imagem no formato correto.");
        }

        if (erros.length > 0) {
            return res.status(400).json({
                status: 400,
                ok: false,
                message: erros
            });
        }

        try {
            // HASH DA SENHA COM BCrypt ANTES DE ENVIAR PARA O REPOSITÓRIO
            const hashedPassword = await bcrypt.hash(senha, saltRounds);

            const novo = {
                nome: nome,
                cpf_cnpj: cpf_cnpj,
                email: email,
                senha: hashedPassword, // Senha hasheada
                cep: cep,
                complemento: complemento,
                numero: numero,
                foto: foto ? foto.buffer : null, // Passando o Buffer da foto
                telefone: telefone
            };

            const result = await clientesRepository.create(novo);
            res.status(result.status).json(result);
        } catch (error) {
            console.error("Erro ao criar cliente:", error);
            res.status(500).json({
                status: 500,
                ok: false,
                message: "Erro interno do servidor ao criar cliente."
            });
        }
    },

    // --- Atualizar Cliente ---
    updateCliente: async (req, res) => {
        const { id, nome, cpf_cnpj, email, senha, cep, complemento, numero, foto, telefone } = req.body;

        // Validações
        const erros = [];
        if (nome.length < 3 || nome.length > 30) {
            erros.push("O nome deve ter entre 3 e 30 caracteres");
        }
        if (!isEmail(email)) {
            erros.push("Email inválido");
        }
        if (senha && senha.length < 8) {
            erros.push("A senha deve ter no mínimo 8 caracteres (se estiver sendo atualizada)");
        }

        if (erros.length > 0) {
            return res.status(400).json({
                status: 400,
                ok: false,
                message: erros
            });
        }

        try {
            let hashedPassword = senha;
            if (senha) { // Se uma nova senha foi fornecida, hasheie-a
                hashedPassword = await bcrypt.hash(senha, saltRounds);
            } else {
                // Se a senha não foi fornecida, busque a senha atual do banco de dados
                // para garantir que ela não seja sobrescrita com null ou undefined.
                // Isso requer uma busca adicional, mas é mais seguro.
                const currentClientResult = await clientesRepository.getById(id);
                if (currentClientResult.ok && currentClientResult.data) {
                    hashedPassword = currentClientResult.data.senha;
                } else {
                    // Se o cliente não for encontrado, ou não tiver senha, trate o erro.
                    // Isso pode indicar um ID inválido ou um problema.
                    return res.status(404).json({
                        status: 404,
                        ok: false,
                        message: "Cliente não encontrado para atualização ou senha atual não disponível."
                    });
                }
            }

            const updatedData = {
                nome: nome,
                cpf_cnpj: cpf_cnpj,
                email: email,
                senha: hashedPassword, // Senha hasheada (ou a original se não foi alterada)
                cep: cep,
                complemento: complemento,
                numero: numero,
                foto: foto ? foto.buffer : null, // Passando o Buffer da foto
                telefone: telefone
            };

            const result = await clientesRepository.update(id, updatedData);
            res.status(result.status).json(result);
        } catch (error) {
            console.error("Erro ao atualizar cliente:", error);
            res.status(500).json({
                status: 500,
                ok: false,
                message: "Erro interno do servidor ao atualizar cliente."
            });
        }
    },

    // --- Deletar Cliente ---
    deleteCliente: async (req, res) => {
        const id = req.params.id;
        const result = await clientesRepository.delete(id);
        res.status(result.status).json(result);
    },

    // --- NOVO MÉTODO: Login de Cliente ---
    loginCliente: async (req, res) => {
        const { email, senha } = req.body;

        try {
            const result = await clientesRepository.getByEmail(email);

            if (!result.ok || !result.data) {
                return res.status(401).json({ status: 401, ok: false, message: 'Credenciais inválidas.' });
            }

            const cliente = result.data;

            // Comparar a senha fornecida com o hash armazenado
            const isMatch = await bcrypt.compare(senha, cliente.senha);

            if (!isMatch) {
                return res.status(401).json({ status: 401, ok: false, message: 'Credenciais inválidas.' });
            }

            // Senha correta: Gerar JWT
            const payload = {
                id: cliente.id,
                email: cliente.email,
                tipo: 'cliente' // Adicionar o tipo de usuário ao payload
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN // Ex: '1h'
            });

            return res.status(200).json({
                status: 200,
                ok: true,
                message: 'Login realizado com sucesso!',
                data: {
                    cliente: {
                        id: cliente.id,
                        nome: cliente.nome,
                        email: cliente.email,
                        // ... outros dados do cliente que você queira retornar (sem a senha)
                    },
                    token: token // Retornar o token para o cliente
                }
            });

        } catch (error) {
            console.error('Erro no login do cliente:', error);
            return res.status(500).json({ status: 500, ok: false, message: 'Erro interno do servidor.' });
        }
    },

    // --- Obter Foto por ID ---
    getFotoById: async (req, res) => {
        const id = req.params.id;
        const result = await clientesRepository.getById(id); // Usando clientesRepository

        if (result.ok && result.data && result.data.foto) {
            const fotoBuffer = result.data.foto;
            // Converte o Buffer para Base64
            const base64Image = Buffer.from(fotoBuffer).toString('base64');
            res.status(200).send(`<h1>Imagem</h1><img src="data:image/png;base64,${base64Image}">`);
        } else if (result.ok && result.data && !result.data.foto) {
            res.status(404).json({
                status: 404,
                ok: false,
                message: "Foto não encontrada para este cliente."
            });
        } else {
            res.status(result.status).json({
                status: result.status,
                ok: false,
                message: result.message || "Cliente não encontrado ou erro."
            });
        }
    },
};

export default clientesController;