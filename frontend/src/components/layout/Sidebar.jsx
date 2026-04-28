import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const SIDEBAR_BG     = '#1f3a5f';
const ACTIVE_BG      = '#2c5f8a';
const ACTIVE_BORDER  = '#4a90e2';

const navItems = [
  { label: 'Dashboard',      icon: 'dashboard',        path: '/dashboard' },
  { label: 'Organizaciones', icon: 'corporate_fare',   path: '/organizaciones' },
  { label: 'Terminales',     icon: 'store',            path: '/terminales' },
  { label: 'Vehículos',      icon: 'directions_bus',   path: '/vehiculos' },
  { label: 'Operadores',     icon: 'person_pin',       path: '/operadores' },
  { label: 'Rutas',          icon: 'alt_route',        path: '/rutas' },
  { label: 'Mapa de Rutas',  icon: 'map',              path: '/mapa-rutas' },
  { label: 'Admin Usuarios', icon: 'manage_accounts',  path: '/usuarios' },
  { 
    label: 'Configuración', 
    icon: 'settings',         
    path: '/configuracion',
    subItems: [
      { label: 'Permisos',    icon: 'verified_user',    path: '/permisos' },
      { label: 'Catálogos',   icon: 'inventory_2',      path: '/catalogos' },
      { label: 'Auditoría',   icon: 'history_edu',      path: '/auditoria' },
    ]
  },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    // Auto-expand if a sub-item is active
    navItems.forEach(item => {
      if (item.subItems && item.subItems.some(sub => sub.path === location.pathname)) {
        setExpandedItems(prev => ({ ...prev, [item.label]: true }));
      }
    });
  }, [location.pathname]);

  const toggleExpand = (label) => {
    setExpandedItems(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = () => {
    // Limpiar localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    
    // Opcional: Podrías llamar a un endpoint de logout en el backend si fuera necesario
    // api.post('/users/logout/');

    // Redirigir al Login
    navigate('/login');
  };

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
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isChildActive = hasSubItems && item.subItems.some(sub => sub.path === location.pathname);
            const isActive = location.pathname === item.path || isChildActive;
            const isExpanded = expandedItems[item.label];

            return (
              <li key={item.label} className="flex flex-col">
                <div className="flex items-center">
                  <Link
                    to={item.path}
                    className="flex-1 flex items-center px-4 py-3 text-sm font-medium transition-all duration-150 rounded-r"
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
                  {hasSubItems && (
                    <button 
                      onClick={() => toggleExpand(item.label)}
                      className="p-2 text-slate-400 hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {isExpanded ? 'expand_more' : 'chevron_right'}
                      </span>
                    </button>
                  )}
                </div>

                {/* Sub-items */}
                {hasSubItems && isExpanded && (
                  <ul className="flex flex-col gap-0.5 mt-0.5 ml-4 border-l border-slate-700">
                    {item.subItems.map((subItem) => {
                      const isSubActive = location.pathname === subItem.path;
                      return (
                        <li key={subItem.path}>
                          <Link
                            to={subItem.path}
                            className="flex items-center px-8 py-2 text-[13px] font-medium transition-all duration-150"
                            style={{
                              color: isSubActive ? '#ffffff' : '#94a3b8',
                              fontWeight: isSubActive ? 600 : 400,
                            }}
                          >
                            <span className="material-symbols-outlined mr-3 text-[16px]">
                              {subItem.icon}
                            </span>
                            {subItem.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 mt-auto" style={{ borderTop: '1px solid rgba(100,116,139,0.3)' }}>
        <button
          onClick={handleLogout}
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
