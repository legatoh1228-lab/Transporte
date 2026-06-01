import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Consolidado = () => {
  const [filterType, setFilterType] = useState('municipio'); // municipio, gremio, organizacion
  const [filterId, setFilterId] = useState('');
  
  const [options, setOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  
  const [data, setData] = useState({
    metrics: { organizaciones: 0, vehiculos: 0, operadores: 0, rutas: 0 },
    lists: { organizaciones: [], vehiculos: [], operadores: [], rutas: [] }
  });
  const [loadingData, setLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState('vehiculos'); // vehiculos, operadores, organizaciones, rutas

  // Fetch filter options based on filterType
  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true);
      try {
        let endpoint = '';
        if (filterType === 'municipio') endpoint = 'catalogs/municipios/';
        else if (filterType === 'gremio') endpoint = 'organizations/gremios/';
        else if (filterType === 'organizacion') endpoint = 'organizations/organizations/';

        const res = await api.get(endpoint);
        setOptions(res.data);
        if (res.data.length > 0) {
          setFilterId(res.data[0].id || res.data[0].rif);
        } else {
          setFilterId('');
        }
      } catch (error) {
        console.error("Error fetching options:", error);
      }
      setLoadingOptions(false);
    };
    fetchOptions();
  }, [filterType]);

  // Fetch stats when user clicks search
  const handleSearch = async () => {
    if (!filterId) return;
    setLoadingData(true);
    try {
      const res = await api.get(`users/consolidado-stats/?tipo=${filterType}&id=${filterId}`);
      setData(res.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
    setLoadingData(false);
  };

  const getOptionName = (opt) => {
    if (filterType === 'municipio') return opt.nombre;
    if (filterType === 'gremio' || filterType === 'organizacion') return opt.razon_social;
    return '';
  };

  const tabs = [
    { id: 'vehiculos', label: 'Flota / Vehículos', icon: 'directions_bus' },
    { id: 'operadores', label: 'Operadores', icon: 'badge' },
    { id: 'rutas', label: 'Rutas', icon: 'alt_route' },
    { id: 'organizaciones', label: 'Organizaciones', icon: 'corporate_fare' }
  ];

  return (
    <div className="space-y-6 font-public-sans pb-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
        <div>
          <h2 className="text-3xl font-black text-on-surface tracking-tight">Reporte Consolidado</h2>
          <p className="text-sm font-medium text-on-surface-variant">
            Visualiza métricas cruzadas por Municipio, Gremio u Organización
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Agrupar Por</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant text-on-surface rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
            >
              <option value="municipio">Municipio</option>
              <option value="gremio">Gremio / Sindicato</option>
              <option value="organizacion">Organización</option>
            </select>
          </div>
          <div className="flex-[2] w-full">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Seleccione</label>
            <select
              value={filterId}
              onChange={(e) => setFilterId(e.target.value)}
              disabled={loadingOptions}
              className="w-full bg-surface-container border border-outline-variant text-on-surface rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
            >
              {loadingOptions ? (
                <option value="">Cargando...</option>
              ) : (
                options.map(opt => (
                  <option key={opt.id || opt.rif} value={opt.id || opt.rif}>
                    {getOptionName(opt)}
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="w-full md:w-auto">
            <button
              onClick={handleSearch}
              disabled={!filterId || loadingData}
              className="w-full bg-primary text-on-primary font-bold px-8 py-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {loadingData ? (
                <span className="material-symbols-outlined animate-spin">refresh</span>
              ) : (
                <span className="material-symbols-outlined">search</span>
              )}
              Consultar
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {data && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Vehículos', val: data.metrics.vehiculos, icon: 'directions_bus', color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Operadores', val: data.metrics.operadores, icon: 'badge', color: 'text-secondary', bg: 'bg-secondary/10' },
              { label: 'Rutas', val: data.metrics.rutas, icon: 'alt_route', color: 'text-error', bg: 'bg-error/10' },
              { label: 'Organizaciones', val: data.metrics.organizaciones, icon: 'corporate_fare', color: 'text-tertiary', bg: 'bg-tertiary/10' }
            ].map((card, idx) => (
              <div key={idx} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.bg} ${card.color}`}>
                  <span className="material-symbols-outlined text-[24px]">{card.icon}</span>
                </div>
                <div>
                  <p className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest opacity-80">{card.label}</p>
                  <p className="text-3xl font-black text-on-surface leading-none mt-1">{card.val}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Details Tabs */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
            <div className="flex overflow-x-auto border-b border-outline-variant custom-scrollbar">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-bold text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id 
                    ? 'border-b-2 border-primary text-primary bg-primary/5' 
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                  {tab.label}
                  <span className="ml-2 bg-surface-container-high text-xs px-2 py-0.5 rounded-full">
                    {data.lists[tab.id]?.length || 0}
                  </span>
                </button>
              ))}
            </div>

            <div className="p-0 max-h-[500px] overflow-y-auto custom-scrollbar">
              {activeTab === 'vehiculos' && (
                <div className="w-full overflow-x-auto pb-4">
<table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container sticky top-0 z-10">
                    <tr>
                      <th className="p-4 text-xs font-black text-on-surface-variant uppercase tracking-wider">Placa</th>
                      <th className="p-4 text-xs font-black text-on-surface-variant uppercase tracking-wider">Marca/Modelo</th>
                      <th className="p-4 text-xs font-black text-on-surface-variant uppercase tracking-wider">Modalidad</th>
                      <th className="p-4 text-xs font-black text-on-surface-variant uppercase tracking-wider">Organización</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/50">
                    {data.lists.vehiculos.map((v, i) => (
                      <tr key={i} className="hover:bg-surface-container-low/50">
                        <td className="p-4 font-bold text-on-surface">{v.placa}</td>
                        <td className="p-4 text-sm text-on-surface-variant">{v.marca} {v.modelo}</td>
                        <td className="p-4 text-sm text-on-surface-variant">{v.modalidad__nombre}</td>
                        <td className="p-4 text-sm text-on-surface-variant truncate max-w-[200px]">{v.org__razon_social}</td>
                      </tr>
                    ))}
                    {data.lists.vehiculos.length === 0 && (
                      <tr><td colSpan="4" className="p-8 text-center text-on-surface-variant">No hay vehículos registrados en este filtro.</td></tr>
                    )}
                  </tbody>
                </table>
</div>
              )}

              {activeTab === 'operadores' && (
                <div className="w-full overflow-x-auto pb-4">
<table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container sticky top-0 z-10">
                    <tr>
                      <th className="p-4 text-xs font-black text-on-surface-variant uppercase tracking-wider">Cédula</th>
                      <th className="p-4 text-xs font-black text-on-surface-variant uppercase tracking-wider">Nombre Completo</th>
                      <th className="p-4 text-xs font-black text-on-surface-variant uppercase tracking-wider">Licencia</th>
                      <th className="p-4 text-xs font-black text-on-surface-variant uppercase tracking-wider">Organización</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/50">
                    {data.lists.operadores.map((o, i) => (
                      <tr key={i} className="hover:bg-surface-container-low/50">
                        <td className="p-4 font-bold text-on-surface">{o.cedula}</td>
                        <td className="p-4 text-sm text-on-surface-variant">{o.nombres} {o.apellidos}</td>
                        <td className="p-4 text-sm text-on-surface-variant">Grado {o.grado_licencia}</td>
                        <td className="p-4 text-sm text-on-surface-variant truncate max-w-[200px]">{o.org__razon_social}</td>
                      </tr>
                    ))}
                    {data.lists.operadores.length === 0 && (
                      <tr><td colSpan="4" className="p-8 text-center text-on-surface-variant">No hay operadores registrados en este filtro.</td></tr>
                    )}
                  </tbody>
                </table>
</div>
              )}

              {activeTab === 'rutas' && (
                <div className="w-full overflow-x-auto pb-4">
<table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container sticky top-0 z-10">
                    <tr>
                      <th className="p-4 text-xs font-black text-on-surface-variant uppercase tracking-wider">Nombre de Ruta</th>
                      <th className="p-4 text-xs font-black text-on-surface-variant uppercase tracking-wider">Tipo</th>
                      <th className="p-4 text-xs font-black text-on-surface-variant uppercase tracking-wider">Trayecto</th>
                      <th className="p-4 text-xs font-black text-on-surface-variant uppercase tracking-wider">Distancia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/50">
                    {data.lists.rutas.map((r, i) => (
                      <tr key={i} className="hover:bg-surface-container-low/50">
                        <td className="p-4 font-bold text-on-surface">{r.nombre}</td>
                        <td className="p-4 text-sm text-on-surface-variant">{r.tipo__nombre}</td>
                        <td className="p-4 text-sm text-on-surface-variant">{r.municipio_or__nombre} - {r.municipio_des__nombre}</td>
                        <td className="p-4 text-sm font-medium text-primary">{r.distancia_km} km</td>
                      </tr>
                    ))}
                    {data.lists.rutas.length === 0 && (
                      <tr><td colSpan="4" className="p-8 text-center text-on-surface-variant">No hay rutas registradas en este filtro.</td></tr>
                    )}
                  </tbody>
                </table>
</div>
              )}

              {activeTab === 'organizaciones' && (
                <div className="w-full overflow-x-auto pb-4">
<table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container sticky top-0 z-10">
                    <tr>
                      <th className="p-4 text-xs font-black text-on-surface-variant uppercase tracking-wider">RIF</th>
                      <th className="p-4 text-xs font-black text-on-surface-variant uppercase tracking-wider">Razón Social</th>
                      <th className="p-4 text-xs font-black text-on-surface-variant uppercase tracking-wider">Tipo</th>
                      <th className="p-4 text-xs font-black text-on-surface-variant uppercase tracking-wider">Municipio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/50">
                    {data.lists.organizaciones.map((org, i) => (
                      <tr key={i} className="hover:bg-surface-container-low/50">
                        <td className="p-4 font-bold text-on-surface">{org.rif}</td>
                        <td className="p-4 text-sm text-on-surface-variant">{org.razon_social}</td>
                        <td className="p-4 text-sm text-on-surface-variant">{org.tipo__nombre}</td>
                        <td className="p-4 text-sm text-on-surface-variant">{org.municipio__nombre}</td>
                      </tr>
                    ))}
                    {data.lists.organizaciones.length === 0 && (
                      <tr><td colSpan="4" className="p-8 text-center text-on-surface-variant">No hay organizaciones en este filtro.</td></tr>
                    )}
                  </tbody>
                </table>
</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Consolidado;
