# PRD: Plataforma de Gestión de Transporte – Estado Aragua (Fase 1)

## 1. Visión general
Sistema web centralizado de catastro y registro de la oferta de transporte público terrestre en el estado Aragua, Venezuela. Permite a la Secretaría de Transporte y otros organismos gubernamentales gestionar organizaciones, vehículos, operadores y rutas, visualizándolos en un mapa interactivo.

## 2. Objetivos de alto nivel
- **Catastro único**: Registrar todas las líneas/empresas, sus flotas y conductores en una base de datos oficial.
- **Gestión territorial**: Organizar la información por ejes y municipios para análisis geográfico.
- **Visualización geoespacial**: Mostrar rutas en un mapa con filtros y datos asociados.
- **Control de permisos**: Administrar qué organizaciones pueden operar cada ruta.
- **Auditoría y seguridad**: Control de acceso basado en roles (Admin, Consultor) y trazabilidad de cambios.

## 3. Usuarios y roles
| Rol          | Acceso                                                                 |
|--------------|------------------------------------------------------------------------|
| Admin        | CRUD total sobre todas las entidades, configuración de catálogos, usuarios. |
| Consultor    | Lectura de todo el sistema (sin edición). Acceso a mapa y reportes.    |

## 4. Requisitos funcionales (Fase 1)
### Módulo de Catálogos (Admin)
- CRUD de: Modalidad, Tipo Combustible, Tipo Ruta, Tipo Organización, Tipo Transmisión, Submodalidad, Tipo Vía.
- Baja lógica (campo `activo` en lugar de eliminación).

### Módulo de Organizaciones (Admin/Operador)
- Admin: listado, creación, edición, desactivación de todas las empresas.
- Operador: edición de su propia empresa.
- Campos: RIF, razón social, tipo, representante legal (CI, nombres), teléfono, correo, dirección fiscal, fecha constitución, estado activo.

### Módulo de Vehículos (Admin/Operador)
- Listado con filtros (placa, modalidad, organización, combustible, etc.).
- Alta/edición con campos: placa, modalidad, submodalidad (opcional), marca, modelo, año, color, transmisión, capacidad (sentados/pie), combustible, aire acondicionado, accesibilidad, seguro vence, revisión técnica vence.
- Asignación automática a organización actual (Operador) o selección manual (Admin). Cada cambio de propietario genera un nuevo registro histórico.

### Módulo de Operadores/Choferes (Admin/Operador)
- Listado y formulario con: cédula, código operador, nombres, apellidos, teléfono, dirección, fecha nacimiento, licencia grado (2-5), vence licencia, certificado médico vence, tipo sangre.
- Historial de empleo igual que vehículos.

### Módulo Geoespacial de Rutas (solo Admin)
- Listado con filtros por tipo, municipio origen/destino.
- Formulario de ruta: nombre, tipo (URBANA/SUBURBANA), municipio origen y destino, es anillado, tiempo estimado, número de paradas, tipo de vía, observaciones.
- Dibujo de la geometría: sobre mapa interactivo, el usuario marca puntos y se genera un LINESTRING. Cálculo automático de distancia (km) en base a la geometría.
- Índice GIST en `geom`.

### Módulo de Permisos de Operación
- Admin: asigna una organización a una ruta, con fecha de emisión, número resolución, estatus (ACT/SUSP), observaciones.
- Restricción UNIQUE (org_id, ruta_id).
- Operador: visualiza sus permisos vigentes.

### Módulo de Visualización y Reportes (Admin/Consultor)
- Mapa principal con todas las rutas, coloreadas por tipo o eje.
- Filtros por ejes, municipios, tipo de ruta, modalidad.
- Click en ruta muestra popup con datos y tabla de organizaciones autorizadas (con conteo de vehículos).
- Exportación de reportes (PDF/Excel).

### Seguridad y Auditoría
- Autenticación con usuario/contraseña (hash bcrypt).
- RBAC implementado en backend y reflejado en UI.
- Log de auditoría: quién, cuándo, qué acción sobre qué entidad.

## 5. Requisitos no funcionales
- **Plataforma**: Web responsive (escritorio, tablet, móvil).
- **Backend**: Django (Python) + Django REST Framework.
- **Base de datos**: PostgreSQL 14+ con PostGIS.
- **Frontend**: React.js + Leaflet (mapas).
- **Despliegue**: Docker Compose (contenedores de backend, frontend, nginx, db).
- **Rendimiento**: Paginación (100 registros), carga asíncrona, consultas espaciales optimizadas.
- **Seguridad**: HTTPS, protección CSRF, CORS configurado, variables de entorno.

## 6. Métricas de éxito (Objetivos cuantitativos)
- Registrar el 100% de las líneas de transporte del estado en 3 meses.
- Reducir el tiempo de consulta de información de rutas/organizaciones para fiscalizaciones a menos de 2 minutos.
- Alertar automáticamente sobre vencimientos (licencias, seguros) con 30 días de antelación.
- Cero pérdida de datos históricos gracias a la auditoría.