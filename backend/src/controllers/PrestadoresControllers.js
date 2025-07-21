import prestadoresRepository from "../repositories/prestadoresRepository.js";
import { isEmail } from "../shared/util.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; // Importar jsonwebtoken
import dotenv from 'dotenv'; // Importar dotenv

dotenv.config(); // Carregar as variáveis de ambiente do arquivo .env

// Configuração do custo do Bcrypt. 10 é um bom valor inicial.
const saltRounds = 10;

const prestadoresControllers = {
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
        const { nome, cpf_cnpj, email, senha, cep, complemento, numero, foto, raioAtuacao, telefone } = req.body;

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
                raioAtuacao: raioAtuacao,
                telefone: telefone
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
        const { id, nome, cpf_cnpj, email, senha, cep, complemento, numero, foto, raioAtuacao, telefone } = req.body;

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
            if (senha) {
                hashedPassword = await bcrypt.hash(senha, saltRounds);
            } else {
                const currentPrestadorResult = await prestadoresRepository.getById(id);
                if (currentPrestadorResult.ok && currentPrestadorResult.data) {
                    hashedPassword = currentPrestadorResult.data.senha;
                } else {
                    return res.status(404).json({
                        status: 404,
                        ok: false,
                        message: "Prestador não encontrado para atualização ou senha atual não disponível."
                    });
                }
            }

            const updatedData = {
                nome: nome,
                cpf_cnpj: cpf_cnpj,
                email: email,
                senha: hashedPassword,
                cep: cep,
                complemento: complemento,
                numero: numero,
                foto: foto ? foto.buffer : null,
                raioAtuacao: raioAtuacao,
                telefone: telefone
            };

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
        const id = req.params.id;
        const result = await prestadoresRepository.delete(id);
        res.status(result.status).json(result);
    },

    // --- NOVO MÉTODO: Login de Prestador (AGORA COM JWT) ---
    loginPrestador: async (req, res) => {
        const { email, senha } = req.body;

        // Validação básica
        if (!email || !senha) {
            return res.status(400).json({
                status: 400,
                ok: false,
                message: "Email e senha são obrigatórios."
            });
        }

        try {
            // 1. Buscar o prestador pelo email para obter a senha hasheada
            const userResult = await prestadoresRepository.getByEmailForLogin(email);

            if (!userResult.ok || !userResult.data) {
                // Prestador não encontrado ou erro
                return res.status(401).json({
                    status: 401,
                    ok: false,
                    message: "Email ou senha inválidos."
                });
            }

            const prestadorNoBanco = userResult.data;

            // 2. Comparar a senha fornecida com a senha hasheada do banco
            const isPasswordValid = await bcrypt.compare(senha, prestadorNoBanco.senha);

            if (isPasswordValid) {
                // Senha correta: Gerar JWT
                const payload = {
                    id: prestadorNoBanco.id,
                    email: prestadorNoBanco.email, // O método getByEmailForLogin precisa retornar o email também, ou você pode buscar o prestador completo aqui.
                    tipo: 'prestador' // Adicionar o tipo de usuário ao payload
                };

                const token = jwt.sign(payload, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN // Ex: '1h'
                });

                // Buscar os dados completos do prestador (sem a senha) para retornar na resposta
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
                                // ... outros dados do prestador que você queira retornar (sem a senha)
                            },
                            token: token // Retornar o token para o cliente
                        }
                    });
                } else {
                    // Deveria ser raro, mas para garantir
                    res.status(500).json({
                        status: 500,
                        ok: false,
                        message: "Erro ao recuperar dados completos do prestador após login."
                    });
                }
            } else {
                // Senha incorreta
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
};

export default prestadoresControllers;
