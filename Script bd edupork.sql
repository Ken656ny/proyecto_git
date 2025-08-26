create database Edupork;

use edupork;

create table tipo_identificacion(
id_tipo_identificacion int auto_increment primary key,
descripcion varchar(20) not null
);

create table usuario(
id_usuario int auto_increment primary key,
nombre varchar(200) not null,
correo varchar(80) not null unique key, 
contrasena varchar(80) not null,
estado enum('Activo','Inactivo') not null,
id_tipo_identificacion int not null,

foreign key (id_tipo_identificacion) references tipo_identificacion(id_tipo_identificacion)
);


CREATE TABLE transaccion_peso(
id_documento INT AUTO_INCREMENT PRIMARY KEY,
fecha_documento DATE NOT NULL,
fecha_pesaje DATE NOT NULL,
id_porcino INT NOT NULL,
peso_final INT NOT NULL,
id_usuario INT NOT NULL,
descripcion VARCHAR(400) NULL,

FOREIGN KEY (id_porcino) REFERENCES porcinos(id_porcino),
FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);


create table raza(
id_raza int auto_increment primary key,
nombre varchar(20) not null,
descripcion varchar(100) not null
);

create table etapa_vida(
id_etapa int auto_increment primary key,
nombre varchar(20) not null,
descripcion varchar(100) not null
);

create table porcinos(
id_porcino int auto_increment primary key,
peso_inicial float not null,
peso_final float not null,
fecha_nacimiento date not null,
sexo enum('Hembra','Macho') not null,
id_raza int not null,
id_etapa int not null,
estado enum('Activo','Inactivo') not null,
descripcion varchar(100) not null,

foreign key (id_raza) references raza(id_raza),
foreign key (id_etapa) references etapa_vida(id_etapa)
);

create table alimentos(
id_alimento int auto_increment primary key,
estado enum('Activo','Inactivo') not null,
descripcion varchar(100) not null,
id_usuario int not null,

foreign key (id_usuario) references usuario(id_usuario)
);

create table elementos(
id_elemento int auto_increment primary key,
nombre varchar(20) not null,
descripcion varchar(100) not null
);

create table alimento_tiene_elemento(
id int auto_increment primary key,
id_alimento int not null,
id_elemento int not null,

foreign key (id_alimento) references alimentos(id_alimento),
foreign key (id_elemento) references elementos(id_elemento)
);


-- MAnejo de informacion de la base de datos

-- show

SHOW TABLES;

-- selects

select * from raza;
select * from etapa_vida;
select * from usuario;
select * from porcinos;
select * from tipo_identificacion;
SELECT * FROM alimentos;
SELECT * FROM elementos;
SELECT * FROM alimento_tiene_elemento;

-- describe

describe usuario;
DESCRIBE transaccion_peso;
DESCRIBE raza;
DESCRIBE etapa_vida;

-- inserts
insert into raza (id_raza,nombre,descripcion) VALUES (3,'Pietrain',''),(4,'Large White','');
insert into etapa_vida (id_etapa,nombre,descripcion) values (3,'Pre-inicial',''),(4,'Inicial',''),(5,'Finalizador','');
insert into porcinos (id_porcino,peso_inicial,peso_final,fecha_nacimiento,sexo,id_raza,id_etapa,estado,descripcion) values (3,20,56,'2025-05-10','Macho',1,2,'Activo','prueba');

insert into tipo_identificacion(descripcion) values ('Cedula de Cuidania');
insert into tipo_identificacion(descripcion) VALUES ('Tarjeta de identidad');


-- alter
alter TABLE usuario MODIFY COLUMN id_usuario INT AUTO_INCREMENT;
ALTER TABLE usuario ADD COLUMN numero_identificacion CHAR(10) NOT NULL;
ALTER TABLE usuario DROP INDEX  contrasena;
ALTER TABLE usuario ADD COLUMN rol ENUM('Admin','Aprendiz') NULL;

-- Colocar el auto_increment en 1

ALTER TABLE usuario AUTO_INCREMENT = 1;

-- Eliminar el valor unique
SHOW INDEX FROM usuario;

-- truncate
TRUNCATE TABLE usuario;
DELETE FROM usuario;
