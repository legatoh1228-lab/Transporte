import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { GoogleMap, useJsApiLoader, Polyline, Marker } from '@react-google-maps/api';
import wellknown from 'wellknown';
import { GOOGLE_MAPS_API_KEY } from '../config';

const LIBRARIES = ['places', 'geometry'];

const darkTheme = [
  { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
  { "featureType": "administrative.country", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
  { "featureType": "administrative.land_parcel", "stylers": [{ "visibility": "off" }] },
  { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#181818" }] },
  { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "featureType": "poi.park", "elementType": "labels.text.stroke", "stylers": [{ "color": "#1b1b1b" }] },
  { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#8a8a8a" }] },
  { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#373737" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#3c3c3c" }] },
  { "featureType": "road.highway.controlled_access", "elementType": "geometry", "stylers": [{ "color": "#4e4e4e" }] },
  { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "featureType": "transit", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#3d3d3d" }] }
];

const Consolidado = () => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES
  });

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

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalTitle, setModalTitle] = useState('');

  // Fetch filter options based on filterType
  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true);
      try {
        let endpoint = '';
        if (filterType === 'municipio') endpoint = 'catalogs/municipios/';
        else if (filterType === 'gremio') endpoint = 'organizations/gremios/';
        else if (filterType === 'organizacion') endpoint = 'organizations/organizations/';
        else if (filterType === 'grado_licencia') {
          const grados = [
            { id: 2, nombre: 'Grado 2 (2da)' },
            { id: 3, nombre: 'Grado 3 (3ra)' },
            { id: 4, nombre: 'Grado 4 (4ta)' },
            { id: 5, nombre: 'Grado 5 (5ta)' }
          ];
          setOptions(grados);
          setFilterId(grados[0].id);
          setLoadingOptions(false);
          return;
        }

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
    if (filterType === 'municipio' || filterType === 'grado_licencia') return opt.nombre;
    if (filterType === 'gremio' || filterType === 'organizacion') return opt.razon_social;
    return '';
  };

  const handleViewDetails = async (type, id, title) => {
    setModalTitle(title);
    setModalData(null);
    setModalOpen(true);
    setModalLoading(true);
    
    try {
      let endpoint = '';
      if (type === 'vehiculos') endpoint = `fleet/vehicles/${id}/`;
      else if (type === 'operadores') endpoint = `personnel/operators/${id}/`;
      else if (type === 'rutas') endpoint = `routes/rutas/${id}/`;
      else if (type === 'organizaciones') endpoint = `organizations/organizations/${id}/`;

      const res = await api.get(endpoint);
      setModalData(res.data);
    } catch (err) {
      console.error("Error fetching details", err);
      setModalData({ error: 'No se pudo cargar la información.' });
    }
    setModalLoading(false);
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
              <option value="grado_licencia">Grado de Licencia</option>
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
                      <th className="p-4 text-xs font-black text-on-surface-variant uppercase tracking-wider w-[50px]">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/50">
                    {data.lists.vehiculos.map((v, i) => (
                      <tr key={i} className="hover:bg-surface-container-low/50">
                        <td className="p-4 font-bold text-on-surface">{v.placa}</td>
                        <td className="p-4 text-sm text-on-surface-variant">{v.marca} {v.modelo}</td>
                        <td className="p-4 text-sm text-on-surface-variant">{v.modalidad__nombre}</td>
                        <td className="p-4 text-sm text-on-surface-variant truncate max-w-[200px]">{v.org__razon_social}</td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleViewDetails('vehiculos', v.placa, `Vehículo ${v.placa}`)} className="text-primary hover:text-secondary transition-colors p-2 rounded-full hover:bg-primary/10" title="Ver Detalles">
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {data.lists.vehiculos.length === 0 && (
                      <tr><td colSpan="5" className="p-8 text-center text-on-surface-variant">No hay vehículos registrados en este filtro.</td></tr>
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
                      <th className="p-4 text-xs font-black text-on-surface-variant uppercase tracking-wider w-[50px]">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/50">
                    {data.lists.operadores.map((o, i) => (
                      <tr key={i} className="hover:bg-surface-container-low/50">
                        <td className="p-4 font-bold text-on-surface">{o.cedula}</td>
                        <td className="p-4 text-sm text-on-surface-variant">{o.nombres} {o.apellidos}</td>
                        <td className="p-4 text-sm text-on-surface-variant">Grado {o.grado_licencia}</td>
                        <td className="p-4 text-sm text-on-surface-variant truncate max-w-[200px]">{o.org__razon_social}</td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleViewDetails('operadores', o.cedula, `Operador ${o.nombres} ${o.apellidos}`)} className="text-primary hover:text-secondary transition-colors p-2 rounded-full hover:bg-primary/10" title="Ver Detalles">
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {data.lists.operadores.length === 0 && (
                      <tr><td colSpan="5" className="p-8 text-center text-on-surface-variant">No hay operadores registrados en este filtro.</td></tr>
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
                      <th className="p-4 text-xs font-black text-on-surface-variant uppercase tracking-wider w-[50px]">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/50">
                    {data.lists.rutas.map((r, i) => (
                      <tr key={i} className="hover:bg-surface-container-low/50">
                        <td className="p-4 font-bold text-on-surface">{r.nombre}</td>
                        <td className="p-4 text-sm text-on-surface-variant">{r.tipo__nombre}</td>
                        <td className="p-4 text-sm text-on-surface-variant">{r.municipio_or__nombre} - {r.municipio_des__nombre}</td>
                        <td className="p-4 text-sm font-medium text-primary">{r.distancia_km} km</td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleViewDetails('rutas', r.id, `Ruta: ${r.nombre}`)} className="text-primary hover:text-secondary transition-colors p-2 rounded-full hover:bg-primary/10" title="Ver Detalles">
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {data.lists.rutas.length === 0 && (
                      <tr><td colSpan="5" className="p-8 text-center text-on-surface-variant">No hay rutas registradas en este filtro.</td></tr>
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
                      <th className="p-4 text-xs font-black text-on-surface-variant uppercase tracking-wider w-[50px]">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/50">
                    {data.lists.organizaciones.map((org, i) => (
                      <tr key={i} className="hover:bg-surface-container-low/50">
                        <td className="p-4 font-bold text-on-surface">{org.rif}</td>
                        <td className="p-4 text-sm text-on-surface-variant">{org.razon_social}</td>
                        <td className="p-4 text-sm text-on-surface-variant">{org.tipo__nombre}</td>
                        <td className="p-4 text-sm text-on-surface-variant">{org.municipio__nombre}</td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleViewDetails('organizaciones', org.rif, `Organización: ${org.razon_social}`)} className="text-primary hover:text-secondary transition-colors p-2 rounded-full hover:bg-primary/10" title="Ver Detalles">
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {data.lists.organizaciones.length === 0 && (
                      <tr><td colSpan="5" className="p-8 text-center text-on-surface-variant">No hay organizaciones en este filtro.</td></tr>
                    )}
                  </tbody>
                </table>
</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest border border-outline-variant w-full max-w-3xl rounded-[32px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-outline-variant flex items-center justify-between bg-surface-container-low shrink-0">
              <h3 className="text-xl font-black text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">visibility</span>
                Detalles
              </h3>
              <button onClick={() => setModalOpen(false)} className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container hover:bg-error/10 hover:text-error transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="overflow-y-auto custom-scrollbar flex-1 bg-surface-container-lowest flex flex-col">
              {modalLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <span className="material-symbols-outlined animate-spin text-4xl text-primary">refresh</span>
                  <p className="text-sm font-bold text-on-surface-variant animate-pulse">Cargando datos precisos...</p>
                </div>
              ) : modalData?.error ? (
                <div className="p-8">
                  <div className="p-4 bg-error/10 text-error rounded-2xl flex items-center gap-3">
                    <span className="material-symbols-outlined">error</span>
                    <span className="font-bold">{modalData.error}</span>
                  </div>
                </div>
              ) : modalData ? (
                <>
                  {/* Photo Header for Operators and Vehicles */}
                  {modalData.foto && (
                    <div className="w-full h-48 bg-surface-container-high relative flex items-end justify-center pb-4 shrink-0 overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                       <img src={modalData.foto} alt="Perfil" className="absolute inset-0 w-full h-full object-cover opacity-60 blur-sm" />
                       <img 
                          src={modalData.foto} 
                          alt="Foto principal" 
                          className={`relative z-20 object-cover shadow-2xl border-4 border-surface-container-lowest ${
                            activeTab === 'operadores' ? 'w-32 h-32 rounded-full' : 'w-48 h-32 rounded-2xl'
                          }`}
                       />
                    </div>
                  )}

                  {/* Title Area */}
                  <div className="px-8 py-6 border-b border-outline-variant/50 bg-surface-container-low shrink-0 text-center">
                     <h4 className="font-black text-on-surface text-2xl truncate">{modalTitle}</h4>
                     {activeTab === 'vehiculos' && modalData.marca && <p className="text-primary font-bold">{modalData.marca} {modalData.modelo}</p>}
                     {activeTab === 'operadores' && modalData.nombres && <p className="text-primary font-bold">Grado: {modalData.grado_licencia || modalData.licencia_grado}</p>}
                  </div>

                  <div className="p-8 space-y-8 shrink-0">
                    {/* General Information Grid */}
                    <div>
                      <h4 className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-primary">feed</span>
                        Información General
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(modalData).map(([key, value]) => {
                          if (typeof value === 'object' && value !== null) return null; // Skip complex nested arrays for now
                          if (key === 'foto' || key.includes('foto')) return null; // Skip raw image urls
                          if (key === 'geom' || key === 'paradas' || key === 'id') return null; // Skip map data and IDs
                          return (
                            <div key={key} className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 flex flex-col gap-1">
                              <span className="text-[10px] font-black text-primary uppercase tracking-wider">
                                {key.replace(/_/g, ' ')}
                              </span>
                              <span className={`text-sm font-bold break-words ${value === true ? 'text-secondary' : value === false ? 'text-error' : 'text-on-surface'}`}>
                                {value === true ? 'Activo / Sí' : value === false ? 'Inactivo / No' : value || 'N/A'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Google Map Area for Routes */}
                    {(activeTab === 'rutas' && (modalData.geom || modalData.paradas) && isLoaded) && (
                      <div className="mt-8">
                        <h4 className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-4 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-error">map</span>
                          Trazado de Ruta
                        </h4>
                        <div className="w-full h-[400px] rounded-3xl overflow-hidden border border-outline-variant shadow-md">
                          <GoogleMap
                            mapContainerStyle={{ width: '100%', height: '100%' }}
                            center={
                              modalData.paradas && modalData.paradas.length > 0 && modalData.paradas[0].coord 
                              ? { lat: modalData.paradas[0].coord[0], lng: modalData.paradas[0].coord[1] } 
                              : { lat: 10.2469, lng: -67.5958 }
                            }
                            zoom={13}
                            options={{ styles: darkTheme, disableDefaultUI: true, zoomControl: true }}
                          >
                            {/* Route Path */}
                            {modalData.geom && (() => {
                              try {
                                const geojson = wellknown.parse(modalData.geom);
                                if (geojson && geojson.type === 'LineString') {
                                  const path = geojson.coordinates.map(c => ({ lat: c[1], lng: c[0] }));
                                  return (
                                    <Polyline 
                                      path={path} 
                                      options={{ strokeColor: '#3B82F6', strokeWeight: 6, strokeOpacity: 0.9 }} 
                                    />
                                  );
                                }
                              } catch(e) {}
                              return null;
                            })()}

                            {/* Stops */}
                            {modalData.paradas && modalData.paradas.map((stop, idx) => {
                               if (!stop.coord) return null;
                               const isOrigin = idx === 0;
                               const isDest = idx === modalData.paradas.length - 1;
                               const color = isOrigin ? '#3B82F6' : isDest ? '#EF4444' : '#F59E0B';
                               return (
                                 <Marker 
                                   key={idx}
                                   position={{ lat: stop.coord[0], lng: stop.coord[1] }}
                                   icon={{
                                     path: window.google.maps.SymbolPath.CIRCLE,
                                     fillColor: color,
                                     fillOpacity: 1,
                                     strokeWeight: 2,
                                     strokeColor: '#FFFFFF',
                                     scale: 8,
                                   }}
                                 />
                               );
                            })}
                          </GoogleMap>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
            
            <div className="p-4 border-t border-outline-variant bg-surface-container-low flex justify-end shrink-0">
               <button onClick={() => setModalOpen(false)} className="px-6 py-2.5 bg-surface-container-high hover:bg-outline-variant text-on-surface rounded-xl font-bold text-sm transition-colors">
                 Cerrar Detalles
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Consolidado;
