import prestadoresRepository from "../repositories/prestadoresRepository.js";
import { isEmail } from "../shared/util.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const saltRounds = 10;

const prestadoresController = {
    // --- Obter Prestador por ID ---
    getPrestadores: async (req, res) => {
        const id = req.params.id;
        const result = await prestadoresRepository.getById(id);

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

    // --- Obter Prestadores por Nome ---
    getPrestadoresByName: async (req, res) => {
        const nome = req.params.nome;
        const result = await prestadoresRepository.getByName(nome);

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

    // --- Obter Todos os Prestadores ---
    getAllPrestadores: async (req, res) => {
        const result = await prestadoresRepository.getAll();

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

    // --- Criar Novo Prestador ---
    createPrestadores: async (req, res) => {
        const { nome, cpf_cnpj, email, senha, cep, complemento, numero, foto, raioAtuacao, telefone, status_disponibilidade } = req.body; // Adicionado status_disponibilidade

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
        if (foto && !foto.buffer) { // A foto é opcional no DDL, então a validação deve ser flexível
            erros.push("Foto inválida. Envie uma imagem no formato correto.");
        }
        if (status_disponibilidade && !['online', 'offline', 'ocupado'].includes(status_disponibilidade.toLowerCase())) {
            erros.push("Status de disponibilidade inválido. Use 'online', 'offline' ou 'ocupado'.");
        }


        if (erros.length > 0) {
            return res.status(400).json({
                status: 400,
                ok: false,
                message: erros
            });
        }

        try {
            const hashedPassword = await bcrypt.hash(senha, saltRounds);

            const novo = {
                nome: nome,
                cpf_cnpj: cpf_cnpj,
                email: email,
                senha: hashedPassword,
                cep: cep,
                complemento: complemento,
                numero: numero,
                foto: foto ? foto.buffer : null,
                raioAtuacao: raioAtuacao,
                telefone: telefone,
                status_disponibilidade: status_disponibilidade ? status_disponibilidade.toLowerCase() : 'online' // Define padrão se não fornecido
            };

            const result = await prestadoresRepository.create(novo);
            res.status(result.status).json(result);
        } catch (error) {
            console.error("Erro ao criar prestador:", error);
            res.status(500).json({
                status: 500,
                ok: false,
                message: "Erro interno do servidor ao criar prestador."
            });
        }
    },

    // --- Atualizar Prestador ---
    updateUser: async (req, res) => {
        const id = parseInt(req.params.id); // ID do prestador a ser atualizado
        const prestador_id_logado = req.user.id; // ID do prestador logado (do JWT)
        const prestador_tipo_logado = req.user.tipo;

        // Apenas o próprio prestador pode atualizar seus dados
        if (prestador_tipo_logado !== 'prestador' || id !== prestador_id_logado) {
            return res.status(403).json({ status: 403, ok: false, message: "Acesso negado: Você não tem permissão para atualizar este prestador." });
        }

        const { nome, cpf_cnpj, email, senha, cep, complemento, numero, foto, raioAtuacao, telefone, status_disponibilidade } = req.body; // Adicionado status_disponibilidade

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
        if (status_disponibilidade && !['online', 'offline', 'ocupado'].includes(status_disponibilidade.toLowerCase())) {
            erros.push("Status de disponibilidade inválido. Use 'online', 'offline' ou 'ocupado'.");
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
            if (cpf_cnpj !== undefined) updatedData.cpf_cnpj = cpf_cnpj;
            if (email !== undefined) updatedData.email = email;
            if (telefone !== undefined) updatedData.telefone = telefone;
            if (cep !== undefined) updatedData.cep = cep;
            if (complemento !== undefined) updatedData.complemento = complemento;
            if (numero !== undefined) updatedData.numero = numero;
            if (foto !== undefined) updatedData.foto = foto ? foto.buffer : null;
            if (raioAtuacao !== undefined) updatedData.raioAtuacao = raioAtuacao;
            if (status_disponibilidade !== undefined) updatedData.status_disponibilidade = status_disponibilidade.toLowerCase(); // Atualiza o novo campo

            if (senha) {
                updatedData.senha = await bcrypt.hash(senha, saltRounds);
            } else {
                // Se a senha não foi fornecida, busque a senha atual do banco de dados
                const currentPrestadorResult = await prestadoresRepository.getById(id);
                if (currentPrestadorResult.ok && currentPrestadorResult.data) {
                    updatedData.senha = currentPrestadorResult.data.senha;
                } else {
                    return res.status(404).json({
                        status: 404,
                        ok: false,
                        message: "Prestador não encontrado para atualização ou senha atual não disponível."
                    });
                }
            }

            const result = await prestadoresRepository.update(id, updatedData);
            res.status(result.status).json(result);
        } catch (error) {
            console.error("Erro ao atualizar prestador:", error);
            res.status(500).json({
                status: 500,
                ok: false,
                message: "Erro interno do servidor ao atualizar prestador."
            });
        }
    },

    // --- Deletar Prestador ---
    deleteUser: async (req, res) => {
        const id = parseInt(req.params.id);
        const prestador_id_logado = req.user.id;
        const prestador_tipo_logado = req.user.tipo;

        // Apenas o próprio prestador pode deletar sua conta
        if (prestador_tipo_logado !== 'prestador' || id !== prestador_id_logado) {
            return res.status(403).json({ status: 403, ok: false, message: "Acesso negado: Você não tem permissão para deletar este prestador." });
        }

        const result = await prestadoresRepository.delete(id);
        res.status(result.status).json(result);
    },

    // --- Login de Prestador ---
    loginPrestador: async (req, res) => {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                status: 400,
                ok: false,
                message: "Email e senha são obrigatórios."
            });
        }

        try {
            const userResult = await prestadoresRepository.getByEmailForLogin(email);

            if (!userResult.ok || !userResult.data) {
                return res.status(401).json({
                    status: 401,
                    ok: false,
                    message: "Email ou senha inválidos."
                });
            }

            const prestadorNoBanco = userResult.data;
            const isPasswordValid = await bcrypt.compare(senha, prestadorNoBanco.senha);

            if (isPasswordValid) {
                const payload = {
                    id: prestadorNoBanco.id,
                    email: email,
                    tipo: 'prestador'
                };

                const token = jwt.sign(payload, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                });

                const fullPrestadorResult = await prestadoresRepository.getById(prestadorNoBanco.id);
                if (fullPrestadorResult.ok) {
                    res.status(200).json({
                        status: 200,
                        ok: true,
                        message: "Login bem-sucedido!",
                        data: {
                            prestador: {
                                id: fullPrestadorResult.data.id,
                                nome: fullPrestadorResult.data.nome,
                                email: fullPrestadorResult.data.email,
                                status_disponibilidade: fullPrestadorResult.data.status_disponibilidade // Incluído no retorno do login
                            },
                            token: token
                        }
                    });
                } else {
                    res.status(500).json({
                        status: 500,
                        ok: false,
                        message: "Erro ao recuperar dados completos do prestador após login."
                    });
                }
            } else {
                res.status(401).json({
                    status: 401,
                    ok: false,
                    message: "Email ou senha inválidos."
                });
            }
        } catch (error) {
            console.error("Erro no processo de login do prestador:", error);
            res.status(500).json({
                status: 500,
                ok: false,
                message: "Erro interno do servidor durante o login do prestador."
            });
        }
    },

    // --- Obter Foto por ID ---
    getFotoById: async (req, res) => {
        const id = req.params.id;
        const result = await prestadoresRepository.getById(id);

        if (result.ok && result.data && result.data.foto) {
            const fotoBuffer = result.data.foto;
            const base64Image = Buffer.from(fotoBuffer).toString('base64');
            res.status(200).send(`<h1>Imagem</h1><img src="data:image/png;base64,${base64Image}">`);
        } else if (result.ok && result.data && !result.data.foto) {
            res.status(404).json({
                status: 404,
                ok: false,
                message: "Foto não encontrada para este prestador."
            });
        } else {
            res.status(result.status).json({
                status: result.status,
                ok: false,
                message: result.message || "Prestador não encontrado ou erro."
            });
        }
    },

    /**
     * @description Atualiza o status de disponibilidade global de um prestador.
     * Apenas o próprio prestador logado pode atualizar seu status.
     * @param {Object} req - Objeto de requisição (params: { id }, body: { status_disponibilidade }).
     * @param {Object} res - Objeto de resposta.
     */
    updatePrestadorAvailability: async (req, res) => {
        const id = parseInt(req.params.id);
        const prestador_id_logado = req.user.id;
        const prestador_tipo_logado = req.user.tipo;

        // Apenas o próprio prestador pode atualizar seu status de disponibilidade
        if (prestador_tipo_logado !== 'prestador' || id !== prestador_id_logado) {
            return res.status(403).json({ status: 403, ok: false, message: "Acesso negado: Você não tem permissão para atualizar o status de disponibilidade deste prestador." });
        }

        const { status_disponibilidade } = req.body;

        const erros = [];
        if (!status_disponibilidade || !['online', 'offline', 'ocupado'].includes(status_disponibilidade.toLowerCase())) {
            erros.push("Status de disponibilidade inválido. Use 'online', 'offline' ou 'ocupado'.");
        }

        if (erros.length > 0) {
            return res.status(400).json({ status: 400, ok: false, message: erros });
        }

        try {
            const updatedData = { status_disponibilidade: status_disponibilidade.toLowerCase() };
            const result = await prestadoresRepository.update(id, updatedData); // Reutiliza o método update do repositório

            if (result.ok) {
                res.status(result.status).json(result);
            } else {
                res.status(result.status).json({
                    status: result.status,
                    ok: result.ok,
                    message: result.message
                });
            }
        } catch (error) {
            console.error("Erro no controller ao atualizar status de disponibilidade do prestador:", error);
            res.status(500).json({ status: 500, ok: false, message: "Erro interno do servidor ao atualizar status de disponibilidade." });
        }
    }
};

export default prestadoresController;
