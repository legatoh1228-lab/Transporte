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

  // Helper to get bar color based on index
  const getBarColor = (index) => {
    const colors = ['bg-primary', 'bg-secondary', 'bg-tertiary-fixed-dim', 'bg-error', 'bg-primary-container'];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-8 font-public-sans">
      {/* Page Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-display-lg text-display-lg text-primary mb-2">Vista General de la Plataforma</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Panel de control centralizado para la red de transporte de Aragua.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {canCreateOrg && (
            <button 
              onClick={() => navigate('/organizaciones')}
              className="bg-surface-container-lowest border border-outline-variant text-primary font-label-bold text-label-bold px-4 py-2.5 rounded flex items-center gap-2 hover:bg-surface-container-low transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add_business</span>
              Nueva Org.
            </button>
          )}
          {canCreateVeh && (
            <button 
              onClick={() => navigate('/vehiculos')}
              className="bg-primary text-on-primary font-label-bold text-label-bold px-4 py-2.5 rounded flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">directions_bus</span>
              Registrar Vehículo
            </button>
          )}
        </div>

      </div>

      {/* Bento Grid: Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div 
          onClick={() => navigate('/organizaciones')}
          className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col hover:bg-surface-container-low/50 transition-all shadow-sm cursor-pointer hover:-translate-y-1"
        >
          <div className="flex items-center gap-3 mb-4 text-on-surface-variant">
            <span className="material-symbols-outlined text-secondary bg-secondary-fixed p-2 rounded-lg" style={{ fontVariationSettings: "'FILL' 1" }}>corporate_fare</span>
            <h3 className="font-title-sm text-title-sm">Organizaciones</h3>
          </div>
          <div className="mt-auto">
            <div className="font-display-lg text-display-lg text-primary text-[36px]">{stats.organizations}</div>
            <div className="flex items-center gap-1 mt-1 text-tertiary font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              <span>Registros en base de datos</span>
            </div>
          </div>
        </div>
        {/* Card 2 */}
        <div 
          onClick={() => navigate('/vehiculos')}
          className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col hover:bg-surface-container-low/50 transition-all shadow-sm cursor-pointer hover:-translate-y-1"
        >
          <div className="flex items-center gap-3 mb-4 text-on-surface-variant">
            <span className="material-symbols-outlined text-secondary bg-secondary-fixed p-2 rounded-lg" style={{ fontVariationSettings: "'FILL' 1" }}>directions_bus</span>
            <h3 className="font-title-sm text-title-sm">Vehículos Registrados</h3>
          </div>
          <div className="mt-auto">
            <div className="font-display-lg text-display-lg text-primary text-[36px]">{stats.vehicles}</div>
            <div className="flex items-center gap-1 mt-1 text-tertiary font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              <span>Unidades activas</span>
            </div>
          </div>
        </div>
        {/* Card 3 */}
        <div 
          onClick={() => navigate('/operadores')}
          className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col hover:bg-surface-container-low/50 transition-all shadow-sm cursor-pointer hover:-translate-y-1"
        >
          <div className="flex items-center gap-3 mb-4 text-on-surface-variant">
            <span className="material-symbols-outlined text-secondary bg-secondary-fixed p-2 rounded-lg" style={{ fontVariationSettings: "'FILL' 1" }}>person_pin</span>
            <h3 className="font-title-sm text-title-sm">Operadores Activos</h3>
          </div>
          <div className="mt-auto">
            <div className="font-display-lg text-display-lg text-primary text-[36px]">{stats.operators}</div>
            <div className="flex items-center gap-1 mt-1 text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px]">sync</span>
              <span>Conductores registrados</span>
            </div>
          </div>
        </div>
        {/* Card 4 */}
        <div 
          onClick={() => navigate('/rutas')}
          className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col hover:bg-surface-container-low/50 transition-all shadow-sm cursor-pointer hover:-translate-y-1 relative overflow-hidden"
        >
          <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
            <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>alt_route</span>
          </div>
          <div className="flex items-center gap-3 mb-4 text-on-surface-variant relative z-10">
            <span className="material-symbols-outlined text-secondary bg-secondary-fixed p-2 rounded-lg" style={{ fontVariationSettings: "'FILL' 1" }}>alt_route</span>
            <h3 className="font-title-sm text-title-sm">Rutas Activas</h3>
          </div>
          <div className="mt-auto relative z-10">
            <div className="font-display-lg text-display-lg text-primary text-[36px]">{stats.routes}</div>
            <div className="flex items-center gap-1 mt-1 text-on-surface-variant font-label-sm text-label-sm">
              <span>Trazados en el sistema</span>
            </div>
          </div>
        </div>
      </div>
      {/* Bento Grid: Secondary Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline-md text-headline-md text-primary">Distribución de Flota por Modalidad</h3>
            <button className="text-secondary hover:text-primary transition-colors">
              <span className="material-symbols-outlined">more_horiz</span>
            </button>
          </div>
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div className="space-y-6">
              {stats.fleet_distribution.length > 0 ? (
                stats.fleet_distribution.map((item, index) => (
                  <div key={item.name}>
                    <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant mb-1">
                      <span className="font-medium">{item.name}</span>
                      <span className="font-bold text-primary">{item.percentage}% ({item.count})</span>
                    </div>
                    <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getBarColor(index)} rounded-full transition-all duration-1000`} 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-on-surface-variant italic">
                  No hay datos de flota registrados.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Required / Alerts Column */}
        <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              <h3 className="font-headline-md text-headline-md text-primary">Acciones Requeridas</h3>
            </div>
            {stats.alerts.length > 0 && (
              <span className="bg-error text-on-error text-[10px] font-bold px-2 py-0.5 rounded-full">
                {stats.alerts.length}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            {stats.alerts.length > 0 ? (
              stats.alerts.map((alert, index) => (
                <div 
                  key={index} 
                  className={`p-4 ${alert.type === 'error' ? 'bg-error-container/10 border-error-container/30' : 'bg-surface-container border-outline-variant/50'} border rounded-lg flex items-start gap-3 hover:bg-surface-container-high transition-colors cursor-pointer group`}
                  onClick={() => navigate(alert.link)}
                >
                  <span className={`material-symbols-outlined mt-0.5 ${alert.type === 'error' ? 'text-error' : 'text-secondary'}`}>
                    {alert.icon}
                  </span>
                  <div className="flex-1">
                    <h4 className={`font-title-sm text-title-sm text-[14px] ${alert.type === 'error' ? 'text-on-error-container' : 'text-primary'}`}>
                      {alert.title}
                    </h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 text-[13px] leading-relaxed">
                      {alert.message}
                    </p>
                    <div className="mt-2 text-primary font-label-bold text-label-bold text-[11px] uppercase tracking-wider group-hover:underline flex items-center gap-1">
                      Gestionar <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant">
                <span className="material-symbols-outlined text-[48px] text-tertiary/30 mb-2">check_circle</span>
                <p className="font-body-md text-body-md text-on-surface-variant">Todo al día</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant/60">No se requieren acciones inmediatas.</p>
              </div>
            )}
          </div>
          {canViewAudit && (
            <button onClick={() => navigate('/auditoria')} className="w-full mt-4 py-2 text-center text-secondary font-label-bold text-label-bold border border-outline-variant rounded hover:bg-surface-container-low transition-colors">
              Ver Registro Completo
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
