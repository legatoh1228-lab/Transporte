import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Organizaciones = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        setLoading(true);
        const response = await api.get('organizations/organizations/');
        setOrganizations(response.data);
      } catch (err) {
        console.error('Error fetching organizations:', err);
        setError('No se pudo conectar con el servidor de organizaciones.');
        // Fallback data for development
        setOrganizations([
          { rif: 'J-12345678-9', razon_social: 'Cooperativa TransAragua', tipo_nombre: 'Cooperativa', rep_legal_nom: 'Juan Pérez', esta_activa: true },
          { rif: 'J-98765432-1', razon_social: 'Sindicato Central Rutas', tipo_nombre: 'Sindicato', rep_legal_nom: 'María García', esta_activa: true },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrgs();
  }, []);

  return (
    <div className="space-y-6 font-public-sans">
      {/* Header Block */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant pb-4">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface">Empresas y Organizaciones</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-2xl">Administración del registro de líneas, cooperativas y empresas de transporte autorizadas.</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col lg:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
            <input className="w-full pl-9 pr-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:border-primary outline-none transition-all" placeholder="RIF, Razón Social..." type="text"/>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          <button className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-bold text-label-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Registrar Organización
          </button>
        </div>
      </div>

      {/* Data Table Container */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-20 text-center text-on-surface-variant font-body-md">Cargando organizaciones...</div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="p-table-cell-padding font-label-bold text-label-bold text-on-surface-variant">RIF</th>
                  <th className="p-table-cell-padding font-label-bold text-label-bold text-on-surface-variant">Razón Social</th>
                  <th className="p-table-cell-padding font-label-bold text-label-bold text-on-surface-variant">Tipo</th>
                  <th className="p-table-cell-padding font-label-bold text-label-bold text-on-surface-variant">Rep. Legal</th>
                  <th className="p-table-cell-padding font-label-bold text-label-bold text-on-surface-variant w-[100px]">Estado</th>
                  <th className="p-table-cell-padding font-label-bold text-label-bold text-on-surface-variant text-right w-[80px]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40 bg-surface-container-lowest">
                {organizations.length > 0 ? organizations.map((org, i) => (
                  <tr key={org.rif} className={`hover:bg-surface-container-low/60 transition-colors ${i % 2 !== 0 ? 'bg-surface-container/10' : ''}`}>
                    <td className="p-table-cell-padding font-title-sm text-title-sm text-primary font-bold">{org.rif}</td>
                    <td className="p-table-cell-padding font-body-sm text-body-sm text-on-surface font-medium">{org.razon_social}</td>
                    <td className="p-table-cell-padding font-body-sm text-body-sm text-on-surface-variant">{org.tipo_nombre || 'No especificado'}</td>
                    <td className="p-table-cell-padding font-body-sm text-body-sm text-on-surface">{org.rep_legal_nom}</td>
                    <td className="p-table-cell-padding">
                      <span className={`px-2 py-1 rounded-sm text-[10px] font-label-bold uppercase tracking-wider border ${org.esta_activa ? 'bg-tertiary-fixed text-on-tertiary-fixed border-tertiary-fixed-dim/50' : 'bg-error-container text-on-error-container border-error/20'}`}>
                        {org.esta_activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="p-table-cell-padding text-right">
                      <button className="p-1.5 text-outline hover:text-primary transition-colors rounded hover:bg-surface-container">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="p-10 text-center text-on-surface-variant font-body-sm">No se encontraron organizaciones registradas.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        {/* Table Footer */}
        <div className="p-4 border-t border-outline-variant bg-surface-container-low flex items-center justify-between">
          <p className="font-body-sm text-body-sm text-on-surface-variant">Mostrando <span className="font-medium text-on-surface">{organizations.length}</span> organizaciones</p>
        </div>
      </div>
      {error && <div className="text-error font-label-sm text-center">{error}</div>}
    </div>
  );
};

export default Organizaciones;
