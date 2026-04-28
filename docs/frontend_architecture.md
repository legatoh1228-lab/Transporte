# Documentación de la Arquitectura del Frontend - Sistema de Transporte

Esta documentación describe la estructura, tecnologías y patrones de diseño utilizados en el frontend del Sistema de Transporte.

## 🛠 Tecnologías Principales

- **Framework:** [React](https://reactjs.org/) (v18+)
- **Herramienta de Construcción:** [Vite](https://vitejs.dev/)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **Enrutamiento:** [React Router Dom](https://reactrouter.com/) (v6+)
- **Cliente HTTP:** [Axios](https://axios-http.com/)

---

## 📂 Estructura de Carpetas (`src/`)

El proyecto sigue una estructura modular y escalable para facilitar el mantenimiento y el crecimiento del sistema.

### 1. `assets/`
Contiene recursos estáticos que se procesarán en la compilación.
- `images/`: Logotipos, ilustraciones y fotografías.

### 2. `components/`
Componentes de interfaz de usuario reutilizables.
- `common/`: Componentes básicos o "átomos" como botones, inputs, modales, etc.
- `layout/`: Componentes que definen la estructura de la página, como el Navbar, Sidebar y Footer. Utilizan `<Outlet />` de React Router.

### 3. `pages/`
Componentes que representan una "vista" o "pantalla" completa del sistema. Suelen estar compuestos por varios componentes de la carpeta `components/`.

### 4. `services/`
Centraliza la lógica de comunicación con APIs externas.
- `api.js`: Configura la instancia global de Axios con la URL base de Django y los interceptores de seguridad para tokens.

### 5. `hooks/`
Contiene "Custom Hooks" de React para encapsular lógica de estado reutilizable (ej. manejo de formularios, peticiones de datos específicas).

### 6. `context/`
Implementación de la Context API de React para el manejo del estado global, como la autenticación del usuario o configuraciones de tema.

### 7. `routes/`
Centraliza la definición de las rutas de la aplicación.
- `AppRoutes.jsx`: Define la jerarquía de rutas, asociaciones de Layouts y rutas protegidas.

### 8. `utils/`
Funciones utilitarias, constantes globales y helpers (ej. formateadores de fecha, validadores).

---

## ⚙️ Configuración del Backend

La comunicación con el backend de Django se gestiona a través de `src/services/api.js`.
- **URL Base:** `http://localhost:8000/api` (Asegúrate de que el servidor Django esté corriendo).
- **Autenticación:** El interceptor de Axios busca automáticamente un `access_token` en el `localStorage` para añadirlo al header `Authorization`.

---

## 🚀 Cómo ejecutar el proyecto

1. Navegar a la carpeta frontend:
   ```bash
   cd frontend
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Ejecutar en modo desarrollo:
   ```bash
   npm run dev
   ```

---

## 📋 Convenciones de Código

- **Componentes:** Usar nombres en PascalCase (ej. `BotonEnviar.jsx`).
- **Funciones/Variables:** Usar camelCase.
- **Estilos:** Priorizar el uso de clases de Tailwind CSS en lugar de archivos CSS locales.
