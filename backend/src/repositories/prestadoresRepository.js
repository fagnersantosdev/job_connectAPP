import conexao from "../database/conexao.js";

const prestadoresRepository = {
    // --- Obter Todos os Prestadores ---
    getAll: async () => {
        // Incluído 'latitude' e 'longitude' no SELECT
        const sql = 'SELECT id, nome, cpf_cnpj, email, telefone, cep, complemento, numero, foto, raioAtuacao, status_disponibilidade, latitude, longitude FROM prestadores;';
        try {
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
                sqlMessage: error.message
            };
        }
    },

    // --- Obter Prestador por ID ---
    getById: async (id) => {
        // Incluído 'latitude' e 'longitude' no SELECT
        const sql = `SELECT id, nome, cpf_cnpj, email, telefone, cep, complemento, numero, foto, raioAtuacao, status_disponibilidade, latitude, longitude FROM prestadores WHERE id=$1;`;
        try {
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
        // Incluído 'latitude' e 'longitude' no SELECT
        const sql = 'SELECT id, nome, cpf_cnpj, email, telefone, cep, complemento, numero, foto, raioAtuacao, status_disponibilidade, latitude, longitude FROM prestadores WHERE nome ILIKE $1;';
        try {
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

    // --- Obter Prestador por Email para Login (apenas ID e Senha) ---
    getByEmailForLogin: async (email) => {
        const sql = `SELECT id, senha FROM prestadores WHERE email=$1;`;
        try {
            const prestador = await conexao.oneOrNone(sql, [email]);
            if (prestador) {
                return {
                    status: 200,
                    ok: true,
                    message: 'Credenciais de login obtidas com sucesso',
                    data: prestador
                };
            } else {
                return {
                    status: 404,
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
        // Incluído 'latitude' e 'longitude' no INSERT
        const sql = `INSERT INTO prestadores (nome, cpf_cnpj, email, senha, telefone, cep, complemento, numero, foto, raioAtuacao, status_disponibilidade, latitude, longitude)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *;`;

        try {
            const newPrestador = await conexao.one(sql, [
                obj.nome,
                obj.cpf_cnpj,
                obj.email,
                obj.senha,
                obj.telefone,
                obj.cep,
                obj.complemento,
                obj.numero,
                obj.foto,
                obj.raioAtuacao,
                obj.status_disponibilidade,
                obj.latitude, // Passando o valor de 'latitude'
                obj.longitude // Passando o valor de 'longitude'
            ]);
            return {
                status: 201,
                ok: true,
                message: 'Prestador criado com sucesso',
                data: newPrestador
            };
        } catch (error) {
            console.error('Erro ao criar prestador:', error);
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
                message: 'Erro de servidor ao criar prestador',
                sqlMessage: error.message
            };
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
    getNearbyPrestadores: async (filtros) => {
        // Fórmula de Haversine para calcular distância entre dois pontos de lat/lon
        // Distância em KM
        const sql = `
            SELECT
                p.id,
                p.nome,
                p.email,
                p.telefone,
                p.cep,
                p.complemento,
                p.numero,
                p.foto,
                p.raioAtuacao,
                p.status_disponibilidade,
                p.latitude,
                p.longitude,
                so.id AS servico_id,
                so.titulo AS servico_titulo,
                so.descricao AS servico_descricao,
                so.valor_estimado AS servico_valor_estimado,
                so.disponibilidade AS servico_disponibilidade,
                c.nome AS categoria_nome,
                c.icone_url AS categoria_icone_url,
                (6371 * acos(
                    cos(radians($1)) * cos(radians(p.latitude)) * cos(radians(p.longitude) - radians($2)) +
                    sin(radians($1)) * sin(radians(p.latitude))
                )) AS distance_km
            FROM
                prestadores p
            JOIN
                servicos_oferecidos so ON p.id = so.prestador_id
            JOIN
                categorias_servico c ON so.categoria_id = c.id
            WHERE
                p.latitude IS NOT NULL AND p.longitude IS NOT NULL AND so.ativo = TRUE AND p.status_disponibilidade = 'online'
                AND (6371 * acos(
                    cos(radians($1)) * cos(radians(p.latitude)) * cos(radians(p.longitude) - radians($2)) +
                    sin(radians($1)) * sin(radians(p.latitude))
                )) <= $3
                ${filtros.categoria_id ? `AND so.categoria_id = $${4 + (filtros.titulo ? 1 : 0)}` : ''}
                ${filtros.titulo ? `AND so.titulo ILIKE $${4 + (filtros.categoria_id ? 1 : 0)}` : ''}
            ORDER BY
                distance_km ASC;
        `;

        const params = [filtros.lat, filtros.lon, filtros.radius];
        if (filtros.categoria_id) {
            params.push(filtros.categoria_id);
        }
        if (filtros.titulo) {
            params.push(`%${filtros.titulo}%`);
        }

        try {
            const list = await conexao.any(sql, params);
            return {
                status: 200,
                ok: true,
                message: 'Prestadores encontrados por proximidade',
                data: list
            };
        } catch (error) {
            console.error('Erro ao buscar prestadores por proximidade:', error);
            return {
                status: 500,
                ok: false,
                message: 'Erro de servidor ao buscar prestadores por proximidade',
                sqlMessage: error.message
            };
        }
    }
};

export default prestadoresRepository;
