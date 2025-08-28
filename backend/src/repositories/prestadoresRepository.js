import conexao from "../database/conexao.js";

const prestadoresRepository = {
    // --- Obter Todos os Prestadores ---
    getAll: async () => {
        const sql = 'SELECT id, nome, cpf_cnpj, email, telefone, cep, raioAtuacao, status_disponibilidade, latitude, longitude FROM prestadores;';
        try {
            const list = await conexao.any(sql);
            return { status: 200, ok: true, data: list };
        } catch (error) {
            console.error('Erro ao buscar todos os prestadores:', error);
            return { status: 500, ok: false, message: 'Erro de servidor.' };
        }
    },

    // --- Obter Prestador por ID ---
    getById: async (id) => {
        const sql = `SELECT id, nome, cpf_cnpj, email, telefone, cep, raioAtuacao, status_disponibilidade, latitude, longitude FROM prestadores WHERE id=$1;`;
        try {
            const prestador = await conexao.oneOrNone(sql, [id]);
            if (prestador) {
                return { status: 200, ok: true, data: prestador };
            } else {
                return { status: 404, ok: false, message: 'Prestador não encontrado' };
            }
        } catch (error) {
            console.error('Erro ao buscar prestador por ID:', error);
            return { status: 500, ok: false, message: 'Erro de servidor.' };
        }
    },


    // --- Obter Prestador por Nome (like) ---
    getByName: async (nome) => {
        const sql = 'SELECT id, nome, cpf_cnpj, email, telefone, cep, raioAtuacao, status_disponibilidade, latitude, longitude FROM prestadores WHERE nome ILIKE $1;';
        try {
            const list = await conexao.any(sql, [`%${nome}%`]);
            return { status: 200, ok: true, data: list };
        } catch (error) {
            console.error('Erro ao buscar prestadores por nome:', error);
            return { status: 500, ok: false, message: 'Erro de servidor.' };
        }
    },

    // --- Obter Prestador por Email para Login (apenas ID e Senha) ---
    getByEmailForLogin: async (email, plainPassword) => {
        const sql = `
            SELECT id, nome, email, status_disponibilidade, latitude, longitude 
            FROM prestadores 
            WHERE email = $1 AND senha = crypt($2, senha)
        `;
        try {
            const prestador = await conexao.oneOrNone(sql, [email, plainPassword]);
            if (prestador) {
                return { status: 200, ok: true, data: prestador };
            } else {
                return { status: 404, ok: false, message: 'Prestador não encontrado ou senha inválida' };
            }
        } catch (error) {
            console.error('Erro no repositório ao buscar prestador para login:', error);
            return { status: 500, ok: false, message: 'Erro interno do servidor.' };
        }
    },


    // --- Criar Novo Prestador ---
    create: async (obj) => {
        const sql = `INSERT INTO prestadores (nome, cpf_cnpj, email, senha, telefone, cep, complemento, numero, foto, raioAtuacao, status_disponibilidade, latitude, longitude)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *;`;
        try {
            const newPrestador = await conexao.one(sql, [
                obj.nome, obj.cpf_cnpj, obj.email, obj.senha, obj.telefone,
                obj.cep, obj.complemento, obj.numero, obj.foto, obj.raioAtuacao,
                obj.status_disponibilidade, obj.latitude, obj.longitude
            ]);
            return { status: 201, ok: true, message: 'Prestador criado com sucesso', data: newPrestador };
        } catch (error) {
            console.error('Erro ao criar prestador:', error);
            return { status: 500, ok: false, message: 'Erro de servidor.' };
        }
    },

    // --- Atualizar Prestador ---
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
        if (obj.raioAtuacao !== undefined) {
            fields.push(`raioAtuacao = $${paramCount++}`);
            params.push(obj.raioAtuacao);
        }
        if (obj.status_disponibilidade !== undefined) {
            fields.push(`status_disponibilidade = $${paramCount++}`);
            params.push(obj.status_disponibilidade);
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

        const sql = `UPDATE prestadores SET ${fields.join(', ')} WHERE id = $1 RETURNING *;`;

        try {
            const updatedPrestador = await conexao.oneOrNone(sql, params);

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
                    message: 'Erro: Email ou CPF/CNPJ já cadastrado para outro prestador.',
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
        const sql = "DELETE FROM prestadores WHERE id=$1 RETURNING id;";
        try {
            const deletedRow = await conexao.oneOrNone(sql, [id]);
            if (deletedRow) {
                console.log(`Prestador com ID ${id} deletado.`);
                return {
                    status: 200,
                    ok: true,
                    message: 'Prestador deletado com sucesso',
                    data: { id: deletedRow.id }
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
    },

    /**
     * @description Busca prestadores por proximidade e filtros de serviço.
     * @param {Object} filtros - Objeto com:
     * - lat: Latitude do ponto central da busca.
     * - lon: Longitude do ponto central da busca.
     * - radius: Raio de busca em quilômetros.
     * - categoria_id (opcional): ID da categoria de serviço.
     * - titulo (opcional): Título do serviço.
     * @returns {Promise<{status: number, ok: boolean, message: string, data: Array<Object>|string}>}
     */
    
    // --- Método para Encontrar Prestadores Próximos (Query Corrigida) ---
    // --- Método para Encontrar Prestadores Próximos (Query Dinâmica) ---
    findProximos: async (filtros) => {
        const { clienteId, categoriaNome, tituloServico } = filtros;

        try {
            const clienteResult = await conexao.oneOrNone('SELECT latitude, longitude FROM clientes WHERE id = $1', [clienteId]);
            if (!clienteResult) {
                return { status: 404, ok: false, message: 'Cliente não encontrado.' };
            }
            const { latitude: clienteLat, longitude: clienteLon } = clienteResult;

            // Inicia a construção da query e dos parâmetros
            let params = [clienteLat, clienteLon];
            // A cláusula DISTINCT garante que cada prestador apareça apenas uma vez,
            // mesmo que ofereça múltiplos serviços que correspondam à busca.
            let query = `
                SELECT DISTINCT ON (p.id)
                    p.id, 
                    p.nome, 
                    p.foto,
                    (
                        6371 * acos(
                            cos(radians($1)) * cos(radians(p.latitude)) * cos(radians(p.longitude) - radians($2)) + 
                            sin(radians($1)) * sin(radians(p.latitude))
                        )
                    ) AS distancia_km
                FROM 
                    prestadores p
                INNER JOIN 
                    servicos_oferecidos so ON p.id = so.prestador_id
                INNER JOIN 
                    categorias_servico cs ON so.categoria_id = cs.id
            `;
            
            let whereConditions = [`p.status_disponibilidade = 'online'`];

            // Adiciona o filtro de categoria se ele for fornecido
            if (categoriaNome) {
                params.push(categoriaNome);
                whereConditions.push(`cs.nome = $${params.length}`);
            }

            // Adiciona o filtro por título do serviço se ele for fornecido
            if (tituloServico) {
                params.push(tituloServico);
                whereConditions.push(`so.titulo = $${params.length}`);
            }
            
            if (whereConditions.length > 0) {
                query += ` WHERE ${whereConditions.join(' AND ')}`;
            }

            query += `
                ORDER BY 
                    p.id, distancia_km
                LIMIT 10;
            `;

            const prestadores = await conexao.any(query, params);
            return { status: 200, ok: true, data: prestadores };

        } catch (error) {
            console.error('Erro no repositório ao buscar prestadores próximos:', error);
            return { status: 500, ok: false, message: 'Erro interno do servidor.' };
        }
    },
};

export default prestadoresRepository;
