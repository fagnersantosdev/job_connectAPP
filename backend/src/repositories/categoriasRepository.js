import conexao from "../database/conexao.js";

const categoriasRepository = {
    /**
     * @description Busca todas as categorias de serviço no banco de dados.
     * @returns {Promise<Object>} Um objeto de resposta padronizado.
     */
    getAll: async () => {
        // A query seleciona os campos necessários para a tela do cliente
        const sql = 'SELECT id, nome, icone_url FROM categorias_servico ORDER BY nome;';
        try {
            const list = await conexao.any(sql);
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
            };
        }
    },

    /**
     * @description Busca uma categoria pelo seu ID.
     * @param {number} id - O ID da categoria.
     * @returns {Promise<Object>} Um objeto de resposta padronizado.
     */
    getById: async (id) => {
        const sql = 'SELECT id, nome, icone_url FROM categorias_servico WHERE id = $1;';
        try {
            const categoria = await conexao.oneOrNone(sql, [id]);
            if (categoria) {
                return { status: 200, ok: true, data: categoria };
            }
            return { status: 404, ok: false, message: 'Categoria não encontrada' };
        } catch (error) {
            console.error('Erro ao buscar categoria por ID:', error);
            return { status: 500, ok: false, message: 'Erro de servidor' };
        }
    }
};

export default categoriasRepository;
