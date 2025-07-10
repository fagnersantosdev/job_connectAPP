-- CRIAR BANCO

CREATE TABLE clientes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  cpf_cnpj CHAR(14) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  cep CHAR(8) NOT NULL,
  complemento VARCHAR(10),
  numero INTEGER,
  foto BYTEA,
  telefone VARCHAR(20) NOT NULL
);

CREATE TABLE prestadores (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  cpf_cnpj CHAR(14) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  cep CHAR(8) NOT NULL,
  complemento VARCHAR(10),
  numero INTEGER,
  foto BYTEA,
  raio_atuacao REAL NOT NULL,
  telefone VARCHAR(20) NOT NULL
);
