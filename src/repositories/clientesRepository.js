import conexao from "../database/conexao.js"; // Sua instância do pg-promise

const clientesRepository = {
    // --- Obter Todos os Clientes ---
    getAll: async () => {
        // CORRIGIDO: Tabela 'clientes'
        const sql = 'SELECT id, nome, cpf_cnpj, email, telefone, cep, complemento, numero, foto FROM clientes;';
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
        // CORRIGIDO: Tabela 'clientes'
        const sql = `SELECT id, nome, cpf_cnpj, email, telefone, cep, complemento, numero, foto FROM clientes WHERE id=$1;`;
        try {
            const cliente = await conexao.oneOrNone(sql, [id]);
            if (cliente) {
                return {
                    status: 200,
                    ok: true,
                    message: 'Cliente encontrado com sucesso',
                    data: cliente // CORRIGIDO: Variável 'cliente'
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
        // CORRIGIDO: Tabela 'clientes'
        const sql = 'SELECT id, nome, cpf_cnpj, email, telefone, cep, complemento, numero, foto FROM clientes WHERE nome ILIKE $1;';
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

    // --- Obter Cliente por Email para Login (apenas ID e Senha) ---
    getByEmailForLogin: async (email) => {
        // CORRIGIDO: Tabela 'clientes'
        const sql = `SELECT id, senha FROM clientes WHERE email=$1;`;
        try {
            const cliente = await conexao.oneOrNone(sql, [email]);
            if (cliente) {
                return {
                    status: 200,
                    ok: true,
                    message: 'Credenciais de login obtidas com sucesso',
                    data: cliente // CORRIGIDO: Variável 'cliente'
                };
            } else {
                return {
                    status: 404,
                    ok: false,
                    message: 'Cliente não encontrado pelo email',
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
        // CORRIGIDO: Removido 'raioAtuacao' do SQL e dos parâmetros, pois não é campo de cliente.
        // Verifique se o número de placeholders ($n) corresponde exatamente ao número de parâmetros.
        // A senha (obj.senha) JÁ DEVE ESTAR HASHADA AQUI, vinda do controller.
        const sql = `INSERT INTO clientes (nome, cpf_cnpj, email, senha, telefone, cep, complemento, numero, foto)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;`; // 9 placeholders

        try {
            const newCliente = await conexao.one(sql, [
                obj.nome,
                obj.cpf_cnpj,
                obj.email,
                obj.senha, // Senha já hasheada pelo Bcrypt no controller
                obj.telefone,
                obj.cep,
                obj.complemento,
                obj.numero,
                obj.foto,
                // obj.raioAtuacao - REMOVIDO, pois não é campo de clientes
            ]);
            return {
                status: 201,
                ok: true,
                message: 'Cliente criado com sucesso',
                data: newCliente // CORRIGIDO: Variável 'newCliente'
            };
        } catch (error) {
            console.error('Erro ao criar cliente:', error);
            if (error.code === '23505') {
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
        // CORRIGIDO: Tabela 'clientes'. Removido 'raioAtuacao'.
        // CORRIGIDO: Número de placeholders e ordem para corresponder aos parâmetros.
        // A senha (obj.senha) JÁ DEVE ESTAR HASHADA AQUI se foi modificada no controller.
        const sql = `UPDATE clientes SET
                     nome=$1, email=$2, senha=$3, telefone=$4, cep=$5, complemento=$6,
                     numero=$7, foto=$8
                     WHERE id=$9 RETURNING *;`; // 8 campos para SET + 1 para WHERE = 9 placeholders

        try {
            const updatedCliente = await conexao.oneOrNone(sql, [
                obj.nome,
                obj.email,
                obj.senha, // Senha já hasheada (se nova) ou a antiga (se não alterada)
                obj.telefone,
                obj.cep,
                obj.complemento,
                obj.numero,
                obj.foto,
                // obj.raioAtuacao - REMOVIDO
                id // ID é o $9
            ]);

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
                    message: 'Erro: Email já cadastrado para outro cliente.',
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
        // CORRIGIDO: Tabela 'clientes'
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