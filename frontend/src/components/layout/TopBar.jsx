import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TopBar = () => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  return (
    <header
      className="flex justify-between items-center h-16 px-6 w-full sticky top-0 z-40 font-public-sans"
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #c4c6cf',
      }}
    >
      {/* Left: Brand + Hamburger */}
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 rounded transition-colors" style={{ color: '#74777f' }}>
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="text-lg font-bold hidden md:block" style={{ color: '#1f3a5f' }}>
          Transporte Aragua
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-md mx-6 hidden lg:block">
        <div className="relative">
          <span
            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px]"
            style={{ color: '#74777f' }}
          >
            search
          </span>
          <input
            className="w-full py-2 pl-10 pr-4 text-sm rounded-xl transition-all outline-none"
            style={{
              backgroundColor: '#f3f4f4',
              border: '1px solid #c4c6cf',
              color: '#191c1c',
              fontFamily: "'Public Sans', sans-serif",
            }}
            placeholder="Buscar registros, placas u operadores..."
            type="text"
            onFocus={(e) => { e.target.style.borderColor = '#1f3a5f'; }}
            onBlur={(e)  => { e.target.style.borderColor = '#c4c6cf'; }}
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Settings */}
        <button
          className="w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-surface-container"
          style={{ color: '#74777f' }}
          onClick={() => navigate('/configuracion')}
          title="Configuración"
        >
          <span className="material-symbols-outlined text-[22px]">settings</span>
        </button>

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
              src={user.avatar || `https://ui-avatars.com/api/?name=${user.username || 'Admin'}&background=1f3a5f&color=fff`}
            />
          </button>

          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)}></div>
              <div className="absolute right-0 mt-2 w-48 bg-white border border-outline-variant rounded-xl shadow-lg z-20 py-2 animate-in fade-in zoom-in-95">
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
