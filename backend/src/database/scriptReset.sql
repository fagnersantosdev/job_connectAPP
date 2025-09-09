-- PASSO 1: Garantir que a extensão de criptografia está ativa
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- PASSO 2: Criar a função que criptografa a senha
CREATE OR REPLACE FUNCTION hash_password_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Gera um "salt" e criptografa a senha usando o algoritmo bcrypt
    NEW.senha = crypt(NEW.senha, gen_salt('bf', 8));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PASSO 3: Garantir que os gatilhos existem (remove os antigos se houver)
DROP TRIGGER IF EXISTS trg_hash_cliente_senha ON clientes;
CREATE TRIGGER trg_hash_cliente_senha
BEFORE INSERT OR UPDATE ON clientes
FOR EACH ROW EXECUTE FUNCTION hash_password_trigger();

DROP TRIGGER IF EXISTS trg_hash_prestador_senha ON prestadores;
CREATE TRIGGER trg_hash_prestador_senha
BEFORE INSERT OR UPDATE ON prestadores
FOR EACH ROW EXECUTE FUNCTION hash_password_trigger();

-- PASSO 4: Limpar completamente as tabelas e reiniciar os IDs
TRUNCATE TABLE clientes, prestadores, categorias_servico, servicos_oferecidos RESTART IDENTITY CASCADE;

-- PASSO 5: Inserir os dados de teste (agora com os gatilhos ativos)
INSERT INTO categorias_servico (nome, icone_url) VALUES
('Elétrica', 'flash-outline'),
('Encanamento', 'water-outline'),
('Pintura', 'brush-outline'),
('Limpeza', 'sparkles-outline'),
('Jardinagem', 'leaf-outline');

INSERT INTO clientes (nome, cpf_cnpj, email, senha, cep, latitude, longitude) VALUES
('Ana Clara', '11122233344', 'ana.clara@email.com', 'senha123', '22050002', -22.9713, -43.1857),
('Bruno Costa', '55566677788', 'bruno.costa@email.com', 'senha123', '01311000', -23.5614, -46.6565);

INSERT INTO prestadores (nome, cpf_cnpj, email, senha, cep, latitude, longitude) VALUES
('Robson Silva', '12345678900', 'robson.silva@email.com', 'senha123', '22250040', -22.9519, -43.1822),
('Carlos Martins', '09876543211', 'carlos.martins@email.com', 'senha123', '20520054', -22.9231, -43.2335);

INSERT INTO servicos_oferecidos (prestador_id, categoria_id, titulo, descricao) VALUES
(1, 1, 'Instalação Elétrica Residencial', 'Serviços completos de instalação.'),
(2, 2, 'Reparos de Vazamento', 'Conserto de vazamentos em geral.');
