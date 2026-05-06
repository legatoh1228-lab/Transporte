import React, { useState, useEffect } from 'react';
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

  const filteredActivities = activities.filter(activity => {
    const searchStr = searchTerm.toLowerCase();
    return (
      (activity.user_name && activity.user_name.toLowerCase().includes(searchStr)) ||
      (activity.action && activity.action.toLowerCase().includes(searchStr)) ||
      (activity.ip_address && activity.ip_address.toLowerCase().includes(searchStr))
    );
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-VE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  return (
    <div className="flex flex-col gap-6 font-public-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Auditoría de Seguridad</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">Registro de actividad y trazas del sistema (Syslog).</p>
        </div>
        <button className="bg-surface-container border border-outline-variant hover:bg-surface-container-high text-on-surface px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm" onClick={fetchActivities}>
          <span className="material-symbols-outlined mr-2 text-[18px]">refresh</span>
          Actualizar Logs
        </button>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-outline-variant bg-surface-container-low flex gap-4 items-center">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
            <input 
              type="text" 
              placeholder="Buscar por usuario, acción o IP..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2 pl-9 pr-4 text-sm outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-4 text-sm text-on-surface-variant border-l border-outline-variant pl-4">
            <div className="flex items-center gap-2">
               <span className="material-symbols-outlined text-[16px] text-primary">history</span> <span>{filteredActivities.length} Registros encontrados</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-on-surface">
            <thead className="bg-surface-container text-xs uppercase text-on-surface-variant font-bold">
              <tr>
                <th className="px-6 py-4">Fecha/Hora</th>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Acción</th>
                <th className="px-6 py-4">Dirección IP</th>
                <th className="px-6 py-4">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-mono text-xs">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-on-surface-variant animate-pulse font-sans">Cargando registros de auditoría...</td></tr>
              ) : filteredActivities.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-on-surface-variant font-sans">No se encontraron registros que coincidan con la búsqueda.</td></tr>
              ) : filteredActivities.map((row) => (
                <tr key={row.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4 text-on-surface-variant">{formatDate(row.created_at)}</td>
                  <td className="px-6 py-4 font-sans font-bold text-primary">@{row.user_name || 'Desconocido'}</td>
                  <td className="px-6 py-4 font-bold">{row.action}</td>
                  <td className="px-6 py-4 text-outline">{row.ip_address || 'N/A'}</td>
                  <td className="px-6 py-4 font-sans text-on-surface-variant truncate max-w-[200px]" title={row.details || 'Sin detalles'}>
                    {row.details || '--'}
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

