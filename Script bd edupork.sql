create database if not exists edupork;

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
reset_token VARCHAR(255) NULL,
reset_token_expira DATETIME NULL,
tipo enum('Interno'),
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
   rol enum("Admin","Aprendiz") not null,
   estado enum('Activo','Inactivo'),
   tipo enum('Externo')
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
-- TABLA: elementos
-- ========================================
create table if not exists elementos(
	id_elemento int auto_increment primary key,
	nombre varchar(20) not null
);

-- ========================================
-- TABLA: requerimientos_nutricionales
-- ========================================
CREATE TABLE requerimientos_nutricionales (
    id_requerimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_etapa INT NOT NULL,
    id_elemento INT NOT NULL,
    porcentaje DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_etapa) REFERENCES etapa_vida(id_etapa),
    FOREIGN KEY (id_elemento) REFERENCES elementos(id_elemento)
);


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

FOREIGN KEY (id_porcino) REFERENCES porcinos(id_porcino)
);


-- ========================================
-- TABLA: alimentos
-- ========================================
CREATE TABLE IF NOT EXISTS alimentos (
    id_alimento INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL,
    estado ENUM('Activo','Inactivo') NOT NULL,
    imagen VARCHAR(150),
    usuario_id INT NOT NULL,
    usuario_tipo enum('Interno','Externo') not null
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
    usuario_id INT NOT NULL,
    usuario_tipo enum('Interno','Externo') not null,
    fecha_creacion DATE NOT NULL,
    id_etapa_vida int not null,
    estado ENUM('Activo','Inactivo') NOT NULL,
    descripcion VARCHAR(200),
    mezcla_nutricional json,
    foreign key (id_etapa_vida) references etapa_vida(id_etapa)
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

  destinatario_id INT NOT NULL,
  destinatario_tipo ENUM('interno','externo') NOT NULL,

  origen_id INT NOT NULL,
  origen_tipo ENUM('Interno','Externo') NOT NULL,

  titulo VARCHAR(100) NOT NULL,
  mensaje TEXT NOT NULL,
  tipo ENUM('General','Pesaje','Ingreso','Actualización','Eliminación'),
  url_referencia VARCHAR(255),
  leida TINYINT(1) DEFAULT 0,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_destinatario (destinatario_tipo, destinatario_id),
  INDEX idx_origen (origen_tipo, origen_id),
  INDEX idx_leida (leida)
);

-- ==========================================
-- Procedimientos: Actualizar_peso_historial
-- ==========================================
DELIMITER $$
CREATE PROCEDURE sp_actualizar_peso_historial(
    IN p_fecha_pesaje DATE,
    IN p_id_porcino INT,
    IN p_peso_final FLOAT,
    IN p_id_usuario INT,
    IN p_usuario_tipo ENUM('Interno','Externo'),
    IN p_descripcion VARCHAR(500)
)
BEGIN
    DECLARE v_etapa_actual INT;
    DECLARE v_etapa_nueva INT;

    -- Etapa actual
    SELECT id_etapa
    INTO v_etapa_actual
    FROM porcinos
    WHERE id_porcino = p_id_porcino;

    -- Registrar transacción de peso
    INSERT INTO transaccion_peso (
        fecha_pesaje,
        id_porcino,
        peso_final,
        usuario_id,
        usuario_tipo,
        descripcion
    )
    VALUES (
        p_fecha_pesaje,
        p_id_porcino,
        p_peso_final,
        p_id_usuario,
        p_usuario_tipo,
        p_descripcion
    );

    -- Actualizar peso
    UPDATE porcinos
    SET peso_final = p_peso_final
    WHERE id_porcino = p_id_porcino;

    -- Nueva etapa
    SELECT id_etapa
    INTO v_etapa_nueva
    FROM etapa_vida
    WHERE p_peso_final BETWEEN peso_min AND peso_max
    LIMIT 1;

    -- Cambio de etapa
    IF v_etapa_nueva IS NOT NULL
       AND v_etapa_nueva <> v_etapa_actual THEN

        UPDATE porcinos
        SET id_etapa = v_etapa_nueva
        WHERE id_porcino = p_id_porcino;

        INSERT INTO notificaciones (
            destinatario_id,
            destinatario_tipo,
            origen_id,
            origen_tipo,
            titulo,
            mensaje,
            tipo
        )
        VALUES (
            p_id_usuario,
            p_usuario_tipo,
            p_id_usuario,
            p_usuario_tipo,
            'Cambio de etapa del porcino',
            CONCAT(
                'El porcino con ID ', p_id_porcino,
                ' cambió de etapa automáticamente al registrar el peso de ',
                p_peso_final, ' kg.'
            ),
            'Actualización'
        );
    END IF;
    -- Notificación general
    INSERT INTO notificaciones (
        destinatario_id,
        destinatario_tipo,
        origen_id,
        origen_tipo,
        titulo,
        mensaje,
        tipo
    )
    VALUES (
        p_id_usuario,
        p_usuario_tipo,
        p_id_usuario,
        p_usuario_tipo,
        'Actualización de peso final',
        CONCAT(
            'Se registró un nuevo peso de ',
            p_peso_final,
            ' kg para el porcino con ID ',
            p_id_porcino
        ),
        'Pesaje'
    );
END $$
DELIMITER ;

insert into tipo_identificacion(descripcion) values ('Cedula de Cuidania');
insert into tipo_identificacion(descripcion) VALUES ('Tarjeta de identidad');

insert into raza (id_raza,nombre,descripcion) VALUES (1,'Landrace',''),(2,'Duroc',''),(3,'Pietrain',''),(4,'Large White','');

INSERT INTO elementos (nombre) VALUES
('Proteina_cruda'),
('Fosforo'),
('Treonina'),
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