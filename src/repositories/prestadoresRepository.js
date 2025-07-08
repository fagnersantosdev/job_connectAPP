import conexao from "../database/conexao.js"; // Sua instância do pg-promise

const prestadoresRepository = {
    // --- Obter Todos os Prestadores ---
    getAll: async () => {
        const sql = 'SELECT id, nome, cpf_cnpj, email, telefone, cep, complemento, numero, foto, raioAtuacao FROM prestadores;';
        try {
            // .any() retorna um array de todos os resultados (ou um array vazio se nenhum)
            const list = await conexao.any(sql);
            return {
                status: 200,
                ok: true,
                message: 'Lista de prestadores obtida com sucesso',
                data: list
            };
        } catch (error) {
            console.error('Erro ao buscar todos os prestadores:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao buscar todos os prestadores',
                sqlMessage: error.message // pg-promise retorna 'message' para o erro
            };
        }
    },

    // --- Obter Prestador por ID ---
    getById: async (id) => {
        // Use $1 para o placeholder do PostgreSQL
        const sql = `SELECT id, nome, cpf_cnpj, email, telefone, cep, complemento, numero, foto, raioAtuacao FROM prestadores WHERE id=$1;`;
        try {
            // .oneOrNone() retorna um único objeto ou null se não encontrar
            const prestador = await conexao.oneOrNone(sql, [id]);
            if (prestador) {
                return {
                    status: 200,
                    ok: true,
                    message: 'Prestador encontrado com sucesso',
                    data: prestador
                };
            } else {
                return {
                    status: 404,
                    ok: false,
                    message: 'Prestador não encontrado',
                    data: null
                };
            }
        } catch (error) {
            console.error('Erro ao buscar prestador por ID:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao buscar prestador por ID',
                sqlMessage: error.message
            };
        }
    },

    // --- Obter Prestador por Nome (like) ---
    getByName: async (nome) => {
        // Use $1 para o placeholder e concatenação com '%' no SQL
        const sql = 'SELECT id, nome, cpf_cnpj, email, telefone, cep, complemento, numero, foto, raioAtuacao FROM prestadores WHERE nome ILIKE $1;'; // ILIKE para busca case-insensitive no PostgreSQL
        try {
            // .any() para caso haja mais de um prestador com nome similar
            const list = await conexao.any(sql, [`%${nome}%`]);
            return {
                status: 200,
                ok: true,
                message: 'Prestadores encontrados com sucesso',
                data: list
            };
        } catch (error) {
            console.error('Erro ao buscar prestadores por nome:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao buscar prestadores por nome',
                sqlMessage: error.message
            };
        }
    },

    // --- NOVO MÉTODO: Obter Prestador por Email para Login (apenas ID e Senha) ---
    // Este método é usado pelo controller para obter o hash da senha para comparação com Bcrypt.
    getByEmailForLogin: async (email) => {
        const sql = `SELECT id, senha FROM prestadores WHERE email=$1;`;
        try {
            // .oneOrNone() porque esperamos 0 ou 1 resultado
            const prestador = await conexao.oneOrNone(sql, [email]);
            if (prestador) {
                return {
                    status: 200,
                    ok: true,
                    message: 'Credenciais de login obtidas com sucesso',
                    data: prestador // Retorna { id, senha: 'hash_da_senha' }
                };
            } else {
                return {
                    status: 404, // Não encontrado
                    ok: false,
                    message: 'Prestador não encontrado pelo email',
                    data: null
                };
            }
        } catch (error) {
            console.error('Erro ao buscar prestador por email para login:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao buscar prestador por email para login',
                sqlMessage: error.message
            };
        }
    },

    // --- Criar Novo Prestador ---
    create: async (obj) => {
        // A senha (obj.senha) JÁ DEVE ESTAR HASHADA AQUI, vinda do controller.
        const sql = `INSERT INTO prestadores (nome, cpf_cnpj, email, senha, telefone, cep, complemento, numero, foto, raioAtuacao)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *;`; // RETURNING * para obter o registro inserido

        try {
            const newPrestador = await conexao.one(sql, [
                obj.nome,
                obj.cpf_cnpj,
                obj.email,
                obj.senha, // Senha já hasheada pelo Bcrypt no controller
                obj.telefone,
                obj.cep,
                obj.complemento,
                obj.numero,
                obj.foto,
                obj.raioAtuacao
            ]);
            return {
                status: 201,
                ok: true,
                message: 'Prestador criado com sucesso',
                data: newPrestador
            };
        } catch (error) {
            console.error('Erro ao criar prestador:', error);
            // Captura erro de chave duplicada (ex: email ou cpf_cnpj já existentes)
            if (error.code === '23505') { // Código de erro para violação de unique_constraint no PostgreSQL
                return {
                    status: 409, // Conflict
                    ok: false,
                    message: 'Erro: Email ou CPF/CNPJ já cadastrado.',
                    sqlMessage: error.message
                };
            }
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao criar prestador',
                sqlMessage: error.message
            };
        }
    },

    // --- Atualizar Prestador ---
    update: async (id, obj) => {
        // A senha (obj.senha) JÁ DEVE ESTAR HASHADA AQUI se foi modificada no controller.
        // Se a senha não foi modificada no controller, o obj.senha terá o hash antigo.
        const sql = `UPDATE prestadores SET
                     nome=$1, email=$2, senha=$3, telefone=$4, cep=$5, complemento=$6,
                     numero=$7, foto=$8, raioAtuacao=$9
                     WHERE id=$10 RETURNING *;`; // RETURNING * para obter o registro atualizado

        try {
            const updatedPrestador = await conexao.oneOrNone(sql, [
                obj.nome,
                obj.email,
                obj.senha, // Senha já hasheada (se nova) ou a antiga (se não alterada)
                obj.telefone,
                obj.cep,
                obj.complemento,
                obj.numero,
                obj.foto,
                obj.raioAtuacao,
                id
            ]);

            if (updatedPrestador) {
                return {
                    status: 200,
                    ok: true,
                    message: 'Prestador atualizado com sucesso',
                    data: updatedPrestador
                };
            } else {
                return {
                    status: 404,
                    ok: false,
                    message: 'Prestador não encontrado para atualização',
                    data: null
                };
            }
        } catch (error) {
            console.error('Erro ao atualizar prestador:', error);
            if (error.code === '23505') {
                return {
                    status: 409,
                    ok: false,
                    message: 'Erro: Email já cadastrado para outro prestador.',
                    sqlMessage: error.message
                };
            }
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao atualizar prestador',
                sqlMessage: error.message
            };
        }
    },

    // --- Deletar Prestador ---
    delete: async (id) => {
        const sql = "DELETE FROM prestadores WHERE id=$1 RETURNING id;"; // RETURNING id para confirmar deleção
        try {
            const deletedRow = await conexao.oneOrNone(sql, [id]); // Retorna o ID da linha deletada ou null
            if (deletedRow) {
                console.log(`Prestador com ID ${id} deletado.`);
                return {
                    status: 200,
                    ok: true,
                    message: 'Prestador deletado com sucesso',
                    data: { id: deletedRow.id } // Retorna o ID do que foi deletado
                };
            } else {
                return {
                    status: 404,
                    ok: false,
                    message: 'Prestador não encontrado para deletar',
                    data: null
                };
            }
        } catch (error) {
            console.error('Erro ao deletar prestador:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao deletar prestador',
                sqlMessage: error.message
            };
        }
    }
};

export default prestadoresRepository;