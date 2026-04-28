import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const SIDEBAR_BG     = '#1f3a5f';
const ACTIVE_BG      = '#2c5f8a';
const ACTIVE_BORDER  = '#4a90e2';

const navItems = [
  { label: 'Dashboard',      icon: 'dashboard',        path: '/dashboard' },
  { label: 'Catálogos',      icon: 'inventory_2',      path: '/catalogos' },
  { label: 'Organizaciones', icon: 'corporate_fare',   path: '/organizaciones' },
  { label: 'Vehículos',      icon: 'directions_bus',   path: '/vehiculos' },
  { label: 'Operadores',     icon: 'person_pin',       path: '/operadores' },
  { label: 'Rutas',          icon: 'alt_route',        path: '/rutas' },
  { label: 'Permisos',       icon: 'verified_user',    path: '/permisos' },
  { label: 'Mapa de Rutas',  icon: 'map',              path: '/mapa-rutas' },
  { label: 'Auditoría',      icon: 'history_edu',      path: '/auditoria' },
  { label: 'Admin Usuarios', icon: 'manage_accounts',  path: '/usuarios' },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[280px] flex-col z-50 overflow-y-auto hidden md:flex font-public-sans"
      style={{ backgroundColor: SIDEBAR_BG }}
    >
      {/* Header */}
      <div className="p-6 flex flex-col gap-4" style={{ borderBottom: '1px solid rgba(100,116,139,0.3)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ color: SIDEBAR_BG, fontVariationSettings: "'FILL' 1" }}
            >
              account_balance
            </span>
          </div>
          <div>
            <h1 className="tracking-wide text-xl font-black text-white uppercase leading-tight">Gestión Aragua</h1>
            <p className="tracking-wide text-slate-400 text-xs mt-0.5">Administración Central</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="flex flex-col gap-0.5 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="flex items-center px-4 py-3 text-sm font-medium transition-all duration-150 rounded-r"
                  style={{
                    color:           isActive ? '#ffffff' : '#94a3b8',
                    backgroundColor: isActive ? ACTIVE_BG  : 'transparent',
                    borderLeft:      isActive
                      ? `4px solid ${ACTIVE_BORDER}`
                      : '4px solid transparent',
                    fontWeight: isActive ? 600 : 400,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color           = '#ffffff';
                      e.currentTarget.style.backgroundColor = `${ACTIVE_BG}40`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color           = '#94a3b8';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span
                    className="material-symbols-outlined mr-3 text-[20px] flex-shrink-0"
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 mt-auto" style={{ borderTop: '1px solid rgba(100,116,139,0.3)' }}>
        <button
          className="w-full flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white rounded text-sm font-medium transition-all duration-200"
          style={{ fontFamily: "'Public Sans', sans-serif" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `${ACTIVE_BG}40`;
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#94a3b8';
          }}
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
