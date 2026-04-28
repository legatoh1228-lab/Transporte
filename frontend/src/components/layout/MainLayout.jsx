import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar Placeholder */}
      <header className="bg-blue-600 text-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Sistema de Transporte</h1>
        <nav>
          <ul className="flex space-x-4">
            <li className="hover:text-blue-200 cursor-pointer transition-colors">Inicio</li>
            <li className="hover:text-blue-200 cursor-pointer transition-colors">Vehículos</li>
            <li className="hover:text-blue-200 cursor-pointer transition-colors">Rutas</li>
          </ul>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-6 container mx-auto">
        <Outlet />
      </main>

      {/* Footer Placeholder */}
      <footer className="bg-white text-center p-4 text-gray-500 border-t">
        &copy; {new Date().getFullYear()} - Secretaría de Transporte
      </footer>
    </div>
  );
};

export default MainLayout;
