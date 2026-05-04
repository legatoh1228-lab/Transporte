import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import wellknown from 'wellknown';
import 'leaflet/dist/leaflet.css';
import { Modal } from '../components/common/Modal';
import api from '../services/api';

// Fix for default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Helper: Calculate distance between two coordinates in km
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Helper component to center map
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

// Map component for drawing in the modal
const RouteDesigner = ({ points, setPoints, onDistanceUpdate }) => {
  useMapEvents({
    click(e) {
      const newPoint = [e.latlng.lat, e.latlng.lng];
      const newPoints = [...points, newPoint];
      setPoints(newPoints);
      
      let totalDist = 0;
      for (let i = 1; i < newPoints.length; i++) {
        totalDist += calculateDistance(
          newPoints[i-1][0], newPoints[i-1][1],
          newPoints[i][0], newPoints[i][1]
        );
      }
      onDistanceUpdate(totalDist.toFixed(2), newPoints.length);
    },
  });

  return (
    <>
      <Polyline positions={points} pathOptions={{ color: '#032448', weight: 4 }} />
      {points.map((point, idx) => (
        <Marker key={idx} position={point}>
          <Popup>
            <div className="text-center">
              <p className="font-bold mb-1">
                {idx === 0 ? "Origen" : idx === points.length - 1 ? "Destino" : `Parada #${idx}`}
              </p>
              <button 
                className="bg-error text-white text-[10px] px-2 py-1 rounded font-bold"
                onClick={(e) => {
                  e.stopPropagation();
                  const updatedPoints = points.filter((_, i) => i !== idx);
                  setPoints(updatedPoints);
                  let totalDist = 0;
                  for (let i = 1; i < updatedPoints.length; i++) {
                    totalDist += calculateDistance(
                      updatedPoints[i-1][0], updatedPoints[i-1][1],
                      updatedPoints[i][0], updatedPoints[i][1]
                    );
                  }
                  onDistanceUpdate(totalDist.toFixed(2), updatedPoints.length);
                }}
              >
                Eliminar
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export default function Rutas() {
  const [routes, setRoutes] = useState([]);
  const [tiposRuta, setTiposRuta] = useState([]);
  const [vias, setVias] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState(null);

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
    observaciones: '',
    geom: null
  });

  const [routePoints, setRoutePoints] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resRoutes, resTipos, resVias, resMun] = await Promise.all([
        api.get('routes/routes/'),
        api.get('catalogs/tipos-ruta/'),
        api.get('catalogs/vias/'),
        api.get('catalogs/municipios/')
      ]);
      
      const processedRoutes = resRoutes.data.map(route => {
        let coordinates = [];
        if (route.geom) {
          try {
            const geojson = wellknown.parse(route.geom);
            if (geojson && geojson.type === 'LineString') {
              coordinates = geojson.coordinates.map(coord => [coord[1], coord[0]]);
            }
          } catch (e) { console.error("Error parsing geom", e); }
        }
        return { ...route, coordinates };
      });

      setRoutes(processedRoutes);
      setTiposRuta(resTipos.data);
      setVias(resVias.data);
      setMunicipios(resMun.data);
      
      if (processedRoutes.length > 0 && !selectedRouteId) {
        setSelectedRouteId(processedRoutes[0].id);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedRoute = useMemo(() => 
    routes.find(r => r.id === selectedRouteId), 
    [routes, selectedRouteId]
  );

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
      observaciones: '',
      geom: null
    });
    setRoutePoints([]);
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
      observaciones: route.observaciones || '',
      geom: route.geom
    });
    setRoutePoints(route.coordinates || []);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    let wkt = null;
    if (routePoints.length > 1) {
      wkt = wellknown.stringify({
        type: 'LineString',
        coordinates: routePoints.map(p => [p[1], p[0]])
      });
    }

    const payload = { 
      ...formData,
      geom: wkt
    };
    
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
      setError("Error al guardar los datos.");
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (window.confirm("¿Está seguro de eliminar esta ruta?")) {
      try {
        await api.delete(`routes/routes/${id}/`);
        if (selectedRouteId === id) setSelectedRouteId(null);
        fetchData();
      } catch (err) {
        console.error("Error deleting route:", err);
      }
    }
  };

  const getTipoName = (id) => tiposRuta.find(t => t.id === id)?.nombre || 'Desconocido';
  const getMunicipioName = (id) => municipios.find(m => m.id === id)?.nombre || 'Desconocido';

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] font-public-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Gestión de Rutas</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">Configuración y trazado de las líneas de servicio</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center shadow-md active:scale-95"
        >
          <span className="material-symbols-outlined mr-2 text-[18px]">add_road</span>
          Nueva Ruta
        </button>
      </div>

      <div className={`flex flex-col lg:flex-row gap-6 flex-1 min-h-0 transition-all duration-300 ${isModalOpen ? 'blur-sm grayscale-[0.2] opacity-50 pointer-events-none' : ''}`}>
        {/* List */}
        <div className="w-full lg:w-1/3 flex flex-col bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl overflow-hidden">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low shrink-0 flex items-center justify-between">
            <h3 className="font-bold text-on-surface text-sm uppercase tracking-wide">Rutas Activas</h3>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-md">{routes.length} Totales</span>
          </div>
          
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
             {loading ? (
                <div className="p-10 text-center text-on-surface-variant animate-pulse">Cargando rutas...</div>
             ) : routes.length === 0 ? (
                <div className="p-10 text-center text-on-surface-variant">No hay rutas configuradas.</div>
             ) : (
                routes.map((route) => {
                  const isSelected = selectedRouteId === route.id;
                  return (
                    <div 
                      key={route.id} 
                      onClick={() => setSelectedRouteId(route.id)}
                      className={`p-4 rounded-lg cursor-pointer transition-all border ${isSelected ? 'bg-primary-fixed border-primary-fixed-dim/50' : 'bg-surface hover:bg-surface-container border-transparent'}`}
                    >
                      <div className="flex justify-between items-start">
                         <h4 className="font-bold text-on-surface">{route.nombre}</h4>
                         <div className="flex">
                            <button onClick={(e) => handleEdit(route, e)} className="text-on-surface-variant hover:text-primary p-1">
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button onClick={(e) => handleDelete(route.id, e)} className="text-on-surface-variant hover:text-error p-1">
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                         </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs mt-1">
                         <span className="bg-surface-container border border-outline-variant px-2 py-0.5 rounded text-on-surface-variant font-semibold">
                           {getTipoName(route.tipo)}
                         </span>
                         <span className="text-on-surface-variant flex items-center">
                           <span className="material-symbols-outlined mr-1 text-[14px]">route</span> {route.distancia_km || '--'} km
                         </span>
                      </div>
                    </div>
                  );
                })
             )}
          </div>
        </div>

        {/* View Map */}
        <div className="w-full lg:w-2/3 bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl overflow-hidden relative min-h-[400px]">
           {selectedRoute ? (
             <MapContainer 
               center={selectedRoute?.coordinates?.[0] || [10.2469, -67.5958]} 
               zoom={13} 
               style={{ height: '100%', width: '100%' }}
               zoomControl={false}
             >
               <ChangeView center={selectedRoute?.coordinates?.[0]} zoom={13} />
               <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
               {selectedRoute.coordinates && (
                 <Polyline positions={selectedRoute.coordinates} pathOptions={{ color: '#032448', weight: 6 }} />
               )}
               {selectedRoute.coordinates?.[0] && <Marker position={selectedRoute.coordinates[0]} />}
               {selectedRoute.coordinates?.length > 1 && <Marker position={selectedRoute.coordinates[selectedRoute.coordinates.length - 1]} />}
             </MapContainer>
           ) : (
             <div className="flex items-center justify-center h-full text-on-surface-variant">Seleccione una ruta de la lista</div>
           )}
        </div>
      </div>

      {/* Advanced Modal Designer */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? "Editar Ruta" : "Configurar Nueva Ruta"}
        subtitle="Haz clic en el mapa para trazar el recorrido"
        icon="alt_route"
        maxWidthClass="max-w-6xl"
        actions={
          <>
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-on-surface hover:bg-surface-variant rounded-lg">Cancelar</button>
            <button onClick={handleSubmit} className="px-6 py-2 text-sm font-bold text-on-primary bg-primary hover:bg-primary/90 rounded-lg shadow-sm">
              {isEditing ? "Actualizar" : "Guardar Ruta"}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="text-error text-xs bg-error-container/10 p-3 rounded-lg border border-error/20">{error}</div>}
            
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-outline-variant pb-2">Datos Básicos</h3>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase ml-1">Nombre</label>
                <input name="nombre" value={formData.nombre} onChange={handleInputChange} className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm focus:border-primary outline-none" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase ml-1">Tipo</label>
                  <select name="tipo" value={formData.tipo} onChange={handleInputChange} className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm outline-none">
                    <option value="">Seleccione...</option>
                    {tiposRuta.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase ml-1">Vía</label>
                  <select name="tipo_via" value={formData.tipo_via} onChange={handleInputChange} className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm outline-none">
                    <option value="">Seleccione...</option>
                    {vias.map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-outline-variant pb-2">Municipios</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase ml-1">Origen</label>
                  <select name="municipio_or" value={formData.municipio_or} onChange={handleInputChange} className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm outline-none">
                    <option value="">Seleccione...</option>
                    {municipios.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase ml-1">Destino</label>
                  <select name="municipio_des" value={formData.municipio_des} onChange={handleInputChange} className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm outline-none">
                    <option value="">Seleccione...</option>
                    {municipios.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
               <div className="flex justify-between items-center mb-2">
                  <h4 className="text-[10px] font-bold text-primary uppercase">Cálculo Automático</h4>
                  <button type="button" onClick={() => { setRoutePoints([]); setFormData(p => ({...p, distancia_km: 0, numero_paradas: 0})) }} className="text-[9px] font-bold text-error uppercase">Reset Mapa</button>
               </div>
               <div className="flex gap-6">
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase">Distancia</p>
                    <p className="text-lg font-bold text-primary">{formData.distancia_km || '0.00'} <span className="text-xs">km</span></p>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase">Paradas</p>
                    <p className="text-lg font-bold text-primary">{formData.numero_paradas}</p>
                  </div>
               </div>
            </div>
          </form>

          <div className="h-[400px] lg:h-full min-h-[400px] rounded-xl overflow-hidden border border-outline-variant relative">
            <MapContainer center={[10.2469, -67.5958]} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <RouteDesigner 
                points={routePoints} 
                setPoints={setRoutePoints} 
                onDistanceUpdate={(dist, stops) => setFormData(p => ({...p, distancia_km: dist, numero_paradas: stops}))} 
              />
              {routePoints.length > 0 && <ChangeView center={routePoints[routePoints.length - 1]} zoom={13} />}
            </MapContainer>
          </div>
        </div>
      </Modal>
    </div>
  );
}
