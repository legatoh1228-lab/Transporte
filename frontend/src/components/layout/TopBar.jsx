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
  const [systemName, setSystemName] = useState('Transporte Aragua');

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
        <div className="text-base md:text-lg font-black" style={{ color: 'var(--color-primary-container)' }}>
          {systemName}
        </div>
      </div>


      {/* Center: Search Bar */}
      <div className="flex-1 max-w-md mx-6 hidden lg:block">
        <div className="relative">
          <span
            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px]"
            style={{ color: 'var(--color-outline)' }}
          >
            search
          </span>
          <input
            className="w-full py-2 pl-10 pr-4 text-sm rounded-xl transition-all outline-none"
            style={{
              backgroundColor: 'var(--color-surface-container-low)',
              border: '1px solid var(--color-outline-variant)',
              color: 'var(--color-on-surface)',
              fontFamily: "'Public Sans', sans-serif",
            }}
            placeholder="Buscar registros, placas u operadores..."
            type="text"
            onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; }}
            onBlur={(e)  => { e.target.style.borderColor = 'var(--color-outline-variant)'; }}
          />
        </div>
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
