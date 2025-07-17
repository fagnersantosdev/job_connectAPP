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

-- Criação da tabela avaliacoes
CREATE TABLE avaliacoes (
    id SERIAL PRIMARY KEY,
    solicitacao_id INTEGER NOT NULL UNIQUE, -- A avaliação está ligada a uma solicitação de serviço específica
    cliente_id INTEGER NOT NULL, -- Cliente que fez a avaliação
    prestador_id INTEGER NOT NULL, -- Prestador que foi avaliado
    nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5), -- Nota de 1 a 5
    comentario TEXT, -- Comentário detalhado sobre o serviço
    data_avaliacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Restrições de Chave Estrangeira
    CONSTRAINT fk_avaliacao_solicitacao
        FOREIGN KEY (solicitacao_id)
        REFERENCES solicitacoes_servico(id)
        ON DELETE CASCADE, -- Se a solicitação for deletada, a avaliação também
    CONSTRAINT fk_avaliacao_cliente
        FOREIGN KEY (cliente_id)
        REFERENCES clientes(id)
        ON DELETE CASCADE, -- Se o cliente for deletado, suas avaliações também
    CONSTRAINT fk_avaliacao_prestador
        FOREIGN KEY (prestador_id)
        REFERENCES prestadores(id)
        ON DELETE CASCADE -- Se o prestador for deletado, suas avaliações também
);

-- Adicionar índices para otimizar buscas
CREATE INDEX idx_avaliacoes_solicitacao_id ON avaliacoes (solicitacao_id);
CREATE INDEX idx_avaliacoes_cliente_id ON avaliacoes (cliente_id);
CREATE INDEX idx_avaliacoes_prestador_id ON avaliacoes (prestador_id);

-- Criação da tabela mensagens
CREATE TABLE mensagens (
    id SERIAL PRIMARY KEY,
    solicitacao_id INTEGER NOT NULL, -- A mensagem está vinculada a uma solicitação de serviço
    remetente_id INTEGER NOT NULL, -- ID do usuário que enviou a mensagem (cliente ou prestador)
    remetente_tipo VARCHAR(20) NOT NULL, -- 'cliente' ou 'prestador'
    destinatario_id INTEGER NOT NULL, -- ID do usuário que recebeu a mensagem
    destinatario_tipo VARCHAR(20) NOT NULL, -- 'cliente' ou 'prestador'
    conteudo TEXT, -- Conteúdo da mensagem (agora pode ser NULL se for só foto)
    foto_url VARCHAR(255), -- NOVO CAMPO: URL para a imagem anexada à mensagem (opcional)
    data_envio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    lida BOOLEAN DEFAULT FALSE, -- Indica se a mensagem foi lida

    -- Restrição para garantir que remetente_tipo seja 'cliente' ou 'prestador'
    CONSTRAINT chk_remetente_tipo CHECK (remetente_tipo IN ('cliente', 'prestador')),
    CONSTRAINT chk_destinatario_tipo CHECK (destinatario_tipo IN ('cliente', 'prestador')),

    -- A validação de que remetente_id/destinatario_id existe em clientes OU prestadores
    -- precisará ser feita na camada da aplicação (controller/repository).

    CONSTRAINT fk_mensagem_solicitacao
        FOREIGN KEY (solicitacao_id)
        REFERENCES solicitacoes_servico(id)
        ON DELETE CASCADE, -- Se a solicitação for deletada, as mensagens relacionadas também

    -- Adicionar uma restrição para garantir que ou 'conteudo' ou 'foto_url' não seja nulo,
    -- mas não ambos (ou ambos podem ser permitidos, dependendo da regra de negócio)
    -- Exemplo: pelo menos um dos dois deve existir
    CONSTRAINT chk_conteudo_ou_foto CHECK (conteudo IS NOT NULL OR foto_url IS NOT NULL)
);

-- Índices para otimizar buscas por remetente, destinatário e solicitação
CREATE INDEX idx_mensagens_solicitacao_id ON mensagens (solicitacao_id);
CREATE INDEX idx_mensagens_remetente_id ON mensagens (remetente_id);
CREATE INDEX idx_mensagens_destinatario_id ON mensagens (destinatario_id);
CREATE INDEX idx_mensagens_data_envio ON mensagens (data_envio);
