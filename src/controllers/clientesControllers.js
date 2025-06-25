import clientesRepository from "../repositories/clientesRepository.js";
import { blobToBase64, isEmail } from "../shared/util.js";


const clientesController = {
    getClienteById: async (req, res) => {
        const id = req.params.id;
        const user = await clientesRepository.getById(id);
        console.log(user);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(400).json({
                status: 400,
                ok: false,
                message: "Cliente não encontrado"
            });
        }
    },

    getClientesByName: async (req, res) => {
        const nome = req.params.nome;
        const user = await clientesRepository.getByName(nome);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(400).json({
                status: 400,
                ok: false,
                message: "Cliente não encontrado"
            });
        }
    },

    getAllClientes: async (req, res) => {
        const users = await clientesRepository.getAll();
        if (users) {
            res.status(200).json(users);
        } else {
            res.status(400).json({
                status: 400,
                ok: false,
                message: "Clientes não encontrados"
            });
        }
    },

    createClientes: async (req, res) => {
        const { nome, cpf_cnpj, email, senha, cep, complemento, numero, telefone } = req.body;
        const foto = req.file; // utilizando multer

        const erros = [];

        if (!nome || nome.length < 3 || nome.length > 30) {
            erros.push("O nome deve ter entre 3 e 30 caracteres");
        }

        if (!cpf_cnpj || (cpf_cnpj.length !== 11 && cpf_cnpj.length !== 14)) {
            erros.push("CPF/CNPJ inválido. Deve conter 11 (CPF) ou 14 (CNPJ) dígitos");
        }

        if (!email || !isEmail(email)) {
            erros.push("Email inválido");
        }

        if (!senha || senha.length < 8) {
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

        const novo = {
            nome,
            cpf_cnpj,
            email,
            senha, // lembre-se de hashear antes de salvar
            cep,
            complemento,
            numero,
            foto: foto.buffer,
            telefone
        };

        const resp = await clientesRepository.create(novo);
        res.status(200).json(resp);
    },

    updateClientes: async (req, res) => {
        const { id, nome, cpf_cnpj, email, senha, cep, complemento, numero, telefone } = req.body;
        const foto = req.file;

        const erros = [];

        if (!nome || nome.length < 3 || nome.length > 30) {
            erros.push("O nome deve ter entre 3 e 30 caracteres");
        }

        if (!email || !isEmail(email)) {
            erros.push("Email inválido");
        }

        if (!senha || senha.length < 8) {
            erros.push("A senha deve ter no mínimo 8 caracteres");
        }

        if (erros.length > 0) {
            return res.status(400).json({
                status: 400,
                ok: false,
                message: erros
            });
        }

        const novo = {
            nome,
            cpf_cnpj,
            email,
            senha,
            cep,
            complemento,
            numero,
            foto: foto ? foto.buffer : null,
            telefone
        };

        const resp = await clientesRepository.update(id, novo);
        res.status(200).json(resp);
    },

    deleteClientes: async (req, res) => {
        const id = req.params.id;
        const resp = await clientesRepository.delete(id);
        res.status(200).json(resp);
    },

    getFotoById: async (req, res) => {
        const id = req.params.id;
        const user = await clientesRepository.getById(id);
        console.log(user);
        if (user) {
            //converte a foto blob em base64
            const b46 = btoa(String.fromCharCode.apply(null, user[0].foto));
            res.status(200).send(`<h1>imagem</h1><img src="data:image/png;base64,${b46}">`);
        } else {
            res.status(400).json({
                status: 400,
                ok: false,
                message: "Cliente não encontrado"
            });
        }
    },
};

export default clientesController;
