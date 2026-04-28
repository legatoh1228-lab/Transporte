import React from 'react';

const DUMMY_AUDIT = [
  { id: '1', date: '28/04/2026 15:20', user: 'Carlos Mendoza', action: 'CREATE_USER', resource: 'Usuarios', ip: '192.168.1.45', status: 'SUCCESS' },
  { id: '2', date: '28/04/2026 14:10', user: 'Ana Rodríguez', action: 'UPDATE_ROUTE', resource: 'Rutas', ip: '192.168.1.112', status: 'SUCCESS' },
  { id: '3', date: '28/04/2026 10:05', user: 'Sistema', action: 'LOGIN_FAILED', resource: 'Auth', ip: '203.0.113.42', status: 'FAILURE' },
  { id: '4', date: '27/04/2026 18:30', user: 'Luis Vargas', action: 'DELETE_ORG', resource: 'Organizaciones', ip: '192.168.1.5', status: 'SUCCESS' },
];

export default function Auditoria() {
  return (
    <div className="flex flex-col gap-6 font-public-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Auditoría de Seguridad</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">Registro de actividad y trazas del sistema (Syslog).</p>
        </div>
        <button className="bg-surface-container border border-outline-variant hover:bg-surface-container-high text-on-surface px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm">
          <span className="material-symbols-outlined mr-2 text-[18px]">download</span>
          Exportar Logs
        </button>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-outline-variant bg-surface-container-low flex gap-4 items-center">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
            <input 
              type="text" 
              placeholder="Buscar por usuario o acción..." 
              className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2 pl-9 pr-4 text-sm outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-4 text-sm text-on-surface-variant border-l border-outline-variant pl-4">
            <div className="flex items-center gap-2">
               <span className="material-symbols-outlined text-[16px] text-error">gpp_bad</span> <span>2 Alertas de Seguridad</span>
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
                <th className="px-6 py-4">Módulo</th>
                <th className="px-6 py-4">Dirección IP</th>
                <th className="px-6 py-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-mono text-xs">
              {DUMMY_AUDIT.map((row) => (
                <tr key={row.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4 text-on-surface-variant">{row.date}</td>
                  <td className="px-6 py-4 font-sans font-bold">{row.user}</td>
                  <td className="px-6 py-4 font-bold text-primary">{row.action}</td>
                  <td className="px-6 py-4 font-sans">{row.resource}</td>
                  <td className="px-6 py-4 text-outline">{row.ip}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded font-bold ${row.status === 'SUCCESS' ? 'text-tertiary bg-tertiary-container/20' : 'text-error bg-error-container/20'}`}>
                      {row.status}
                    </span>
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
