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
    colectores: 0,
    routes: 0,
    insumos: 0,
    fleet_distribution: [],
    operator_distribution: [],
    colector_distribution: [],
    org_distribution: [],
    route_distribution: [],
    insumos_distribution: [],
    alerts: []
  });
  const [systemName, setSystemName] = useState('Transporte Aragua Digital');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, brandingRes] = await Promise.all([
          api.get('users/dashboard-stats/'),
          api.get('catalogs/configuracion-visual/')
        ]);
        setStats(statsRes.data);
        if (brandingRes.data && brandingRes.data.nombre_sistema) {
          setSystemName(brandingRes.data.nombre_sistema);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
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
    colectores: {
      title: "Clasificación de Colectores",
      subtitle: "Distribución por instrucción",
      label: "Colectores",
      total: stats.colectores,
      data: stats.colector_distribution || [],
      iconGetter: () => 'groups'
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
    },
    insumos: {
      title: "Inventario General",
      subtitle: "Distribución por categoría de insumos",
      label: "Insumos",
      total: stats.insumos || 0,
      data: stats.insumos_distribution || [],
      iconGetter: () => 'category'
    }
  };

  const activeComposition = compositionConfig[selectedComposition];
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Clear hover state when composition tab changes
  useEffect(() => {
    setHoveredIndex(null);
  }, [selectedComposition]);

  const radius = 36;
  const circumference = 2 * Math.PI * radius; // ~226.195

  let accumulatedPercent = 0;
  const donutSlices = (activeComposition.data || []).map((item, index) => {
    const percentage = Number(item.percentage) || 0;
    const strokeLength = (percentage / 100) * circumference;
    const strokeOffset = - (accumulatedPercent / 100) * circumference;
    accumulatedPercent += percentage;
    
    // For visual spacing between slices, subtract a tiny gap if length is enough
    const visualLength = strokeLength > 3 ? strokeLength - 1.5 : strokeLength;
    
    return {
      ...item,
      index,
      strokeLength: visualLength,
      strokeOffset,
      percentage
    };
  });

  const chartColors = ['#0ea5e9', '#f97316', '#10b981', '#8b5cf6', '#f43f5e'];
  const hasData = donutSlices.length > 0 && activeComposition.total > 0;

  const getAxisIcon = (name) => {
    const n = name.toUpperCase();
    if (n.includes('METRO')) return 'location_city';
    if (n.includes('ESTE')) return 'east';
    if (n.includes('SUR')) return 'south';
    if (n.includes('COSTA') || n.includes('NORTE')) return 'sailing';
    return 'explore';
  };

  const axisStyles = [
    {
      text: 'text-primary',
      bg: 'bg-primary',
      lightBg: 'bg-primary/10',
      border: 'border-primary/20 hover:border-primary/50',
      icon: 'location_city'
    },
    {
      text: 'text-secondary',
      bg: 'bg-secondary',
      lightBg: 'bg-secondary/10',
      border: 'border-secondary/20 hover:border-secondary/50',
      icon: 'east'
    },
    {
      text: 'text-tertiary',
      bg: 'bg-tertiary',
      lightBg: 'bg-tertiary/10',
      border: 'border-tertiary/20 hover:border-tertiary/50',
      icon: 'south'
    },
    {
      text: 'text-error',
      bg: 'bg-error',
      lightBg: 'bg-error/10',
      border: 'border-error/20 hover:border-error/50',
      icon: 'sailing'
    }
  ];

  return (
    <div className="space-y-10 font-public-sans pb-10">
      {/* Page Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-4">
        <div>
          <h2 className="text-4xl font-black text-on-surface tracking-tight mb-2">Panel Ejecutivo</h2>
          <div className="flex items-center gap-2 text-on-surface-variant/80">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <p className="text-sm font-medium">{systemName} • Tiempo Real</p>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { label: 'Organizaciones', value: stats.organizations, icon: 'corporate_fare', bgClass: 'bg-primary/10', textClass: 'text-primary', path: '/organizaciones' },
          { label: 'Unidades Activas', value: stats.vehicles, icon: 'directions_bus', bgClass: 'bg-secondary/10', textClass: 'text-secondary', path: '/vehiculos' },
          { label: 'Operadores', value: stats.operators, icon: 'person_pin', bgClass: 'bg-tertiary/10', textClass: 'text-tertiary', path: '/operadores' },
          { label: 'Colectores', value: stats.colectores, icon: 'groups', bgClass: 'bg-primary/10', textClass: 'text-primary', path: '/colectores' },
          { label: 'Rutas Digitales', value: stats.routes, icon: 'alt_route', bgClass: 'bg-error/10', textClass: 'text-error', path: '/rutas' }
        ].map((card, i) => (
          <div 
            key={i}
            onClick={() => navigate(card.path)}
            className="group relative overflow-hidden bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-5 flex items-center gap-5 transition-all duration-300 hover:shadow-lg hover:border-outline-variant/80 cursor-pointer hover:-translate-y-1"
          >
             {/* Subtle color highlight at the bottom */}
             <div className={`absolute bottom-0 left-0 right-0 h-[3px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ${card.textClass.includes('text-primary') ? 'bg-primary' : card.textClass.includes('text-secondary') ? 'bg-secondary' : card.textClass.includes('text-tertiary') ? 'bg-tertiary' : 'bg-error'}`}></div>

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
          <div className="bg-surface-container-lowest border border-outline-variant rounded-[40px] p-8 md:p-10 flex flex-col shadow-sm relative overflow-hidden group">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--color-primary) 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
            
            <h3 className="text-2xl font-black text-on-surface mb-6 relative z-10">Resumen de Composición</h3>
            
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-10 relative z-10">
              <div className="flex flex-col gap-3">
                {/* Premium Filter Chips */}
                <div className="flex flex-wrap items-center gap-0.5 bg-surface-container p-0.5 rounded-xl w-fit border border-outline-variant/30 shadow-inner">
                  {[
                    { id: 'vehiculos', icon: 'directions_bus', label: 'Flota' },
                    { id: 'operadores', icon: 'badge', label: 'Operadores' },
                    { id: 'colectores', icon: 'groups', label: 'Colectores' },
                    { id: 'organizaciones', icon: 'corporate_fare', label: 'Gremios' },
                    { id: 'rutas', icon: 'alt_route', label: 'Rutas' },
                    { id: 'insumos', icon: 'inventory_2', label: 'Insumos' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedComposition(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
                        selectedComposition === tab.id 
                        ? 'bg-primary text-on-primary shadow-sm' 
                        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-on-surface-variant font-bold ml-1 opacity-60 tracking-widest uppercase">{activeComposition.subtitle}</p>
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

            <div className="flex flex-col xl:flex-row items-center xl:items-start gap-12 xl:gap-16 relative z-10 w-full">
              {/* SVG Donut Chart */}
              <div className="relative w-56 h-56 md:w-64 md:h-64 flex-shrink-0 flex items-center justify-center select-none">
                {hasData ? (
                  <svg 
                    viewBox="0 0 100 100" 
                    className="w-full h-full transform -rotate-90 origin-center filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.04)] dark:drop-shadow-[0_8px_16px_rgba(0,0,0,0.25)]"
                  >
                    {/* Background track circle for depth */}
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="transparent"
                      stroke="var(--color-surface-container-high)"
                      strokeWidth="8"
                      className="opacity-40"
                    />
                    {donutSlices.map((slice) => {
                      const color = chartColors[slice.index % chartColors.length];
                      const isHovered = hoveredIndex === slice.index;
                      const isAnyHovered = hoveredIndex !== null;
                      
                      return (
                        <circle
                          key={`${selectedComposition}-${slice.name}`}
                          cx="50"
                          cy="50"
                          r={radius}
                          fill="transparent"
                          stroke={color}
                          strokeWidth={isHovered ? 12 : 8.5}
                          strokeDasharray={`${slice.strokeLength} ${circumference}`}
                          strokeDashoffset={slice.strokeOffset}
                          strokeLinecap="round"
                          className="transition-all duration-300 cursor-pointer ease-out"
                          style={{
                            opacity: isAnyHovered ? (isHovered ? 1 : 0.35) : 0.95,
                            transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                            transformOrigin: 'center'
                          }}
                          onMouseEnter={() => setHoveredIndex(slice.index)}
                          onMouseLeave={() => setHoveredIndex(null)}
                        />
                      );
                    })}
                  </svg>
                ) : (
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="transparent"
                      stroke="var(--color-outline-variant)"
                      strokeWidth="6"
                      strokeDasharray="4 4"
                      className="opacity-40"
                    />
                  </svg>
                )}
                
                {/* Dynamic Center Text Container */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  {hoveredIndex === null ? (
                    <div className="transition-all duration-300 transform scale-100 opacity-100 flex flex-col items-center">
                      <span className="text-3.5xl font-black text-on-surface leading-none tracking-tight">{activeComposition.total}</span>
                      <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mt-2">{activeComposition.label}</span>
                    </div>
                  ) : (
                    <div className="transition-all duration-300 transform scale-105 opacity-100 flex flex-col items-center px-4 max-w-full">
                      <span 
                        className="text-4xl font-black leading-none transition-colors" 
                        style={{ color: chartColors[hoveredIndex % chartColors.length] }}
                      >
                        {Number(activeComposition.data[hoveredIndex]?.percentage || 0).toFixed(
                          (activeComposition.data[hoveredIndex]?.percentage || 0) % 1 === 0 ? 0 : 1
                        )}%
                      </span>
                      <span className="text-[10px] font-black text-on-surface uppercase tracking-widest mt-2 truncate w-[130px] text-center">
                        {activeComposition.data[hoveredIndex]?.name}
                      </span>
                      <span className="text-[11px] font-bold text-on-surface-variant/80 mt-0.5">
                        {activeComposition.data[hoveredIndex]?.count} {activeComposition.label}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Composition Cards Grid (Legend) */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4 w-full">
                {activeComposition.data.map((item, index) => {
                    const color = chartColors[index % chartColors.length];
                    const icon = activeComposition.iconGetter(item.name);
                    const percentageStr = Number(item.percentage).toFixed(item.percentage % 1 === 0 ? 0 : 1);
                    const isHovered = hoveredIndex === index;
                    const isAnyHovered = hoveredIndex !== null;

                    return (
                      <div 
                        key={item.name} 
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        className={`flex flex-col p-4 rounded-[22px] bg-surface-container-lowest border transition-all duration-300 cursor-pointer min-w-0 ${
                          isHovered 
                            ? 'border-primary/50 shadow-md translate-x-1' 
                            : 'border-outline-variant/30 hover:border-outline-variant/60 shadow-sm'
                        }`}
                        style={{
                          opacity: isAnyHovered && !isHovered ? 0.6 : 1,
                          transform: isHovered ? 'scale(1.015) translateX(3px)' : 'scale(1) translateX(0px)'
                        }}
                      >
                        <div className="flex items-center justify-between min-w-0">
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            {/* Styled Icon Container */}
                            <div 
                              className="w-11 h-11 rounded-xl flex items-center justify-center shadow-inner flex-shrink-0 transition-transform duration-500"
                              style={{ 
                                backgroundColor: `${color}15`, 
                                color: color,
                                transform: isHovered ? 'rotate(-6deg) scale(1.1)' : 'none'
                              }}
                            >
                              <span className="material-symbols-outlined text-[22px]">{icon}</span>
                            </div>
                            
                            <div className="flex flex-col min-w-0 flex-1">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }}></span>
                                <span className="text-sm font-black text-on-surface tracking-tight truncate" title={item.name}>
                                  {item.name}
                                </span>
                              </div>
                              <span className="text-[11px] font-bold text-on-surface-variant/80 mt-1 uppercase tracking-wider">
                                {item.count} {activeComposition.label}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center pl-4 ml-2 border-l border-outline-variant/20 flex-shrink-0">
                            <span className="text-lg font-black tracking-tight" style={{ color: color }}>
                              {percentageStr}%
                            </span>
                          </div>
                        </div>
                        
                        {/* Inline progress bar */}
                        <div className="w-full bg-surface-container rounded-full h-1.5 mt-3 overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-700 ease-out" 
                            style={{ 
                              width: `${item.percentage}%`,
                              backgroundColor: color
                            }}
                          />
                        </div>
                      </div>
                    );
                })}
              </div>
            </div>
          </div>

          {/* Second Block: Territorial Axis */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-[40px] p-8 md:p-10 flex flex-col shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--color-primary) 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div>
                <h3 className="text-xl font-black text-on-surface">Distribución por Eje Territorial</h3>
                <p className="text-sm text-on-surface-variant font-medium">Concentración de rutas en el estado Aragua</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">map</span>
              </div>
            </div>

            {stats.axis_distribution && stats.axis_distribution.length > 0 && (
              <div className="space-y-6 relative z-10">
                {/* Single, Sleek Unified Stacked Bar */}
                <div className="h-4 w-full rounded-full overflow-hidden flex shadow-inner bg-surface-container-high/40 border border-outline-variant/20">
                  {stats.axis_distribution.map((axis, i) => {
                    const colors = [
                      'var(--color-primary)',      // Deep Blue
                      'var(--color-secondary)',    // Secondary Slate
                      'var(--color-tertiary)',     // Violet / Green
                      'var(--color-error)'         // Red
                    ];
                    const color = colors[i % colors.length];
                    return (
                      <div 
                        key={i} 
                        style={{ width: `${axis.percentage}%`, backgroundColor: color }}
                        className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-500 group relative cursor-pointer"
                        title={`${axis.name}: ${axis.count} rutas (${axis.percentage}%)`}
                      >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Minimalist Legend Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.axis_distribution.map((axis, i) => {
                    const colors = [
                      'var(--color-primary)',
                      'var(--color-secondary)',
                      'var(--color-tertiary)',
                      'var(--color-error)'
                    ];
                    const color = colors[i % colors.length];
                    const borderColors = [
                      'border-primary/20 hover:border-primary/45',
                      'border-secondary/20 hover:border-secondary/45',
                      'border-tertiary/20 hover:border-tertiary/45',
                      'border-error/20 hover:border-error/45'
                    ];
                    const textColors = [
                      'text-primary',
                      'text-secondary',
                      'text-tertiary',
                      'text-error'
                    ];

                    return (
                      <div 
                        key={i} 
                        className={`flex flex-col p-4 rounded-2xl bg-surface-container-lowest border ${borderColors[i % borderColors.length]} transition-all duration-300 hover:shadow-sm`}
                      >
                        {/* Bullet color + Axis name */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }}></span>
                          <span className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest truncate" title={axis.name}>
                            {axis.name}
                          </span>
                        </div>
                        {/* Compact unified numbers */}
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-xl font-black text-on-surface leading-none">
                            {axis.count}
                          </span>
                          <span className="text-[11px] font-bold text-on-surface-variant">
                            rutas
                          </span>
                          <span className={`text-[12px] font-black ml-auto ${textColors[i % textColors.length]}`}>
                            {Number(axis.percentage).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {canViewAlerts && (
          <div className="lg:col-span-4 h-full">
             <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-[40px] p-6 xl:p-8 flex flex-col shadow-sm relative overflow-hidden h-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 flex-shrink-0">
                   <div className="flex flex-wrap items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-error/10 flex items-center justify-center">
                         <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>notifications_active</span>
                      </div>
                      <h3 className="text-xl font-black text-on-surface">Notificaciones</h3>
                   </div>
                   <div className="flex items-center gap-2 self-start sm:self-auto">
                      {stats.alerts.length > 0 && (
                        <span className="bg-error text-on-error text-[12px] font-black px-3 py-1 rounded-full animate-pulse shadow-sm">
                           {stats.alerts.length} nuevas
                        </span>
                      )}
                   </div>
                </div>

                <div className="space-y-4 flex-1 min-h-0 overflow-y-auto max-h-[520px] pr-2 custom-scrollbar">
                   {stats.alerts.length > 0 ? (
                     stats.alerts.slice(0, 6).map((alert, index) => (
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
