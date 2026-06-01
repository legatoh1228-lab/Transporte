import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { usePagination } from '../hooks/usePagination';
import { PaginationControls } from '../components/common/PaginationControls';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Auditoria() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [filterDate, setFilterDate] = useState('');
  const [filterUser, setFilterUser] = useState('ALL');

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

  const uniqueUsers = useMemo(() => {
    const users = activities
      .map(a => a.user_name)
      .filter((name, index, self) => name && self.indexOf(name) === index);
    return users.sort();
  }, [activities]);

  const filteredActivities = useMemo(() => {
    let result = activities;

    // Search filter
    if (searchTerm) {
      const searchStr = searchTerm.toLowerCase();
      result = result.filter(activity => (
        (activity.user_name && activity.user_name.toLowerCase().includes(searchStr)) ||
        (activity.action && activity.action.toLowerCase().includes(searchStr)) ||
        (activity.ip_address && activity.ip_address.toLowerCase().includes(searchStr)) ||
        (activity.details && activity.details.toLowerCase().includes(searchStr))
      ));
    }

    // Action filter
    if (filterAction !== 'ALL') {
      result = result.filter(activity => {
        const act = activity.action ? activity.action.toUpperCase() : '';
        if (filterAction === 'AUTH') return act.includes('LOGIN') || act.includes('SESIÓN') || act.includes('AUTH');
        if (filterAction === 'CREATE') return act.includes('CREATE') || act.includes('CREAR') || act.includes('NUEV') || act.includes('REGISTR');
        if (filterAction === 'UPDATE') return act.includes('UPDATE') || act.includes('ACTUALIZ') || act.includes('MODIFIC') || act.includes('EDIT');
        if (filterAction === 'DELETE') return act.includes('DELETE') || act.includes('ELIMIN');
        return false;
      });
    }

    // Date filter
    if (filterDate) {
      result = result.filter(activity => {
        const activityDate = new Date(activity.created_at).toISOString().split('T')[0];
        return activityDate === filterDate;
      });
    }

    // User filter
    if (filterUser !== 'ALL') {
      result = result.filter(activity => activity.user_name === filterUser);
    }

    return result;
  }, [activities, searchTerm, filterAction, filterDate, filterUser]);

  const {
    paginatedData,
    currentPage,
    totalPages,
    totalFiltered,
    startIndex,
    endIndex,
    hasNextPage,
    hasPrevPage,
    goToPage,
    nextPage,
    prevPage
  } = usePagination(filteredActivities, { itemsPerPage: 15, enableSearch: false, enableFilter: false });

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

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Fecha", "Usuario", "Operación", "IP", "Detalles"];
    const tableRows = [];

    filteredActivities.forEach(activity => {
      const activityData = [
        formatDate(activity.created_at),
        activity.user_name || 'Desconocido',
        activity.action,
        activity.ip_address || 'N/A',
        activity.details || '--'
      ];
      tableRows.push(activityData);
    });

    doc.setFontSize(18);
    doc.text("Historial de Auditoría de Seguridad", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Total de registros: ${filteredActivities.length}`, 14, 36);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 42,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [13, 71, 161] },
      margin: { top: 42 }
    });

    doc.save(`Auditoria_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="flex flex-col gap-8 font-public-sans">
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/60 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
            </div>
            <h1 className="text-2xl font-black text-on-surface tracking-tight">Auditoría de Seguridad</h1>
          </div>
          <p className="text-sm text-on-surface-variant font-medium mt-2 max-w-2xl">
            Registro inmutable de actividad y trazas del sistema (Syslog). Monitoree accesos, modificaciones estructurales y operaciones críticas.
          </p>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/60 shadow-sm rounded-2xl overflow-hidden flex flex-col">
        {/* Toolbar Avanzado - Rediseñado */}
        <div className="p-6 border-b border-outline-variant/60 bg-surface-container-low/30 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
              <input 
                type="text" 
                placeholder="Búsqueda inteligente por IP, detalles o trazas..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all shadow-sm"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-[18px] z-10 pointer-events-none">person</span>
                <select 
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-primary shadow-sm appearance-none"
                >
                  <option value="ALL">Todos los Usuarios</option>
                  {uniqueUsers.map(user => (
                    <option key={user} value={user}>@{user}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-[18px] z-10 pointer-events-none">list_alt</span>
                <select 
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-primary shadow-sm appearance-none"
                >
                  <option value="ALL">Todas las Acciones</option>
                  <option value="AUTH">Inicios de Sesión</option>
                  <option value="CREATE">Creaciones</option>
                  <option value="UPDATE">Actualizaciones</option>
                  <option value="DELETE">Eliminaciones</option>
                </select>
              </div>

              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-[18px] z-10 pointer-events-none">calendar_today</span>
                <input 
                  type="date" 
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-primary shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-outline-variant/30 mt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container/50 px-4 py-2 rounded-full border border-outline-variant/30">
                 <span className="material-symbols-outlined text-[16px] text-primary">analytics</span> 
                 <span>Resultados: <span className="text-primary">{totalFiltered}</span> de {activities.length} logs</span>
              </div>

              {(searchTerm || filterAction !== 'ALL' || filterDate || filterUser !== 'ALL') && (
                <button 
                  onClick={() => { setSearchTerm(''); setFilterAction('ALL'); setFilterDate(''); setFilterUser('ALL'); }}
                  className="text-xs font-black text-error uppercase tracking-widest flex items-center gap-1 hover:underline transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
                  Limpiar Filtros
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={fetchActivities}
                className="bg-surface-container-highest/50 border border-outline-variant/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-on-surface-variant px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center group shadow-sm"
              >
                <span className="material-symbols-outlined mr-2 text-[18px] group-hover:rotate-180 transition-transform duration-500">sync</span>
                Refrescar
              </button>
              
              <button 
                onClick={exportToPDF}
                className="bg-primary text-on-primary hover:bg-primary/90 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                Exportar Informe
              </button>
            </div>
          </div>
        </div>

        {/* Tabla Refinada */}
        <div className="overflow-x-auto">
          <div className="w-full overflow-x-auto pb-4">
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
              ) : paginatedData.map((row) => (
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
        <div className="p-4 border-t border-outline-variant bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-4">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalFiltered={totalFiltered}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={activities.length}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            onPageChange={goToPage}
            onNextPage={nextPage}
            onPrevPage={prevPage}
          />
        </div>
      </div>
    </div>
  );
}

