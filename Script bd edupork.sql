create database Edupork;

use edupork;
select * from raza;
select * from etapa_vida;
select * from usuario;
select * from porcinos;
select * from tipo_identificacion;
describe usuario;

-- SELECT FORMAT(fecha_nacimiento, 'dd-MM-yyyy') AS fecha_nacimiento FROM porcinos;

insert into raza (id_raza,nombre,descripcion) values (1,'Landrace',''),(2,'Duroc','');
insert into etapa_vida (id_etapa,nombre,descripcion) values (1,'Desarrollador',''),(2,'Crecimiento','');
insert into porcinos (id_porcino,peso_inicial,peso_final,fecha_nacimiento,sexo,id_raza,id_etapa,estado,descripcion) values (3,20,56,'2025-05-10','Macho',1,2,'Activo','prueba');

create table tipo_identificacion(
id_tipo_identificacion int auto_increment primary key,
descripcion varchar(20) not null
);

insert into tipo_identificacion(descripcion) values ('Cedula de Cuidania');
insert into tipo_identificacion(descripcion) values ('Tarjeta de identidad');

create table usuario(
id_usuario int auto_increment primary key,
nombre varchar(200) not null,
correo varchar(80) not null unique key, 
contrasena varchar(80) not null unique key ,
estado enum('Activo','Inactivo') not null,
id_tipo_identificacion int not null,

foreign key (id_tipo_identificacion) references tipo_identificacion(id_tipo_identificacion)
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