
TRUNCATE TABLE clientes, prestadores, categorias_servico, servicos_oferecidos, solicitacoes_servico, avaliacoes, assinaturas_prestadores, mensagens, contas_custodia, transacoes RESTART IDENTITY CASCADE;

-- Limpa as tabelas na ordem correta para evitar erros de chave estrangeira
DELETE FROM solicitacoes_servico;
DELETE FROM servicos_oferecidos;
DELETE FROM prestadores;
DELETE FROM clientes;
DELETE FROM categorias_servico;

-- 1. Inserir Categorias de Serviço
-- Lembre-se desses IDs: 1=Elétrica, 2=Encanamento, etc.
INSERT INTO categorias_servico (nome, icone_url) VALUES
('Elétrica', 'flash-outline'),
('Encanamento', 'water-outline'),
('Pintura', 'brush-outline'),
('Limpeza', 'sparkles-outline'),
('Jardinagem', 'leaf-outline');

-- 2. Inserir Clientes Fictícios
-- A senha 'senha123' foi "hasheada" (criptografada) pela aplicação antes de ser inserida.
INSERT INTO clientes (nome, cpf_cnpj, email, senha, cep, latitude, longitude) VALUES
('Ana Clara', '11122233344', 'ana.clara@email.com', 'senha123', '22050002' ,-22.9713, -43.1857), -- Copacabana, RJ
('Bruno Costa', '55566677788', 'bruno.costa@email.com', 'senha123', '01311000',-23.5614, -46.6565);  -- Av. Paulista, SP

-- 3. Inserir Prestadores Fictícios
INSERT INTO prestadores (nome, cpf_cnpj, email, senha, cep, latitude, longitude) VALUES
('Robson Silva', '12345678900', 'robson.silva@email.com', 'senha123', '22250040',-22.9519, -43.1822),    -- ID será 1
('Carlos Martins', '09876543211', 'carlos.martins@email.com', 'senha123', '20520054', -22.9231, -43.2335), -- ID será 2
('Fernanda Lima', '11223344556', 'fernanda.lima@email.com', 'senha123', '05416000', -23.5654, -46.6912);     -- ID será 3

-- 4. Ligar os Prestadores às Categorias através dos SERVIÇOS OFERECIDOS
-- (Assumindo que os IDs dos prestadores serão 1, 2, 3 e os das categorias 1, 2, 3...)
INSERT INTO servicos_oferecidos (prestador_id, categoria_id, titulo, descricao) VALUES
(1, 1, 'Instalação Elétrica Residencial', 'Serviços completos de instalação de tomadas, disjuntores e fiação.'), -- Robson Silva (ID 1) oferece serviço de Elétrica (ID 1)
(2, 2, 'Reparos de Vazamento', 'Conserto de vazamentos em pias, chuveiros e encanamentos em geral.'), -- Carlos Martins (ID 2) oferece serviço de Encanamento (ID 2)
(3, 1, 'Manutenção de Quadro de Luz', 'Análise e manutenção preventiva em quadros de luz comerciais.'); -- Fernanda Lima (ID 3) oferece serviço de Elétrica (ID 1)

