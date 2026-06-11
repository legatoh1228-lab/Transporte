import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMediaUrl } from '../../utils/helpers';
import { usePermissions } from '../../hooks/usePermissions';
import api from '../../services/api';

const TopBar = ({ onMenuToggle }) => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [systemName, setSystemName] = useState('Transporte Aragua Digital');
  
  // Global Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState({ orgs: [], gremios: [], vehicles: [], operators: [], routes: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    };
    const fetchSystemName = async () => {
      try {
        const response = await api.get('catalogs/configuracion-visual/');
        if (response.data.nombre_sistema) setSystemName(response.data.nombre_sistema);
      } catch (err) {
        console.error('Error fetching system name:', err);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    fetchSystemName();
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Global Search Logic
  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setResults({ orgs: [], gremios: [], vehicles: [], operators: [], routes: [] });
      setShowResults(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      setShowResults(true);
      
      const searchPromises = [];
      const keys = [];

      if (hasPermission('Organizaciones', 'Leer')) {
        searchPromises.push(api.get(`organizations/organizations/?search=${searchTerm}`));
        keys.push('orgs');
      }
      if (hasPermission('Gremios', 'Leer')) {
        searchPromises.push(api.get(`organizations/gremios/?search=${searchTerm}`));
        keys.push('gremios');
      }
      if (hasPermission('Vehículos', 'Leer')) {
        searchPromises.push(api.get(`fleet/vehicles/?search=${searchTerm}`));
        keys.push('vehicles');
      }
      if (hasPermission('Operadores', 'Leer')) {
        searchPromises.push(api.get(`personnel/operators/?search=${searchTerm}`));
        keys.push('operators');
      }
      if (hasPermission('Rutas', 'Leer')) {
        searchPromises.push(api.get(`routes/rutas/?search=${searchTerm}`));
        keys.push('routes');
      }

      try {
        const responses = await Promise.all(searchPromises);
        const newResults = { orgs: [], gremios: [], vehicles: [], operators: [], routes: [] };
        
        responses.forEach((res, i) => {
          newResults[keys[i]] = (res.data || []).slice(0, 3);
        });

        setResults(newResults);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  const avatarUrl = getMediaUrl(user.avatar) || `https://ui-avatars.com/api/?name=${user.username || 'Admin'}&background=1f3a5f&color=fff`;

  return (
    <header
      className="flex justify-between items-center h-16 px-4 md:px-6 w-full sticky top-0 z-40 font-public-sans transition-colors duration-200"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-outline-variant)',
      }}
    >
      {/* Left: Brand + Hamburger */}
      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-xl hover:bg-surface-container transition-colors" 
          style={{ color: 'var(--color-outline)' }}
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="text-base md:text-lg font-black truncate max-w-[150px] sm:max-w-none" style={{ color: 'var(--color-primary-container)' }}>
          {systemName}
        </div>
      </div>


      <div className="flex-1 max-w-md mx-6 hidden lg:block relative">
        <div className="relative">
          <span
            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px]"
            style={{ color: 'var(--color-outline)' }}
          >
            {isSearching ? 'sync' : 'search'}
          </span>
          <input
            className={`w-full py-2.5 pl-10 pr-4 text-sm rounded-xl transition-all outline-none border ${isSearching ? 'animate-pulse' : ''}`}
            style={{
              backgroundColor: 'var(--color-surface-container-low)',
              borderColor: 'var(--color-outline-variant)',
              color: 'var(--color-on-surface)',
              fontFamily: "'Public Sans', sans-serif",
            }}
            placeholder="Buscar registros, placas u operadores..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
          />
        </div>

        {/* Global Search Results Dropdown */}
        {showResults && (searchTerm.length >= 2) && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowResults(false)}></div>
            <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="max-h-[400px] overflow-y-auto p-2 custom-scrollbar">
                
                {/* Gremios Section */}
                {results.gremios.length > 0 && (
                  <div className="mb-2">
                    <div className="px-3 py-1.5 text-[10px] font-black text-outline uppercase tracking-widest opacity-60">Gremios</div>
                    {results.gremios.map(gr => (
                      <button 
                        key={gr.rif} 
                        className="w-full text-left p-3 rounded-xl hover:bg-surface-container transition-colors flex items-center gap-3 group"
                        onClick={() => { navigate('/gremios'); setShowResults(false); setSearchTerm(''); }}
                      >
                        <span className="material-symbols-outlined text-tertiary bg-tertiary/10 p-2 rounded-lg">groups</span>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-on-surface truncate">{gr.razon_social}</p>
                          <p className="text-[11px] text-on-surface-variant font-medium">{gr.rif}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Organizations Section */}
                {results.orgs.length > 0 && (
                  <div className="mb-2">
                    <div className="px-3 py-1.5 text-[10px] font-black text-outline uppercase tracking-widest opacity-60">Organizaciones</div>
                    {results.orgs.map(org => (
                      <button 
                        key={org.rif} 
                        className="w-full text-left p-3 rounded-xl hover:bg-surface-container transition-colors flex items-center gap-3 group"
                        onClick={() => { navigate('/organizaciones'); setShowResults(false); setSearchTerm(''); }}
                      >
                        <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">corporate_fare</span>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-on-surface truncate">{org.razon_social}</p>
                          <p className="text-[11px] text-on-surface-variant font-medium">{org.rif}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Vehicles Section */}
                {results.vehicles.length > 0 && (
                  <div className="mb-2">
                    <div className="px-3 py-1.5 text-[10px] font-black text-outline uppercase tracking-widest opacity-60">Vehículos</div>
                    {results.vehicles.map(vh => (
                      <button 
                        key={vh.placa} 
                        className="w-full text-left p-3 rounded-xl hover:bg-surface-container transition-colors flex items-center gap-3 group"
                        onClick={() => { navigate('/vehiculos'); setShowResults(false); setSearchTerm(''); }}
                      >
                        <span className="material-symbols-outlined text-secondary bg-secondary/10 p-2 rounded-lg">directions_bus</span>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-on-surface truncate">{vh.placa} - {vh.marca}</p>
                          <p className="text-[11px] text-on-surface-variant font-medium">{vh.modelo} • {vh.anio}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Operators Section */}
                {results.operators.length > 0 && (
                  <div className="mb-2">
                    <div className="px-3 py-1.5 text-[10px] font-black text-outline uppercase tracking-widest opacity-60">Operadores</div>
                    {results.operators.map(op => (
                      <button 
                        key={op.cedula} 
                        className="w-full text-left p-3 rounded-xl hover:bg-surface-container transition-colors flex items-center gap-3 group"
                        onClick={() => { navigate('/operadores'); setShowResults(false); setSearchTerm(''); }}
                      >
                        <span className="material-symbols-outlined text-tertiary bg-tertiary/10 p-2 rounded-lg">badge</span>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-on-surface truncate">{op.nombres} {op.apellidos}</p>
                          <p className="text-[11px] text-on-surface-variant font-medium">{op.cedula} • Lic. Grado {op.licencia_grado}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Routes Section */}
                {results.routes.length > 0 && (
                  <div className="mb-2">
                    <div className="px-3 py-1.5 text-[10px] font-black text-outline uppercase tracking-widest opacity-60">Rutas</div>
                    {results.routes.map(rt => (
                      <button 
                        key={rt.id} 
                        className="w-full text-left p-3 rounded-xl hover:bg-surface-container transition-colors flex items-center gap-3 group"
                        onClick={() => { navigate('/rutas'); setShowResults(false); setSearchTerm(''); }}
                      >
                        <span className="material-symbols-outlined text-error bg-error/10 p-2 rounded-lg">alt_route</span>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-on-surface truncate">{rt.nombre}</p>
                          <p className="text-[11px] text-on-surface-variant font-medium">{rt.tipo_nombre} • {rt.distancia_km} km</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Empty State or Searching State */}
                {isSearching ? (
                  <div className="p-8 text-center">
                    <span className="material-symbols-outlined animate-spin text-primary text-[32px] mb-2">sync</span>
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Buscando en el sistema...</p>
                  </div>
                ) : (results.orgs.length === 0 && results.gremios.length === 0 && results.vehicles.length === 0 && results.operators.length === 0 && results.routes.length === 0) && (
                  <div className="p-8 text-center opacity-50">
                    <span className="material-symbols-outlined text-[32px] mb-2">search_off</span>
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">No se encontraron registros</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-surface-container active:scale-95 ${isDarkMode ? 'shadow-[0_0_15px_rgba(208,228,255,0.2)]' : ''}`}
          style={{ color: 'var(--color-outline)' }}
          onClick={toggleTheme}
          title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          <span className={`material-symbols-outlined text-[22px] transition-all duration-300 ${isDarkMode ? 'rotate-[360deg] text-primary' : 'rotate-0'}`}>
            {isDarkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </button>


        {/* Settings */}
        {hasPermission('Configuración', 'Leer') && (
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-surface-container"
            style={{ color: 'var(--color-outline)' }}
            onClick={() => navigate('/configuracion')}
            title="Configuración"
          >
            <span className="material-symbols-outlined text-[22px]">settings</span>
          </button>
        )}

        {/* Divider */}
        <div className="h-6 w-px mx-1 hidden sm:block bg-outline-variant" />

        {/* User Profile Info (Desktop) */}
        <div className="hidden sm:flex flex-col items-end mr-2">
          <span className="text-[13px] font-bold text-on-surface leading-tight">{user.first_name || user.username || 'Usuario'}</span>
          <span className="text-[11px] text-on-surface-variant leading-tight">{user.rol_nombre || 'Funcionario'}</span>
        </div>

        {/* Avatar with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-9 h-9 rounded-full overflow-hidden border-2 transition-all hover:border-primary border-outline-variant"
          >
            <img
              alt="User profile"
              className="w-full h-full object-cover"
              src={avatarUrl}
            />
          </button>

          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)}></div>
              <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg z-20 py-2 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2 border-b border-outline-variant mb-1">
                  <p className="text-xs font-bold text-outline uppercase tracking-wider">Mi Cuenta</p>
                </div>
                <button 
                  onClick={() => { navigate('/perfil'); setShowProfileMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">person</span> Perfil
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/5 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span> Cerrar Sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>

  );
};

export default TopBar;
