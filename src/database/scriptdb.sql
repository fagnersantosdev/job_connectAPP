-- CRIAR BANCO

create database connect;
USE connect;

create table clientes(
id int auto_increment primary key,
nome varchar(100) not null,
cpf_cnpj varchar(14) not null unique,
email varchar(100) not null unique,
senha varchar(255) not null,
cep char(8) not null,
complemento varchar(10),
numero int(10),
foto mediumblob
);

create table prestadores(
id int auto_increment primary key,
nome varchar(100) not null,
cpf_cnpj varchar(14) not null unique,
email varchar(100) not null unique,
senha varchar(255) not null,
cep char(8) not null,
complemento varchar(10),
numero int(10),
foto mediumblob,
raioAtuacao float not null
);