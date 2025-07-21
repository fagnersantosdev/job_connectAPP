import conexao from "../database/conexao.js"; // Sua instância do pg-promise

const categoriasRepository = {
    /**
     * @description Obtém todas as categorias de serviço.
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Array<Object>|string}>} Objeto de resposta padronizado.
     */
    getAll: async () => { // RENOMEADO: de getAllCategorias para getAll
        const sql = 'SELECT id, nome, icone_url FROM categorias_servico;';
        try {
            const list = await conexao.any(sql); // .any() retorna um array de todos os resultados (ou vazio)
            return {
                status: 200,
                ok: true,
                message: 'Lista de categorias obtida com sucesso',
                data: list
            };
        } catch (error) {
            console.error('Erro ao buscar todas as categorias:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao buscar todas as categorias',
                sqlMessage: error.message
            };
        }
    },

    /**
     * @description Obtém uma categoria de serviço pelo ID.
     * @param {number} id - O ID da categoria.
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|null|string}>} Objeto de resposta padronizado.
     */
    getById: async (id) => { // RENOMEADO: de getCategoriasById para getById
        const sql = `SELECT id, nome, icone_url FROM categorias_servico WHERE id=$1;`;
        try {
            const categoria = await conexao.oneOrNone(sql, [id]); // .oneOrNone() retorna um objeto ou null
            if (categoria) {
                return {
                    status: 200,
                    ok: true,
                    message: 'Categoria encontrada com sucesso',
                    data: categoria
                };
            } else {
                return {
                    status: 404,
                    ok: false,
                    message: 'Categoria não encontrada',
                    data: null
                };
            }
        } catch (error) {
            console.error('Erro ao buscar categoria por ID:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao buscar categoria por ID',
                sqlMessage: error.message
            };
        }
    },

    /**
     * @description Cria uma nova categoria de serviço.
     * @param {Object} obj - Objeto contendo os dados da categoria (nome, icone_url).
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|string}>} Objeto de resposta padronizado.
     */
    create: async (obj) => { // RENOMEADO: de createCategorias para create
        const sql = `INSERT INTO categorias_servico (nome, icone_url) VALUES ($1, $2) RETURNING *;`;
        try {
            const newCategoria = await conexao.one(sql, [obj.nome, obj.icone_url]); // .one() espera exatamente um resultado
            return {
                status: 201, // 201 Created
                ok: true,
                message: 'Categoria criada com sucesso',
                data: newCategoria
            };
        } catch (error) {
            console.error('Erro ao criar categoria:', error);
            if (error.code === '23505') { // Código de erro para violação de unique_constraint no PostgreSQL
                return {
                    status: 409, // Conflict
                    ok: false,
                    message: 'Erro: Nome da categoria já existe.',
                    sqlMessage: error.message
                };
            }
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao criar categoria',
                sqlMessage: error.message
            };
        }
    },

    /**
     * @description Atualiza uma categoria de serviço existente.
     * @param {number} id - O ID da categoria a ser atualizada.
     * @param {Object} obj - Objeto contendo os dados atualizados da categoria (nome, icone_url).
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|null|string}>} Objeto de resposta padronizado.
     */
    update: async (id, obj) => { // RENOMEADO: de updateCategorias para update
        const sql = `UPDATE categorias_servico SET nome=$1, icone_url=$2 WHERE id=$3 RETURNING *;`;
        try {
            const updatedCategoria = await conexao.oneOrNone(sql, [obj.nome, obj.icone_url, id]);
            if (updatedCategoria) {
                return {
                    status: 200,
                    ok: true,
                    message: 'Categoria atualizada com sucesso',
                    data: updatedCategoria
                };
            } else {
                return {
                    status: 404,
                    ok: false,
                    message: 'Categoria não encontrada para atualização',
                    data: null
                };
            }
        } catch (error) {
            console.error('Erro ao atualizar categoria:', error);
            if (error.code === '23505') {
                return {
                    status: 409,
                    ok: false,
                    message: 'Erro: Nome da categoria já existe.',
                    sqlMessage: error.message
                };
            }
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao atualizar categoria',
                sqlMessage: error.message
            };
        }
    },

    /**
     * @description Deleta uma categoria de serviço.
     * @param {number} id - O ID da categoria a ser deletada.
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Object|null|string}>} Objeto de resposta padronizado.
     */
    delete: async (id) => { // RENOMEADO: de deleteCategorias para delete
        const sql = "DELETE FROM categorias_servico WHERE id=$1 RETURNING id;"; // Retorna o ID da linha deletada
        try {
            const deletedRow = await conexao.oneOrNone(sql, [id]);
            if (deletedRow) {
                console.log(`Categoria com ID ${id} deletada.`);
                return {
                    status: 200,
                    ok: true,
                    message: 'Categoria deletada com sucesso',
                    data: { id: deletedRow.id }
                };
            } else {
                return {
                    status: 404,
                    ok: false,
                    message: 'Categoria não encontrada para deletar',
                    data: null
                };
            }
        } catch (error) {
            console.error('Erro ao deletar categoria:', error);
            // Considerar erro '23503' (foreign_key_violation) se houver serviços associados a esta categoria
            if (error.code === '23503') {
                return {
                    status: 409, // Conflict
                    ok: false,
                    message: 'Não é possível deletar esta categoria, pois existem serviços associados a ela.',
                    sqlMessage: error.message
                };
            }
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao deletar categoria',
                sqlMessage: error.message
            };
        }
    }
};

export default categoriasRepository;
