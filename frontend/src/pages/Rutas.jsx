import React, { useState, useEffect } from 'react';
import { Modal } from '../components/common/Modal';
import api from '../services/api';

export default function Rutas() {
  const [routes, setRoutes] = useState([]);
  const [tiposRuta, setTiposRuta] = useState([]);
  const [vias, setVias] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);

  const [formData, setFormData] = useState({
    id: null,
    nombre: '',
    tipo: '',
    municipio_or: '',
    municipio_des: '',
    es_anillado: false,
    distancia_km: '',
    tiempo_estimado_min: '',
    numero_paradas: 0,
    tipo_via: '',
    observaciones: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resRoutes, resTipos, resVias, resMun] = await Promise.all([
        api.get('routes/routes/'),
        api.get('catalogs/tipos-ruta/'),
        api.get('catalogs/vias/'),
        api.get('catalogs/municipios/')
      ]);
      setRoutes(resRoutes.data);
      setTiposRuta(resTipos.data);
      setVias(resVias.data);
      setMunicipios(resMun.data);
      
      if (resRoutes.data.length > 0) {
        setSelectedRoute(resRoutes.data[0]);
      }
    } catch (err) {
      console.error("Error fetching rutas data:", err);
      setError("Error al cargar los datos. Verifique la conexión.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const resetForm = () => {
    setFormData({
      id: null,
      nombre: '',
      tipo: '',
      municipio_or: '',
      municipio_des: '',
      es_anillado: false,
      distancia_km: '',
      tiempo_estimado_min: '',
      numero_paradas: 0,
      tipo_via: '',
      observaciones: ''
    });
    setIsEditing(false);
    setError(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (route, e) => {
    if (e) e.stopPropagation();
    setFormData({
      id: route.id,
      nombre: route.nombre || '',
      tipo: route.tipo || '',
      municipio_or: route.municipio_or || '',
      municipio_des: route.municipio_des || '',
      es_anillado: route.es_anillado || false,
      distancia_km: route.distancia_km || '',
      tiempo_estimado_min: route.tiempo_estimado_min || '',
      numero_paradas: route.numero_paradas || 0,
      tipo_via: route.tipo_via || '',
      observaciones: route.observaciones || ''
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData };
    
    // Convert empty numbers to null
    if (payload.distancia_km === '') payload.distancia_km = null;
    if (payload.tiempo_estimado_min === '') payload.tiempo_estimado_min = null;

    try {
      if (isEditing) {
        await api.put(`routes/routes/${payload.id}/`, payload);
      } else {
        await api.post('routes/routes/', payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Error saving route:", err);
      if (err.response && err.response.data) {
        const errorMsgs = Object.entries(err.response.data)
          .map(([key, msgs]) => `${key}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(" | ");
        setError(`Error: ${errorMsgs}`);
      } else {
        setError("Error al guardar los datos.");
      }
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (window.confirm("¿Está seguro de eliminar esta ruta?")) {
      try {
        await api.delete(`routes/routes/${id}/`);
        // If the deleted route was selected, unselect it
        if (selectedRoute && selectedRoute.id === id) {
           setSelectedRoute(null);
        }
        fetchData();
      } catch (err) {
        console.error("Error deleting route:", err);
        alert("No se pudo eliminar la ruta.");
      }
    }
  };

  // Helper for names
  const getTipoName = (id) => tiposRuta.find(t => t.id === id)?.nombre || 'Desconocido';
  const getMunicipioName = (id) => municipios.find(m => m.id === id)?.nombre || 'Desconocido';

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] font-public-sans">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Gestión de Rutas</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">Configuración y trazado de las líneas de servicio</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={handleOpenCreate}
             className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center shadow-md hover:shadow-lg active:scale-95"
           >
             <span className="material-symbols-outlined mr-2 text-[18px]">add_road</span>
             Nueva Ruta
           </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Left List */}
        <div className="w-full lg:w-1/3 flex flex-col bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl overflow-hidden shrink-0 lg:shrink">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low shrink-0 flex items-center justify-between">
            <h3 className="font-bold text-on-surface text-sm uppercase tracking-wide">Rutas Activas</h3>
            <span className="bg-tertiary-container/20 text-tertiary-container text-xs font-bold px-2 py-1 rounded-md">{routes.length} Totales</span>
          </div>
          
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
             {loading ? (
                <div className="p-10 text-center text-on-surface-variant animate-pulse font-medium">Cargando rutas...</div>
             ) : routes.length === 0 ? (
                <div className="p-10 text-center text-on-surface-variant font-medium">No hay rutas configuradas.</div>
             ) : (
                routes.map((route) => {
                  const isSelected = selectedRoute && selectedRoute.id === route.id;
                  return (
                    <div 
                      key={route.id} 
                      onClick={() => setSelectedRoute(route)}
                      className={`p-4 rounded-lg cursor-pointer transition-all border group ${isSelected ? 'bg-primary-fixed border-primary-fixed-dim/50 shadow-sm' : 'bg-surface hover:bg-surface-container border-transparent'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                         <h4 className={`font-bold ${isSelected ? 'text-on-primary-fixed' : 'text-on-surface'}`}>{route.nombre}</h4>
                         <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => handleEdit(route, e)} className="text-on-surface-variant hover:text-primary p-1">
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button onClick={(e) => handleDelete(route.id, e)} className="text-on-surface-variant hover:text-error p-1">
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                         </div>
                      </div>
                      <div className="flex items-center flex-wrap gap-2 text-xs">
                         <span className={`px-2 py-0.5 rounded border font-semibold ${isSelected ? 'bg-white/40 border-primary-fixed-variant text-on-primary-fixed-variant' : 'bg-surface-container border-outline-variant text-on-surface-variant'}`}>
                           {route.tipo_nombre || getTipoName(route.tipo)}
                         </span>
                         {route.distancia_km && (
                           <span className="flex items-center text-on-surface-variant">
                             <span className="material-symbols-outlined mr-1 text-[14px]">route</span> {route.distancia_km} km
                           </span>
                         )}
                         <span className="flex items-center text-on-surface-variant">
                           <span className="material-symbols-outlined mr-1 text-[14px]">signpost</span> {route.numero_paradas} Paradas
                         </span>
                      </div>
                    </div>
                  );
                })
             )}
          </div>
        </div>

        {/* Right Details / Map Panel */}
        <div className="w-full lg:w-2/3 bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl overflow-hidden relative min-h-[400px] flex flex-col">
           {selectedRoute ? (
             <>
               {/* Selected Route Info Overlay */}
               <div className="absolute top-4 left-4 z-10 bg-surface-container-lowest/90 backdrop-blur border border-outline-variant shadow-lg rounded-xl p-5 max-w-sm">
                 <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase">{selectedRoute.tipo_nombre || getTipoName(selectedRoute.tipo)}</span>
                    {selectedRoute.es_anillado && <span className="px-2 py-0.5 rounded bg-secondary/10 text-secondary text-[10px] font-bold uppercase">Ruta Anillada</span>}
                 </div>
                 <h2 className="text-xl font-bold text-on-surface mb-4 leading-tight">{selectedRoute.nombre}</h2>
                 
                 <div className="space-y-4">
                   <div className="flex gap-3">
                     <div className="flex flex-col items-center mt-1">
                        <div className="w-3 h-3 rounded-full bg-primary border-2 border-white shadow-sm z-10"></div>
                        <div className="w-0.5 h-8 bg-outline-variant"></div>
                        <div className="w-3 h-3 rounded-full bg-error border-2 border-white shadow-sm z-10"></div>
                     </div>
                     <div className="flex flex-col justify-between">
                        <div>
                           <p className="text-[10px] font-bold text-on-surface-variant uppercase">Origen</p>
                           <p className="text-sm font-semibold text-on-surface">{selectedRoute.municipio_or_nombre || getMunicipioName(selectedRoute.municipio_or)}</p>
                        </div>
                        <div className="mt-2">
                           <p className="text-[10px] font-bold text-on-surface-variant uppercase">Destino</p>
                           <p className="text-sm font-semibold text-on-surface">{selectedRoute.municipio_des_nombre || getMunicipioName(selectedRoute.municipio_des)}</p>
                        </div>
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-3 p-3 bg-surface-container-low rounded-lg border border-outline-variant/50">
                     <div>
                       <p className="text-[10px] font-bold text-on-surface-variant uppercase flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">route</span> Distancia</p>
                       <p className="text-sm font-bold text-on-surface">{selectedRoute.distancia_km || '--'} km</p>
                     </div>
                     <div>
                       <p className="text-[10px] font-bold text-on-surface-variant uppercase flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">schedule</span> Tiempo Est.</p>
                       <p className="text-sm font-bold text-on-surface">{selectedRoute.tiempo_estimado_min || '--'} min</p>
                     </div>
                     <div>
                       <p className="text-[10px] font-bold text-on-surface-variant uppercase flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">signpost</span> Paradas</p>
                       <p className="text-sm font-bold text-on-surface">{selectedRoute.numero_paradas}</p>
                     </div>
                   </div>
                   
                   {selectedRoute.observaciones && (
                     <div>
                       <p className="text-[10px] font-bold text-on-surface-variant uppercase">Observaciones</p>
                       <p className="text-xs text-on-surface mt-1">{selectedRoute.observaciones}</p>
                     </div>
                   )}
                 </div>
               </div>

               {/* Map Background */}
               <div className="absolute inset-0 bg-[#e8eae6] overflow-hidden flex items-center justify-center">
                 <span className="material-symbols-outlined text-[120px] text-surface-container-high opacity-50">map</span>
                 {/* Decorative mock map */}
                 <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" preserveAspectRatio="none">
                   <path d="M-100,50 Q400,200 800,100 T1200,400" fill="none" stroke="#ffffff" strokeWidth="8" />
                   <path d="M200,0 L300,800" fill="none" stroke="#ffffff" strokeWidth="12" />
                   {/* The active route line representation */}
                   <path d="M300,300 C400,300 450,150 600,150 S750,300 800,250" fill="none" stroke="#032448" strokeWidth="5" strokeLinecap="round" />
                   <path d="M300,300 C400,300 450,150 600,150 S750,300 800,250" fill="none" stroke="#aec8f4" strokeWidth="2" strokeDasharray="5,5" />
                   <circle cx="300" cy="300" r="8" fill="#032448" className="animate-pulse" />
                   <circle cx="800" cy="250" r="8" fill="#ba1a1a" />
                 </svg>
                 <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 to-transparent pointer-events-none"></div>
               </div>
             </>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant/50 p-10 text-center">
                <span className="material-symbols-outlined text-6xl mb-4 opacity-50">alt_route</span>
                <p className="text-lg font-medium">Seleccione una ruta de la lista</p>
                <p className="text-sm mt-1">O configure una nueva para comenzar.</p>
             </div>
           )}
        </div>
      </div>

      {/* Modal Nueva/Editar Ruta */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? "Editar Ruta" : "Configurar Nueva Ruta"}
        subtitle="Complete los detalles de la ruta operativa"
        icon="alt_route"
        actions={
          <>
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-on-surface hover:bg-surface-variant rounded-lg transition-colors">Cancelar</button>
            <button type="button" onClick={handleSubmit} className="px-6 py-2 text-sm font-bold text-on-primary bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-all">
              {isEditing ? "Actualizar" : "Guardar Ruta"}
            </button>
          </>
        }
      >
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-error text-sm font-bold bg-error-container/10 p-3 rounded-lg border border-error/20 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          {/* Información General */}
          <div>
            <h3 className="text-sm font-bold text-primary mb-3 flex items-center gap-2 border-b border-outline-variant pb-2">
              <span className="material-symbols-outlined text-[18px]">info</span>
              Información General
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-on-surface-variant ml-1">Nombre de la Ruta <span className="text-error">*</span></label>
                <input 
                  name="nombre" value={formData.nombre} onChange={handleInputChange}
                  placeholder="Ej: Ruta 14 - Terminal / El Castaño" className="w-full bg-surface-container border border-outline-variant rounded-lg py-2.5 px-3 text-sm focus:border-primary outline-none transition-colors"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant ml-1">Tipo de Ruta <span className="text-error">*</span></label>
                <select 
                  name="tipo" value={formData.tipo} onChange={handleInputChange}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg py-2.5 px-3 text-sm focus:border-primary outline-none transition-colors"
                  required
                >
                  <option value="">Seleccione...</option>
                  {tiposRuta.map(t => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant ml-1">Tipo de Vía Principal <span className="text-error">*</span></label>
                <select 
                  name="tipo_via" value={formData.tipo_via} onChange={handleInputChange}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg py-2.5 px-3 text-sm focus:border-primary outline-none transition-colors"
                  required
                >
                  <option value="">Seleccione...</option>
                  {vias.map(v => (
                    <option key={v.id} value={v.id}>{v.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Recorrido */}
          <div>
            <h3 className="text-sm font-bold text-primary mb-3 flex items-center gap-2 border-b border-outline-variant pb-2">
              <span className="material-symbols-outlined text-[18px]">share_location</span>
              Recorrido Geográfico
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant ml-1">Municipio Origen <span className="text-error">*</span></label>
                <select 
                  name="municipio_or" value={formData.municipio_or} onChange={handleInputChange}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg py-2.5 px-3 text-sm focus:border-primary outline-none transition-colors"
                  required
                >
                  <option value="">Seleccione...</option>
                  {municipios.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant ml-1">Municipio Destino <span className="text-error">*</span></label>
                <select 
                  name="municipio_des" value={formData.municipio_des} onChange={handleInputChange}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg py-2.5 px-3 text-sm focus:border-primary outline-none transition-colors"
                  required
                >
                  <option value="">Seleccione...</option>
                  {municipios.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 mt-1">
                <label className="flex items-center gap-2 cursor-pointer p-3 bg-surface-container rounded-lg border border-outline-variant hover:border-primary/50 transition-colors">
                  <input 
                    type="checkbox" name="es_anillado" checked={formData.es_anillado} onChange={handleInputChange}
                    className="w-4 h-4 text-primary accent-primary"
                  />
                  <div>
                    <span className="text-sm font-bold text-on-surface block">Ruta Anillada / Circular</span>
                    <span className="text-xs text-on-surface-variant">El origen y el destino representan el mismo punto para un recorrido cerrado.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Detalles Operativos */}
          <div>
            <h3 className="text-sm font-bold text-primary mb-3 flex items-center gap-2 border-b border-outline-variant pb-2">
              <span className="material-symbols-outlined text-[18px]">speed</span>
              Detalles Operativos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant ml-1">Distancia (km)</label>
                <input 
                  type="number" step="0.01" name="distancia_km" value={formData.distancia_km} onChange={handleInputChange}
                  placeholder="Ej: 12.5" className="w-full bg-surface-container border border-outline-variant rounded-lg py-2.5 px-3 text-sm focus:border-primary outline-none transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant ml-1">Tiempo (min)</label>
                <input 
                  type="number" name="tiempo_estimado_min" value={formData.tiempo_estimado_min} onChange={handleInputChange}
                  placeholder="Ej: 45" className="w-full bg-surface-container border border-outline-variant rounded-lg py-2.5 px-3 text-sm focus:border-primary outline-none transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant ml-1">N° de Paradas</label>
                <input 
                  type="number" name="numero_paradas" value={formData.numero_paradas} onChange={handleInputChange} min="0"
                  className="w-full bg-surface-container border border-outline-variant rounded-lg py-2.5 px-3 text-sm focus:border-primary outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="text-xs font-bold text-on-surface-variant ml-1">Observaciones / Notas</label>
            <textarea 
              name="observaciones" value={formData.observaciones} onChange={handleInputChange} rows="2"
              placeholder="Cualquier nota adicional sobre la ruta..." className="mt-1 w-full bg-surface-container border border-outline-variant rounded-lg py-2.5 px-3 text-sm focus:border-primary outline-none transition-colors resize-none"
            ></textarea>
          </div>
        </form>
      </Modal>
    </div>
  );
}
