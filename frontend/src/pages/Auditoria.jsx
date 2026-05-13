import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';

export default function Auditoria() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await api.get('users/activities/');
      setActivities(response.data);
    } catch (err) {
      console.error("Error fetching activities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const filteredActivities = useMemo(() => {
    if (!searchTerm) return activities;
    const searchStr = searchTerm.toLowerCase();
    return activities.filter(activity => (
      (activity.user_name && activity.user_name.toLowerCase().includes(searchStr)) ||
      (activity.action && activity.action.toLowerCase().includes(searchStr)) ||
      (activity.ip_address && activity.ip_address.toLowerCase().includes(searchStr)) ||
      (activity.details && activity.details.toLowerCase().includes(searchStr))
    ));
  }, [activities, searchTerm]);

  const getActionBadge = (action) => {
    const act = action ? action.toUpperCase() : 'UNKNOWN';
    if (act.includes('LOGIN') || act.includes('INICIO DE SESIÓN') || act.includes('AUTH')) 
      return 'bg-primary/10 text-primary border-primary/20';
    if (act.includes('CREATE') || act.includes('CREAR') || act.includes('NUEV') || act.includes('REGISTR')) 
      return 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20';
    if (act.includes('UPDATE') || act.includes('ACTUALIZ') || act.includes('MODIFIC') || act.includes('EDIT')) 
      return 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20';
    if (act.includes('DELETE') || act.includes('ELIMIN') || act.includes('FAIL') || act.includes('ERROR') || act.includes('RECHAZ')) 
      return 'bg-error/10 text-error border-error/20';
    return 'bg-surface-container-highest text-on-surface border-outline-variant/50';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-VE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  return (
    <div className="flex flex-col gap-8 font-public-sans">
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/60 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
            </div>
            <h1 className="text-2xl font-black text-on-surface tracking-tight">Auditoría de Seguridad</h1>
          </div>
          <p className="text-sm text-on-surface-variant font-medium mt-2 max-w-2xl">
            Registro inmutable de actividad y trazas del sistema (Syslog). Monitoree accesos, modificaciones estructurales y operaciones críticas.
          </p>
        </div>
        <button 
          className="bg-surface-container-lowest border border-outline-variant/50 hover:bg-primary/5 hover:text-primary hover:border-primary/30 text-on-surface px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center shadow-sm group" 
          onClick={fetchActivities}
        >
          <span className="material-symbols-outlined mr-2 text-[20px] group-hover:rotate-180 transition-transform duration-500">sync</span>
          Refrescar Trazas
        </button>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/60 shadow-sm rounded-2xl overflow-hidden flex flex-col">
        {/* Toolbar Avanzado */}
        <div className="p-5 border-b border-outline-variant/60 bg-surface-container-low/30 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
            <input 
              type="text" 
              placeholder="Buscar por usuario, acción, IP o detalles..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-2.5 pl-11 pr-4 text-sm outline-none transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container px-4 py-2 rounded-lg border border-outline-variant/50">
             <span className="material-symbols-outlined text-[16px] text-primary">data_usage</span> 
             <span>{filteredActivities.length} Registros Auditados</span>
          </div>
        </div>

        {/* Tabla Refinada */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-on-surface">
            <thead className="bg-surface-container/50 text-[11px] uppercase text-on-surface-variant font-black tracking-wider border-b border-outline-variant/60">
              <tr>
                <th className="px-6 py-4">Estampa de Tiempo</th>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Operación</th>
                <th className="px-6 py-4">Dirección IP</th>
                <th className="px-6 py-4 w-1/3">Detalles Técnicos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40 bg-surface-container-lowest">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 opacity-60">
                      <span className="material-symbols-outlined text-4xl animate-spin text-primary">autorenew</span>
                      <p className="font-bold text-sm text-on-surface-variant">Extrayendo logs de seguridad...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 opacity-40">
                      <span className="material-symbols-outlined text-5xl">policy</span>
                      <p className="font-bold text-base text-on-surface">No hay hallazgos</p>
                      <p className="text-sm font-medium">La búsqueda no arrojó ningún evento coincidente en la bitácora.</p>
                    </div>
                  </td>
                </tr>
              ) : filteredActivities.map((row) => (
                <tr key={row.id} className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-mono text-xs text-on-surface-variant bg-surface-container-high/30 px-2.5 py-1 rounded-md inline-block border border-outline-variant/30">
                      {formatDate(row.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                        <span className="material-symbols-outlined text-[14px] text-primary">person</span>
                      </div>
                      <span className="font-bold text-primary text-sm hover:underline cursor-pointer">@{row.user_name || 'Desconocido'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${getActionBadge(row.action)}`}>
                      {row.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-on-surface-variant">
                      <span className="material-symbols-outlined text-[14px] opacity-70">router</span>
                      {row.ip_address || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-medium text-on-surface-variant bg-surface-container-low p-2 rounded-lg border border-outline-variant/40 leading-relaxed max-h-[60px] overflow-y-auto custom-scrollbar group-hover:bg-surface-container transition-colors" title={row.details || 'Sin detalles'}>
                      {row.details || '--'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

