-- ============================================================================
-- ACTUALIZACIÃ“N DE BASE DE DATOS â€“ TRANSPORTE ARAGUA (V2)
-- Cambios de la primera revisiÃ³n - 2026-05-12
-- ============================================================================

-- ============================================================================
-- 1. NUEVA TABLA: TIPO DE CPS (CertificaciÃ³n de PrestaciÃ³n de Servicio)
-- ============================================================================
CREATE TABLE public.tipo_cps (
    id          BIGSERIAL       PRIMARY KEY,
    codigo      VARCHAR(5)      NOT NULL UNIQUE,
    descripcion VARCHAR(100)
);

COMMENT ON TABLE tipo_cps IS 'Tipo de CPS: DT9 (5-32 puestos) / DT10 (32+ puestos)';

-- ============================================================================
-- 2. NUEVA TABLA: GREMIOS
-- ============================================================================
CREATE TABLE public.gremio (
    id              BIGSERIAL       PRIMARY KEY,
    rif             VARCHAR(15)     NOT NULL UNIQUE,
    razon_social    VARCHAR(255)    NOT NULL,
    direccion       TEXT,
    anio_creacion   SMALLINT,
    telefono        VARCHAR(20),
    correo          VARCHAR(255)
);

COMMENT ON TABLE gremio IS 'Agrupa a las organizaciones (lÃ­neas) bajo un gremio estadal';

-- ============================================================================
-- 3. MODIFICAR ORGANIZACIONES (empresa_organizacion)
-- ============================================================================
-- Renombrar fecha_constitucion a fecha_constitucion_mercantil
ALTER TABLE public.empresa_organizacion
    RENAME COLUMN fecha_constitucion TO fecha_constitucion_mercantil;

-- Agregar columna gremio_id (pertenencia a un gremio)
ALTER TABLE public.empresa_organizacion
    ADD COLUMN gremio_id BIGINT REFERENCES public.gremio(id) ON DELETE SET NULL;

-- Agregar cupo mÃ¡ximo de unidades
ALTER TABLE public.empresa_organizacion
    ADD COLUMN cupo_maximo_unidades SMALLINT;

COMMENT ON COLUMN empresa_organizacion.gremio_id IS 'FK al gremio al que pertenece la organizaciÃ³n';
COMMENT ON COLUMN empresa_organizacion.cupo_maximo_unidades IS 'Cupo mÃ¡ximo de unidades asignadas';

-- ============================================================================
-- 4. NUEVA TABLA: CPS DE LA ORGANIZACIÃ“N (CertificaciÃ³n de PrestaciÃ³n de Servicio)
-- ============================================================================
CREATE TABLE public.organizacion_cps (
    id                  BIGSERIAL       PRIMARY KEY,
    organizacion_id     VARCHAR(15)     NOT NULL REFERENCES public.empresa_organizacion(rif) ON DELETE CASCADE,
    codigo              VARCHAR(50)     NOT NULL,
    fecha_expedicion    DATE            NOT NULL,
    fecha_vencimiento   DATE            NOT NULL,
    modalidad           VARCHAR(50),
    tipo_cps_id         BIGINT          REFERENCES public.tipo_cps(id) ON DELETE SET NULL,
    cupo_maximo_unidades SMALLINT,
    activa              BOOLEAN         DEFAULT TRUE
);

COMMENT ON TABLE organizacion_cps IS 'CertificaciÃ³n de PrestaciÃ³n de Servicio de la organizaciÃ³n (DT9/DT10)';

-- ============================================================================
-- 5. MODIFICAR FLOTA VEHICULAR (flota_vehiculo)
-- ============================================================================
-- Eliminar capacidad_pie (pasajeros parados)
ALTER TABLE public.flota_vehiculo
    DROP COLUMN capacidad_pie;

-- Agregar nuevos campos
ALTER TABLE public.flota_vehiculo
    ADD COLUMN propietario_cedula  VARCHAR(15),
    ADD COLUMN propietario_rif     VARCHAR(15),
    ADD COLUMN propietario_nombre  VARCHAR(150),
    ADD COLUMN serial_carroceria   VARCHAR(50),
    ADD COLUMN cps_tipo_id         BIGINT REFERENCES public.tipo_cps(id) ON DELETE SET NULL;

COMMENT ON COLUMN flota_vehiculo.propietario_cedula IS 'CÃ©dula del propietario del vehÃ­culo';
COMMENT ON COLUMN flota_vehiculo.propietario_rif IS 'RIF del propietario del vehÃ­culo';
COMMENT ON COLUMN flota_vehiculo.propietario_nombre IS 'Nombre del propietario';
COMMENT ON COLUMN flota_vehiculo.serial_carroceria IS 'Serial de carrocerÃ­a';
COMMENT ON COLUMN flota_vehiculo.cps_tipo_id IS 'Tipo de CPS del vehÃ­culo (DT9/DT10)';

-- ============================================================================
-- 6. NUEVA TABLA: HORARIOS DE RUTA (ida/vuelta)
-- ============================================================================
CREATE TABLE public.horario_ruta (
    id                  BIGSERIAL       PRIMARY KEY,
    permiso_id          BIGINT          NOT NULL REFERENCES public.gestion_permiso(id) ON DELETE CASCADE,
    sentido             VARCHAR(10)     NOT NULL CHECK (sentido IN ('IDA','VUELTA')),
    hora_inicio         TIME            NOT NULL,
    hora_fin            TIME            NOT NULL,
    frecuencia_minutos  SMALLINT        NOT NULL
);

COMMENT ON TABLE horario_ruta IS 'Horarios de ida y vuelta asociados a un permiso de operaciÃ³n (orgâ€‘ruta)';

-- ============================================================================
-- 7. INSERTAR DATOS INICIALES EN CATÃLOGOS NUEVOS
-- ============================================================================
-- Poblar tipo_cps
INSERT INTO public.tipo_cps (codigo, descripcion) VALUES
('DT9',  'Para unidades de 5 a 32 puestos'),
('DT10', 'Para unidades de 32 o mÃ¡s puestos')
ON CONFLICT (codigo) DO NOTHING;

-- ============================================================================
-- 8. ACTUALIZAR PERMISOS Y ROLES (si es necesario agregar el mÃ³dulo de gremios)
-- ============================================================================
-- Agregar permisos del mÃ³dulo "Gremios" para el rol SUPERADMIN (id=1)
-- y otros roles segÃºn polÃ­tica
INSERT INTO public.rol_permiso (modulo, accion, permitido, rol_id) VALUES
('Gremios', 'Leer',      TRUE, 1),
('Gremios', 'Crear',     TRUE, 1),
('Gremios', 'Actualizar',TRUE, 1),
('Gremios', 'Eliminar',  TRUE, 1)
ON CONFLICT (rol_id, modulo, accion) DO NOTHING;
-- Ejemplo para CONSULTOR (id=4): solo lectura
INSERT INTO public.rol_permiso (modulo, accion, permitido, rol_id) VALUES
('Gremios', 'Leer',      TRUE, 4),
('Gremios', 'Crear',     FALSE,4),
('Gremios', 'Actualizar',FALSE,4),
('Gremios', 'Eliminar',  FALSE,4)
ON CONFLICT (rol_id, modulo, accion) DO NOTHING;
