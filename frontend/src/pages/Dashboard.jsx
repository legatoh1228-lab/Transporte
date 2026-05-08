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

  const [stats, setStats] = useState({
    organizations: 0,
    vehicles: 0,
    operators: 0,
    routes: 0,
    fleet_distribution: [],
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

  // Helper for Donut Chart calculation
  const calculateDonutSegments = () => {
    let currentOffset = 0;
    return stats.fleet_distribution.map((item, index) => {
      const percentage = item.percentage;
      const offset = currentOffset;
      currentOffset += percentage;
      return { ...item, offset, index };
    });
  };

  const donutSegments = calculateDonutSegments();

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
          { label: 'Organizaciones', value: stats.organizations, icon: 'corporate_fare', color: 'primary', trend: '+12%', path: '/organizaciones' },
          { label: 'Unidades Activas', value: stats.vehicles, icon: 'directions_bus', color: 'secondary', trend: '+5.4%', path: '/vehiculos' },
          { label: 'Operadores', value: stats.operators, icon: 'person_pin', color: 'tertiary', trend: '+3.1%', path: '/operadores' },
          { label: 'Rutas Digitales', value: stats.routes, icon: 'alt_route', color: 'error', trend: '+8%', path: '/rutas' }
        ].map((card, i) => (
          <div 
            key={i}
            onClick={() => navigate(card.path)}
            className="group relative overflow-hidden bg-surface-container-lowest border border-outline-variant/60 rounded-[32px] p-7 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 cursor-pointer hover:-translate-y-2 border-opacity-50"
          >
            {/* Background Decorative Gradient */}
            <div className={`absolute -right-10 -top-10 w-32 h-32 bg-${card.color}/5 rounded-full blur-3xl group-hover:bg-${card.color}/10 transition-colors duration-500`}></div>
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className={`w-14 h-14 rounded-2xl bg-${card.color}/10 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                <span className={`material-symbols-outlined text-[28px] text-${card.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                  {card.icon}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-[12px] font-black text-${card.color} bg-${card.color}/10 px-2 py-0.5 rounded-full`}>{card.trend}</span>
              </div>
            </div>

            <div className="relative z-10">
              <h3 className="text-on-surface-variant font-bold text-sm tracking-wide mb-1 opacity-70 group-hover:opacity-100 transition-opacity">{card.label}</h3>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-on-surface tracking-tighter leading-none">{card.value}</span>
                <span className="text-[11px] font-bold text-on-surface-variant mb-1 uppercase tracking-widest opacity-40">Total</span>
              </div>
            </div>

            {/* Sparkline Visual (Simple SVG) */}
            <div className="mt-6 pt-4 border-t border-outline-variant/20 flex items-center justify-between">
               <div className="w-24 h-6 opacity-30 group-hover:opacity-100 transition-opacity duration-700">
                  <svg viewBox="0 0 100 20" className={`w-full h-full text-${card.color}`}>
                    <path 
                      d="M0 15 Q 10 5, 20 12 T 40 8 T 60 14 T 80 6 T 100 10" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                    />
                  </svg>
               </div>
               <span className="material-symbols-outlined text-on-surface-variant/20 group-hover:text-primary transition-colors duration-300">north_east</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Analytics Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Fleet Analytics - Reimagined */}
        <div className="lg:col-span-8 space-y-8">
          {/* First Block: Fleet by Modality */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-[40px] p-10 flex flex-col shadow-sm relative overflow-hidden group">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--color-primary) 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
              <div>
                <h3 className="text-2xl font-black text-on-surface mb-1">Composición de la Flota</h3>
                <p className="text-sm text-on-surface-variant font-medium">Distribución por modalidad técnica de transporte</p>
              </div>
              <div className="bg-surface-container border border-outline-variant/60 rounded-2xl px-4 py-2 flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest leading-none mb-1">Total Unidades</span>
                  <span className="text-lg font-black text-primary leading-none">{stats.vehicles}</span>
                </div>
                <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">equalizer</span>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row items-center gap-16 relative z-10">
              <div className="relative w-64 h-64 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-surface-container-high" />
                  {donutSegments.map((seg, i) => {
                    const colors = ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-tertiary-container)', 'var(--color-error)', 'var(--color-primary-fixed-dim)'];
                    const color = colors[i % colors.length];
                    return (
                      <circle
                        key={i}
                        cx="50" cy="50" r="40"
                        fill="none"
                        stroke={color}
                        strokeWidth={seg.percentage > 0 ? 12 : 0}
                        strokeDasharray={`${seg.percentage} 100`}
                        strokeDashoffset={`-${seg.offset}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-in-out hover:stroke-[14] cursor-pointer"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-black text-on-surface leading-none">{stats.vehicles}</span>
                  <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mt-1">Unidades</span>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8 w-full">
                {stats.fleet_distribution.map((item, index) => {
                    const colors = ['bg-primary', 'bg-secondary', 'bg-tertiary-container', 'bg-error', 'bg-primary-fixed-dim'];
                    const icon = {
                      'COLECTIVO': 'directions_bus',
                      'TAXI': 'local_taxi',
                      'MOTO': 'two_wheeler'
                    }[item.name.toUpperCase()] || 'transportation';

                    return (
                      <div key={item.name} className="flex flex-col gap-2 group/item">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                              <span className="text-sm font-black text-on-surface tracking-tight group-hover/item:text-primary transition-colors">{item.name}</span>
                            </div>
                            <span className="text-sm font-bold text-on-surface-variant">{item.percentage}%</span>
                        </div>
                        <div className="flex items-center justify-between pl-6">
                            <div className="flex items-center gap-1.5 opacity-60">
                              <span className="material-symbols-outlined text-[16px]">{icon}</span>
                              <span className="text-[11px] font-medium">{item.count} unidades</span>
                            </div>
                            <div className="h-1.5 w-24 bg-surface-container rounded-full overflow-hidden">
                              <div className={`h-full ${colors[index % colors.length]} rounded-full`} style={{ width: `${item.percentage}%` }}></div>
                            </div>
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

        {/* Alerts & Insights Section */}
        <div className="lg:col-span-4 flex flex-col gap-8">
           <div className="bg-surface-container-lowest border border-outline-variant rounded-[40px] p-8 flex flex-col shadow-sm relative overflow-hidden group/alerts h-full">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-error/10 flex items-center justify-center">
                       <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>notifications_active</span>
                    </div>
                    <h3 className="text-xl font-black text-on-surface">Notificaciones</h3>
                 </div>
                 {stats.alerts.length > 0 && (
                   <span className="bg-error text-on-error text-[12px] font-black px-3 py-1 rounded-full animate-bounce">
                     {stats.alerts.length}
                   </span>
                 )}
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                 {stats.alerts.length > 0 ? (
                   stats.alerts.map((alert, index) => (
                     <div 
                       key={index} 
                       className={`p-5 rounded-[24px] border border-transparent transition-all cursor-pointer hover:shadow-xl hover:shadow-primary/5 ${
                         alert.type === 'error' 
                         ? 'bg-error-container/10 hover:border-error/20 hover:bg-error-container/20' 
                         : 'bg-surface-container hover:border-primary/20 hover:bg-surface-container-high'
                       }`}
                       onClick={() => navigate(alert.link)}
                     >
                        <div className="flex items-start gap-4">
                           <span className={`material-symbols-outlined p-2 rounded-xl text-[20px] ${alert.type === 'error' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                              {alert.icon}
                           </span>
                           <div className="flex-1 min-w-0">
                              <h4 className={`text-[14px] font-black truncate ${alert.type === 'error' ? 'text-error' : 'text-on-surface'}`}>
                                 {alert.title}
                              </h4>
                              <p className="text-[12px] text-on-surface-variant font-medium mt-1 leading-relaxed line-clamp-2">
                                 {alert.message}
                              </p>
                              <div className="mt-3 flex items-center gap-1 text-[11px] font-black text-primary uppercase tracking-tighter hover:underline">
                                 Gestionar ahora <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
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
                      <p className="font-black text-on-surface">Sin alertas pendientes</p>
                      <p className="text-xs font-medium mt-1">El sistema se encuentra estable y al día.</p>
                   </div>
                 )}
              </div>
              
              {canViewAudit && (
                <button 
                  onClick={() => navigate('/auditoria')} 
                  className="mt-8 w-full py-4 border border-outline-variant rounded-2xl text-sm font-black text-on-surface-variant hover:bg-surface-container-high transition-all"
                >
                  Bitácora de Actividades
                </button>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
