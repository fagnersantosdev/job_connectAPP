import conexao from "../database/conexao.js";

const clientesRepository = {
    // --- Obter Todos os Clientes ---
    getAll: async () => {
        // Incluído 'latitude' e 'longitude' no SELECT
        const sql = 'SELECT id, nome, cpf_cnpj, email, telefone, cep, complemento, numero, foto, latitude, longitude FROM clientes;';
        try {
            const list = await conexao.any(sql);
            return {
                status: 200,
                ok: true,
                message: 'Lista de clientes obtida com sucesso',
                data: list
            };
        } catch (error) {
            console.error('Erro ao buscar todos os clientes:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao buscar todos os clientes',
                sqlMessage: error.message
            };
        }
    },

    // --- Obter Cliente por ID ---
    getById: async (id) => {
        // Incluído 'latitude' e 'longitude' no SELECT
        const sql = `SELECT id, nome, cpf_cnpj, email, telefone, cep, complemento, numero, foto, latitude, longitude FROM clientes WHERE id=$1;`;
        try {
            const cliente = await conexao.oneOrNone(sql, [id]);
            if (cliente) {
                return {
                    status: 200,
                    ok: true,
                    message: 'Cliente encontrado com sucesso',
                    data: cliente
                };
            } else {
                return {
                    status: 404,
                    ok: false,
                    message: 'Cliente não encontrado',
                    data: null
                };
            }
        } catch (error) {
            console.error('Erro ao buscar cliente por ID:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao buscar cliente por ID',
                sqlMessage: error.message
            };
        }
    },

    // --- Obter Cliente por Nome (like) ---
    getByName: async (nome) => {
        // Incluído 'latitude' e 'longitude' no SELECT
        const sql = 'SELECT id, nome, cpf_cnpj, email, telefone, cep, complemento, numero, foto, latitude, longitude FROM clientes WHERE nome ILIKE $1;';
        try {
            const list = await conexao.any(sql, [`%${nome}%`]);
            return {
                status: 200,
                ok: true,
                message: 'Clientes encontrados com sucesso',
                data: list
            };
        } catch (error) {
            console.error('Erro ao buscar clientes por nome:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao buscar clientes por nome',
                sqlMessage: error.message
            };
        }
    },

    // --- Obter Cliente por Email para Login (com verificação de senha) ---
    getByEmailForLogin: async (email, plainPassword) => {
        // A query agora compara o email E a senha.
        // A função crypt(senha_enviada, senha_no_banco) retorna a senha do banco se elas baterem.
        // Se a senha estiver errada, a condição não é satisfeita e a query não retorna nada.
        const sql = `SELECT id, nome, email, latitude, longitude FROM clientes WHERE email = $1 AND senha = crypt($2, senha)`;
        try {
            const cliente = await conexao.oneOrNone(sql, [email, plainPassword]);
            if (cliente) {
                return {
                    status: 200,
                    ok: true,
                    message: 'Cliente validado com sucesso',
                    data: cliente
                };
            } else {
                return {
                    status: 404,
                    ok: false,
                    message: 'Cliente não encontrado ou senha inválida',
                    data: null
                };
            }
        } catch (error) {
            console.error('Erro ao buscar cliente por email para login:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao buscar cliente por email para login',
                sqlMessage: error.message
            };
        }
    },

    // --- Criar Novo Cliente ---
    create: async (obj) => {
        // Incluído 'latitude' e 'longitude' no INSERT
        const sql = `INSERT INTO clientes (nome, cpf_cnpj, email, senha, telefone, cep, complemento, numero, foto, latitude, longitude)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *;`;

        try {
            const newCliente = await conexao.one(sql, [
                obj.nome,
                obj.cpf_cnpj,
                obj.email,
                obj.senha,
                obj.telefone,
                obj.cep,
                obj.complemento,
                obj.numero,
                obj.foto,
                obj.latitude, // Passando o valor de 'latitude'
                obj.longitude // Passando o valor de 'longitude'
            ]);
            return {
                status: 201,
                ok: true,
                message: 'Cliente criado com sucesso',
                data: newCliente
            };
        } catch (error) {
            console.error('Erro ao criar cliente:', error);
            if (error.code === '23505') { // unique_violation (email ou cpf_cnpj já existe)
                return {
                    status: 409,
                    ok: false,
                    message: 'Erro: Email ou CPF/CNPJ já cadastrado.',
                    sqlMessage: error.message
                };
            }
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao criar cliente',
                sqlMessage: error.message
            };
        }
    },

    // --- Atualizar Cliente ---
    update: async (id, obj) => {
        const fields = [];
        const params = [id];
        let paramCount = 2;

        if (obj.nome !== undefined) {
            fields.push(`nome = $${paramCount++}`);
            params.push(obj.nome);
        }
        if (obj.cpf_cnpj !== undefined) {
            fields.push(`cpf_cnpj = $${paramCount++}`);
            params.push(obj.cpf_cnpj);
        }
        if (obj.email !== undefined) {
            fields.push(`email = $${paramCount++}`);
            params.push(obj.email);
        }
        if (obj.senha !== undefined) {
            fields.push(`senha = $${paramCount++}`);
            params.push(obj.senha);
        }
        if (obj.telefone !== undefined) {
            fields.push(`telefone = $${paramCount++}`);
            params.push(obj.telefone);
        }
        if (obj.cep !== undefined) {
            fields.push(`cep = $${paramCount++}`);
            params.push(obj.cep);
        }
        if (obj.complemento !== undefined) {
            fields.push(`complemento = $${paramCount++}`);
            params.push(obj.complemento);
        }
        if (obj.numero !== undefined) {
            fields.push(`numero = $${paramCount++}`);
            params.push(obj.numero);
        }
        if (obj.foto !== undefined) {
            fields.push(`foto = $${paramCount++}`);
            params.push(obj.foto);
        }
        if (obj.latitude !== undefined) { // Incluído 'latitude' no UPDATE
            fields.push(`latitude = $${paramCount++}`);
            params.push(obj.latitude);
        }
        if (obj.longitude !== undefined) { // Incluído 'longitude' no UPDATE
            fields.push(`longitude = $${paramCount++}`);
            params.push(obj.longitude);
        }

        if (fields.length === 0) {
            return { status: 400, ok: false, message: "Nenhum campo para atualizar fornecido." };
        }

        const sql = `UPDATE clientes SET ${fields.join(', ')} WHERE id = $1 RETURNING *;`;

        try {
            const updatedCliente = await conexao.oneOrNone(sql, params);

            if (updatedCliente) {
                return {
                    status: 200,
                    ok: true,
                    message: 'Cliente atualizado com sucesso',
                    data: updatedCliente
                };
            } else {
                return {
                    status: 404,
                    ok: false,
                    message: 'Cliente não encontrado para atualização',
                    data: null
                };
            }
        } catch (error) {
            console.error('Erro ao atualizar cliente:', error);
            if (error.code === '23505') {
                return {
                    status: 409,
                    ok: false,
                    message: 'Erro: Email ou CPF/CNPJ já cadastrado para outro cliente.',
                    sqlMessage: error.message
                };
            }
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao atualizar cliente',
                sqlMessage: error.message
            };
        }
    },

    // --- Deletar Cliente ---
    delete: async (id) => {
        const sql = "DELETE FROM clientes WHERE id=$1 RETURNING id;";
        try {
            const deletedRow = await conexao.oneOrNone(sql, [id]);
            if (deletedRow) {
                console.log(`Cliente com ID ${id} deletado.`);
                return {
                    status: 200,
                    ok: true,
                    message: 'Cliente deletado com sucesso',
                    data: { id: deletedRow.id }
                };
            } else {
                return {
                    status: 404,
                    ok: false,
                    message: 'Cliente não encontrado para deletar',
                    data: null
                };
            }
        } catch (error) {
            console.error('Erro ao deletar cliente:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao deletar cliente',
                sqlMessage: error.message
            };
        }
    }
};

export default clientesRepository;
