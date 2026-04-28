import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Vehicles from '../pages/Vehicles';
import RouteMap from '../pages/RouteMap';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/login" element={<Login />} />
      
      {/* Rutas con Dashboard Layout */}
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vehiculos" element={<Vehicles />} />
        <Route path="/rutas" element={<RouteMap />} />
        <Route path="/mapa-rutas" element={<RouteMap />} />
        
        {/* Mantengo Home por compatibilidad si se desea usar la anterior */}
        <Route path="/old-home" element={<Home />} />
      </Route>

      {/* Ruta 404 Not Found */}
      <Route path="*" element={<div className="p-10 text-center text-2xl font-bold font-public-sans">404 - Página No Encontrada</div>} />
    </Routes>
  );
};

export default AppRoutes;
