import prestadoresRepository from "../repositories/prestadoresRepository.js";
import { isEmail } from "../shared/util.js"; // Supondo que blobToBase64 não será mais necessário aqui, ou será adaptado.
import bcrypt from 'bcrypt'; // Importe a biblioteca bcrypt

// Configuração do custo do Bcrypt. 10 é um bom valor inicial.
const saltRounds = 10;

const prestadoresController = {
    // --- Obter Prestador por ID ---
    getPrestadores: async (req, res) => {
        const id = req.params.id;
        // O repositório agora retorna um objeto { status, ok, message, data }
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
        // Se a foto é um Buffer, você pode passá-la diretamente
        // Se a foto vem como base64 da requisição, você precisaria convertê-la para Buffer aqui
        // Exemplo: if (foto && typeof foto === 'string' && foto.startsWith('data:')) { fotoBuffer = Buffer.from(foto.split(',')[1], 'base64'); }
        // Se `foto.buffer` já é um Buffer (ex: vindo de um middleware como Multer), use-o.
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
            res.status(result.status).json(result); // O repositório já retorna o objeto de resposta completo
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
        // A validação de senha aqui deve ser cuidadosa.
        // Se a senha for opcional na atualização, não valide o tamanho se ela não for fornecida.
        if (senha && senha.length < 8) { // Só valida se a senha for fornecida
            erros.push("A senha deve ter no mínimo 8 caracteres (se estiver sendo atualizada)");
        }
        // Removidas validações de `confirma` e `acesso` pois não estão no req.body
        // e não são relevantes para a entidade Prestador neste contexto.

        if (erros.length > 0) {
            return res.status(400).json({
                status: 400,
                ok: false,
                message: erros
            });
        }

        try {
            let hashedPassword = senha;
            // HASH DA SENHA COM BCrypt SE A SENHA ESTIVER SENDO ATUALIZADA
            if (senha) { // Se uma nova senha foi fornecida, hasheie-a
                hashedPassword = await bcrypt.hash(senha, saltRounds);
            } else {
                // Se a senha não foi fornecida na atualização, você pode:
                // 1. Manter a senha existente (buscando-a do banco antes).
                // 2. Exigir que a senha seja sempre fornecida para atualização.
                // Por simplicidade, se não fornecida, assumimos que não será atualizada.
                // O repositório precisaria de lógica para não atualizar o campo senha se for null/undefined.
                // Ou você pode buscar o prestador, pegar a senha antiga, e usá-la se nenhuma nova for fornecida.
                // Para este exemplo, vou assumir que se `senha` não for fornecida, ela não será alterada no banco.
                // Isso exigirá um ajuste no método `update` do repositório para lidar com campos opcionais.
                // Ou, mais seguro, sempre peça a senha atual para confirmar a atualização, e a nova senha se for para mudar.
                // Para o propósito de hashing, se `senha` for vazia, `hashedPassword` será vazia.
            }

            const updatedData = {
                nome: nome,
                cpf_cnpj: cpf_cnpj, // Adicionado para consistência, embora não seja usualmente atualizado
                email: email,
                senha: hashedPassword, // Senha hasheada (ou a original se não foi alterada)
                cep: cep,
                complemento: complemento,
                numero: numero,
                foto: foto ? foto.buffer : null, // Passando o Buffer da foto
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

    // --- NOVO MÉTODO: Login de Prestador ---
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
            // Você precisará de um novo método no seu repositório para isso,
            // que retorne APENAS o ID e a SENHA HASHEADA.
            // Ex: const userForLogin = await prestadoresRepository.getByEmailForLogin(email);
            // Por enquanto, vamos usar getById e acessar a senha, mas o ideal é um método mais específico.
            const userResult = await prestadoresRepository.getByEmailForLogin(email); // Supondo que você criou este método

            if (!userResult.ok || !userResult.data) {
                // Usuário não encontrado ou erro
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
                // Senha correta. Agora, você pode buscar os dados completos do prestador (sem a senha)
                // e talvez gerar um token JWT para autenticação futura.
                const fullPrestadorResult = await prestadoresRepository.getById(prestadorNoBanco.id);
                if (fullPrestadorResult.ok) {
                    res.status(200).json({
                        status: 200,
                        ok: true,
                        message: "Login bem-sucedido!",
                        data: fullPrestadorResult.data // Dados completos do prestador (sem senha)
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
            console.error("Erro no processo de login:", error);
            res.status(500).json({
                status: 500,
                ok: false,
                message: "Erro interno do servidor durante o login."
            });
        }
    },

    // --- Obter Foto por ID ---
    // ATENÇÃO: Corrigido para usar prestadoresRepository e lidar com Buffer
    getFotoById: async (req, res) => {
        const id = req.params.id;
        const result = await prestadoresRepository.getById(id); // Usando prestadoresRepository

        if (result.ok && result.data && result.data.foto) {
            const fotoBuffer = result.data.foto; // Supondo que pg-promise retorna um Buffer para BYTEA
            // Converte o Buffer para Base64
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

export default prestadoresController;
