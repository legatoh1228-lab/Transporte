import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Alertas = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await api.get('users/alerts/');
        setAlerts(response.data);
      } catch (error) {
        console.error("Error fetching alerts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || alert.type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-public-sans pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
        <div>
          <h2 className="text-4xl font-black text-on-surface tracking-tight mb-2">Centro de Alertas</h2>
          <p className="text-sm text-on-surface-variant font-medium">Gestión preventiva de vencimientos y notificaciones del sistema</p>
        </div>
        <div className="bg-error/10 px-6 py-3 rounded-2xl border border-error/20 flex items-center gap-3">
            <span className="material-symbols-outlined text-error animate-pulse">notifications_active</span>
            <span className="text-sm font-black text-error uppercase tracking-wider">{alerts.length} Alertas Activas</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface-container-lowest border border-outline-variant/50 p-4 rounded-[28px] shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50">search</span>
          <input 
            type="text" 
            placeholder="Buscar por placa, nombre o descripción..."
            className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-2xl border-none focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button 
            onClick={() => setFilterType('all')}
            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${filterType === 'all' ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/20' : 'bg-surface-container text-on-surface-variant border-transparent hover:bg-surface-container-high'}`}
          >
            Todas
          </button>
          <button 
            onClick={() => setFilterType('error')}
            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${filterType === 'error' ? 'bg-error text-on-error border-error shadow-lg shadow-error/20' : 'bg-surface-container text-on-surface-variant border-transparent hover:bg-surface-container-high'}`}
          >
            Críticas
          </button>
          <button 
            onClick={() => setFilterType('warning')}
            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${filterType === 'warning' ? 'bg-warning-container text-on-warning-container border-warning shadow-lg' : 'bg-surface-container text-on-surface-variant border-transparent hover:bg-surface-container-high'}`}
          >
            Advertencias
          </button>
        </div>
      </div>

      {/* Alerts Grid/List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert, index) => (
            <div 
              key={index}
              className={`group bg-surface-container-lowest border border-outline-variant/40 p-6 rounded-[32px] transition-all hover:shadow-xl hover:-translate-y-1 ${alert.type === 'error' ? 'hover:border-error/30' : 'hover:border-primary/30'}`}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${alert.type === 'error' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                  <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {alert.icon}
                  </span>
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className={`text-lg font-black tracking-tight ${alert.type === 'error' ? 'text-error' : 'text-on-surface'}`}>{alert.title}</h3>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${alert.type === 'error' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                      {alert.type === 'error' ? 'Urgente' : 'Pendiente'}
                    </span>
                  </div>
                  <p className="text-on-surface-variant font-medium text-sm leading-relaxed">{alert.message}</p>
                </div>

                <div className="flex flex-col items-end gap-3 min-w-[200px]">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-50 mb-1">Fecha de Vencimiento</p>
                    <p className="font-black text-on-surface">{new Date(alert.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <button 
                    onClick={() => navigate(alert.link)}
                    className="bg-surface-container-high hover:bg-primary hover:text-on-primary transition-all px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 group/btn"
                  >
                    Gestionar Recurso
                    <span className="material-symbols-outlined text-[16px] group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-surface-container-lowest border-2 border-dashed border-outline-variant rounded-[40px] p-20 flex flex-col items-center justify-center text-center opacity-60">
            <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant">verified_user</span>
            </div>
            <h3 className="text-xl font-black text-on-surface mb-2">No se encontraron alertas</h3>
            <p className="text-sm font-medium text-on-surface-variant max-w-md">No hay notificaciones que coincidan con tus filtros actuales. Todo parece estar bajo control.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alertas;
