import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#f8f9f9' }}>
      {/* Sidebar Fijo */}
      <Sidebar />
      
      {/* Contenedor Principal */}
      <div className="flex-1 md:ml-[280px] flex flex-col min-h-screen">
        <TopBar />
        
        {/* Contenido Dinámico */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto" style={{ backgroundColor: '#f8f9f9' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
