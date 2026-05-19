-- ============================================================================
-- DATOS DE PRUEBA – SISTEMA DE TRANSPORTE ARAGUA
-- Incluye: Gremios, Organizaciones, CPS, Vehículos, Operadores y Vinculaciones
-- ============================================================================

-- ============================================================================
-- 1. GREMIOS
-- ============================================================================
INSERT INTO public.gremio (rif, razon_social, direccion, anio_creacion, telefono, correo) VALUES
  ('J-30001001-0', 'Federación Aragüeña de Transporte Colectivo', 'Av. Bolívar Norte, Torre Financiera, Piso 3, Maracay', 1988, '+58-243-2310500', 'fedtransporte@aragua.gob.ve'),
  ('J-30001002-0', 'Gremio de Transportistas del Norte de Aragua',   'Calle Páez, Edif. Transporte, La Victoria, Aragua',   1995, '+58-244-3210001', 'gremnorte@transaragua.ve'),
  ('J-30001003-0', 'Asociación de Minibuses y Colectivos Aragua',    'Av. Las Delicias, C.C. Las Américas, Local 12, Maracay', 2003, '+58-243-5551234', 'asominicol@gmail.com'),
  ('J-30001004-0', 'Sindicato Regional de Conductores Aragua',       'Calle Girardot, Urb. Los Chaguaramos, Maracay',      2008, '+58-243-8882222', 'sindconductores.aragua@ve'),
  ('J-30001005-0', 'Federación de Cooperativas de Transporte Aragua','Av. Principal de La Morita, Cagua, Aragua',          2012, '+58-244-6667777', 'fedcooptransporte@cagua.ve')
ON CONFLICT (rif) DO NOTHING;

-- ============================================================================
-- 2. ORGANIZACIONES (empresa_organizacion)
--    tipo_id: 1=PÚBLICA, 2=PRIVADA/LÍNEA, 3=COOPERATIVA, 4=SINDICATO
--    municipio_id: 1=GIRARDOT, 2=MARIO BRICEÑO IRAGORRY, 3=SANTIAGO MARIÑO, etc.
--    gremio_id referencia la tabla gremio
-- ============================================================================
INSERT INTO public.empresa_organizacion
  (rif, razon_social, rep_legal_ci, rep_legal_nom, telefono, correo, direccion_fiscal,
   fecha_constitucion_mercantil, esta_activa, tipo_id, gremio_id, cupo_maximo_unidades)
VALUES
  ('J-10000101-0', 'Línea Maracay Express C.A.',       'V-12345678', 'Juan Carlos Pérez Rodríguez',  '+58-243-2221100', 'maracayexpress@gmail.com',       'Av. Bolívar, Edif. Central, Maracay',           '2001-03-15', TRUE, 2, 1, 25),
  ('J-10000102-0', 'Cooperativa Aragua Norte 2300 R.L.','V-11223344', 'María Elena Soto Blanco',      '+58-244-3330011', 'coopnorte2300@ve',                'Urb. Los Pinos, Calle 4, La Victoria',          '2005-07-20', TRUE, 3, 2, 30),
  ('J-10000103-0', 'Línea El Limón – Maracay C.A.',    'V-13456789', 'Pedro Antonio Gómez Lunar',    '+58-243-4442200', 'linea.elimon@hotmail.com',        'Av. Las Delicias, local 5, Maracay',            '1998-11-10', TRUE, 2, 1, 20),
  ('J-10000104-0', 'Sindicato Unión Vial Aragua',      'V-14567890', 'Luisa Margarita Tovar Ruiz',   '+58-243-6660330', 'unionvial.aragua@gmail.com',      'Calle El Comercio, Urb. Industrial, Maracay',   '2010-02-28', TRUE, 4, 4, 40),
  ('J-10000105-0', 'Cooperativa Cagua Transporte 780 R.L.','V-15678901','Carlos Andrés Leal Mora',   '+58-244-7770440', 'cooptrans780@cagua.ve',           'Av. Principal Los Mangos, Cagua',               '2008-06-05', TRUE, 3, 5, 22),
  ('J-10000106-0', 'Línea San Mateo – Central C.A.',   'V-16789012', 'Ana Beatriz Villalobos Castro', '+58-244-8880550', 'lsanmateo.central@gmail.com',    'Calle Real de Cagua, Edif. La Central',         '2003-09-18', TRUE, 2, 2, 18),
  ('J-10000107-0', 'Línea Palo Negro Urbana C.A.',     'V-17890123', 'Roberto Jesús Figueroa Torres','+58-243-9990660', 'palonegrourbana@transaragua.ve',  'Av. Libertador, Palo Negro, Aragua',            '2000-01-22', TRUE, 2, 1, 28),
  ('J-10000108-0', 'Cooperativa Valle de Aragua 850 R.L.','V-18901234','Sofía Isabel Díaz Martínez', '+58-243-1230770', 'vallearagua850@gmail.com',        'Urb. El Bosque, Maracay',                       '2015-04-12', TRUE, 3, 3, 15),
  ('J-10000109-0', 'Línea Villa de Cura C.A.',         'V-19012345', 'Miguel Ángel Colmenares Vega', '+58-244-2340880', 'lineavillacura@hotmail.com',      'Calle Comercio, Villa de Cura, Aragua',         '1997-12-03', TRUE, 2, 4, 35),
  ('J-10000110-0', 'Sindicato Transporte Público Aragua','V-20123456','Carla Valentina Herrera Paz', '+58-243-3450990', 'sintranspub.aragua@ve',           'Av. 19 de Abril, Centro, Maracay',              '2018-08-30', TRUE, 4, 4, 50)
ON CONFLICT (rif) DO NOTHING;

-- ============================================================================
-- 3. CPS DE ORGANIZACIONES
-- ============================================================================
INSERT INTO public.organizacion_cps
  (organizacion_id, codigo, fecha_expedicion, fecha_vencimiento, modalidad, tipo_cps_id, cupo_maximo_unidades, activa)
VALUES
  ('J-10000101-0', 'CPS-2023-0101', '2023-01-10', '2026-01-10', 'Colectivo Urbano',    1, 25, TRUE),
  ('J-10000102-0', 'CPS-2023-0102', '2023-02-15', '2026-02-15', 'Colectivo Suburbano', 1, 30, TRUE),
  ('J-10000103-0', 'CPS-2022-0103', '2022-11-05', '2025-11-05', 'Colectivo Urbano',    1, 20, TRUE),
  ('J-10000104-0', 'CPS-2024-0104', '2024-03-20', '2027-03-20', 'Bus Interurbano',     2, 40, TRUE),
  ('J-10000105-0', 'CPS-2023-0105', '2023-06-01', '2026-06-01', 'Colectivo Urbano',    1, 22, TRUE),
  ('J-10000106-0', 'CPS-2021-0106', '2021-09-10', '2024-09-10', 'Colectivo Suburbano', 1, 18, FALSE),
  ('J-10000107-0', 'CPS-2024-0107', '2024-01-15', '2027-01-15', 'Colectivo Urbano',    1, 28, TRUE),
  ('J-10000108-0', 'CPS-2024-0108', '2024-04-22', '2027-04-22', 'Colectivo Urbano',    1, 15, TRUE),
  ('J-10000109-0', 'CPS-2022-0109', '2022-12-01', '2025-12-01', 'Bus Interurbano',     2, 35, TRUE),
  ('J-10000110-0', 'CPS-2025-0110', '2025-01-08', '2028-01-08', 'Bus Interurbano',     2, 50, TRUE)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. VEHÍCULOS (flota_vehiculo)
--    combustible_id: 1=GASOLINA, 2=GASOIL, 3=GAS, 4=MIXTO
--    modalidad_id: 1=COLECTIVO, 2=CARRITOS/TAXI, 3=MOTO, 4=CARGA, 5=ESPECIAL
--    submodalidad_id: 1=ENCAVA, 2=CAMIONETICA(Minibús), 3=BUSETA, 4=AUTOBÚS, 10=RÚSTICO
--    transmision_id: 1=AUTOMÁTICA, 2=SINCRÓNICA(Manual)
--    cps_tipo_id: 1=DT9, 2=DT10
-- ============================================================================
INSERT INTO public.flota_vehiculo
  (placa, marca, modelo, anio, color, capacidad, aire_acondicionado, accesibilidad,
   seguro_vence, revision_tecnica_vence, combustible_id, modalidad_id, submodalidad_id,
   transmision_id, propietario_cedula, propietario_rif, propietario_nombre,
   serial_carroceria, cps_tipo_id)
VALUES
  ('AB123CD', 'Encava',    '610',         2015, 'AMARILLO',  24, FALSE, FALSE, '2026-06-30', '2026-06-30', 2, 1, 1, 2, 'V-12345678', NULL, 'Juan Carlos Pérez Rodríguez', 'SB001234567890', 1),
  ('AB124CD', 'Chevrolet', 'Express',     2018, 'BLANCO',    15, FALSE, FALSE, '2026-09-15', '2026-09-15', 1, 1, 2, 2, 'V-13456789', NULL, 'Pedro Antonio Gómez Lunar',  'SB001234567891', 1),
  ('AB125CD', 'Encava',    '900',         2019, 'AMARILLO',  30, FALSE, FALSE, '2026-12-01', '2026-12-01', 2, 1, 1, 2, 'V-14567890', NULL, 'Luisa Margarita Tovar Ruiz', 'SB001234567892', 2),
  ('AB126CD', 'Yutong',    'ZK6107',      2020, 'BLANCO',    45, TRUE,  TRUE,  '2027-01-15', '2027-01-15', 2, 1, 4, 1, 'V-15678901', NULL, 'Carlos Andrés Leal Mora',    'SB001234567893', 2),
  ('AB127CD', 'Mitsubishi','L300',        2016, 'BEIGE',     12, FALSE, FALSE, '2026-04-20', '2026-04-20', 1, 1, 2, 2, 'V-16789012', NULL, 'Ana Beatriz Villalobos Castro','SB001234567894',1),
  ('AB128CD', 'Encava',    '610',         2014, 'AMARILLO',  24, FALSE, FALSE, '2025-11-30', '2025-11-30', 2, 1, 1, 2, 'V-17890123', NULL, 'Roberto Jesús Figueroa Torres','SB001234567895',1),
  ('AB129CD', 'Toyota',    'Coaster',     2021, 'BLANCO',    20, TRUE,  FALSE, '2027-03-10', '2027-03-10', 1, 1, 2, 2, 'V-18901234', NULL, 'Sofía Isabel Díaz Martínez', 'SB001234567896', 1),
  ('AB130CD', 'Yutong',    'ZK6729D',     2022, 'BLANCO',    29, TRUE,  FALSE, '2027-06-20', '2027-06-20', 2, 1, 3, 2, 'V-19012345', NULL, 'Miguel Ángel Colmenares Vega','SB001234567897', 1),
  ('AB131CD', 'Encava',    '900',         2017, 'AMARILLO',  32, FALSE, FALSE, '2026-08-05', '2026-08-05', 2, 1, 1, 2, 'V-20123456', NULL, 'Carla Valentina Herrera Paz', 'SB001234567898', 2),
  ('AB132CD', 'Mercedes',  'Sprinter',    2023, 'BLANCO',    18, TRUE,  FALSE, '2027-12-31', '2027-12-31', 1, 1, 2, 1, 'V-12345678', NULL, 'Juan Carlos Pérez Rodríguez', 'SB001234567899', 1),
  ('AB133CD', 'Chevrolet', 'Express',     2019, 'GRIS',      15, FALSE, FALSE, '2026-07-14', '2026-07-14', 1, 1, 2, 2, 'V-11223344', NULL, 'María Elena Soto Blanco',    'SB001234567900', 1),
  ('AB134CD', 'Encava',    '610',         2016, 'AMARILLO',  24, FALSE, FALSE, '2026-05-18', '2026-05-18', 2, 1, 1, 2, 'V-13456789', NULL, 'Pedro Antonio Gómez Lunar',  'SB001234567901', 1),
  ('AB135CD', 'Yutong',    'ZK6107',      2021, 'BLANCO',    45, TRUE,  TRUE,  '2027-09-25', '2027-09-25', 2, 1, 4, 1, 'V-15678901', NULL, 'Carlos Andrés Leal Mora',    'SB001234567902', 2),
  ('AB136CD', 'Toyota',    'Coaster',     2020, 'BLANCO',    20, TRUE,  FALSE, '2026-10-30', '2026-10-30', 1, 1, 2, 2, 'V-14567890', NULL, 'Luisa Margarita Tovar Ruiz', 'SB001234567903', 1),
  ('AB137CD', 'Encava',    '900',         2018, 'AMARILLO',  30, FALSE, FALSE, '2026-11-22', '2026-11-22', 2, 1, 1, 2, 'V-16789012', NULL, 'Ana Beatriz Villalobos Castro','SB001234567904',2)
ON CONFLICT (placa) DO NOTHING;

-- ============================================================================
-- 5. OPERADORES (personal_operador)
-- ============================================================================
INSERT INTO public.personal_operador
  (cedula, codigo_op, nombres, apellidos, telefono, direccion, fecha_nacimiento,
   licencia_grado, vence_lic, certificado_medico_vence, tipo_sangre)
VALUES
  ('V-12300001', 'OP-001', 'Luis Alberto',   'Ramírez Mora',       '+58-424-2310001', 'Urb. El Limón, Calle 5, Maracay',            '1985-04-12', 3, '2026-08-01', '2026-02-01', 'O+'),
  ('V-12300002', 'OP-002', 'Ana Carolina',   'Blanco Hernández',   '+58-414-3320002', 'Urb. Base Aragua, Maracay',                  '1990-07-23', 2, '2025-11-15', '2025-11-15', 'A+'),
  ('V-12300003', 'OP-003', 'José Miguel',    'Torres Álvarez',     '+58-416-4330003', 'Av. Casanova Godoy, Turmero',                '1978-01-30', 3, '2027-03-20', '2026-03-20', 'B+'),
  ('V-12300004', 'OP-004', 'Carmen Rosa',    'Mendoza Fernández',  '+58-426-5340004', 'Calle Miranda, La Victoria',                 '1983-11-05', 2, '2026-06-10', '2026-06-10', 'AB+'),
  ('V-12300005', 'OP-005', 'Ramón Ernesto',  'Castellano Vega',    '+58-424-6350005', 'Sector La Soledad, Maracay',                 '1975-09-18', 3, '2025-09-30', '2025-09-30', 'O-'),
  ('V-12300006', 'OP-006', 'Yolanda Teresa', 'Fuentes Medina',     '+58-414-7360006', 'Urb. Los Mangos, Cagua',                     '1992-03-07', 2, '2027-01-25', '2026-01-25', 'A-'),
  ('V-12300007', 'OP-007', 'Eduardo José',   'Sánchez Rivas',      '+58-416-8370007', 'Calle Real de Cagua, Aragua',                '1980-06-14', 3, '2026-04-15', '2026-04-15', 'B-'),
  ('V-12300008', 'OP-008', 'Patricia Elena', 'Gutiérrez López',    '+58-426-9380008', 'Urb. El Bosque, Maracay',                    '1988-12-22', 2, '2026-12-20', '2026-12-20', 'O+'),
  ('V-12300009', 'OP-009', 'Héctor Manuel',  'Rojas Contreras',    '+58-424-1390009', 'Sector Brisas de Turmero, Aragua',           '1973-08-09', 3, '2025-07-05', '2025-07-05', 'A+'),
  ('V-12300010', 'OP-010', 'Mariela Coromoto','Ávila Pérez',       '+58-414-2400010', 'Av. Las Delicias, Maracay',                  '1995-02-28', 2, '2027-05-30', '2026-05-30', 'AB-'),
  ('V-12300011', 'OP-011', 'Freddy Alejandro','Ruiz Díaz',         '+58-416-3410011', 'Calle El Parque, Palo Negro',                '1982-10-17', 3, '2026-09-10', '2026-09-10', 'O+'),
  ('V-12300012', 'OP-012', 'Gloria Marina',  'Pineda Suárez',      '+58-426-4420012', 'Urb. Las Acacias, Maracay',                  '1987-05-03', 2, '2026-03-14', '2026-03-14', 'B+')
ON CONFLICT (cedula) DO NOTHING;

-- ============================================================================
-- 6. VINCULAR VEHÍCULOS A ORGANIZACIONES (vehiculo_organizacion)
-- ============================================================================
INSERT INTO public.vehiculo_organizacion (fecha_inicio, fecha_fin, organizacion_id, vehiculo_id) VALUES
  ('2023-01-10', NULL, 'J-10000101-0', 'AB123CD'),
  ('2023-01-10', NULL, 'J-10000101-0', 'AB124CD'),
  ('2023-01-10', NULL, 'J-10000101-0', 'AB132CD'),
  ('2023-02-15', NULL, 'J-10000102-0', 'AB125CD'),
  ('2023-02-15', NULL, 'J-10000102-0', 'AB133CD'),
  ('2022-11-05', NULL, 'J-10000103-0', 'AB126CD'),
  ('2022-11-05', NULL, 'J-10000103-0', 'AB134CD'),
  ('2024-03-20', NULL, 'J-10000104-0', 'AB127CD'),
  ('2024-03-20', NULL, 'J-10000104-0', 'AB135CD'),
  ('2023-06-01', NULL, 'J-10000105-0', 'AB128CD'),
  ('2023-06-01', NULL, 'J-10000105-0', 'AB136CD'),
  ('2024-01-15', NULL, 'J-10000107-0', 'AB129CD'),
  ('2024-04-22', NULL, 'J-10000108-0', 'AB130CD'),
  ('2022-12-01', NULL, 'J-10000109-0', 'AB131CD'),
  ('2025-01-08', NULL, 'J-10000110-0', 'AB137CD')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 7. VINCULAR OPERADORES A ORGANIZACIONES (operador_organizacion)
-- ============================================================================
INSERT INTO public.operador_organizacion (fecha_inicio, fecha_fin, operador_id, organizacion_id) VALUES
  ('2023-01-10', NULL, 'V-12300001', 'J-10000101-0'),
  ('2023-01-10', NULL, 'V-12300002', 'J-10000101-0'),
  ('2023-02-15', NULL, 'V-12300003', 'J-10000102-0'),
  ('2023-02-15', NULL, 'V-12300004', 'J-10000102-0'),
  ('2022-11-05', NULL, 'V-12300005', 'J-10000103-0'),
  ('2024-03-20', NULL, 'V-12300006', 'J-10000104-0'),
  ('2023-06-01', NULL, 'V-12300007', 'J-10000105-0'),
  ('2021-09-10', NULL, 'V-12300008', 'J-10000106-0'),
  ('2024-01-15', NULL, 'V-12300009', 'J-10000107-0'),
  ('2024-04-22', NULL, 'V-12300010', 'J-10000108-0'),
  ('2022-12-01', NULL, 'V-12300011', 'J-10000109-0'),
  ('2025-01-08', NULL, 'V-12300012', 'J-10000110-0')
ON CONFLICT DO NOTHING;
