-- TRUNCATE limpa as tabelas e REINICIA os contadores de ID (SERIAL)
-- A opção CASCADE remove dados em tabelas dependentes automaticamente.
TRUNCATE TABLE clientes, prestadores, categorias_servico, servicos_oferecidos RESTART IDENTITY CASCADE;

-- 1. Inserir Categorias de Serviço
-- IDs começarão em 1 novamente: 1=Elétrica, 2=Encanamento, etc.
INSERT INTO categorias_servico (nome, icone_url) VALUES
('Elétrica', 'flash-outline'),
('Encanamento', 'water-outline'),
('Pintura', 'brush-outline'),
('Limpeza', 'sparkles-outline'),
('Jardinagem', 'leaf-outline');

-- 2. Inserir Clientes Fictícios
-- O gatilho no banco de dados irá criptografar 'senha123' automaticamente.
INSERT INTO clientes (nome, cpf_cnpj, email, senha, cep, latitude, longitude) VALUES
('Ana Clara', '11122233344', 'ana.clara@email.com', 'senha123', '22050002', -22.9713, -43.1857), -- Cliente em Copacabana, RJ
('Bruno Costa', '55566677788', 'bruno.costa@email.com', 'senha123', '01311000', -23.5614, -46.6565);  -- Cliente em Av. Paulista, SP

-- 3. Inserir Prestadores Fictícios
INSERT INTO prestadores (nome, cpf_cnpj, email, senha, cep, latitude, longitude) VALUES
-- Prestadores Originais
('Robson Silva', '12345678900', 'robson.silva@email.com', 'senha123', '22250040', -22.9519, -43.1822),    -- Botafogo, RJ (ID 1)
('Carlos Martins', '09876543211', 'carlos.martins@email.com', 'senha123', '20520054', -22.9231, -43.2335), -- Tijuca, RJ (ID 2)
('Fernanda Lima', '11223344556', 'fernanda.lima@email.com', 'senha123', '05416000', -23.5654, -46.6912),    -- Pinheiros, SP (ID 3)

-- NOVOS PRESTADORES (Próximos da Ana Clara em Copacabana)
('Mariana Gomes', '22233344455', 'mariana.gomes@email.com', 'senha123', '22071100', -22.9845, -43.2050), -- Ipanema, RJ (ID 4)
('Lucas Pereira', '66677788899', 'lucas.pereira@email.com', 'senha123', '22010010', -22.9644, -43.1722),  -- Leme, RJ (ID 5)
('Thiago Almeida', '10120230344', 'thiago.almeida@email.com', 'senha123', '22290160', -22.9545, -43.1659);   -- Urca, RJ (ID 6)

-- 4. Ligar os Prestadores às Categorias através dos SERVIÇOS OFERECIDOS
INSERT INTO servicos_oferecidos (prestador_id, categoria_id, titulo, descricao) VALUES
-- Serviços do Robson (ID 1)
(1, 1, 'Instalação Elétrica Residencial', 'Serviços completos de instalação de tomadas, disjuntores e fiação.'),
(1, 1, 'Instalação de Tomadas', 'Instalação de novas tomadas e substituição de antigas.'),
(1, 1, 'Troca de Chuveiro', 'Substituição de chuveiros e resistências elétricas.'),

-- Serviços do Carlos (ID 2)
(2, 2, 'Reparos de Vazamento', 'Conserto de vazamentos em pias, chuveiros e encanamentos em geral.'),

-- Serviços da Fernanda (ID 3)
(3, 1, 'Manutenção de Quadro de Luz', 'Análise e manutenção preventiva em quadros de luz comerciais.'),
(3, 1, 'Instalação de Luminárias', 'Instalação de lustres, spots e todo tipo de iluminação.'),
(3, 1, 'Instalação de Ventilador de Teto', 'Montagem e instalação completa de ventiladores de teto.'),

-- Serviços da Mariana (ID 4)
(4, 1, 'Troca de Fiação Antiga', 'Substituição de fiação elétrica antiga por cabos novos e seguros.'),

-- Serviços do Lucas (ID 5)
(5, 1, 'Instalação de Luminárias', 'Instalação de lustres, spots e todo tipo de iluminação.'),

-- Serviços do Thiago (ID 6)
(6, 3, 'Pintura de Apartamento', 'Serviços de pintura interna para apartamentos.');

-- Serviços de Elétrica
(1, 1, 'Instalação de Tomadas', 'Instalação de novas tomadas e substituição de antigas.'),
(1, 1, 'Troca de Chuveiro', 'Substituição de chuveiros e resistências elétricas.'),
(3, 1, 'Instalação de Luminárias', 'Instalação de lustres, spots e todo tipo de iluminação.'),
(3, 1, 'Instalação de Ventilador de Teto', 'Montagem e instalação completa de ventiladores de teto.'),
-- Serviço de Encanamento
(2, 2, 'Reparos de Vazamento', 'Conserto de vazamentos em pias, chuveiros e encanamentos em geral.');