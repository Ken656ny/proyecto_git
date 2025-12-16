-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema edupork_4
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema edupork_4
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `edupork_4` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `edupork_4` ;

-- -----------------------------------------------------
-- Table `edupork_4`.`alimentos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `edupork_4`.`alimentos` (
  `id_alimento` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(30) NOT NULL,
  `estado` ENUM('Activo', 'Inactivo') NOT NULL,
  `imagen` VARCHAR(150) NULL DEFAULT NULL,
  `usuario_id` INT NOT NULL,
  `usuario_tipo` ENUM('Interno', 'Externo') NULL DEFAULT NULL,
  PRIMARY KEY (`id_alimento`))
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `edupork_4`.`elementos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `edupork_4`.`elementos` (
  `id_elemento` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id_elemento`))
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `edupork_4`.`alimento_tiene_elemento`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `edupork_4`.`alimento_tiene_elemento` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_alimento` INT NOT NULL,
  `id_elemento` INT NOT NULL,
  `valor` DOUBLE NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `id_alimento` (`id_alimento` ASC) VISIBLE,
  INDEX `id_elemento` (`id_elemento` ASC) VISIBLE,
  CONSTRAINT `alimento_tiene_elemento_ibfk_1`
    FOREIGN KEY (`id_alimento`)
    REFERENCES `edupork_4`.`alimentos` (`id_alimento`),
  CONSTRAINT `alimento_tiene_elemento_ibfk_2`
    FOREIGN KEY (`id_elemento`)
    REFERENCES `edupork_4`.`elementos` (`id_elemento`))
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `edupork_4`.`etapa_vida`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `edupork_4`.`etapa_vida` (
  `id_etapa` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(20) NOT NULL,
  `descripcion` VARCHAR(100) NOT NULL,
  `peso_min` INT NOT NULL,
  `peso_max` INT NOT NULL,
  `duracion_dias` INT NOT NULL,
  `duracion_semanas` INT NOT NULL,
  PRIMARY KEY (`id_etapa`),
  UNIQUE INDEX `nombre` (`nombre` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `edupork_4`.`dietas`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `edupork_4`.`dietas` (
  `id_dieta` INT NOT NULL AUTO_INCREMENT,
  `usuario_id` INT NOT NULL,
  `fecha_creacion` DATE NOT NULL,
  `id_etapa_vida` INT NOT NULL,
  `estado` ENUM('Activo', 'Inactivo') NOT NULL,
  `descripcion` VARCHAR(200) NULL DEFAULT NULL,
  `mezcla_nutricional` JSON NULL DEFAULT NULL,
  `usuario_tipo` ENUM('Interno', 'Externo') NOT NULL,
  PRIMARY KEY (`id_dieta`),
  INDEX `id_etapa_vida` (`id_etapa_vida` ASC) VISIBLE,
  CONSTRAINT `dietas_ibfk_2`
    FOREIGN KEY (`id_etapa_vida`)
    REFERENCES `edupork_4`.`etapa_vida` (`id_etapa`))
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `edupork_4`.`dieta_tiene_alimentos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `edupork_4`.`dieta_tiene_alimentos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_dieta` INT NOT NULL,
  `id_alimento` INT NOT NULL,
  `cantidad` FLOAT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `id_dieta` (`id_dieta` ASC) VISIBLE,
  INDEX `id_alimento` (`id_alimento` ASC) VISIBLE,
  CONSTRAINT `dieta_tiene_alimentos_ibfk_1`
    FOREIGN KEY (`id_dieta`)
    REFERENCES `edupork_4`.`dietas` (`id_dieta`),
  CONSTRAINT `dieta_tiene_alimentos_ibfk_2`
    FOREIGN KEY (`id_alimento`)
    REFERENCES `edupork_4`.`alimentos` (`id_alimento`))
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `edupork_4`.`notificaciones`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `edupork_4`.`notificaciones` (
  `id_notificacion` INT NOT NULL AUTO_INCREMENT,
  `destinatario_id` INT NOT NULL,
  `destinatario_tipo` ENUM('Interno', 'Externo') NOT NULL,
  `origen_id` INT NULL DEFAULT NULL,
  `origen_tipo` ENUM('Interno', 'Externo') NOT NULL,
  `titulo` VARCHAR(100) NOT NULL,
  `mensaje` TEXT NOT NULL,
  `tipo` ENUM('General', 'Pesaje', 'Ingreso', 'Actualización', 'Eliminación') NULL DEFAULT NULL,
  `url_referencia` VARCHAR(255) NULL DEFAULT NULL,
  `leida` TINYINT(1) NULL DEFAULT '0',
  `fecha_creacion` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_notificacion`),
  INDEX `idx_destinatario` (`destinatario_tipo` ASC, `destinatario_id` ASC) VISIBLE,
  INDEX `idx_origen` (`origen_tipo` ASC, `origen_id` ASC) VISIBLE,
  INDEX `idx_leida` (`leida` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `edupork_4`.`raza`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `edupork_4`.`raza` (
  `id_raza` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(20) NOT NULL,
  `descripcion` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_raza`))
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `edupork_4`.`porcinos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `edupork_4`.`porcinos` (
  `id_porcino` INT NOT NULL AUTO_INCREMENT,
  `peso_inicial` FLOAT NOT NULL,
  `peso_final` FLOAT NOT NULL,
  `fecha_nacimiento` DATE NOT NULL,
  `sexo` ENUM('Hembra', 'Macho') NOT NULL,
  `id_raza` INT NOT NULL,
  `id_etapa` INT NOT NULL,
  `estado` ENUM('Activo', 'Inactivo') NOT NULL,
  `descripcion` VARCHAR(100) NOT NULL,
  `fecha_creacion` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_porcino`),
  INDEX `id_raza` (`id_raza` ASC) VISIBLE,
  INDEX `id_etapa` (`id_etapa` ASC) VISIBLE,
  CONSTRAINT `porcinos_ibfk_1`
    FOREIGN KEY (`id_raza`)
    REFERENCES `edupork_4`.`raza` (`id_raza`),
  CONSTRAINT `porcinos_ibfk_2`
    FOREIGN KEY (`id_etapa`)
    REFERENCES `edupork_4`.`etapa_vida` (`id_etapa`))
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `edupork_4`.`requerimientos_nutricionales`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `edupork_4`.`requerimientos_nutricionales` (
  `id_requerimiento` INT NOT NULL AUTO_INCREMENT,
  `id_etapa` INT NOT NULL,
  `id_elemento` INT NOT NULL,
  `porcentaje` DECIMAL(5,2) NOT NULL,
  PRIMARY KEY (`id_requerimiento`),
  INDEX `id_etapa` (`id_etapa` ASC) VISIBLE,
  INDEX `id_elemento` (`id_elemento` ASC) VISIBLE,
  CONSTRAINT `requerimientos_nutricionales_ibfk_1`
    FOREIGN KEY (`id_etapa`)
    REFERENCES `edupork_4`.`etapa_vida` (`id_etapa`),
  CONSTRAINT `requerimientos_nutricionales_ibfk_2`
    FOREIGN KEY (`id_elemento`)
    REFERENCES `edupork_4`.`elementos` (`id_elemento`))
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `edupork_4`.`tipo_identificacion`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `edupork_4`.`tipo_identificacion` (
  `id_tipo_identificacion` INT NOT NULL AUTO_INCREMENT,
  `descripcion` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id_tipo_identificacion`))
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `edupork_4`.`transaccion_peso`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `edupork_4`.`transaccion_peso` (
  `id_documento` INT NOT NULL AUTO_INCREMENT,
  `fecha_documento` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_pesaje` DATE NOT NULL,
  `id_porcino` INT NOT NULL,
  `peso_final` INT NOT NULL,
  `usuario_id` INT NOT NULL,
  `descripcion` VARCHAR(400) NULL DEFAULT NULL,
  `usuario_tipo` ENUM('Interno', 'Externo') NOT NULL,
  PRIMARY KEY (`id_documento`),
  INDEX `id_porcino` (`id_porcino` ASC) VISIBLE,
  CONSTRAINT `transaccion_peso_ibfk_1`
    FOREIGN KEY (`id_porcino`)
    REFERENCES `edupork_4`.`porcinos` (`id_porcino`))
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

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


-- -----------------------------------------------------
-- Table `edupork_4`.`usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `edupork_4`.`usuario` (
  `id_usuario` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(200) NOT NULL,
  `numero_identificacion` CHAR(10) NOT NULL,
  `correo` VARCHAR(80) NOT NULL,
  `contrasena` VARCHAR(555) NOT NULL,
  `estado` ENUM('Activo', 'Inactivo') NOT NULL,
  `rol` ENUM('Admin', 'Aprendiz') NULL DEFAULT NULL,
  `id_tipo_identificacion` INT NOT NULL,
  `intentos_fallidos` INT NULL DEFAULT '0',
  `bloqueado_hasta` DATETIME NULL DEFAULT NULL,
  `reset_token` VARCHAR(255) NULL DEFAULT NULL,
  `reset_token_expira` DATETIME NULL DEFAULT NULL,
  `tipo` ENUM('Interno') NULL DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE INDEX `correo` (`correo` ASC) VISIBLE,
  UNIQUE INDEX `numero_identificacion_UNIQUE` (`numero_identificacion` ASC) VISIBLE,
  INDEX `id_tipo_identificacion` (`id_tipo_identificacion` ASC) VISIBLE,
  CONSTRAINT `usuario_ibfk_1`
    FOREIGN KEY (`id_tipo_identificacion`)
    REFERENCES `edupork_4`.`tipo_identificacion` (`id_tipo_identificacion`))
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `edupork_4`.`usuario_externo`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `edupork_4`.`usuario_externo` (
  `id_usuario_externo` INT NOT NULL AUTO_INCREMENT,
  `correo` VARCHAR(80) NOT NULL,
  `nombre` VARCHAR(200) NULL DEFAULT NULL,
  `proveedor` ENUM('Google') NULL DEFAULT NULL,
  `rol` ENUM('Admin', 'Aprendiz') NOT NULL,
  `estado` ENUM('Activo', 'Inactivo') NULL DEFAULT NULL,
  `tipo` ENUM('Externo') NULL DEFAULT NULL,
  PRIMARY KEY (`id_usuario_externo`),
  UNIQUE INDEX `correo` (`correo` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

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

select * from elementos;

select * from usuario_externo;
