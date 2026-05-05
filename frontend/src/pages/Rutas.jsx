import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Map, { Source, Layer, Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import wellknown from 'wellknown';
import axios from 'axios';
import { Modal } from '../components/common/Modal';
import api from '../services/api';
import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';

const MAPBOX_TOKEN = 'pk.eyJ1IjoibGVnYXRvaCIsImEiOiJjbW9zbzA4OXcwMHgwMnFyM3J1dHc1a2IyIn0.XQgEj2Clkl9A46opIMUklA';
const geocodingClient = mbxGeocoding({ accessToken: MAPBOX_TOKEN });

const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving/';

// Map component for drawing in the modal
const RouteDesigner = ({ points, setPoints, onDistanceUpdate, setGeom, municipios, onMunicipalityDetect, externalViewState, terminales }) => {
  const [viewState, setViewState] = useState({
    latitude: 10.2469,
    longitude: -67.5958,
    zoom: 12
  });
  const [geocoderResults, setGeocoderResults] = useState([]);
  const [geocoderQuery, setGeocoderQuery] = useState('');
  const [routeData, setRouteData] = useState(null);
  const mapRef = useRef();

  // Sync with external view state (from parent municipality selection)
  useEffect(() => {
    if (externalViewState) {
      setViewState(prev => ({ ...prev, ...externalViewState }));
    }
  }, [externalViewState]);

  // Update route and detect municipalities when points change
  useEffect(() => {
    if (points.length > 1) {
      fetchOSRMRoute(points);
    } else {
      setRouteData(null);
      onDistanceUpdate(0, points.length);
    }

    if (points.length > 0) {
      detectMunicipality(points[0], 'origen');
      if (points.length > 1) {
        detectMunicipality(points[points.length - 1], 'destino');
      }
    }
  }, [points]);

  const detectMunicipality = async (point, type) => {
    try {
      const response = await geocodingClient.reverseGeocode({
        query: [point[1], point[0]],
        types: ['place', 'locality', 'district', 'neighborhood'],
        limit: 1
      }).send();

      if (response.body.features && response.body.features.length > 0) {
        const feature = response.body.features[0];
        
        const searchNames = [
          feature.text.toLowerCase(),
          ...(feature.context || []).map(c => c.text.toLowerCase())
        ];
        
        const match = municipios.find(m => {
          const mName = m.nombre.toLowerCase();
          return searchNames.some(name => name.includes(mName) || mName.includes(name));
        });

        if (match) {
          onMunicipalityDetect(type, match.id);
        }
      }
    } catch (err) {
      console.error("Error detecting municipality:", err);
    }
  };

  const fetchOSRMRoute = async (pts) => {
    try {
      const coords = pts.map(p => `${p[1]},${p[0]}`).join(';');
      const response = await axios.get(`${OSRM_URL}${coords}?overview=full&geometries=geojson`);
      
      if (response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        setRouteData(route.geometry);
        onDistanceUpdate((route.distance / 1000).toFixed(2), pts.length);
        
        const wkt = wellknown.stringify({
          type: 'LineString',
          coordinates: route.geometry.coordinates
        });
        setGeom(wkt);
      }
    } catch (err) {
      console.error("OSRM Routing error:", err);
    }
  };

  const handleMapClick = (e) => {
    const { lng, lat } = e.lngLat;
    setPoints(prev => [...prev, [lat, lng]]);
  };

  const handleTerminalClick = (terminal, e) => {
    e.stopPropagation();
    const geojson = wellknown.parse(terminal.location);
    if (geojson && geojson.type === 'Point') {
      const [lng, lat] = geojson.coordinates;
      setPoints(prev => [...prev, [lat, lng]]);
    }
  };

  const handleGeocoderSearch = async (query) => {
    setGeocoderQuery(query);
    if (query.length > 2) {
      try {
        const response = await geocodingClient.forwardGeocode({
          query,
          autocomplete: true,
          limit: 5,
          countries: ['VE']
        }).send();
        setGeocoderResults(response.body.features);
      } catch (err) {
        console.error("Geocoding error:", err);
      }
    } else {
      setGeocoderResults([]);
    }
  };

  const handleSelectLocation = (feature) => {
    const [lng, lat] = feature.center;
    setViewState(prev => ({
      ...prev,
      longitude: lng,
      latitude: lat,
      zoom: 14
    }));
    setPoints(prev => [...prev, [lat, lng]]);
    setGeocoderQuery('');
    setGeocoderResults([]);
  };

  const removePoint = (idx, e) => {
    e.stopPropagation();
    setPoints(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-4 left-4 z-[20] w-64">
        <div className="relative">
          <input 
            className="w-full bg-surface-container-highest/90 backdrop-blur-md border border-outline-variant rounded-lg py-2 px-3 pl-9 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50" 
            placeholder="Buscar y añadir punto..." 
            value={geocoderQuery}
            onChange={(e) => handleGeocoderSearch(e.target.value)}
          />
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">add_location</span>
          {geocoderResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-highest rounded-lg shadow-xl border border-outline-variant overflow-hidden max-h-48 overflow-y-auto">
              {geocoderResults.map(res => (
                <div 
                  key={res.id} 
                  onClick={() => handleSelectLocation(res)}
                  className="px-3 py-2 text-xs hover:bg-primary/10 cursor-pointer border-b border-outline-variant last:border-0"
                >
                  {res.place_name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        onClick={handleMapClick}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        ref={mapRef}
      >
        <NavigationControl position="bottom-right" />
        
        {routeData && (
          <Source type="geojson" data={{ type: 'Feature', geometry: routeData }}>
            <Layer 
              id="route-line"
              type="line"
              paint={{
                'line-color': '#032448',
                'line-width': 4,
                'line-opacity': 0.8
              }}
            />
          </Source>
        )}

        {/* Terminals as potential points */}
        {terminales.map(terminal => {
          const geojson = terminal.location ? wellknown.parse(terminal.location) : null;
          if (!geojson) return null;
          return (
            <Marker key={terminal.id} longitude={geojson.coordinates[0]} latitude={geojson.coordinates[1]}>
              <div 
                className="flex flex-col items-center group cursor-pointer text-primary/60 hover:text-primary transition-colors"
                onClick={(e) => handleTerminalClick(terminal, e)}
              >
                <span className="material-symbols-outlined text-xl drop-shadow-sm">store</span>
                <div className="hidden group-hover:block absolute bottom-full mb-1 bg-surface-container-highest text-[9px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-50">
                  {terminal.nombre} (Clic para usar como punto)
                </div>
              </div>
            </Marker>
          );
        })}

        {points.map((point, idx) => (
          <Marker key={idx} longitude={point[1]} latitude={point[0]}>
            <div 
              className={`flex flex-col items-center group cursor-pointer ${idx === 0 ? 'text-primary' : idx === points.length - 1 ? 'text-error' : 'text-secondary'}`}
              onClick={(e) => removePoint(idx, e)}
            >
              <span className="material-symbols-outlined text-2xl drop-shadow-md">location_on</span>
              <div className="hidden group-hover:block absolute bottom-full mb-1 bg-surface-container-highest text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                {idx === 0 ? "Origen" : idx === points.length - 1 ? "Destino" : `Parada #${idx}`} (Clic para eliminar)
              </div>
            </div>
          </Marker>
        ))}
      </Map>
    </div>
  );
};

export default function Rutas() {
  const [routes, setRoutes] = useState([]);
  const [tiposRuta, setTiposRuta] = useState([]);
  const [vias, setVias] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [terminales, setTerminales] = useState([]);
  
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
  const [designerViewState, setDesignerViewState] = useState(null);
  const [viewStateMain, setViewStateMain] = useState({
    latitude: 10.2469,
    longitude: -67.5958,
    zoom: 12
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resRoutes, resTipos, resVias, resMun, resTerm] = await Promise.all([
        api.get('routes/routes/'),
        api.get('catalogs/tipos-ruta/'),
        api.get('catalogs/vias/'),
        api.get('catalogs/municipios/'),
        api.get('fleet/terminales/')
      ]);
      
      const processedRoutes = resRoutes.data.map(route => {
        let geojson = null;
        if (route.geom) {
          try {
            geojson = wellknown.parse(route.geom);
          } catch (e) { console.error("Error parsing geom", e); }
        }
        return { ...route, geojson };
      });

      setRoutes(processedRoutes);
      setTiposRuta(resTipos.data);
      setVias(resVias.data);
      setMunicipios(resMun.data);
      setTerminales(resTerm.data);
      
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

  useEffect(() => {
    if (selectedRoute && selectedRoute.geojson && selectedRoute.geojson.coordinates.length > 0) {
      setViewStateMain(prev => ({
        ...prev,
        latitude: selectedRoute.geojson.coordinates[0][1],
        longitude: selectedRoute.geojson.coordinates[0][0],
        zoom: 13,
        transitionDuration: 1000
      }));
    }
  }, [selectedRouteId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));

    if (name === 'municipio_or' || name === 'municipio_des') {
      const mun = municipios.find(m => m.id === parseInt(value));
      if (mun) {
        geocodingClient.forwardGeocode({
          query: `${mun.nombre}, Aragua, Venezuela`,
          limit: 1
        }).send().then(response => {
          if (response.body.features.length > 0) {
            const [lng, lat] = response.body.features[0].center;
            setDesignerViewState({ latitude: lat, longitude: lng, zoom: 12 });
          }
        });
      }
    }
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
    setDesignerViewState(null);
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
    
    let pts = [];
    if (route.geojson) {
      if (route.geojson.type === 'LineString') {
        pts = route.geojson.coordinates.map(c => [c[1], c[0]]);
      }
    }
    setRoutePoints(pts);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (routePoints.length < 2) {
      setError("La ruta debe tener al menos un origen y un destino.");
      return;
    }

    const payload = { 
      ...formData,
      distancia_km: formData.distancia_km || 0,
      numero_paradas: routePoints.length
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
      setError("Error al guardar los datos. Verifique los campos obligatorios.");
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
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Gestión de Rutas</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">Configuración y trazado de las líneas de servicio con OSRM & MapBox</p>
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
                      className={`p-4 rounded-lg cursor-pointer transition-all border ${isSelected ? 'bg-primary/10 border-primary/30' : 'bg-surface hover:bg-surface-container border-transparent'}`}
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

        <div className="w-full lg:w-2/3 bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl overflow-hidden relative min-h-[400px]">
           {selectedRoute ? (
             <Map
               {...viewStateMain}
               onMove={evt => setViewStateMain(evt.viewState)}
               mapStyle="mapbox://styles/mapbox/streets-v12"
               mapboxAccessToken={MAPBOX_TOKEN}
               style={{ width: '100%', height: '100%' }}
             >
               <NavigationControl position="bottom-right" />
               {selectedRoute.geojson && (
                 <Source type="geojson" data={{ type: 'Feature', geometry: selectedRoute.geojson }}>
                   <Layer 
                    id="main-route-line"
                    type="line"
                    paint={{
                      'line-color': '#032448',
                      'line-width': 6,
                      'line-opacity': 0.9
                    }}
                   />
                 </Source>
               )}
               {selectedRoute.geojson?.coordinates?.[0] && (
                 <Marker longitude={selectedRoute.geojson.coordinates[0][0]} latitude={selectedRoute.geojson.coordinates[0][1]}>
                    <span className="material-symbols-outlined text-primary text-3xl">location_on</span>
                 </Marker>
               )}
             </Map>
           ) : (
             <div className="flex items-center justify-center h-full text-on-surface-variant">Seleccione una ruta de la lista</div>
           )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? "Editar Ruta" : "Configurar Nueva Ruta"}
        subtitle="Haz clic en el mapa para trazar el recorrido (Rutas por carretera vía OSRM)"
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
          <form className="space-y-4 overflow-y-auto pr-2" onSubmit={handleSubmit}>
            {error && <div className="text-error text-xs bg-error-container/10 p-3 rounded-lg border border-error/20">{error}</div>}
            
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-outline-variant pb-2">Datos Básicos</h3>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase ml-1">Nombre de la Ruta</label>
                <input name="nombre" value={formData.nombre} onChange={handleInputChange} className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm focus:border-primary outline-none" placeholder="Ej. Ruta Troncal 1" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase ml-1">Tipo de Servicio</label>
                  <select name="tipo" value={formData.tipo} onChange={handleInputChange} className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm outline-none" required>
                    <option value="">Seleccione...</option>
                    {tiposRuta.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase ml-1">Vía Principal</label>
                  <select name="tipo_via" value={formData.tipo_via} onChange={handleInputChange} className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm outline-none">
                    <option value="">Seleccione...</option>
                    {vias.map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-outline-variant pb-2">Municipios (Cobertura)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase ml-1">Municipio Origen</label>
                  <select name="municipio_or" value={formData.municipio_or} onChange={handleInputChange} className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm outline-none" required>
                    <option value="">Seleccione...</option>
                    {municipios.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase ml-1">Municipio Destino</label>
                  <select name="municipio_des" value={formData.municipio_des} onChange={handleInputChange} className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm outline-none" required>
                    <option value="">Seleccione...</option>
                    {municipios.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
               <div className="flex justify-between items-center mb-2">
                  <h4 className="text-[10px] font-bold text-primary uppercase">Métricas de Recorrido</h4>
                  <button type="button" onClick={() => { setRoutePoints([]); setFormData(p => ({...p, distancia_km: 0, numero_paradas: 0, geom: null})) }} className="text-[9px] font-bold text-error uppercase hover:underline">Resetear Trazo</button>
               </div>
               <div className="flex gap-10">
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase">Distancia Total</p>
                    <p className="text-2xl font-bold text-primary">{formData.distancia_km || '0.00'} <span className="text-xs font-medium">km</span></p>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase">Nodos de Ruta</p>
                    <p className="text-2xl font-bold text-primary">{routePoints.length}</p>
                  </div>
               </div>
               <p className="text-[9px] text-on-surface-variant mt-3 italic">* La distancia se calcula automáticamente siguiendo las vías principales.</p>
            </div>
          </form>
 
          <div className="h-full rounded-xl overflow-hidden border border-outline-variant relative bg-surface-container-low">
            <RouteDesigner 
              points={routePoints} 
              setPoints={setRoutePoints} 
              onDistanceUpdate={(dist, stops) => setFormData(p => ({...p, distancia_km: dist, numero_paradas: stops}))}
              setGeom={(wkt) => setFormData(p => ({...p, geom: wkt}))}
              municipios={municipios}
              onMunicipalityDetect={(type, id) => setFormData(p => ({ ...p, [type === 'origen' ? 'municipio_or' : 'municipio_des']: id }))}
              externalViewState={designerViewState}
              terminales={terminales}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
