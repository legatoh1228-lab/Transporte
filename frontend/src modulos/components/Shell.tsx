import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Bus, Building2, IdCard, Map, BarChart3, Settings, LogOut, Bell, HelpCircle, Search, Users, MapPin, KeyRound, Database, Shield, ChevronDown, ChevronRight } from 'lucide-react';

interface ShellProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  children: React.ReactNode;
}

type NavItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  subItems?: { id: string; label: string; icon: React.ElementType }[];
};

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Tablero Control', icon: LayoutDashboard },
  { id: 'vehiculos', label: 'Vehículos', icon: Bus },
  { id: 'organizaciones', label: 'Organizaciones', icon: Building2 },
  { id: 'operadores', label: 'Operadores', icon: IdCard },
  { id: 'terminales', label: 'Terminales', icon: MapPin },
  { id: 'rutas', label: 'Rutas', icon: Map },
  { id: 'usuarios', label: 'Usuarios', icon: Users },
  { id: 'reportes', label: 'Reportes', icon: BarChart3 },
  { 
    id: 'configuracion', 
    label: 'Configuración', 
    icon: Settings,
    subItems: [
      { id: 'permisos', label: 'Permisos', icon: KeyRound },
      { id: 'catalogos', label: 'Catálogos', icon: Database },
      { id: 'auditoria', label: 'Auditoría', icon: Shield },
    ]
  }
];

export function Shell({ currentView, setCurrentView, children }: ShellProps) {
  const [isConfigExpanded, setIsConfigExpanded] = useState(false);

  useEffect(() => {
    // Auto-expand if a sub-item is active
    if (['configuracion', 'permisos', 'catalogos', 'auditoria'].includes(currentView)) {
      setIsConfigExpanded(true);
    }
  }, [currentView]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* SideNavBar */}
      <aside className="fixed left-0 top-0 h-full w-[280px] bg-primary text-on-primary shadow-xl flex flex-col py-6 z-30 hidden md:flex">
        {/* Header */}
        <div className="px-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <Bus className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-widest text-white uppercase leading-none">TransAragua</h1>
              <p className="text-xs text-primary-fixed-dim tracking-wide mt-1">Gestión de Transporte</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = currentView === item.id;
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isExpanded = hasSubItems && isConfigExpanded;
            
            return (
              <div key={item.id} className="flex flex-col">
                <button
                  onClick={() => {
                    if (hasSubItems) {
                      setIsConfigExpanded(!isConfigExpanded);
                      setCurrentView(item.id);
                    } else {
                      setCurrentView(item.id);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-all rounded-r-none rounded-l-md ${
                    isActive || (hasSubItems && ['permisos', 'catalogos', 'auditoria'].includes(currentView))
                      ? 'bg-surface-tint text-white border-l-4 border-secondary-container opacity-100' 
                      : 'text-primary-fixed-dim hover:text-white hover:bg-white/5 opacity-80 hover:opacity-100 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center">
                    <item.icon className={`mr-3 ${isActive || (hasSubItems && ['permisos', 'catalogos', 'auditoria'].includes(currentView)) ? 'text-secondary-container' : 'text-primary-fixed-dim'}`} size={20} />
                    {item.label}
                  </div>
                  {hasSubItems && (
                     isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                  )}
                </button>
                
                {isExpanded && item.subItems && (
                  <div className="flex flex-col space-y-1 mt-1 pl-4">
                    {item.subItems.map(subItem => {
                      const isSubActive = currentView === subItem.id;
                      return (
                        <button
                          key={subItem.id}
                          onClick={() => setCurrentView(subItem.id)}
                          className={`w-full flex items-center px-4 py-2 text-sm font-medium transition-all rounded-r-none rounded-l-md ${
                            isSubActive 
                              ? 'bg-white/10 text-white border-l-2 border-secondary-container opacity-100' 
                              : 'text-primary-fixed-dim hover:text-white hover:bg-white/5 opacity-80 hover:opacity-100 border-l-2 border-transparent'
                          }`}
                        >
                          <subItem.icon className={`mr-3 ${isSubActive ? 'text-secondary-container' : 'text-primary-fixed-dim'}`} size={16} />
                          {subItem.label}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="px-3 pt-4 border-t border-white/10 space-y-1">
          <button className="w-full flex items-center px-4 py-2 text-sm font-medium text-primary-fixed-dim hover:text-white hover:bg-white/5 transition-all rounded-md opacity-80 hover:opacity-100">
            <LogOut className="mr-3" size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-1 flex flex-col md:ml-[280px] min-h-screen">
        {/* TopNavBar */}
        <header className="sticky top-0 w-full h-16 border-b border-outline-variant bg-surface-container-lowest/95 backdrop-blur-md z-20 flex justify-between items-center px-8 transition-colors">
          <div className="flex items-center flex-1 pr-6 gap-6">
            <h2 className="text-lg font-bold text-primary md:hidden">TransAragua</h2>
            <div className="relative w-full max-w-md hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
              <input 
                type="text" 
                placeholder="Buscar operadores, rutas, organizaciones..." 
                className="w-full bg-surface-container-low border border-transparent focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest rounded-full py-2 pl-10 pr-4 text-sm text-on-surface transition-all outline-none"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full outline outline-2 outline-surface-container-lowest"></span>
            </button>
            <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors mr-2">
              <HelpCircle size={20} />
            </button>
            
            <div className="flex items-center gap-3 pl-4 border-l border-outline-variant cursor-pointer group">
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-sm font-bold text-on-surface leading-tight group-hover:text-primary transition-colors">Aragua Potencia</span>
                <span className="text-xs text-on-surface-variant font-medium">Oficial Administrativo</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-secondary-container border border-outline-variant flex items-center justify-center text-on-secondary-container font-bold text-sm">
                OA
              </div>
            </div>
          </div>
        </header>

        {/* Content Canvas */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
