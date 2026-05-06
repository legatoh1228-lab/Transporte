import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Vehicles from '../pages/Vehicles';
import RouteMap from '../pages/RouteMap';
import Operadores from '../pages/Operadores';
import Organizaciones from '../pages/Organizaciones';
import Rutas from '../pages/Rutas';
import Auditoria from '../pages/Auditoria';
import Catalogos from '../pages/Catalogos';
import Permisos from '../pages/Permisos';
import Terminales from '../pages/Terminales';
import Usuarios from '../pages/Usuarios';
import Configuracion from '../pages/Configuracion';
import Profile from '../pages/Profile';
import VisualSettings from '../pages/VisualSettings';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Redirección Inicial: Siempre al Login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Rutas Públicas */}
      <Route path="/login" element={<Login />} />
      
      {/* Rutas Protegidas con Dashboard Layout */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vehiculos" element={<Vehicles />} />
        <Route path="/rutas" element={<Rutas />} />
        <Route path="/mapa-rutas" element={<RouteMap />} />
        <Route path="/operadores" element={<Operadores />} />
        <Route path="/organizaciones" element={<Organizaciones />} />
        <Route path="/auditoria" element={<Auditoria />} />
        <Route path="/catalogos" element={<Catalogos />} />
        <Route path="/permisos" element={<Permisos />} />
        <Route path="/terminales" element={<Terminales />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/configuracion" element={<Configuracion />} />
        <Route path="/apariencia" element={<VisualSettings />} />
        <Route path="/perfil" element={<Profile />} />
        
        {/* Mantengo Home por compatibilidad si se desea usar la anterior */}
        <Route path="/old-home" element={<Home />} />
      </Route>

      {/* Ruta 404 Not Found */}
      <Route path="*" element={<div className="p-10 text-center text-2xl font-bold font-public-sans">404 - Página No Encontrada</div>} />
    </Routes>
  );
};

export default AppRoutes;
