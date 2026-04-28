import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const response = await api.get('fleet/vehicles/');
        setVehicles(response.data);
      } catch (err) {
        console.error('Error fetching vehicles:', err);
        setError('No se pudo conectar con el servidor de flota.');
        // Fallback data for development if API fails
        setVehicles([
          { placa: 'AB123CD', modalidad_nombre: 'Transporte Urbano', marca: 'Encava', modelo: 'E-NT610', anio: 2018, status: 'Activo' },
          { placa: 'XY987ZT', modalidad_nombre: 'Interurbano', marca: 'Yutong', modelo: 'ZK6122H', anio: 2020, status: 'Mantenimiento' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  return (
    <div className="space-y-6 font-public-sans">
      {/* Header Block */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant pb-4">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface">Registro de Vehículos</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-2xl">Gestione la base de datos de la flota, monitoree el estado operativo y registre nuevas unidades de transporte.</p>
        </div>
      </div>

      {/* Controls Bento Card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col lg:flex-row gap-4 justify-between items-center relative overflow-hidden group shadow-sm">
        <div className="absolute top-0 left-0 w-1 h-full bg-secondary opacity-50 group-hover:opacity-100 transition-opacity"></div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
            <input className="w-full pl-9 pr-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Placa, marca..." type="text"/>
          </div>
          {/* Filter: Modality */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">commute</span>
            <select className="pl-9 pr-8 py-2 bg-surface border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer hover:bg-surface-container-low transition-colors min-w-[160px]">
              <option value="">Todas las Modalidades</option>
              <option value="urban">Urbano</option>
              <option value="intercity">Interurbano</option>
              <option value="taxi">Taxi / Ejecutivo</option>
              <option value="cargo">Carga Pesada</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">arrow_drop_down</span>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          <button className="px-4 py-2 bg-surface-container-lowest border border-secondary text-secondary rounded-lg font-label-bold text-label-bold flex items-center gap-2 hover:bg-secondary/5 transition-colors">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Exportar
          </button>
          <button className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-bold text-label-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nuevo Vehículo
          </button>
        </div>
      </div>

      {/* Data Table Container */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center text-on-surface-variant font-body-md">Cargando flota institucional...</div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="p-table-cell-padding font-label-bold text-label-bold text-on-surface-variant w-[140px]">Placa</th>
                  <th className="p-table-cell-padding font-label-bold text-label-bold text-on-surface-variant w-[160px]">Modalidad</th>
                  <th className="p-table-cell-padding font-label-bold text-label-bold text-on-surface-variant">Marca / Modelo</th>
                  <th className="p-table-cell-padding font-label-bold text-label-bold text-on-surface-variant w-[120px]">Año</th>
                  <th className="p-table-cell-padding font-label-bold text-label-bold text-on-surface-variant w-[120px]">Estado</th>
                  <th className="p-table-cell-padding font-label-bold text-label-bold text-on-surface-variant text-right w-[80px]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40 bg-surface-container-lowest">
                {vehicles.length > 0 ? vehicles.map((v, i) => (
                  <tr key={v.placa} className={`hover:bg-surface-container-low/60 transition-colors group ${i % 2 !== 0 ? 'bg-surface-container/10' : ''}`}>
                    <td className="p-table-cell-padding">
                      <div className="font-title-sm text-title-sm text-primary font-bold tracking-wider bg-surface-container py-1 px-2 rounded inline-block border border-outline-variant/50">{v.placa}</div>
                    </td>
                    <td className="p-table-cell-padding font-body-sm text-body-sm text-on-surface flex items-center gap-2 mt-1">
                      <span className="material-symbols-outlined text-[16px] text-outline">directions_bus</span>
                      {v.modalidad_nombre || 'No asignada'}
                    </td>
                    <td className="p-table-cell-padding">
                      <div className="font-body-sm text-body-sm text-on-surface">{v.marca}</div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">{v.modelo}</div>
                    </td>
                    <td className="p-table-cell-padding font-body-sm text-body-sm text-on-surface">
                      {v.anio}
                    </td>
                    <td className="p-table-cell-padding">
                      <span className={`inline-flex items-center px-2 py-1 rounded-sm font-label-bold text-label-bold text-[10px] uppercase tracking-wider border ${
                        v.status === 'Activo' ? 'bg-tertiary-fixed text-on-tertiary-fixed border-tertiary-fixed-dim/50' : 
                        v.status === 'Mantenimiento' ? 'bg-error-container text-on-error-container border-error/20' : 
                        'bg-surface-container-highest text-on-surface border-outline-variant'
                      }`}>
                        {v.status || 'Registrado'}
                      </span>
                    </td>
                    <td className="p-table-cell-padding text-right">
                      <button className="p-1.5 text-outline hover:text-primary transition-colors rounded hover:bg-surface-container opacity-0 group-hover:opacity-100">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="p-10 text-center text-on-surface-variant font-body-sm">No se encontraron vehículos registrados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        {/* Table Footer / Pagination */}
        <div className="p-4 border-t border-outline-variant bg-surface-container-low flex items-center justify-between">
          <p className="font-body-sm text-body-sm text-on-surface-variant">Mostrando <span className="font-medium text-on-surface">{vehicles.length}</span> registros</p>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded text-outline hover:text-primary hover:bg-surface-container transition-colors disabled:opacity-30" disabled>
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-on-primary font-label-bold text-label-bold shadow-sm">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded text-outline hover:text-primary hover:bg-surface-container transition-colors" disabled>
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
      {error && <div className="text-error font-label-sm text-center">{error}</div>}
    </div>
  );
};

export default Vehicles;
