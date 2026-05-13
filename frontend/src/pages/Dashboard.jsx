import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { usePermissions } from '../hooks/usePermissions';


const Dashboard = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  
  const canCreateOrg = hasPermission('Organizaciones', 'Crear');
  const canCreateVeh = hasPermission('Vehículos', 'Crear');
  const canViewAudit = hasPermission('Configuración', 'Leer');
  const canViewAlerts = hasPermission('Alertas', 'Leer');

  const [selectedComposition, setSelectedComposition] = useState('vehiculos');
  const [stats, setStats] = useState({
    organizations: 0,
    vehicles: 0,
    operators: 0,
    routes: 0,
    fleet_distribution: [],
    operator_distribution: [],
    org_distribution: [],
    route_distribution: [],
    alerts: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('users/dashboard-stats/');
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };
    fetchStats();
  }, []);

  const compositionConfig = {
    vehiculos: {
      title: "Composición de la Flota",
      subtitle: "Distribución por modalidad técnica de transporte",
      label: "Unidades",
      total: stats.vehicles,
      data: stats.fleet_distribution || [],
      iconGetter: (name) => {
        return {
          'COLECTIVO': 'directions_bus',
          'TAXI': 'local_taxi',
          'MOTO': 'two_wheeler'
        }[name.toUpperCase()] || 'transportation';
      }
    },
    operadores: {
      title: "Clasificación de Operadores",
      subtitle: "Distribución por grado de licencia",
      label: "Operadores",
      total: stats.operators,
      data: stats.operator_distribution || [],
      iconGetter: () => 'badge'
    },
    organizaciones: {
      title: "Tipos de Organizaciones",
      subtitle: "Clasificación de gremios y asociaciones",
      label: "Orgs",
      total: stats.organizations,
      data: stats.org_distribution || [],
      iconGetter: () => 'corporate_fare'
    },
    rutas: {
      title: "Clasificación de Rutas",
      subtitle: "Distribución por tipología de servicio",
      label: "Rutas",
      total: stats.routes,
      data: stats.route_distribution || [],
      iconGetter: () => 'alt_route'
    }
  };

  const activeComposition = compositionConfig[selectedComposition];

  // Helper for Wave Chart calculation
  const calculateWaveLayers = (data) => {
    let acc = 0;
    const computed = (data || []).map((item, index) => {
      acc += item.percentage;
      const yPos = 100 - acc;
      return { ...item, index, yPos };
    });
    // Sort so the topmost layer (smallest Y) is drawn first (at the back)
    return computed.sort((a, b) => a.yPos - b.yPos);
  };

  const waveLayers = calculateWaveLayers(activeComposition.data);

  return (
    <div className="space-y-10 font-public-sans pb-10">
      {/* Page Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-4">
        <div>
          <h2 className="text-4xl font-black text-on-surface tracking-tight mb-2">Panel Ejecutivo</h2>
          <div className="flex items-center gap-2 text-on-surface-variant/80">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <p className="text-sm font-medium">Sistema de Gestión de Transporte Aragua • Tiempo Real</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {canCreateOrg && (
            <button 
              onClick={() => navigate('/organizaciones')}
              className="bg-surface-container-high/50 backdrop-blur-sm border border-outline-variant text-on-surface font-bold text-sm px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-surface-container-highest transition-all shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">add_business</span>
              Nueva Organización
            </button>
          )}
          {canCreateVeh && (
            <button 
              onClick={() => navigate('/vehiculos')}
              className="bg-primary text-on-primary font-bold text-sm px-6 py-3 rounded-2xl flex items-center gap-2 hover:shadow-[0_8px_20px_rgba(3,36,72,0.3)] transition-all shadow-md active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">directions_bus</span>
              Registrar Unidad
            </button>
          )}
        </div>
      </div>

      {/* Hero Stats: Top 4 Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Organizaciones', value: stats.organizations, icon: 'corporate_fare', bgClass: 'bg-primary/10', textClass: 'text-primary', path: '/organizaciones' },
          { label: 'Unidades Activas', value: stats.vehicles, icon: 'directions_bus', bgClass: 'bg-secondary/10', textClass: 'text-secondary', path: '/vehiculos' },
          { label: 'Operadores', value: stats.operators, icon: 'person_pin', bgClass: 'bg-tertiary/10', textClass: 'text-tertiary', path: '/operadores' },
          { label: 'Rutas Digitales', value: stats.routes, icon: 'alt_route', bgClass: 'bg-error/10', textClass: 'text-error', path: '/rutas' }
        ].map((card, i) => (
          <div 
            key={i}
            onClick={() => navigate(card.path)}
            className="group relative overflow-hidden bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-5 flex items-center gap-5 transition-all duration-300 hover:shadow-lg hover:border-outline-variant/80 cursor-pointer hover:-translate-y-1"
          >
             {/* Icon */}
             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 ${card.bgClass} ${card.textClass}`}>
               <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                 {card.icon}
               </span>
             </div>

             {/* Content */}
             <div className="flex-1 flex flex-col justify-center">
                <span className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest opacity-80 mb-1">
                  {card.label}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-on-surface leading-none">{card.value}</span>
                </div>
             </div>

             {/* Action Arrow */}
             <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">arrow_forward</span>
             </div>
          </div>
        ))}
      </div>

      {/* Main Analytics Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Fleet Analytics - Reimagined */}
        <div className={`space-y-8 ${canViewAlerts ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
          {/* First Block: Fleet by Modality */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-[40px] p-10 flex flex-col shadow-sm relative overflow-hidden group">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--color-primary) 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
            
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-10 relative z-10">
              <div>
                <h3 className="text-2xl font-black text-on-surface mb-4">Resumen de Composición</h3>
                
                {/* Premium Filter Chips */}
                <div className="flex flex-wrap items-center gap-2 bg-surface-container p-1.5 rounded-[20px] w-fit border border-outline-variant/30 shadow-inner">
                  {[
                    { id: 'vehiculos', icon: 'directions_bus', label: 'Flota' },
                    { id: 'operadores', icon: 'badge', label: 'Operadores' },
                    { id: 'organizaciones', icon: 'corporate_fare', label: 'Gremios' },
                    { id: 'rutas', icon: 'alt_route', label: 'Rutas' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedComposition(tab.id)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                        selectedComposition === tab.id 
                        ? 'bg-primary text-on-primary shadow-md scale-[1.02]' 
                        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-on-surface-variant font-bold mt-4 ml-2 opacity-60 tracking-wide uppercase">{activeComposition.subtitle}</p>
              </div>
              <div className="bg-surface-container-low border border-outline-variant/60 rounded-3xl px-6 py-4 flex items-center gap-5 shadow-sm">
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest leading-none mb-1.5">Total {activeComposition.label}</span>
                  <div className="flex items-baseline gap-1 justify-end">
                     <span className="text-3xl font-black text-primary leading-none">{activeComposition.total}</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px] text-primary">pie_chart</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row items-center xl:items-center gap-12 xl:gap-16 relative z-10">
              <div className="relative w-56 h-56 md:w-64 md:h-64 flex-shrink-0 rounded-full border-[10px] border-surface-container-high overflow-hidden shadow-[inset_0_4px_20px_rgba(0,0,0,0.1)] bg-surface-container">
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  {waveLayers.map((layer) => {
                    const chartColors = ['#0ea5e9', '#f97316', '#10b981', '#8b5cf6', '#f43f5e'];
                    const color = chartColors[layer.index % chartColors.length];
                    const y = Math.max(0, layer.yPos); 
                    const dur = 2.5 + (layer.index % 2); // Faster base animation
                    const amplitude = 6; // Taller waves for more movement
                    
                    return (
                      <g key={`${selectedComposition}-${layer.name}`}>
                        {/* Back wave (slower, offset, lower opacity for 3D liquid effect) */}
                        <path 
                          d={`M 0 ${y} C 12.5 ${y+amplitude}, 37.5 ${y-amplitude}, 50 ${y} C 62.5 ${y+amplitude}, 87.5 ${y-amplitude}, 100 ${y} C 112.5 ${y+amplitude}, 137.5 ${y-amplitude}, 150 ${y} C 162.5 ${y+amplitude}, 187.5 ${y-amplitude}, 200 ${y} L 200 100 L 0 100 Z`}
                          fill={color}
                          opacity="0.3"
                          className="transition-all duration-700 ease-out"
                        >
                           <animateTransform 
                             attributeName="transform" type="translate" from="-100 0" to="0 0" 
                             dur={`${dur + 1.5}s`} repeatCount="indefinite" 
                           />
                        </path>
                        {/* Front wave */}
                        <path 
                          d={`M 0 ${y} C 12.5 ${y-amplitude}, 37.5 ${y+amplitude}, 50 ${y} C 62.5 ${y-amplitude}, 87.5 ${y+amplitude}, 100 ${y} C 112.5 ${y-amplitude}, 137.5 ${y+amplitude}, 150 ${y} C 162.5 ${y-amplitude}, 187.5 ${y+amplitude}, 200 ${y} L 200 100 L 0 100 Z`}
                          fill={color}
                          opacity="0.95"
                          className="transition-all duration-700 ease-out"
                        >
                           <animateTransform 
                             attributeName="transform" type="translate" from="0 0" to="-100 0" 
                             dur={`${dur}s`} repeatCount="indefinite" 
                           />
                        </path>
                      </g>
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 pointer-events-none">
                  <div className="bg-surface-container-lowest/90 backdrop-blur-md px-6 py-4 rounded-[32px] border border-outline-variant/30 shadow-xl flex flex-col items-center">
                    <span className="text-3xl font-black text-on-surface leading-none transition-all">{activeComposition.total}</span>
                    <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest mt-1 transition-all">{activeComposition.label}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-3 md:gap-4 w-full">
                {activeComposition.data.map((item, index) => {
                    const chartColors = ['#0ea5e9', '#f97316', '#10b981', '#8b5cf6', '#f43f5e'];
                    const color = chartColors[index % chartColors.length];
                    const icon = activeComposition.iconGetter(item.name);
                    const percentageStr = Number(item.percentage).toFixed(item.percentage % 1 === 0 ? 0 : 1);

                    return (
                      <div key={item.name} className="flex items-center justify-between p-4 rounded-[20px] bg-surface-container-lowest border border-outline-variant/30 hover:border-outline-variant/60 hover:shadow-md transition-all group/item min-w-0">
                        <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                           <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0" style={{ backgroundColor: `${color}1A`, color: color }}>
                              <span className="material-symbols-outlined text-[20px] md:text-[24px]">{icon}</span>
                           </div>
                           <div className="flex flex-col min-w-0 flex-1">
                             <div className="flex items-center gap-2 min-w-0">
                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }}></div>
                                <span className="text-xs md:text-sm font-black text-on-surface tracking-tight leading-none truncate" title={item.name}>{item.name}</span>
                             </div>
                             <span className="text-[10px] md:text-[11px] font-medium text-on-surface-variant mt-1.5 truncate">{item.count} {activeComposition.label.toLowerCase()}</span>
                           </div>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0 pl-3 md:pl-4">
                          <span className="text-lg md:text-xl font-black leading-none" style={{ color: color }}>{percentageStr}%</span>
                        </div>
                      </div>
                    );
                })}
              </div>
            </div>
          </div>

          {/* Second Block: Territorial Axis (New Coherent Data) */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-[40px] p-10 flex flex-col shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-on-surface">Distribución por Eje Territorial</h3>
                <p className="text-sm text-on-surface-variant font-medium">Concentración de rutas por zona del estado Aragua</p>
              </div>
              <span className="material-symbols-outlined text-primary">map</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(stats.axis_distribution || []).map((axis, i) => {
                const colors = ['primary', 'secondary', 'tertiary', 'error'];
                const color = colors[i % colors.length];
                return (
                  <div key={i} className="bg-surface-container p-6 rounded-3xl border border-outline-variant/30 hover:border-primary/50 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-${color} font-black text-xs uppercase tracking-widest`}>{axis.name}</span>
                      <span className="text-on-surface-variant text-xs font-bold">{axis.percentage}%</span>
                    </div>
                    <div className="text-2xl font-black text-on-surface mb-3">{axis.count} <span className="text-xs font-medium text-on-surface-variant">Rutas</span></div>
                    <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                      <div className={`h-full bg-${color} rounded-full transition-all duration-1000`} style={{ width: `${axis.percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {canViewAlerts && (
          <div className="lg:col-span-4 h-full">
             <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-[40px] p-6 xl:p-8 flex flex-col shadow-sm relative overflow-hidden h-full">
                <div className="flex items-center justify-between mb-8 flex-shrink-0">
                   <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-error/10 flex items-center justify-center">
                         <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>notifications_active</span>
                      </div>
                      <h3 className="text-xl font-black text-on-surface">Notificaciones</h3>
                   </div>
                   <div className="flex items-center gap-2">
                      {stats.alerts.length > 0 && (
                        <span className="bg-error text-on-error text-[12px] font-black px-3 py-1 rounded-full animate-pulse shadow-sm">
                          {stats.alerts.length}
                        </span>
                      )}
                   </div>
                </div>

                <div className="space-y-4 flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
                   {stats.alerts.length > 0 ? (
                     stats.alerts.map((alert, index) => (
                       <div 
                         key={index} 
                         className={`p-5 rounded-[24px] border transition-all cursor-pointer hover:-translate-y-1 ${
                           alert.type === 'error' 
                           ? 'bg-error-container/10 border-error/10 hover:border-error/30 hover:shadow-[0_8px_20px_rgba(186,26,26,0.08)]' 
                           : 'bg-surface-container border-outline-variant/30 hover:border-primary/30 hover:shadow-[0_8px_20px_rgba(3,36,72,0.05)]'
                         }`}
                         onClick={() => navigate(alert.link)}
                       >
                          <div className="flex items-start gap-4">
                             <span className={`material-symbols-outlined p-2.5 rounded-xl text-[20px] ${alert.type === 'error' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                                {alert.icon}
                             </span>
                             <div className="flex-1 min-w-0 pt-0.5">
                                <h4 className={`text-sm font-black truncate ${alert.type === 'error' ? 'text-error' : 'text-on-surface'}`} title={alert.title}>
                                   {alert.title}
                                </h4>
                                <p className="text-[12px] text-on-surface-variant font-medium mt-1 leading-relaxed line-clamp-2">
                                   {alert.message}
                                </p>
                                <div className="mt-3 flex items-center gap-1.5 text-[11px] font-black text-primary uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity">
                                   Gestionar <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                </div>
                             </div>
                          </div>
                       </div>
                     ))
                   ) : (
                     <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-outline-variant/50 rounded-[32px] opacity-40">
                        <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-4">
                          <span className="material-symbols-outlined text-[40px] text-on-surface-variant">verified</span>
                        </div>
                        <p className="font-black text-on-surface text-lg">Estabilidad Total</p>
                        <p className="text-sm font-medium mt-1">No hay alertas críticas.</p>
                     </div>
                   )}
                </div>
                
                 <div className="mt-6 pt-6 border-t border-outline-variant/30 flex-shrink-0">
                   <button 
                     onClick={() => navigate('/alertas')} 
                     className="w-full py-4 bg-surface-container border border-outline-variant/50 rounded-[20px] text-xs font-black text-on-surface-variant uppercase tracking-widest hover:bg-surface-container-highest hover:text-primary transition-all flex items-center justify-center gap-2 group"
                   >
                     Ver Historial Completo
                     <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
                   </button>
                 </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
