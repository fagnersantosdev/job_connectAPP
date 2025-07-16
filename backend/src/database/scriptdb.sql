-- Remover tabelas existentes (para um setup limpo)
    DROP TABLE IF EXISTS servicos_oferecidos CASCADE;
    DROP TABLE IF EXISTS categorias_servico CASCADE;
    DROP TABLE IF EXISTS clientes CASCADE;
    DROP TABLE IF EXISTS prestadores CASCADE;

    -- Tabela clientes
    CREATE TABLE clientes (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        cpf_cnpj VARCHAR(14) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL,
        telefone VARCHAR(20) NOT NULL,
        cep VARCHAR(8) NOT NULL,
        complemento VARCHAR(100),
        numero VARCHAR(10),
        foto BYTEA,
        data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela prestadores
    CREATE TABLE prestadores (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        cpf_cnpj VARCHAR(14) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL,
        telefone VARCHAR(20) NOT NULL,
        cep VARCHAR(8) NOT NULL,
        complemento VARCHAR(100),
        numero VARCHAR(10),
        foto BYTEA,
        raioAtuacao NUMERIC(10, 2),
        data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP );

    -- Tabela categorias_servico
    CREATE TABLE categorias_servico (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL UNIQUE,
        icone_url VARCHAR(255)
    );

    -- Tabela servicos_oferecidos
    CREATE TABLE servicos_oferecidos (
        id SERIAL PRIMARY KEY,
        prestador_id INTEGER NOT NULL,
        categoria_id INTEGER NOT NULL,
        titulo VARCHAR(100) NOT NULL,
        descricao TEXT,
        valor_estimado NUMERIC(10, 2),
        disponibilidade VARCHAR(255),
        data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_prestador
            FOREIGN KEY (prestador_id)
            REFERENCES prestadores(id)
            ON DELETE CASCADE,
        CONSTRAINT fk_categoria
            FOREIGN KEY (categoria_id)
            REFERENCES categorias_servico(id)
            ON DELETE RESTRICT
    );

    -- Inserir dados de exemplo (gerar os hashes Bcrypt para as senhas)
    INSERT INTO clientes (nome, cpf_cnpj, email, senha, telefone, cep, complemento, numero, foto) VALUES
    ('Joana Silva', '11122233344', 'joana.silva@email.com', '$2b$10$HASH_DA_SENHA_DO_CLIENTE_AQUI', '21987654321', '20000000', 'Apto 505', '500', NULL);

    INSERT INTO prestadores (nome, cpf_cnpj, email, senha, telefone, cep, complemento, numero, foto, raioAtuacao) VALUES
    ('Roberto Reparos', '55566677788', 'roberto.reparos@email.com', '$2b$10$HASH_DA_SENHA_DO_PRESTADOR_AQUI', '11998877665', '01000000', 'Loja 10', '1000', NULL, 15.0);

    INSERT INTO categorias_servico (nome, icone_url) VALUES
    ('Pedreiro', 'https://example.com/icons/pedreiro.png'),
    ('Encanador', 'https://example.com/icons/encanador.png'),
    ('Eletricista', 'https://example.com/icons/eletricista.png'),
    ('Faxineira', 'https://example.com/icons/faxineira.png'),
    ('Pintor', 'https://example.com/icons/pintor.png');

    -- Assumindo IDs 1 para Roberto Reparos e 3 para Eletricista (verifique seus IDs reais)
    INSERT INTO servicos_oferecidos (prestador_id, categoria_id, titulo, descricao, valor_estimado, disponibilidade) VALUES
    (1, 3, 'Instalação de Tomadas e Interruptores', 'Instalação e substituição de tomadas e interruptores residenciais e comerciais.', 80.00, 'Segunda a Sábado, 09:00-18:00');
    
    -- Criação da tabela solicitacoes_servico
    CREATE TABLE solicitacoes_servico (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL, -- Cliente que fez a solicitação
    servico_oferecido_id INTEGER NOT NULL, -- Serviço específico que está sendo solicitado
    data_solicitacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_preferencial TIMESTAMP WITH TIME ZONE, -- Data/hora que o cliente prefere o serviço
    descricao_cliente TEXT, -- Detalhes adicionais do cliente sobre a necessidade
    status VARCHAR(50) NOT NULL DEFAULT 'pendente', -- Ex: 'pendente', 'aceita', 'recusada', 'concluida', 'cancelada'
    valor_proposto NUMERIC(10, 2), -- Valor que o prestador pode propor (se for o caso)
    prestador_id_aceito INTEGER, -- Prestador que aceitou a solicitação (pode ser NULL inicialmente)
    data_aceitacao TIMESTAMP WITH TIME ZONE,
    data_conclusao TIMESTAMP WITH TIME ZONE,

    -- Restrições de Chave Estrangeira
    CONSTRAINT fk_solicitacao_cliente
        FOREIGN KEY (cliente_id)
        REFERENCES clientes(id)
        ON DELETE CASCADE, -- Se o cliente for deletado, suas solicitações também
    CONSTRAINT fk_solicitacao_servico_oferecido
        FOREIGN KEY (servico_oferecido_id)
        REFERENCES servicos_oferecidos(id)
        ON DELETE RESTRICT, -- Não permite deletar um serviço se houver solicitações ativas
    CONSTRAINT fk_solicitacao_prestador_aceito
        FOREIGN KEY (prestador_id_aceito)
        REFERENCES prestadores(id)
        ON DELETE SET NULL -- Se o prestador aceito for deletado, o campo fica NULL
);

-- Índices para otimização
CREATE INDEX idx_solicitacoes_cliente_id ON solicitacoes_servico (cliente_id);
CREATE INDEX idx_solicitacoes_servico_oferecido_id ON solicitacoes_servico (servico_oferecido_id);
CREATE INDEX idx_solicitacoes_status ON solicitacoes_servico (status);
CREATE INDEX idx_solicitacoes_prestador_aceito_id ON solicitacoes_servico (prestador_id_aceito);