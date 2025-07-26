-- DDL para a tabela clientes
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf_cnpj VARCHAR(14) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    cep VARCHAR(8),
    complemento VARCHAR(100),
    numero VARCHAR(10),
    foto BYTEA,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- DDL para a tabela prestadores
CREATE TABLE IF NOT EXISTS prestadores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf_cnpj VARCHAR(14) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    cep VARCHAR(8),
    complemento VARCHAR(100),
    numero VARCHAR(10),
    foto BYTEA,
    raioAtuacao NUMERIC(10, 2),
    status_disponibilidade VARCHAR(20) DEFAULT 'online',
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- DDL para a tabela categorias_servico
CREATE TABLE IF NOT EXISTS categorias_servico (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    icone_url VARCHAR(255)
);

-- DDL para a tabela servicos_oferecidos
CREATE TABLE IF NOT EXISTS servicos_oferecidos (
    id SERIAL PRIMARY KEY,
    prestador_id INTEGER NOT NULL REFERENCES prestadores(id) ON DELETE CASCADE,
    categoria_id INTEGER NOT NULL REFERENCES categorias_servico(id) ON DELETE RESTRICT,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT,
    valor_estimado DECIMAL(10, 2),
    ativo BOOLEAN DEFAULT TRUE,
    disponibilidade VARCHAR(50) DEFAULT 'disponivel',
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- DDL para a tabela solicitacoes_servico
CREATE TABLE IF NOT EXISTS solicitacoes_servico (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    servico_oferecido_id INTEGER NOT NULL REFERENCES servicos_oferecidos(id) ON DELETE RESTRICT,
    data_solicitacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_preferencial TIMESTAMP WITH TIME ZONE,
    descricao_cliente TEXT,
    status VARCHAR(50) DEFAULT 'pendente',
    valor_proposto DECIMAL(10, 2),
    prestador_id_aceito INTEGER REFERENCES prestadores(id) ON DELETE SET NULL,
    data_aceitacao TIMESTAMP WITH TIME ZONE,
    data_conclusao TIMESTAMP WITH TIME ZONE
);

-- DDL para a tabela avaliacoes
CREATE TABLE IF NOT EXISTS avaliacoes (
    id SERIAL PRIMARY KEY,
    solicitacao_id INTEGER NOT NULL UNIQUE REFERENCES solicitacoes_servico(id) ON DELETE CASCADE,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    prestador_id INTEGER NOT NULL REFERENCES prestadores(id) ON DELETE CASCADE,
    nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
    comentario TEXT,
    data_avaliacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- DDL para a tabela mensagens
CREATE TABLE IF NOT EXISTS mensagens (
    id SERIAL PRIMARY KEY,
    solicitacao_id INTEGER NOT NULL REFERENCES solicitacoes_servico(id) ON DELETE CASCADE,
    remetente_id INTEGER NOT NULL,
    remetente_tipo VARCHAR(10) NOT NULL CHECK (remetente_tipo IN ('cliente', 'prestador')),
    destinatario_id INTEGER NOT NULL,
    destinatario_tipo VARCHAR(10) NOT NULL CHECK (destinatario_tipo IN ('cliente', 'prestador')),
    conteudo TEXT,
    foto_url VARCHAR(255),
    data_envio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    lida BOOLEAN DEFAULT FALSE,
    CONSTRAINT chk_conteudo_ou_foto CHECK (conteudo IS NOT NULL OR foto_url IS NOT NULL)
);

-- NOVO DDL: Tabela para Planos de Assinatura (Premium, Gratuito, etc.)
CREATE TABLE IF NOT EXISTS planos_assinatura (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT,
    valor DECIMAL(10, 2) NOT NULL,
    periodicidade VARCHAR(20) NOT NULL CHECK (periodicidade IN ('mensal', 'anual', 'gratuito')),
    taxa_comissao DECIMAL(5, 2) NOT NULL, -- Taxa de comissão para este plano (ex: 0.10 para 10%)
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- NOVO DDL: Tabela para Assinaturas de Prestadores
CREATE TABLE IF NOT EXISTS assinaturas_prestadores (
    id SERIAL PRIMARY KEY,
    prestador_id INTEGER NOT NULL UNIQUE REFERENCES prestadores(id) ON DELETE CASCADE,
    plano_id INTEGER NOT NULL REFERENCES planos_assinatura(id) ON DELETE RESTRICT,
    data_inicio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_fim TIMESTAMP WITH TIME ZONE, -- Nulo para planos gratuitos ou se a assinatura for perpétua
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'cancelado', 'expirado', 'pendente')),
    data_ultima_cobranca TIMESTAMP WITH TIME ZONE,
    proxima_cobranca TIMESTAMP WITH TIME ZONE
);

-- NOVO DDL: Tabela para Contas de Custódia (Escrow)
CREATE TABLE IF NOT EXISTS contas_custodia (
    id SERIAL PRIMARY KEY,
    solicitacao_id INTEGER NOT NULL UNIQUE REFERENCES solicitacoes_servico(id) ON DELETE CASCADE,
    valor_total DECIMAL(10, 2) NOT NULL,
    valor_em_custodia DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'depositado', 'liberado', 'cancelado', 'reembolsado')),
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- NOVO DDL: Tabela para Transações Financeiras
CREATE TABLE IF NOT EXISTS transacoes (
    id SERIAL PRIMARY KEY,
    solicitacao_id INTEGER REFERENCES solicitacoes_servico(id) ON DELETE SET NULL, -- Opcional, transação pode não estar ligada a uma solicitação
    conta_custodia_id INTEGER REFERENCES contas_custodia(id) ON DELETE SET NULL, -- Opcional, transação pode não estar ligada a uma conta de custódia
    remetente_id INTEGER, -- ID do cliente ou prestador ou nulo (para transações da plataforma)
    remetente_tipo VARCHAR(10) CHECK (remetente_tipo IN ('cliente', 'prestador', 'plataforma')),
    destinatario_id INTEGER, -- ID do cliente ou prestador ou nulo (para transações da plataforma)
    destinatario_tipo VARCHAR(10) CHECK (destinatario_tipo IN ('cliente', 'prestador', 'plataforma')),
    tipo_transacao VARCHAR(50) NOT NULL CHECK (tipo_transacao IN ('pagamento_servico', 'deposito_custodia', 'liberacao_custodia', 'reembolso_custodia', 'repasse_prestador', 'cobranca_assinatura', 'taxa_plataforma')),
    valor DECIMAL(10, 2) NOT NULL,
    moeda VARCHAR(3) DEFAULT 'BRL',
    metodo_pagamento VARCHAR(50), -- pix, boleto, cartao_credito, transferencia
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'concluida', 'falhou', 'cancelada', 'reembolsada')),
    id_externo_gateway VARCHAR(255) UNIQUE, -- ID da transação no Stark Bank, por exemplo
    data_transacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- Índices para otimização de busca (já existentes)
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes (email);
CREATE INDEX IF NOT EXISTS idx_clientes_cpf_cnpj ON clientes (cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_clientes_latitude_longitude ON clientes (latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_prestadores_email ON prestadores (email);
CREATE INDEX IF NOT EXISTS idx_prestadores_cpf_cnpj ON prestadores (cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_prestadores_latitude_longitude ON prestadores (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_prestadores_status_disponibilidade ON prestadores (status_disponibilidade);

CREATE INDEX IF NOT EXISTS idx_servicos_oferecidos_prestador_id ON servicos_oferecidos (prestador_id);
CREATE INDEX IF NOT EXISTS idx_servicos_oferecidos_categoria_id ON servicos_oferecidos (categoria_id);
CREATE INDEX IF NOT EXISTS idx_servicos_oferecidos_ativo ON servicos_oferecidos (ativo);
CREATE INDEX IF NOT EXISTS idx_servicos_oferecidos_disponibilidade ON servicos_oferecidos (disponibilidade);

CREATE INDEX IF NOT EXISTS idx_solicitacoes_cliente_id ON solicitacoes_servico (cliente_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_servico_oferecido_id ON solicitacoes_servico (servico_oferecido_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_status ON solicitacoes_servico (status);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_prestador_aceito_id ON solicitacoes_servico (prestador_id_aceito);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_solicitacao_id ON avaliacoes (solicitacao_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_cliente_id ON avaliacoes (cliente_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_prestador_id ON avaliacoes (prestador_id);

CREATE INDEX IF NOT EXISTS idx_mensagens_solicitacao_id ON mensagens (solicitacao_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_remetente_id ON mensagens (remetente_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_destinatario_id ON mensagens (destinatario_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_data_envio ON mensagens (data_envio);

-- NOVO: Índices para as novas tabelas
CREATE INDEX IF NOT EXISTS idx_assinaturas_prestador_id ON assinaturas_prestadores (prestador_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_plano_id ON assinaturas_prestadores (plano_id);
CREATE INDEX IF NOT EXISTS idx_contas_custodia_solicitacao_id ON contas_custodia (solicitacao_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_solicitacao_id ON transacoes (solicitacao_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_conta_custodia_id ON transacoes (conta_custodia_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_remetente_id_tipo ON transacoes (remetente_id, remetente_tipo);
CREATE INDEX IF NOT EXISTS idx_transacoes_destinatario_id_tipo ON transacoes (destinatario_id, destinatario_tipo);
CREATE INDEX IF NOT EXISTS idx_transacoes_tipo_status ON transacoes (tipo_transacao, status);


-- Inserções de dados iniciais (com senhas hasheadas com bcrypt)
INSERT INTO clientes (nome, cpf_cnpj, email, senha, telefone, cep, complemento, numero, foto, latitude, longitude) VALUES
('Joana Silva', '11122233344', 'joana.silva@gmail.com', '$2b$10$73ogDsn9ywAGfl7VSJFR8uZnzrEpTxqDKEKaim8HlRk37yUpZtxOO', '21999101112', '27351000', 'Apto 505', '500', NULL, -22.9068, -43.1729),
('Maria Cliente', '12345678978', 'maria.cliente@gmail.com', '$2b$10$O45F6vNI9A8QSQBtQF0K0eyrdDbsBqKQnIJCW7.yeGMj7nKOXzLxq', '24999121314', '27123456', 'Casa 10', '10', NULL, -23.5505, -46.6333),
('Francisco de Souza', '11178965412', 'francisco.souza@gmail.com', '$2b$10$IEJrxecU8wqG/H3U8Jalp.1kfej2P66kbanE8G0CURhGLSo.kcSDi', '21999654321', '27340000', 'Apto 105', '50', NULL, -22.9068, -43.1729),
('Maria Clara', '12088877766', 'maria.clara@gmail.com', '$2b$10$LtMtXoUUdz5YuD5rUIhsYOs8s8B6bk.7tSy5LLUXM.lAfynML65Xa', '21999030405', '27340340', 'Apto 305', '1500', NULL, -22.9068, -43.1729);


-- NOVOS DADOS DE PRESTADORES FORNECIDOS PELO USUÁRIO (IDs 1 a 5)
INSERT INTO prestadores (nome, cpf_cnpj, email, senha, telefone, cep, complemento, numero, foto, raioAtuacao, status_disponibilidade, latitude, longitude) VALUES
('Carlos Eletricista', '12345678932', 'carlos.eletricista@gmail.com','$2b$10$LHgqzjbUnpeNWOITqkakP.0lufzJxGP6r/NtLjLH9rwMvN8N3VCI6', '21988030405', '27351000', 'Loja 1', '1000', NULL, 15.0, 'online', -23.5613, -46.6560), -- ID 1
('Paulo Alvenaria', '11223344556', 'paulo.alvenaria@gmail.com', '$2b$10$HPRAhr8PFvLDguHCbTUD3eM8lLOd16uv9RB/StlHvuly8UoGK6t4e', '21999543210', '23520000', 'APT 201', 'sala 30', NULL, 10.5, 'online', -22.9133, -43.1792), -- ID 2
('Maria Faxineira', '12345678912', 'maria.faxineira@gmail.com', '$2b$10$2TpK8IuwjsOQWmDAZidKqOsQRY26WdGXIFvPz5/kKCya5nHKU0OaO', '24999887766', '27356000', 'APT 301', 'sala 10', NULL, 10.5, 'online', -22.9133, -43.1792), -- ID 3
('Rafael Pinturas', '12366677788', 'rafael.pinturas@gmail.com', '$2b$10$y8k/dVmTTIyYpRvgIISzSOx7.Fxt/TcQSpdIMOTVXXn70MLuCHoFy', '21998877665', '27350000', 'Loja 10', '1000', NULL, 15.0, 'online', -23.5613, -46.6560), -- ID 4
('Roberto Reparos', '21999050607', 'roberto.reparos@gmail.com', '$2b$10$j2BQaz6UHCGi/88sdG6BS.gq0IUjbdWqAmC6ui0vKQ72M3Wyzar/S', '24999010203', '27232000', 'Casa 01', '52', NULL, 15.0, 'online', -23.5613, -46.6560); -- ID 5

INSERT INTO categorias_servico (nome, icone_url) VALUES
('Elétrica', 'https://placehold.co/40x40/000000/FFFFFF?text=Eletrica'),
('Encanamento', 'https://placehold.co/40x40/000000/FFFFFF?text=Encanamento'),
('Limpeza', 'https://placehold.co/40x40/000000/FFFFFF?text=Limpeza'),
('Pedreiro', 'https://placehold.co/40x40/000000/FFFFFF?text=Pedreiro'),
('Pintura', 'https://placehold.co/40x40/000000/FFFFFF?text=Pintura');

-- Inserir serviços oferecidos de exemplo (ajustados para os novos prestador_id)
INSERT INTO servicos_oferecidos (prestador_id, categoria_id, titulo, descricao, valor_estimado, ativo, disponibilidade) VALUES
(1, 1, 'Instalação de Tomadas e Interruptores', 'Instalação e reparo de tomadas e interruptores residenciais e comerciais.', 150.00, TRUE, 'disponivel'), -- Carlos Eletricista (ID 1)
(1, 2, 'Desentupimento de Pia', 'Desentupimento de pias e ralos com equipamentos profissionais.', 200.00, TRUE, 'disponivel'), -- Carlos Eletricista (ID 1)
(1, 1, 'Manutenção Elétrica Geral', 'Serviços de manutenção elétrica preventiva e corretiva.', 180.00, TRUE, 'disponivel'),
(3, 3, 'Limpeza Pós-Obra', 'Limpeza completa de ambientes após reformas e construções.', 350.00, TRUE, 'disponivel'), -- Maria Faxineira (ID 3)
(4, 5, 'Pintura de Paredes Internas', 'Pintura profissional de paredes internas com acabamento de qualidade.', 250.00, TRUE, 'disponivel'), -- Rafael Pinturas (ID 4)
(5, 2, 'Reparo de Vazamentos', 'Reparo rápido e eficiente de vazamentos em tubulações e torneiras.', 120.00, TRUE, 'disponivel'); -- Roberto Reparos (ID 5)

-- Inserir planos de assinatura de exemplo
INSERT INTO planos_assinatura (nome, descricao, valor, periodicidade, taxa_comissao, ativo) VALUES
('Gratuito', 'Plano básico para prestadores iniciantes.', 0.00, 'gratuito', 0.15, TRUE), -- 15% de comissão
('Premium Mensal', 'Acesso a recursos avançados com pagamento mensal.', 29.90, 'mensal', 0.10, TRUE), -- 10% de comissão
('Premium Anual', 'Acesso a recursos avançados com pagamento anual (desconto).', 299.00, 'anual', 0.05, TRUE); -- 5% de comissão

-- Inserir assinaturas de prestadores de exemplo (prestadores 1 e 2 com plano gratuito)
-- Assumindo que os IDs dos planos são 1, 2, 3 para Gratuito, Premium Mensal, Premium Anual
INSERT INTO assinaturas_prestadores (prestador_id, plano_id, status) VALUES
(1, 1, 'ativo'), -- Carlos Eletricista com plano Gratuito
(2, 1, 'ativo'), -- Paulo Alvenaria com plano Gratuito
(3, 2, 'ativo'); -- Maria Faxineira com plano Premium Mensal
