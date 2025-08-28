import prestadoresRepository from "../repositories/prestadoresRepository.js";
import { isEmail } from "../shared/util.js";
// import bcrypt from 'bcrypt'; // <-- Removido
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
// import pool from '../config/database.js'; // <-- Removido

dotenv.config();

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
        const { nome, cpf_cnpj, email, senha, cep, complemento, numero, foto, raioAtuacao, telefone, status_disponibilidade, latitude, longitude } = req.body;

        // ... (suas validações continuam as mesmas)

        try {
            // const hashedPassword = await bcrypt.hash(senha, saltRounds); // <-- REMOVIDO

            const novo = {
                nome,
                cpf_cnpj,
                email,
                senha, // <-- PASSA A SENHA EM TEXTO PURO
                cep,
                complemento,
                numero,
                foto: foto ? foto.buffer : null,
                raioAtuacao,
                telefone,
                status_disponibilidade: status_disponibilidade ? status_disponibilidade.toLowerCase() : 'online',
                latitude: latitude !== undefined ? parseFloat(latitude) : null,
                longitude: longitude !== undefined ? parseFloat(longitude) : null
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
        const id = parseInt(req.params.id);
        const prestador_id_logado = req.user.id;
        const prestador_tipo_logado = req.user.tipo;

        if (prestador_tipo_logado !== 'prestador' || id !== prestador_id_logado) {
            return res.status(403).json({ status: 403, ok: false, message: "Acesso negado." });
        }

        const { senha, ...outrosCampos } = req.body;

        // ... (suas validações continuam as mesmas)

        try {
            const updatedData = { ...outrosCampos };

            if (senha) {
                updatedData.senha = senha; // <-- PASSA A SENHA EM TEXTO PURO
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
        // ... (código sem alterações)
    },

    // --- Login de Prestador ---
    loginPrestador: async (req, res) => {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ status: 400, ok: false, message: "Email e senha são obrigatórios." });
        }

        try {
            const userResult = await prestadoresRepository.getByEmailForLogin(email, senha);

            if (userResult.ok && userResult.data) {
                const prestadorNoBanco = userResult.data;
                
                const payload = {
                    id: prestadorNoBanco.id,
                    email: email,
                    tipo: 'prestador'
                };

                const token = jwt.sign(payload, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                });

                res.status(200).json({
                    status: 200,
                    ok: true,
                    message: "Login bem-sucedido!",
                    data: {
                        prestador: prestadorNoBanco,
                        token: token
                    }
                });
            } else {
                res.status(401).json({
                    status: 401,
                    ok: false,
                    message: "Email ou senha inválidos."
                });
            }
        } catch (error) {
            console.error("Erro no processo de login do prestador:", error);
            res.status(500).json({ status: 500, ok: false, message: "Erro interno do servidor." });
        }
    },
    
    // --- Obter Foto por ID ---
    getFotoById: async (req, res) => {
        // ... (código sem alterações)
    },

    // --- Atualizar Disponibilidade ---
    updatePrestadorAvailability: async (req, res) => {
        // ... (código sem alterações)
    },

    // --- Encontrar Prestadores Próximos (Lógica Corrigida) ---
    findProximos: async (req, res) => {
        // A categoria e o título do serviço agora são opcionais
        const { categoria, tituloServico, clienteId } = req.query;

        if (!clienteId) {
            return res.status(400).json({ message: 'O ID do cliente é obrigatório.' });
        }

        try {
            // Monta o objeto de filtros para enviar ao repositório
            const filtros = {
                clienteId,
                categoriaNome: categoria,
                tituloServico: tituloServico
            };
            
            const result = await prestadoresRepository.findProximos(filtros);
            
            if (result.ok) {
                res.status(result.status).json(result.data);
            } else {
                res.status(result.status).json({ message: result.message });
            }
        } catch (error) {
            console.error('Erro ao buscar prestadores próximos:', error);
            res.status(500).json({ message: 'Erro interno do servidor.' });
        }
    },
};

export default prestadoresController;
