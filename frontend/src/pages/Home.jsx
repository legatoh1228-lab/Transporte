const Home = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Bienvenido al Panel de Control</h2>
      <p className="text-gray-600 mb-6">
        Desde aquí podrás gestionar todos los aspectos del Sistema de Transporte.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div className="bg-blue-500 text-white p-3 rounded-full mb-4">
             {/* Icon placeholder */}
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          </div>
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Vehículos</h3>
          <p className="text-blue-700 text-sm">Gestiona la flota y mantenimiento</p>
        </div>
        
        <div className="bg-green-50 p-6 rounded-xl border border-green-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div className="bg-green-500 text-white p-3 rounded-full mb-4">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
          </div>
          <h3 className="text-lg font-semibold text-green-900 mb-2">Rutas</h3>
          <p className="text-green-700 text-sm">Asignación y seguimiento de rutas</p>
        </div>

        <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div className="bg-purple-500 text-white p-3 rounded-full mb-4">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          </div>
          <h3 className="text-lg font-semibold text-purple-900 mb-2">Conductores</h3>
          <p className="text-purple-700 text-sm">Personal e incidencias</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
