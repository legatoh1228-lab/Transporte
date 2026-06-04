# Alcance y Limitaciones: Plataforma de Gestión de Transporte – Estado Aragua

Este documento define las fronteras funcionales, operativas y técnicas del sistema web centralizado de catastro y registro de la oferta de transporte público terrestre en el estado Aragua, Venezuela.

---

## 1. Objetivo General de la Plataforma
El objetivo principal del sistema es establecer una herramienta web única y centralizada para el catastro, registro y gestión de la oferta de transporte público terrestre (colectivos, taxis y mototaxis). Esto le permite a la Secretaría de Transporte y otros organismos del estado Aragua digitalizar y georreferenciar la información de las organizaciones, vehículos, choferes y rutas para optimizar la planificación y la fiscalización.

---

## 2. Alcance del Proyecto (Fase 1 - MVP)
El alcance de la primera versión o Producto Mínimo Viable (MVP) está compuesto por los siguientes módulos y capacidades:

### A. Módulo de Registro y Catastro (Actores de la Oferta)
* **Organizaciones / Operadoras (Líneas)**: Registro detallado de empresas públicas y privadas. Cada una se identifica unívocamente por su RIF para evitar duplicidad de información, y contiene el RIF, Razón Social, tipo de empresa, datos del representante legal (cédula, nombres, teléfono) e información de contacto.
* **Flota Vehicular (Vehículos)**: Registro de las unidades vehiculares vinculadas a las organizaciones, identificadas unívocamente por su placa. Contempla la modalidad (colectivo, taxi o mototaxi), marca, modelo, año, color, transmisión, capacidad de pasajeros (sentados y de pie), tipo de combustible (gasolina, gasoil, gas o mixto), aire acondicionado, accesibilidad, y control de fechas de vencimiento de seguros y revisión técnica.
* **Talento Humano (Choferes / Operadores)**: Registro de choferes adscritos a las organizaciones. Permite capturar la cédula de identidad, código único de operador, nombres, apellidos, teléfono, dirección, tipo de sangre y el grado y vencimiento de la licencia de conducir y certificado médico.

### B. Módulo Geoespacial y de Gestión de Rutas
* **Trazado sobre el Mapa**: Creación y edición interactiva de rutas directamente en el mapa (utilizando React + Leaflet). El usuario marca puntos del recorrido y el sistema almacena su geometría espacial (`LineString` compatible con PostGIS).
* **Cálculo Automático**: Determinación automática de la longitud en kilómetros de la ruta a partir de su trazo geográfico.
* **Tipología**: Clasificación de recorridos en rutas **Urbanas** (dentro del mismo municipio) y **Sub-urbanas** (intermunicipales), indicando su morfología (lineal o anillada).
* **Permisología**: Gestión de permisos de operación para vincular formalmente organizaciones con las rutas que tienen autorización de explotar, con registro de número de resolución, fechas de validez y estatus.

### C. Módulo de Configuración y Catálogos Maestros
* **Ejes Territoriales y Municipios**: Categorización territorial del estado Aragua en sus 4 ejes de planificación (Central, Este, Sur, Norte-Costero) y sus 18 municipios (Girardot, Santiago Mariño, José Félix Ribas, Zamora, Ocumare de la Costa, etc.).
* **Tablas de Referencia**: Gestión centralizada de catálogos predeterminados (Modalidades, Tipos de Combustible, Tipo de Vía, Grados de Licencia, etc.) para mantener la coherencia de datos.

### D. Módulo de Seguridad, Roles y Auditoría (RBAC)
* **Administrador Operativo (Secretaría de Transporte / Movilidad)**: Permisos CRUD completos. Registra organizaciones, vehículos, operadores, dibuja las rutas y asocia los permisos de explotación de rutas.
* **Consultor Ejecutivo (Despacho de Gobierno / Directivos)**: Acceso de solo lectura para la supervisión analítica. Permite interactuar con el mapa interactivo, filtrar información por ejes o municipios, y exportar reportes estadísticos.
* **Operador (Líneas / Organizaciones)**: Acceso restringido para registrar y autogestionar exclusivamente los choferes y vehículos de su propia línea de transporte.
* **Log de Auditoría (Audit Log)**: Registro histórico secuencial de las operaciones de creación, modificación o desactivación realizadas por los usuarios en el sistema, asegurando la trazabilidad de los cambios.

### E. Entregables Técnicos
* **Backend (API REST)**: Desarrollado en Python / Django y Django REST Framework.
* **Base de Datos Espacial**: Implementada en PostgreSQL (versión 14+) con la extensión geográfica PostGIS.
* **Frontend (Web App)**: Desarrollado en React.js, integrado con Leaflet para la cartografía y GIS.
* **Despliegue de Entorno**: Contenedores e infraestructura orquestada con Docker y Docker Compose (Frontend, Backend, Base de Datos y Servidor Nginx).

---

## 3. Limitaciones y Elementos Fuera de Alcance
Para enfocar los esfuerzos en la calidad del MVP inicial, se establecen las siguientes limitaciones y exclusiones:

* **Sin Telemetría ni Rastreo en Tiempo Real (GPS)**: El sistema actual funciona como un catastro institucional estático y de planificación. No realiza seguimiento en vivo ni localización geográfica en tiempo real de los vehículos mediante GPS, dispositivos AVL o telefónicamente.
* **Restricción de Modalidades a Terrestre**: Aunque la base de datos y la arquitectura están preparadas conceptualmente para escalar a transporte Aéreo y Acuático (para evitar reestructurar el software en el futuro), las vistas, flujos de negocio e interfaces de usuario están dedicadas exclusivamente al transporte **Terrestre** (colectivo, taxi y mototaxi).
* **Sin Aplicaciones Móviles Nativas**: No se contempla el desarrollo de aplicaciones para Android o iOS para uso de los choferes o de los ciudadanos (pasajeros). El acceso se efectúa en su totalidad a través de navegadores web en un diseño responsivo.
* **Sin Gestión de Cobros, Pasajes ni Tarifas**: La plataforma no maneja transacciones monetarias, pasarelas de pago, compra de boletos, recaudación de pasaje digital ni control operativo directo de subsidios de combustible.
* **Resolución de Filtros a Nivel Municipal**: Las consultas espaciales y estadísticas se organizan por Ejes y Municipios. Aunque las parroquias están pre-cargadas para la consistencia de direcciones o de delimitación secundaria, no se habilitarán en esta primera fase como un filtro cartográfico de primer nivel en el dashboard principal.
* **Propietarios e Historial Operativo**: Cada vehículo y operador se vincula a una única organización activa a la vez. Cuando ocurre un traspaso o cambio de línea, se genera un registro histórico, pero la gestión y resolución de disputas de propiedad del vehículo o chofer se manejan por canales administrativos externos fuera de la aplicación.
