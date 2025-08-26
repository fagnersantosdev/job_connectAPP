import clientesRepository from "../repositories/clientesRepository.js";
import { isEmail } from "../shared/util.js";
//import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
//const saltRounds = 10;

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
        // Adicionado latitude e longitude ao destructuring
        const { nome, cpf_cnpj, email, senha, cep, complemento, numero, foto, telefone, latitude, longitude } = req.body;

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
        // Validação de latitude e longitude (opcional, mas recomendado)
        if (latitude !== undefined && (isNaN(parseFloat(latitude)) || parseFloat(latitude) < -90 || parseFloat(latitude) > 90)) {
            erros.push("Latitude inválida. Deve ser um número entre -90 e 90.");
        }
        if (longitude !== undefined && (isNaN(parseFloat(longitude)) || parseFloat(longitude) < -180 || parseFloat(longitude) > 180)) {
            erros.push("Longitude inválida. Deve ser um número entre -180 e 180.");
        }

        if (erros.length > 0) {
            return res.status(400).json({
                status: 400,
                ok: false,
                message: erros
            });
        }

        try {
            //const hashedPassword = await bcrypt.hash(senha, saltRounds);

            const novo = {
                nome: nome,
                cpf_cnpj: cpf_cnpj,
                email: email,
                senha: senha,
                cep: cep,
                complemento: complemento,
                numero: numero,
                foto: foto ? foto.buffer : null,
                telefone: telefone,
                latitude: latitude !== undefined ? parseFloat(latitude) : null, // Converte para float ou null
                longitude: longitude !== undefined ? parseFloat(longitude) : null // Converte para float ou null
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
        const id = parseInt(req.params.id); // ID do cliente a ser atualizado
        const cliente_id_logado = req.user.id; // ID do cliente logado (do JWT)
        const cliente_tipo_logado = req.user.tipo;

        // Apenas o próprio cliente pode atualizar seus dados
        if (cliente_tipo_logado !== 'cliente' || id !== cliente_id_logado) {
            return res.status(403).json({ status: 403, ok: false, message: "Acesso negado: Você não tem permissão para atualizar este cliente." });
        }

        // Adicionado latitude e longitude ao destructuring
        const { nome, cpf_cnpj, email, senha, cep, complemento, numero, foto, telefone, latitude, longitude } = req.body;

        // Validações
        const erros = [];
        if (nome && (nome.length < 3 || nome.length > 30)) {
            erros.push("O nome deve ter entre 3 e 30 caracteres");
        }
        if (email && !isEmail(email)) {
            erros.push("Email inválido");
        }
        if (senha && senha.length < 8) {
            erros.push("A senha deve ter no mínimo 8 caracteres (se estiver sendo atualizada)");
        }
        if (cep && !/^\d{8}$/.test(cep)) {
            erros.push("CEP inválido. Use apenas 8 dígitos numéricos");
        }
        if (telefone && !/^\d{10,11}$/.test(telefone)) {
            erros.push("Telefone inválido. Use DDD + número (10 ou 11 dígitos)");
        }
        // Validação de latitude e longitude (opcional, mas recomendado)
        if (latitude !== undefined && (isNaN(parseFloat(latitude)) || parseFloat(latitude) < -90 || parseFloat(latitude) > 90)) {
            erros.push("Latitude inválida. Deve ser um número entre -90 e 90.");
        }
        if (longitude !== undefined && (isNaN(parseFloat(longitude)) || parseFloat(longitude) < -180 || parseFloat(longitude) > 180)) {
            erros.push("Longitude inválida. Deve ser um número entre -180 e 180.");
        }

        if (erros.length > 0) {
            return res.status(400).json({
                status: 400,
                ok: false,
                message: erros
            });
        }

        try {
            const updatedData = {};
            if (nome !== undefined) updatedData.nome = nome;
            if (cpf_cnpj !== undefined) updatedData.cpf_cnpj = cpf_cnpj; // CPF/CNPJ geralmente não é atualizado, mas deixado para flexibilidade
            if (email !== undefined) updatedData.email = email;
            if (telefone !== undefined) updatedData.telefone = telefone;
            if (cep !== undefined) updatedData.cep = cep;
            if (complemento !== undefined) updatedData.complemento = complemento;
            if (numero !== undefined) updatedData.numero = numero;
            if (foto !== undefined) updatedData.foto = foto ? foto.buffer : null;
            if (latitude !== undefined) updatedData.latitude = parseFloat(latitude); // Converte para float
            if (longitude !== undefined) updatedData.longitude = parseFloat(longitude); // Converte para float

            if (senha) {
                updatedData.senha = senha;
                //updatedData.senha = await bcrypt.hash(senha, saltRounds);
            }

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
        const id = parseInt(req.params.id);
        const cliente_id_logado = req.user.id;
        const cliente_tipo_logado = req.user.tipo;

        // Apenas o próprio cliente pode deletar sua conta
        if (cliente_tipo_logado !== 'cliente' || id !== cliente_id_logado) {
            return res.status(403).json({ status: 403, ok: false, message: "Acesso negado: Você não tem permissão para deletar este cliente." });
        }

        const result = await clientesRepository.delete(id);
        res.status(result.status).json(result);
    },

    // --- Login de Cliente ---
    loginCliente: async (req, res) => {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                status: 400,
                ok: false,
                message: "Email e senha são obrigatórios."
            });
        }

        try {
            const userResult = await clientesRepository.getByEmailForLogin(email, senha);

            if (userResult.ok && userResult.data) {
                // Se o repositório retornou dados, o login é válido.
                const clienteNoBanco = userResult.data;

                const payload = {
                    id: clienteNoBanco.id,
                    email: email,
                    tipo: 'cliente'
                };

                const token = jwt.sign(payload, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                });

                res.status(200).json({
                    status: 200,
                    ok: true,
                    message: "Login bem-sucedido!",
                    data: {
                        cliente: {
                            id: clienteNoBanco.id,
                            nome: clienteNoBanco.nome,
                            email: clienteNoBanco.email,
                            latitude: clienteNoBanco.latitude,
                            longitude: clienteNoBanco.longitude
                        },
                        token: token
                    }
                });
            } else {
                // Se não encontrou usuário, o email ou a senha estão inválidos.
                res.status(401).json({
                    status: 401,
                    ok: false,
                    message: "Email ou senha inválidos."
                });
            }
        } catch (error) {
            console.error("Erro no processo de login:", error);
            res.status(500).json({
                status: 500,
                ok: false,
                message: "Erro interno do servidor durante o login."
            });
        }
    },

    // --- Obter Foto por ID ---
    getFotoById: async (req, res) => {
        const id = req.params.id;
        const result = await clientesRepository.getById(id);

        if (result.ok && result.data && result.data.foto) {
            const fotoBuffer = result.data.foto;
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
