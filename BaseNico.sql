-- ============================================================================
-- SISTEMA DE GESTIÓN DE TRANSPORTE - ESTADO ARAGUA
-- Base de datos: transporte_aragua
-- Stack: PostgreSQL + PostGIS
-- Fase 1: Catastro y Registro de Oferta
-- ============================================================================

-- Habilitar extensión geoespacial
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================================
-- 1. GEOGRAFÍA
-- ============================================================================

CREATE TABLE territorio_eje (
    id          SMALLSERIAL     PRIMARY KEY,
    nombre      VARCHAR(50)     NOT NULL UNIQUE,
    color_hex   VARCHAR(7)      DEFAULT '#000000'
);

COMMENT ON TABLE territorio_eje IS 'Ejes territoriales del estado Aragua (Norte‑Costero, Central, Sur, Este)';

CREATE TABLE territorio_municipio (
    id      SMALLSERIAL     PRIMARY KEY,
    nombre  VARCHAR(100)    NOT NULL UNIQUE,
    eje_id  SMALLINT        NOT NULL REFERENCES territorio_eje(id) ON DELETE RESTRICT
);

COMMENT ON TABLE territorio_municipio IS 'Municipios del estado Aragua, cada uno pertenece a un eje territorial';

-- ============================================================================
-- 2. CATÁLOGOS MAESTROS
-- ============================================================================

CREATE TABLE modalidad (
    id      SMALLINT    PRIMARY KEY,
    nombre  VARCHAR(20) NOT NULL UNIQUE
);

COMMENT ON TABLE modalidad IS 'Modalidad de transporte terrestre: COLECTIVO, TAXI, MOTO';

CREATE TABLE tipo_combustible (
    id      SMALLINT    PRIMARY KEY,
    nombre  VARCHAR(15) NOT NULL UNIQUE
);

COMMENT ON TABLE tipo_combustible IS 'Tipo de combustible: GASOLINA, GASOIL, GAS, MIXTO';

CREATE TABLE tipo_ruta (
    id      SMALLINT    PRIMARY KEY,
    nombre  VARCHAR(15) NOT NULL UNIQUE
);

COMMENT ON TABLE tipo_ruta IS 'Clasificación de ruta: URBANA, SUBURBANA';

CREATE TABLE tipo_organizacion (
    id      SMALLINT    PRIMARY KEY,
    nombre  VARCHAR(20) NOT NULL UNIQUE
);

COMMENT ON TABLE tipo_organizacion IS 'Naturaleza jurídica de la organización: PUBLICA, PRIVADA, MIXTA';

CREATE TABLE tipo_transmision (
    id      SMALLINT    PRIMARY KEY,
    nombre  VARCHAR(20) NOT NULL UNIQUE
);

COMMENT ON TABLE tipo_transmision IS 'Tipo de transmisión vehicular: AUTOMATICA, SINCRONICA';

CREATE TABLE submodalidad (
    id              SMALLINT    PRIMARY KEY,
    modalidad_id    SMALLINT    NOT NULL REFERENCES modalidad(id) ON DELETE RESTRICT,
    nombre          VARCHAR(50) NOT NULL UNIQUE
);

COMMENT ON TABLE submodalidad IS 'Detalle del tipo de vehículo dentro de una modalidad (ej: MINIBUS, SEDAN)';

CREATE TABLE tipo_via (
    id      SMALLINT    PRIMARY KEY,
    nombre  VARCHAR(30) NOT NULL UNIQUE
);

COMMENT ON TABLE tipo_via IS 'Predominancia de la vía: PAVIMENTADA, ASFALTADA, TIERRA, MIXTA';

-- ============================================================================
-- 3. ORGANIZACIONES
-- ============================================================================

CREATE TABLE empresa_organizacion (
    rif                 VARCHAR(15)     PRIMARY KEY,
    razon_social        VARCHAR(255)    NOT NULL UNIQUE,
    tipo_id             SMALLINT        NOT NULL REFERENCES tipo_organizacion(id) ON DELETE RESTRICT,
    rep_legal_ci        VARCHAR(15)     NOT NULL,
    rep_legal_nom       VARCHAR(150)    NOT NULL,
    telefono            VARCHAR(20),
    correo              VARCHAR(255),
    direccion_fiscal    TEXT,
    fecha_constitucion  DATE,
    esta_activa         BOOLEAN         DEFAULT TRUE
);

COMMENT ON TABLE empresa_organizacion IS 'Líneas o empresas de transporte, con su representante legal';

-- ============================================================================
-- 4. RECURSOS HUMANOS
-- ============================================================================

CREATE TABLE personal_operador (
    cedula                  VARCHAR(15)     PRIMARY KEY,
    codigo_op               VARCHAR(20)     NOT NULL UNIQUE,
    nombres                 VARCHAR(100)    NOT NULL,
    apellidos               VARCHAR(100)    NOT NULL,
    telefono                VARCHAR(20),
    direccion               TEXT,
    fecha_nacimiento        DATE,
    licencia_grado          SMALLINT        NOT NULL CHECK (licencia_grado IN (2,3,4,5)),
    vence_lic               DATE            NOT NULL,
    certificado_medico_vence DATE,
    tipo_sangre             VARCHAR(5)
);

COMMENT ON TABLE personal_operador IS 'Operadores (choferes) del sistema de transporte';

-- ============================================================================
-- 5. FLOTA VEHICULAR
-- ============================================================================

CREATE TABLE flota_vehiculo (
    placa                   VARCHAR(15)     PRIMARY KEY,
    modalidad_id            SMALLINT        NOT NULL REFERENCES modalidad(id) ON DELETE RESTRICT,
    submodalidad_id         SMALLINT        REFERENCES submodalidad(id) ON DELETE SET NULL,
    marca                   VARCHAR(50)     NOT NULL,
    modelo                  VARCHAR(50)     NOT NULL,
    anio                    SMALLINT        NOT NULL,
    color                   VARCHAR(30),
    transmision_id          SMALLINT        NOT NULL REFERENCES tipo_transmision(id) ON DELETE RESTRICT,
    capacidad               SMALLINT        NOT NULL,
    capacidad_pie           SMALLINT,
    combustible_id          SMALLINT        NOT NULL REFERENCES tipo_combustible(id) ON DELETE RESTRICT,
    aire_acondicionado      BOOLEAN         DEFAULT FALSE,
    accesibilidad           BOOLEAN         DEFAULT FALSE,
    seguro_vence            DATE,
    revision_tecnica_vence  DATE
);

COMMENT ON TABLE flota_vehiculo IS 'Vehículos registrados en el sistema (colectivos, taxis, motos)';

-- ============================================================================
-- 6. HISTÓRICOS DE POSESIÓN (AUDITORÍA)
-- ============================================================================

CREATE TABLE vehiculo_organizacion (
    id               BIGSERIAL       PRIMARY KEY,
    vehiculo_id      VARCHAR(15)     NOT NULL REFERENCES flota_vehiculo(placa) ON DELETE CASCADE,
    organizacion_id  VARCHAR(15)     NOT NULL REFERENCES empresa_organizacion(rif) ON DELETE RESTRICT,
    fecha_inicio     DATE            NOT NULL,
    fecha_fin        DATE
);

COMMENT ON TABLE vehiculo_organizacion IS 'Histórico de propiedad de vehículos por organización. El registro activo tiene fecha_fin NULL.';

CREATE TABLE operador_organizacion (
    id               BIGSERIAL       PRIMARY KEY,
    operador_id      VARCHAR(15)     NOT NULL REFERENCES personal_operador(cedula) ON DELETE CASCADE,
    organizacion_id  VARCHAR(15)     NOT NULL REFERENCES empresa_organizacion(rif) ON DELETE RESTRICT,
    fecha_inicio     DATE            NOT NULL,
    fecha_fin        DATE
);

COMMENT ON TABLE operador_organizacion IS 'Histórico de empleo de operadores en las organizaciones. El registro activo tiene fecha_fin NULL.';

-- ============================================================================
-- 7. RUTAS (GEOESPACIAL)
-- ============================================================================

CREATE TABLE vialidad_ruta (
    id                  BIGSERIAL                   PRIMARY KEY,
    nombre              VARCHAR(200)                NOT NULL UNIQUE,
    tipo_id             SMALLINT                    NOT NULL REFERENCES tipo_ruta(id) ON DELETE RESTRICT,
    municipio_or_id     SMALLINT                    NOT NULL REFERENCES territorio_municipio(id) ON DELETE RESTRICT,
    municipio_des_id    SMALLINT                    NOT NULL REFERENCES territorio_municipio(id) ON DELETE RESTRICT,
    es_anillado         BOOLEAN                     DEFAULT FALSE,
    distancia_km        NUMERIC(6,2),
    tiempo_estimado_min SMALLINT,
    numero_paradas      SMALLINT,
    tipo_via_id         SMALLINT                    REFERENCES tipo_via(id) ON DELETE SET NULL,
    observaciones       TEXT,
    geom                GEOMETRY(LINESTRING, 4326)  NOT NULL
);

COMMENT ON TABLE vialidad_ruta IS 'Rutas de transporte terrestre con su trazado geográfico';

-- Índice espacial para consultas rápidas sobre el trazado
CREATE INDEX idx_ruta_geom ON vialidad_ruta USING GIST (geom);

-- ============================================================================
-- 8. PERMISOS DE OPERACIÓN
-- ============================================================================

CREATE TABLE gestion_permiso (
    id                  BIGSERIAL       PRIMARY KEY,
    org_id              VARCHAR(15)     NOT NULL REFERENCES empresa_organizacion(rif) ON DELETE CASCADE,
    ruta_id             BIGINT          NOT NULL REFERENCES vialidad_ruta(id) ON DELETE CASCADE,
    f_emision           DATE            NOT NULL,
    numero_resolucion   VARCHAR(50),
    estatus             VARCHAR(15)     DEFAULT 'ACT' CHECK (estatus IN ('ACT','SUSP')),
    observaciones       TEXT,
    UNIQUE (org_id, ruta_id)           -- Evita permisos duplicados para la misma ruta
);

COMMENT ON TABLE gestion_permiso IS 'Permisos otorgados a organizaciones para operar rutas específicas';

-- ============================================================================
-- 9. SEGURIDAD (USUARIOS Y ROLES)
-- ============================================================================

CREATE TABLE rol (
    id          SMALLINT    PRIMARY KEY,
    nombre      VARCHAR(30) NOT NULL UNIQUE,
    descripcion TEXT
);

COMMENT ON TABLE rol IS 'Roles de usuario del sistema: ADMIN, CONSULTOR, OPERADOR';

CREATE TABLE usuario_sistema (
    id              SERIAL          PRIMARY KEY,
    username        VARCHAR(50)     NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    rol_id          SMALLINT        NOT NULL REFERENCES rol(id) ON DELETE RESTRICT,
    org_id          VARCHAR(15)     REFERENCES empresa_organizacion(rif) ON DELETE SET NULL
);

COMMENT ON TABLE usuario_sistema IS 'Usuarios del sistema con su rol y, si es operador, la organización a la que pertenece';

-- ============================================================================
-- CARGA INICIAL DE DATOS MAESTROS
-- ============================================================================

-- Ejes territoriales
INSERT INTO territorio_eje (nombre, color_hex) VALUES
('Norte-Costero', '#1f77b4'),
('Central',       '#ff7f0e'),
('Sur',           '#2ca02c'),
('Este',          '#9467bd');

-- Municipios (asociados a los ejes según el documento oficial)
WITH ejes AS (
    SELECT id, nombre FROM territorio_eje
)
INSERT INTO territorio_municipio (nombre, eje_id) VALUES
-- Eje Central (id=2)
('Girardot',                     (SELECT id FROM ejes WHERE nombre = 'Central')),
('Mario Briceño Iragorry',      (SELECT id FROM ejes WHERE nombre = 'Central')),
('Santiago Mariño',             (SELECT id FROM ejes WHERE nombre = 'Central')),
('Francisco Linares Alcántara', (SELECT id FROM ejes WHERE nombre = 'Central')),
('Libertador',                  (SELECT id FROM ejes WHERE nombre = 'Central')),
('Sucre',                       (SELECT id FROM ejes WHERE nombre = 'Central')),
('José Ángel Lamas',            (SELECT id FROM ejes WHERE nombre = 'Central')),
-- Eje Este (id=4)
('José Félix Ribas',            (SELECT id FROM ejes WHERE nombre = 'Este')),
('Simón Bolívar',               (SELECT id FROM ejes WHERE nombre = 'Este')),
('José Rafael Revenga',         (SELECT id FROM ejes WHERE nombre = 'Este')),
('Santos Michelena',            (SELECT id FROM ejes WHERE nombre = 'Este')),
('Tovar',                       (SELECT id FROM ejes WHERE nombre = 'Este')),
-- Eje Sur (id=3)
('Ezequiel Zamora',             (SELECT id FROM ejes WHERE nombre = 'Sur')),
('San Sebastián',               (SELECT id FROM ejes WHERE nombre = 'Sur')),
('San Casimiro',                (SELECT id FROM ejes WHERE nombre = 'Sur')),
('Camatagua',                   (SELECT id FROM ejes WHERE nombre = 'Sur')),
('Urdaneta',                    (SELECT id FROM ejes WHERE nombre = 'Sur')),
-- Eje Norte-Costero (id=1)
('Ocumare de la Costa de Oro',  (SELECT id FROM ejes WHERE nombre = 'Norte-Costero'));

-- Catálogos básicos
INSERT INTO modalidad (id, nombre) VALUES
(1, 'COLECTIVO'),
(2, 'TAXI'),
(3, 'MOTO');

INSERT INTO tipo_combustible (id, nombre) VALUES
(1, 'GASOLINA'),
(2, 'GASOIL'),
(3, 'GAS'),
(4, 'MIXTO');

INSERT INTO tipo_ruta (id, nombre) VALUES
(1, 'URBANA'),
(2, 'SUBURBANA');

INSERT INTO tipo_organizacion (id, nombre) VALUES
(1, 'PUBLICA'),
(2, 'PRIVADA'),
(3, 'MIXTA');

INSERT INTO tipo_transmision (id, nombre) VALUES
(1, 'AUTOMATICA'),
(2, 'SINCRONICA');

-- Submodalidades (ejemplos)
INSERT INTO submodalidad (id, modalidad_id, nombre) VALUES
-- Colectivo
(1, 1, 'MICROBUS'),
(2, 1, 'AUTOBUS ESTANDAR'),
(3, 1, 'AUTOBUS ARTICULADO'),
(4, 1, 'BUSETA'),
-- Taxi
(5, 2, 'SEDAN'),
(6, 2, 'STATION WAGON'),
(7, 2, 'MINIVAN'),
-- Moto
(8, 3, 'MOTOCICLETA'),
(9, 3, 'TRICICLO MOTORIZADO');

INSERT INTO tipo_via (id, nombre) VALUES
(1, 'PAVIMENTADA'),
(2, 'ASFALTADA'),
(3, 'TIERRA'),
(4, 'MIXTA');

-- Roles de seguridad
INSERT INTO rol (id, nombre, descripcion) VALUES
(1, 'ADMIN',     'Super Administrador (Secretaría de Transporte) – acceso total'),
(2, 'CONSULTOR', 'Consultor Ejecutivo (Despacho de Gobierno) – solo lectura'),
(3, 'OPERADOR',  'Operador (Línea/Empresa) – gestiona su propia flota y personal');

-- 10. CONFIGURACIÓN VISUAL
CREATE TABLE IF NOT EXISTS configuracion_visual (
    id SERIAL PRIMARY KEY,
    nombre_sistema VARCHAR(100) DEFAULT 'Transporte Aragua Digital',
    logo VARCHAR(255),
    login_bg VARCHAR(255),
    primary_color VARCHAR(7) DEFAULT '#032448',
    secondary_color VARCHAR(7) DEFAULT '#f5f5f5'
);

INSERT INTO configuracion_visual (id, nombre_sistema) 
SELECT 1, 'Transporte Aragua Digital' 
WHERE NOT EXISTS (SELECT 1 FROM configuracion_visual WHERE id = 1);