Levantamiento de información de la reunion con la Secretaria de Transporte.


Transporte publico: comprendido por otros dos componentes que son Vialidad e Infraestructura de pasajeros.
Se necesita recopilar informacion sobre la Oferta en el estado: informacion de todas las organizaciones.
Las organizaciones tienen 3 modos: colectivo (Buses de variadas dimensiones), taxi y moto taxi.
Estos modos son terrestres.
El sistema debe ser escalable para llevar registro para el transporte publico de pasajeros en el modo aéreo y acuático (son lineas de transporte).
El enfoque principal del sistema es en el modo terrestre en sus tres modalidades.
Para los operadores, las organizaciones se debe recolectar su informacion de infentificacion de empresa, identificacion del rif, representante legal, codigo o id para cada operador. Licencia de conducir e identificacion de cada operador. Todo eso seria un componente de identificacion del operador.

En el estado aragua, trabajan lineas o rutas urbanas y sub urbanas. Se necesita saber la oferta en esos modos y en los municipios, y alcaldia, en las rutas

Rutas. Campo origen, destino, recorrido que puede ser por km, anillado
Recorrido, desglose de la ruta especifica
Grafica del recorrido en el mapa
Mapa. Colores por rutas rutas urbanas y suburbanas, filtros de localizador y rutas. En las graficas y mapas, debe salir una tabla de flota de operadoras.
Carros.(o sea los vehiculos terrestres como colectivos) pueden ser a gasolina, gas, gasoil, y mixto por ejemplo gasolina y gas.

Hay cuatro ejes de transportes, eje nortecostero, central, sur y este.
Es llevar un registro de flotas y operadoras privadas y publicas, metrobus es simplemente un operador mas.
Usuarios principales que usaran el sistema:
Secretaria de transporte, secretaria de gobierno, departamento de movilidad, operadores, y despacho de gobierno.
Por ahora, despacho solo hara consultas en el sistema, y secretaria transporte y departamento de movilidad son los que tengan administracion del sistema

tipo de sistema: web, estara alojado en un servidor o host para la secretaria del transporte. 

Análisis de los requerimientos e información recavada 
Diseño de Dominio (Domain-Driven Design). 
Esta es la fase donde tomamos el mundo real (las calles de Aragua, las líneas de autobuses, los choferes) y lo traducimos a una estructura jerárquica estricta que una base de datos pueda entender.
Para que el sistema sea escalable y soporte consultas complejas (como "¿Cuántos autobuses a gasoil están operando rutas urbanas en el eje central?"), vamos a dividir la información en 5 Dominios Lógicos y luego estableceremos cómo fluyen y se relacionan entre sí.
I. Dominio Geográfico y Territorial
Todo ocurre en un espacio físico. Esta jerarquía es estrictamente de "1 a Muchos" (Un estado tiene muchos ejes, un eje tiene muchos municipios).


1.Estado (Aragua)
Eje Territorial (Norte-Costero, Central, Sur, Este)
Municipio / Alcaldía (Ej. Girardot, Mariño, Costa de Oro...)
Parroquia (Nivel de detalle máximo para precisar zonas específicas).

II. Dominio de Modos de Transporte
Estas son tablas de referencia (Lookup tables) que dictan las reglas de lo que se puede registrar.
Modo de Transporte: Terrestre (y en el futuro: Aéreo, Acuático).
Modalidad Terrestre: Colectivo, Taxi, Moto Taxi.
Tipo de Combustible: Gasolina, Gasoil, Gas, Mixto (Gas/Gasolina).
Tipo de Ruta: Urbana (dentro de un municipio) o Sub-urbana (cruza municipios).
III. Dominio Organizacional
Aquí registramos a las empresas o líneas.
Organización / Operadora (La entidad central del sistema).
Atributos: RIF, Razón Social (Nombre de la Línea), Tipo (Pública/Privada), Dirección Fiscal, Teléfono de Contacto.
Representante Legal: Cédula, Nombre, Teléfono.
IV. Dominio de Recursos
Todo lo que le "pertenece" a una Organización.
1.Talento Humano (Operador / Chofer)
Relación: Pertenecen a 1 Organización (Si cambian de línea, se actualiza su registro).
Atributos: ID de Operador, Cédula, Nombre Completo, Grado de Licencia, Fecha de Vencimiento de Licencia, Certificado Médico.
2.Activos Físicos (Vehículo / Flota)
Relación: Pertenecen a 1 Organización.


Atributos: Placa (Llave Primaria), Modalidad (Colectivo, Taxi o Moto), Marca, Modelo, Año, Capacidad (Número de Puestos), Tipo de Combustible.

V. Dominio Geo-espacial y de Servicio
La ruta es independiente de la organización. Una ruta existe físicamente aunque la línea de autobuses quiebre.
Ruta
Clasificación: Tipo (Urbana/Sub-urbana), Eje Territorial principal.
Topología: Forma del recorrido (Lineal o Anillado).
Geografía: Municipio Origen, Municipio Destino.
Métricas: Distancia total calculada en Kilómetros.
Geometría: El trazado exacto en el mapa (El LineString para PostGIS).

Análisis descriptivo de las entidades principales
1. La Organización (La Línea o Empresa)
Esta es la entidad protagonista desde el punto de vista administrativo. Una Organización es la figura jurídica, comercial o gubernamental que agrupa y administra el servicio. No es un objeto físico, es una entidad de responsabilidad.
Identidad: En el mundo real, la conocemos como "Línea Unión", "Cooperativa de Mototaxis El Centro" o "TransAragua". En el sistema, su identidad absoluta es el RIF, que garantiza que no haya registros duplicados.
Responsabilidad: Toda organización tiene un rostro legal (el Representante Legal con su cédula), que es quien responde ante la Secretaría de Transporte.


Comportamiento en el sistema: La Organización actúa como un "contenedor". Es la dueña de la flota (los vehículos) y la patrona del talento humano (los choferes). Por sí sola no se mueve, pero sin ella, los vehículos y choferes no tienen permiso legal para operar.

2. El Vehículo (La Unidad de Flota)
Es el activo físico que realiza el trabajo en la calle. El sistema debe tratar al vehículo como una máquina auditable y medible.

Naturaleza: Puede tomar tres formas físicas (colectivo, taxi o moto taxi). Esta es su "modalidad".
Identidad: Su huella digital es la Placa. Dos vehículos no pueden tener la misma placa en el estado.
Valor operativo: Lo que más le importa a la Secretaría sobre el vehículo es su Capacidad (cuántas personas mueve) y su Tipo de Combustible (gasolina, gasoil, gas o mixto). Este último dato es vital para el Estado, ya que permite planificar políticas de distribución de combustible para el sector transporte.
Comportamiento en el sistema: El vehículo es una entidad dependiente; siempre debe estar amarrado a una Organización. Si un autobús se vende a otra línea, el sistema debe registrar ese cambio de dueño.

3. El Operador (El Chofer)
Es el talento humano, la persona física detrás del volante. El sistema lo audita por motivos de seguridad y legalidad.
Identidad: Su Cédula de Identidad y su Código Único de Operador.
Capacidad legal: El sistema debe registrar su grado de licencia de conducir y, lo más importante, la fecha de vencimiento de la misma. Un sistema inteligente usará este dato para alertar a la Organización o a la Secretaría si un chofer está manejando con documentos vencidos.
Comportamiento en el sistema: Al igual que el vehículo, el operador pertenece operativamente a una Organización.

4. La Ruta 
A diferencia de las organizaciones y los vehículos, la Ruta es un concepto geográfico y matemático. Una ruta existe en el mapa independientemente de si hay autobuses circulando por ella o no.
Esta definida por un nombre, un campo de origen, de destino, y el recorrido de la misma. Un recorrido especifico y exacto por el nombre y orden de las calles de la ruta a seguir y una medicion en km, anillado,etc

Morfología: Es el camino específico. Puede ser Lineal (sale de un punto A y llega a un punto B lejano, como Maracay - La Victoria) o Anillado (un circuito cerrado que da vueltas pxor una zona específica y vuelve a su origen).
Clasificación: Se divide en Urbana (solo se mueve dentro de la misma alcaldía/municipio) o Sub-urbana (cruza las fronteras de varios municipios).
Métricas: La ruta debe contener su propio kilometraje. El sistema usará la línea dibujada en el mapa para calcular cuántos kilómetros exactos mide ese recorrido.

5. El Territorio (Municipios)
Son las divisiones políticas y geográficas del estado Aragua. Sirven como "gavetas" para organizar la información.
Función: Los municipios (como Girardot, Mariño, etc.) nos permiten saber de dónde sale y a dónde llega una ruta.
Agrupación: Para facilitar la gestión gerencial de la Secretaría, estos municipios se agrupan en cuatro grandes zonas: Norte-Costero, Central, Sur y Este. Esto permitirá sacar reportes rápidos (por ejemplo: "Ver todos los taxis registrados en el Eje Sur").



1. Eje Central (El Eje Metropolitano)
Es la zona con mayor densidad poblacional y, por ende, donde se concentra el mayor volumen de rutas urbanas, sub-urbanas y de tráfico pesado.

Girardot (Capital: Maracay) - Es la capital del estado y el nodo principal de rutas.


Mario Briceño Iragorry (Capital: El Limón)


Santiago Mariño (Capital: Turmero)


Francisco Linares Alcántara (Capital: Santa Rita)


Libertador (Capital: Palo Negro)


Sucre (Capital: Cagua)


José Ángel Lamas (Capital: Santa Cruz de Aragua)

2. Eje Este (Los Valles de Aragua)
Un eje crucial para el transporte sub-urbano y extraurbano, ya que conecta al estado Aragua con el estado Miranda y la capital del país, además de poseer topografía de montaña (Colonia Tovar).

José Félix Ribas (Capital: La Victoria)


Simón Bolívar (Capital: San Mateo)


José Rafael Revenga (Capital: El Consejo)


Santos Michelena (Capital: Las Tejerías)


Tovar (Capital: Colonia Tovar)

3. Eje Sur (Los Llanos Aragüeños)
Geográficamente es la extensión territorial más grande del estado. Las rutas aquí suelen ser más largas (mayor kilometraje), lo que impacta directamente en el cálculo de consumo de combustible y desgaste de la flota.

Ezequiel Zamora (Capital: Villa de Cura)


San Sebastián (Capital: San Sebastián de los Reyes)


San Casimiro (Capital: San Casimiro de Güiripa)


Camatagua (Capital: Camatagua)


Urdaneta (Capital: Barbacoas)

4. Eje Norte-Costero (El Litoral)
Esta zona presenta un reto logístico interesante para el sistema de transporte debido a su geografía montañosa (atravesando el Parque Nacional Henri Pittier) para llegar a la costa.

Ocumare de la Costa de Oro (Capital: Ocumare de la Costa)


Nota Técnica para el Sistema: Aunque políticamente el municipio costero es Ocumare, a nivel de "Rutas", el sistema deberá tener en cuenta que parroquias como Choroní (que pertenece al municipio Girardot) y Chuao (que pertenece al municipio Mariño) también forman parte operativa de la dinámica de transporte hacia la costa.

Esta es la jerarquía territorial exacta que fungirá como la "columna vertebral" geográfica de la base de datos de la Secretaría de Transporte. Al registrar una ruta, el operador simplemente seleccionará de este catálogo estandarizado para definir el "Origen" y el "Destino".



Fase 1: Análisis y Definición del MVP
Alcance Estricto: Definir qué entra y qué no entra en la primera versión (Minimum Viable Product). Por ejemplo: entrarán colectivos, taxis y motos; pero aéreo y acuático quedan documentados solo para el futuro.
Diccionario de Datos: Pulir el documento exacto de qué campos lleva cada tabla (el trabajo que hicimos en los mensajes anteriores).
Roles y Permisos: Dejar por escrito qué puede hacer el Súper Administrador (Secretaría), el Consultor (Despacho) y el Operador (Líneas).

Definición de Alcance: Plataforma de Gestión y Registro de Transporte del Estado Aragua (Fase 1)
1. Objetivo General
Desarrollar e implementar un sistema web centralizado de catastro y registro para centralizar la información de la oferta de transporte público terrestre (organizaciones, flotas, talento humano y rutas) en el estado Aragua, permitiendo su visualización georreferenciada y control estadístico.

2. Alcance Funcional (Lo que SÍ incluye el sistema)
El sistema contempla el desarrollo de los siguientes módulos para la Fase 1:
A. Módulo de Configuración y Catálogos Maestros
Gestión de la estructura territorial: 4 Ejes Territoriales, 18 Municipios (las parroquias quedarán pre-cargadas pero no como filtro principal en esta fase).
Gestión de tipologías: Modos de transporte (Terrestre), Modalidades (Colectivo, Taxi, Moto Taxi), y Tipos de Combustible (Gasolina, Gasoil, Gas, Mixto).

B. Módulo de Registro de Actores (Catastro)
Organizaciones: Registro de líneas/empresas con RIF, representante legal, y tipo (pública/privada).
Talento Humano: Registro de operadores (choferes) vinculados a una organización, incluyendo validación de vigencia de licencia.
Flota Vehicular: Registro de vehículos vinculados a una organización, controlando placa (única), capacidad de pasajeros y tipo de combustible.

C. Módulo Geoespacial y de Rutas

Creación y edición de rutas terrestres en un mapa interactivo (dibujo de líneas punto a punto).
Clasificación de rutas: Urbanas y Sub-urbanas.
Cálculo automático de la distancia (kilometraje) basado en el trazado geográfico.
Asignación de permisos de operación: Vincular qué Organizaciones tienen permiso para operar cuáles Rutas.





D. Módulo de Visualización y Reportes (Dashboard)
Visualizador de mapa interactivo con filtros por: Eje Territorial, Municipio, Tipo de Ruta (Urbana/Sub-urbana).
Despliegue de datos dinámico: Al hacer clic en una ruta del mapa, se mostrará una tabla con las Organizaciones autorizadas y la cantidad de vehículos de su flota.

E. Módulo de Seguridad y Auditoría (RBAC)
Sistema de login seguro.
Tres roles de usuario:
Super Administrador (Secretaría de Transporte): Acceso total de lectura, escritura y configuración.
Consultor (Despacho de Gobierno): Acceso exclusivo de lectura y visualización del mapa/reportes.
Operador (Líneas): Acceso restringido para registrar únicamente su propia flota y choferes.
Registro de auditoría básico (Audit Log) para rastrear quién crea, edita o elimina registros críticos.

3. Entregables Técnicos

Backend (API): Desarrollado en Python/Django, exponiendo servicios RESTful.
Base de Datos Espacial: Implementada en PostgreSQL + PostGIS, con modelo relacional optimizado.
Frontend (Web App): Desarrollado en React.js, integrado con Leaflet para la cartografía.
Panel Administrativo: Django Admin configurado y estilizado para la carga rápida de datos maestros.
Despliegue: Sistema montado en un servidor (host) provisto por la Secretaría, utilizando Docker para garantizar el entorno.



4. Fuera del Alcance (Lo que NO incluye esta fase)
Telemetría y GPS en Tiempo Real: El sistema actual es un catastro estático de la oferta. No se rastreará el movimiento en vivo de los buses mediante dispositivos AVL o celulares en esta fase. (Nota: Esto reemplaza la idea preliminar del Metrobús que discutimos al principio, ajustándose a la reunión real que tuviste).
Expansión Multimodal Inmediata: Los modos Aéreo y Acuático quedarán contemplados en la arquitectura de la base de datos para no tener que reescribirla a futuro, pero las interfaces de usuario para gestionarlos no se desarrollarán en esta iteración.
Aplicaciones Móviles (Apps): No se desarrollarán aplicaciones nativas para Android o iOS para los choferes ni para los usuarios (pasajeros). Todo será vía web responsiva.
Integración con Pasarelas de Pago o Boletería: El sistema no manejará transacciones financieras, cobro de pasajes ni subsidios.

Nueva Matriz de Roles (Uso Exclusivo de Gobierno)
Rol 1: Administrador Operativo (Transcripción y Gestión)

Usuarios: Funcionarios de la Secretaría de Transporte y Departamento de Movilidad.
Perfil Técnico: Son los usuarios de "escritura". Son quienes reciben las carpetas con los documentos físicos de las líneas y los cargan al sistema.
Permisos (CRUD Total):
Registran las Organizaciones (Líneas).
Cargan las flotas y los choferes de cada línea.
Dibujan las rutas en el mapa con PostGIS.
Asignan los permisos (vinculan la Línea con la Ruta).

Rol 2: Consultor Ejecutivo (Supervisión y Análisis)
Usuarios: Despacho de Gobierno y directivos de la Secretaría de Gobierno.
Perfil Técnico: Son usuarios de "lectura analítica". Entran al sistema para obtener respuestas rápidas a problemas del estado (ej. "¿Cuántos autobuses a gasoil tenemos operativos en la zona Sur?").


Permisos (Solo Lectura):
Visualizan el Dashboard y estadísticas.
Interactúan con el mapa georreferenciado (React + Leaflet).
Exportan reportes o listados, pero no pueden crear, editar ni eliminar ningún registro de la base de datos.


