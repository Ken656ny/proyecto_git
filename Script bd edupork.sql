create database if not exists Edupork;

use edupork;

-- ========================================
-- TABLA: tipo_identificacion
-- ========================================
create table if not exists tipo_identificacion(
id_tipo_identificacion int auto_increment primary key,
descripcion varchar(20) not null
);

-- ========================================
-- TABLA: usuario
-- ========================================
create table if not exists usuario(
id_usuario int auto_increment primary key,
nombre varchar(200) not null,
numero_identificacion CHAR(10) NOT NULL,
correo varchar(80) not null unique key,
contrasena varchar(555) not null,
estado enum('Activo','Inactivo') not null,
rol ENUM('Admin','Aprendiz') not NULL,
id_tipo_identificacion int not null,
intentos_fallidos int default 0,
bloqueado_hasta datetime null ,
foreign key (id_tipo_identificacion) references tipo_identificacion(id_tipo_identificacion)
);

-- ========================================
-- TABLA: usuario_externo
-- ========================================
CREATE TABLE IF NOT EXISTS usuario_externo (
   id_usuario_externo INT AUTO_INCREMENT PRIMARY KEY,
   correo VARCHAR(80) UNIQUE NOT NULL,
   nombre VARCHAR(200),
   proveedor ENUM('Google'),
   estado enum('Activo','Inactivo') not null,
   rol enum("Admin","Aprendiz") not null
);

-- ========================================
-- TABLA: raza
-- ========================================
create table if not exists raza(
id_raza int auto_increment primary key,
nombre varchar(20) not null,
descripcion varchar(100) not null
);

-- ========================================
-- TABLA: etapa_vida
-- ========================================
create table if not exists etapa_vida(
id_etapa int auto_increment primary key,
nombre varchar(20) not null unique,
peso_min int not null,
peso_max int not null,
duracion_dias int not null,
duracion_semanas int not null,
descripcion varchar(100) not null
);

-- ========================================
-- TABLA: requerimientos_nutricionales
-- ========================================
CREATE TABLE requerimientos_nutricionales (
    id_requerimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_etapa INT NOT NULL,
    id_elemento INT NOT NULL,
    porcentaje DECIMAL(5,2) NOT NULL,
    FOREIGN KEY (id_etapa) REFERENCES etapa_vida(id_etapa),
    FOREIGN KEY (id_elemento) REFERENCES elementos(id_elemento)
);

insert into requerimientos_nutricionales(id_etapa, id_elemento,porcentaje) 
values
(2,1,21), 
(2,2,22),
(2,3,23),
(2,4,24)
;


-- JOIN PARA LA TABLA DE REQUERIMIENTOS NUTRICIONALES
select  ev.nombre as etapa_vida,e.nombre_elemento,rn.porcentaje
from requerimientos_nutricionales rn
JOIN etapa_vida ev ON rn.id_etapa = ev.id_etapa
JOIN elementos e ON rn.id_elemento = e.id_elemento
WHERE rn.id_etapa = 1;

SELECT 
    ev.id_etapa, 
    ev.nombre AS nombre_etapa, 
    ev.peso_min, 
    ev.peso_max, 
    ev.duracion_dias,
    ev.duracion_semanas,
    e.id_elemento,
    e.nombre_elemento,
    rn.porcentaje
FROM etapa_vida ev
LEFT JOIN requerimientos_nutricionales rn ON ev.id_etapa = rn.id_etapa
LEFT JOIN elementos e ON rn.id_elemento = e.id_elemento;


-- ========================================
-- TABLA: porcinos
-- ========================================
create table if not exists porcinos(
id_porcino int auto_increment primary key,
peso_inicial float not null,
peso_final float not null,
fecha_nacimiento date not null,
sexo enum('Hembra','Macho') not null,
id_raza int not null,
id_etapa int not null,
estado enum('Activo','Inactivo') not null,
descripcion varchar(100) not null,
fecha_creacion datetime default current_timestamp,

foreign key (id_raza) references raza(id_raza),
foreign key (id_etapa) references etapa_vida(id_etapa)
);

-- ========================================
-- TABLA: transaccion_peso
-- ========================================
create table if not exists transaccion_peso(
id_documento INT AUTO_INCREMENT PRIMARY KEY,
fecha_documento DATETIME DEFAULT CURRENT_TIMESTAMP,
fecha_pesaje DATE NOT NULL,
id_porcino INT NOT NULL,
peso_final INT NOT NULL,
id_usuario INT NOT NULL,
descripcion VARCHAR(400) NULL,

FOREIGN KEY (id_porcino) REFERENCES porcinos(id_porcino),
FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

-- ========================================
-- TABLA: alimentos
-- ========================================
CREATE TABLE IF NOT EXISTS alimentos (
    id_alimento INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL,
    estado ENUM('Activo','Inactivo') NOT NULL,
    imagen VARCHAR(150),
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

-- ========================================
-- TABLA: elementos
-- ========================================
create table if not exists elementos(
	id_elemento int auto_increment primary key,
	nombre varchar(20) not null
);

-- ========================================
-- TABLA: alimento_tiene_elemento
-- ========================================
CREATE TABLE IF NOT EXISTS alimento_tiene_elemento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_alimento INT NOT NULL,
    id_elemento INT NOT NULL,
    valor DOUBLE,
    FOREIGN KEY (id_alimento) REFERENCES alimentos(id_alimento),
    FOREIGN KEY (id_elemento) REFERENCES elementos(id_elemento)
);

-- ========================================
-- TABLA: dietas
-- ========================================
CREATE TABLE IF NOT EXISTS dietas (
    id_dieta INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    fecha_creacion DATE NOT NULL,
    etapa_vida VARCHAR(50),
    estado ENUM('Activo','Inactivo') NOT NULL,
    descripcion VARCHAR(200),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

-- ========================================
-- TABLA: dieta_tiene_alimentos
-- ========================================
CREATE TABLE IF NOT EXISTS dieta_tiene_alimentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_dieta INT NOT NULL,
    id_alimento INT NOT NULL,
    cantidad FLOAT,
    FOREIGN KEY (id_dieta) REFERENCES dietas(id_dieta),
    FOREIGN KEY (id_alimento) REFERENCES alimentos(id_alimento)
);


-- ========================================
-- TABLA: notificaciones
-- ========================================
CREATE TABLE notificaciones (
    id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario_destinatario INT NOT NULL,
    id_usuario_origen INT NULL,
    titulo VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo enum('General','Pesaje','Ingreso','Actualización','Eliminación') DEFAULT 'General',  -- ejemplo: 'pesaje', 'sistema', 'alerta'
    url_referencia VARCHAR(255) NULL,   -- opcional, para redirigir al hacer clic
    leida BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario_destinatario) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_usuario_origen) REFERENCES usuario(id_usuario)
);

-- ==========================================
-- Procedimientos: Actualizar_peso_historial
-- ==========================================
DELIMITER //
create procedure sp_actualizar_peso_historial(
    in p_fecha_pesaje date,
    in p_id_porcino int,
    in p_peso_final float,
    in p_id_usuario int,
    in p_descripcion varchar(500)
)
BEGIN
	-- Insertar transaccion 
	INSERT INTO transaccion_peso(fecha_pesaje,id_porcino,peso_final,id_usuario,descripcion)
    VALUES(p_fecha_pesaje,p_id_porcino,p_peso_final,p_id_usuario,p_descripcion);
    
    -- Actualizar el peso final de porcino
    UPDATE porcinos SET peso_final = p_peso_final WHERE id_porcino = p_id_porcino;
    
    -- Crear notificación para el usuario (o administrador)
    INSERT INTO notificaciones (id_usuario_destinatario, id_usuario_origen, titulo, mensaje, tipo)
    VALUES (p_id_usuario, p_id_usuario, 'Actualizacion de peso final',
            CONCAT('Se registró un nuevo peso de ', p_peso_final, ' kg para el porcino con ID ', p_id_porcino),
            'Pesaje');
END//
DElimiter ;
CALL sp_actualizar_peso_historial('2025-10-18',1,250,3,'Actualizacion del peso');

-- ==========================================
-- MAnejo de informacion de la base de datos
-- ==========================================

-- ==========================================
-- Selects
-- ==========================================
select * from raza;
select * from etapa_vida;
select * from usuario;
select * from usuario_externo;
select * from porcinos;
select * from transaccion_peso;
select * from tipo_identificacion;
SELECT * FROM alimentos;
SELECT * FROM elementos;
SELECT * FROM alimento_tiene_elemento;
SELECT * FROM notificaciones;

-- ==========================================
-- Describe
-- ==========================================

describe usuario;
DESCRIBE transaccion_peso;
DESCRIBE raza;
DESCRIBE etapa_vida;
Describe usuario_externo;

-- ==========================================
-- Inserts
-- ==========================================
insert into raza (id_raza,nombre,descripcion) VALUES (1,'Landrace',''),(2,'Duroc',''),(3,'Pietrain',''),(4,'Large White','');
insert into etapa_vida (id_etapa,nombre,descripcion) values (1,'Pre-inicial',''),(2,'Inicial',''),(3,'Crecimiento',''),(4,'Desarrollador',''),(5,'Engorde',''),(6,'Finalizador','');
insert into porcinos (id_porcino,peso_inicial,peso_final,fecha_nacimiento,sexo,id_raza,id_etapa,estado,descripcion) values (3,20,56,'2025-05-10','Macho',1,2,'Activo','prueba');

insert into tipo_identificacion(descripcion) values ('Cedula de Cuidania');
insert into tipo_identificacion(descripcion) VALUES ('Tarjeta de identidad');

INSERT INTO elementos (nombre_elemento) VALUES 
('Proteina_cruda'),
('Fosforo'),
('Treitona'),
('Fibra_cruda'),
('Sodio'),
('Metionina'),
('Materia_seca'),
('Extracto_etereo'),
('Arginina'),
('Metionina_Cisteina'),
('Energia_metabo'),
('Calcio'),
('Lisina'),
('Triptofano');


-- Colocar el auto_increment en 1

-- ALTER TABLE usuario AUTO_INCREMENT = 1;

-- Eliminar el valor unique
-- SHOW INDEX FROM usuario;

-- truncate
-- TRUNCATE TABLE usuario;
-- DELETE FROM usuario;