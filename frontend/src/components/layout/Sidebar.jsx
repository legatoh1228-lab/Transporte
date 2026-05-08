import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import api from '../../services/api';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [expandedItems, setExpandedItems] = useState({});

  // Variables de color desde el sistema de diseño
  const sidebarBg        = 'var(--color-sidebar-bg)';
  const sidebarText      = 'var(--color-sidebar-text)';
  const sidebarTextActive = 'var(--color-sidebar-text-active)';
  const activeBg         = 'var(--color-sidebar-item-active)';
  const activeBorder     = 'var(--color-sidebar-border-active)';

  // Mapping labels to Permission Modules
  const moduleMap = {
    'Dashboard': 'Dashboard',
    'Organizaciones': 'Organizaciones',
    'Vehículos': 'Vehículos',
    'Operadores': 'Operadores',
    'Rutas': 'Rutas',
    'Mapa de Rutas': 'Rutas',
    'Alertas': 'Dashboard',
    'Terminales': 'Organizaciones',
    'Admin Usuarios': 'Usuarios',
    'Permisos': 'Permisos',
    'Configuración': 'Configuración',
    'Catálogos': 'Configuración',
    'Auditoría': 'Configuración'
  };


  const navItems = [
    { label: 'Dashboard',      icon: 'dashboard',        path: '/dashboard' },
    { label: 'Organizaciones', icon: 'corporate_fare',   path: '/organizaciones' },
    { label: 'Terminales',     icon: 'store',            path: '/terminales' },
    { label: 'Vehículos',      icon: 'directions_bus',   path: '/vehiculos' },
    { label: 'Operadores',     icon: 'person_pin',       path: '/operadores' },
    { label: 'Rutas',          icon: 'alt_route',        path: '/rutas' },
    { label: 'Mapa de Rutas',  icon: 'map',              path: '/mapa-rutas' },
    { label: 'Alertas',        icon: 'notifications_active', path: '/alertas' },
    { label: 'Admin Usuarios', icon: 'manage_accounts',  path: '/usuarios' },
    { 
      label: 'Configuración', 
      icon: 'settings',         
      path: '/configuracion',
      subItems: [
        { label: 'Permisos',    icon: 'verified_user',    path: '/permisos' },
        { label: 'Gestión',     icon: 'inventory_2',      path: '/catalogos' },
        { label: 'Auditoría',   icon: 'history_edu',      path: '/auditoria' },
        { label: 'Identidad Visual', icon: 'palette',      path: '/apariencia' },
      ]
    },
  ];

  const [branding, setBranding] = useState({
    nombre_sistema: 'Gestión Aragua',
    logo: null
  });

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const response = await api.get('catalogs/configuracion-visual/');
        setBranding({
          nombre_sistema: response.data.nombre_sistema || 'Gestión Aragua',
          logo: response.data.logo
        });
      } catch (err) {
        console.error('Error fetching branding:', err);
      }
    };
    fetchBranding();
  }, []);

  // Filter items based on "Leer" permission
  const filteredNavItems = navItems.filter(item => {
    const module = moduleMap[item.label];
    if (module && !hasPermission(module, 'Leer')) return false;

    // Filter subItems if they exist
    if (item.subItems) {
      // Clone subItems to avoid modifying original array if it's static
      const filteredSubs = item.subItems.filter(sub => {
        const subModule = moduleMap[sub.label];
        return subModule ? hasPermission(subModule, 'Leer') : true;
      });
      // Update item clone or logic here
      if (filteredSubs.length === 0 && !module) return false;
      item.currentSubs = filteredSubs;
    }

    return true;
  });

  useEffect(() => {
    // Auto-expand if a sub-item is active
    filteredNavItems.forEach(item => {
      const subs = item.currentSubs || item.subItems;
      if (subs && subs.some(sub => sub.path === location.pathname)) {
        setExpandedItems(prev => ({ ...prev, [item.label]: true }));
      }
    });
  }, [location.pathname]);

  const toggleExpand = (label) => {
    setExpandedItems(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[280px] flex-col z-50 overflow-y-auto hidden md:flex font-public-sans transition-colors duration-300 shadow-xl"
      style={{ backgroundColor: sidebarBg }}
    >
      {/* Header */}
      <div className="p-6 flex flex-col gap-4" style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-inner overflow-hidden p-1.5">
            {branding.logo ? (
              <img src={branding.logo} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ color: 'var(--color-primary)', fontVariationSettings: "'FILL' 1" }}
              >
                account_balance
              </span>
            )}
          </div>
          <div className="overflow-hidden">
            <h1 className="tracking-wide text-lg font-black text-white dark:text-on-primary-fixed-variant uppercase leading-none truncate">{branding.nombre_sistema}</h1>
            <p className="tracking-wide text-slate-400 text-[10px] mt-1 font-bold uppercase opacity-60">Panel de Control</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="flex flex-col gap-0.5 px-2">
          {filteredNavItems.map((item) => {
            const subs = item.currentSubs || item.subItems;
            const hasSubItems = subs && subs.length > 0;
            const isChildActive = hasSubItems && subs.some(sub => sub.path === location.pathname);
            const isActive = location.pathname === item.path || isChildActive;
            const isExpanded = expandedItems[item.label];

            return (
              <li key={item.label} className="flex flex-col">
                <div className="flex items-center">
                  <Link
                    to={item.path}
                    className="flex-1 flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 rounded-r-xl mr-2"
                    style={{
                      color:           isActive ? sidebarTextActive : sidebarText,
                      backgroundColor: isActive ? activeBg  : 'transparent',
                      borderLeft:      isActive
                        ? `4px solid ${activeBorder}`
                        : '4px solid transparent',
                      fontWeight: isActive ? 700 : 400,
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
                  <ul className="flex flex-col gap-0.5 mt-0.5 ml-4 border-l border-slate-700/50">
                    {subs.map((subItem) => {
                      const isSubActive = location.pathname === subItem.path;
                      return (
                        <li key={subItem.path}>
                          <Link
                            to={subItem.path}
                            className="flex items-center px-8 py-2 text-[13px] font-medium transition-all duration-150"
                            style={{
                              color: isSubActive ? sidebarTextActive : sidebarText,
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
      <div className="p-4 mt-auto" style={{ borderTop: '1px solid var(--color-outline-variant)' }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-3 text-slate-400 hover:text-white rounded-xl text-sm font-bold transition-all duration-200 hover:bg-white/5"
          style={{ fontFamily: "'Public Sans', sans-serif" }}
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Cerrar Sesión
        </button>
      </div>
    </aside>

  );
};

export default Sidebar;
