import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Polyline, Marker, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import wellknown from 'wellknown';
import axios from 'axios';
import { Modal } from '../components/common/Modal';
import api from '../services/api';
import { GOOGLE_MAPS_API_KEY } from '../config';
import { usePermissions } from '../hooks/usePermissions';


const LIBRARIES = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: 10.2469,
  lng: -67.5958
};

// RouteDesigner component using Google Maps
const RouteDesigner = ({ points, setPoints, stops, setStops, onDistanceUpdate, setGeom, municipios, onMunicipalityDetect, externalViewState, terminales }) => {
  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null);
  const [geocoderResults, setGeocoderResults] = useState([]);
  const [activeStopId, setActiveStopId] = useState(null);

  const onLoad = useCallback(mapInstance => setMap(mapInstance), []);
  const onUnmount = useCallback(() => setMap(null), []);

  // Sync with external view state
  useEffect(() => {
    if (externalViewState && map) {
      map.panTo({ lat: externalViewState.latitude, lng: externalViewState.longitude });
      map.setZoom(externalViewState.zoom);
    }
  }, [externalViewState, map]);

  const reverseGeocode = (coord, id) => {
    if (!window.google) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat: coord[0], lng: coord[1] } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        let address = results[0].formatted_address;
        if (address.includes(', Venezuela')) {
          address = address.replace(', Venezuela', '');
        }
        setStops(prev => prev.map(s => s.id === id ? { ...s, text: address } : s));
      }
    });
  };

  // Initialize stops
  useEffect(() => {
    if (points.length === 0 && stops.some(s => s.coord !== null)) {
      setStops([
        { id: 'origin', text: '', coord: null },
        { id: 'dest', text: '', coord: null }
      ]);
    } else if (points.length > 0 && stops.every(s => s.coord === null)) {
      const initialStops = points.map((p, i) => ({
        id: `stop-${Date.now()}-${i}`,
        text: 'Punto en el mapa',
        coord: p
      }));
      if (initialStops.length === 1) {
        initialStops.push({ id: 'dest', text: '', coord: null });
      }
      setStops(initialStops);
      
      initialStops.forEach(stop => {
        if (stop.coord) reverseGeocode(stop.coord, stop.id);
      });
    } else if (stops.length === 0) {
      setStops([
        { id: 'origin', text: '', coord: null },
        { id: 'dest', text: '', coord: null }
      ]);
    }
  }, [points]); // Only dependent on points from parent

  // Sync stops to points
  useEffect(() => {
    const validCoords = stops.filter(s => s.coord).map(s => s.coord);
    if (JSON.stringify(validCoords) !== JSON.stringify(points)) {
      setPoints(validCoords);
    }
  }, [stops]);

  // Update directions when points change
  useEffect(() => {
    if (points.length > 1) {
      const directionsService = new window.google.maps.DirectionsService();
      
      const origin = { lat: points[0][0], lng: points[0][1] };
      const destination = { lat: points[points.length - 1][0], lng: points[points.length - 1][1] };
      const waypoints = points.slice(1, -1).map(p => ({
        location: { lat: p[0], lng: p[1] },
        stopover: true
      }));

      directionsService.route(
        {
          origin,
          destination,
          waypoints,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
            
            // Calculate total distance
            let totalDist = 0;
            result.routes[0].legs.forEach(leg => {
              totalDist += leg.distance.value;
            });
            onDistanceUpdate((totalDist / 1000).toFixed(2), points.length);

            // Convert overview_path to WKT
            const path = result.routes[0].overview_path.map(p => [p.lng(), p.lat()]);
            const wkt = wellknown.stringify({
              type: 'LineString',
              coordinates: path
            });
            setGeom(wkt);
          }
        }
      );
    } else {
      setDirections(null);
      onDistanceUpdate(0, points.length);
    }

    if (points.length > 0) {
      detectMunicipality({ lat: points[0][0], lng: points[0][1] }, 'origen');
      if (points.length > 1) {
        detectMunicipality({ lat: points[points.length - 1][0], lng: points[points.length - 1][1] }, 'destino');
      }
    }
  }, [points]);

  const detectMunicipality = (location, type) => {
    if (!window.google) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const searchNames = results[0].address_components.map(c => c.long_name.toLowerCase());
        
        const match = municipios.find(m => {
          const mName = m.nombre.toLowerCase();
          return searchNames.some(name => name.includes(mName) || mName.includes(name));
        });

        if (match) {
          onMunicipalityDetect(type, match.id);
        }
      }
    });
  };

  const handleStopTextChange = (id, text) => {
    setStops(prev => prev.map(s => s.id === id ? { ...s, text, coord: null } : s));
    setActiveStopId(id);
    
    if (text.length > 2 && window.google) {
      const service = new window.google.maps.places.AutocompleteService();
      service.getPlacePredictions({ 
        input: text, 
        componentRestrictions: { country: 've' } 
      }, (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setGeocoderResults(predictions);
        } else {
          setGeocoderResults([]);
        }
      });
    } else {
      setGeocoderResults([]);
    }
  };

  const handleSelectPlace = (place) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ placeId: place.place_id }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const loc = results[0].geometry.location;
        const lat = loc.lat();
        const lng = loc.lng();
        
        let address = results[0].formatted_address;
        if (address.includes(', Venezuela')) address = address.replace(', Venezuela', '');

        setStops(prev => prev.map(s => s.id === activeStopId ? { ...s, text: address, coord: [lat, lng] } : s));
        setGeocoderResults([]);
        setActiveStopId(null);

        if (map) {
          map.panTo(loc);
          map.setZoom(15);
        }
      }
    });
  };

  const clearStop = (id) => {
    setStops(prev => {
      if (prev.length > 2 && id !== prev[0].id && id !== prev[prev.length - 1].id) {
        return prev.filter(s => s.id !== id);
      }
      return prev.map(s => s.id === id ? { ...s, text: '', coord: null } : s);
    });
    setGeocoderResults([]);
    setActiveStopId(null);
  };

  const handleAddStop = () => {
    setStops(prev => {
      const next = [...prev];
      next.splice(next.length - 1, 0, { id: `stop-${Date.now()}`, text: '', coord: null });
      return next;
    });
  };

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    
    const emptyIndex = stops.findIndex(s => !s.coord);
    if (emptyIndex !== -1) {
      const stopToUpdate = stops[emptyIndex];
      setStops(prev => prev.map((s, i) => i === emptyIndex ? { ...s, coord: [lat, lng], text: 'Punto seleccionado...' } : s));
      reverseGeocode([lat, lng], stopToUpdate.id);
    } else {
      const newId = `stop-${Date.now()}`;
      setStops(prev => {
        const next = [...prev];
        next.splice(next.length - 1, 0, { id: newId, text: 'Punto seleccionado...', coord: [lat, lng] });
        return next;
      });
      reverseGeocode([lat, lng], newId);
    }
  };

  const handleTerminalClick = (terminal) => {
    const geojson = wellknown.parse(terminal.location);
    if (geojson && geojson.type === 'Point') {
      const [lng, lat] = geojson.coordinates;
      const emptyIndex = stops.findIndex(s => !s.coord);
      if (emptyIndex !== -1) {
        const stopToUpdate = stops[emptyIndex];
        setStops(prev => prev.map((s, i) => i === emptyIndex ? { ...s, coord: [lat, lng], text: terminal.nombre } : s));
      } else {
        setStops(prev => {
          const next = [...prev];
          next.splice(next.length - 1, 0, { id: `stop-${Date.now()}`, text: terminal.nombre, coord: [lat, lng] });
          return next;
        });
      }
    }
  };

  const removePoint = (idx) => {
    setStops(prev => {
      const validStops = prev.filter(s => s.coord);
      const stopToRemove = validStops[idx];
      if (stopToRemove) {
        if (prev.length > 2 && stopToRemove.id !== prev[0].id && stopToRemove.id !== prev[prev.length - 1].id) {
          return prev.filter(s => s.id !== stopToRemove.id);
        }
        return prev.map(s => s.id === stopToRemove.id ? { ...s, coord: null, text: '' } : s);
      }
      return prev;
    });
  };

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-4 left-4 z-[20] w-80 bg-surface-container-lowest/95 backdrop-blur-md rounded-2xl shadow-xl overflow-visible border border-outline-variant">
        <div className="p-4 flex flex-col gap-3">
          {stops.map((stop, index) => {
            const isOrigin = index === 0;
            const isDest = index === stops.length - 1;
            const colorClass = isOrigin ? 'bg-primary' : isDest ? 'bg-error' : 'bg-[#F59E0B]';
            const shapeClass = isDest ? 'rounded-sm' : 'rounded-full';

            return (
              <div key={stop.id} className="relative flex items-center gap-3">
                {!isDest && (
                  <div className="absolute left-[11px] top-[24px] bottom-[-16px] w-[2px] bg-outline-variant border-dashed border-l-[2px] z-0"></div>
                )}
                
                <div className={`w-3 h-3 ${shapeClass} ${colorClass} shrink-0 z-10 ring-4 ring-surface-container-lowest/95 shadow-sm`}></div>
                
                <div className="flex-1 relative">
                  <input 
                    className={`w-full bg-surface-container hover:bg-surface-container-high focus:bg-surface-container-highest transition-colors border ${activeStopId === stop.id ? 'border-primary' : 'border-transparent'} rounded-lg py-2.5 pl-3 pr-8 text-sm outline-none shadow-sm`}
                    placeholder={isOrigin ? 'Punto de partida' : isDest ? 'Destino' : 'Parada intermedia'}
                    value={stop.text}
                    onChange={(e) => handleStopTextChange(stop.id, e.target.value)}
                    onFocus={() => setActiveStopId(stop.id)}
                  />
                  {stop.text && (
                    <button 
                      type="button"
                      onClick={() => clearStop(stop.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface bg-surface-container-lowest rounded-full p-0.5 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          <button 
            type="button"
            onClick={handleAddStop}
            className="mt-1 ml-[28px] text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 w-fit transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">add_circle</span>
            Añadir parada
          </button>
        </div>

        {activeStopId && geocoderResults.length > 0 && (
          <>
            <div className="fixed inset-0 z-[-1]" onClick={() => setActiveStopId(null)}></div>
            <div className="border-t border-outline-variant max-h-60 overflow-y-auto bg-surface-container-lowest rounded-b-2xl">
              {geocoderResults.map(res => (
                <div 
                  key={res.place_id} 
                  onClick={() => handleSelectPlace(res)}
                  className="p-3 hover:bg-surface-container cursor-pointer flex gap-3 items-center border-b border-outline-variant last:border-0 transition-colors"
                >
                  <span className="material-symbols-outlined text-on-surface-variant shrink-0">location_on</span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-on-surface truncate">{res.structured_formatting?.main_text || res.description}</span>
                    <span className="text-[10px] text-on-surface-variant truncate">{res.structured_formatting?.secondary_text || ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
        {directions && (
          <DirectionsRenderer 
            directions={directions} 
            options={{ 
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: '#032448',
                strokeWeight: 5,
                strokeOpacity: 0.8
              }
            }} 
          />
        )}

        {/* Terminals */}
        {terminales.map(terminal => {
          const geojson = terminal.location ? wellknown.parse(terminal.location) : null;
          if (!geojson) return null;
          return (
            <Marker 
              key={`term-${terminal.id}`} 
              position={{ lat: geojson.coordinates[1], lng: geojson.coordinates[0] }}
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              }}
              onClick={() => handleTerminalClick(terminal)}
              title={terminal.nombre}
            />
          );
        })}

        {/* Route Points */}
        {points.map((point, idx) => {
          const isOrigin = idx === 0;
          const isDest = idx === points.length - 1 && points.length > 1;
          const color = isOrigin ? '#3B82F6' : isDest ? '#EF4444' : '#F59E0B';
          
          return (
            <Marker 
              key={`point-${idx}`} 
              position={{ lat: point[0], lng: point[1] }}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: color,
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: '#FFFFFF',
                scale: 10,
              }}
              label={{
                text: isOrigin ? "O" : isDest ? "D" : `${idx}`,
                color: "white",
                fontSize: "10px",
                fontWeight: "900"
              }}
              onClick={() => removePoint(idx)}
            />
          );
        })}
      </GoogleMap>
    </div>
  );
};

export default function Rutas() {
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission('Rutas', 'Crear');
  const canUpdate = hasPermission('Rutas', 'Actualizar');
  const canDelete = hasPermission('Rutas', 'Eliminar');

  const { isLoaded } = useJsApiLoader({

    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES
  });

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
  const [routeStops, setRouteStops] = useState([]);
  const [designerViewState, setDesignerViewState] = useState(null);
  const [mapMain, setMapMain] = useState(null);

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
        let path = [];
        if (route.geom) {
          try {
            const geojson = wellknown.parse(route.geom);
            if (geojson.type === 'LineString') {
              path = geojson.coordinates.map(c => ({ lat: c[1], lng: c[0] }));
            }
          } catch (e) { console.error("Error parsing geom", e); }
        }
        return { ...route, path };
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

  // Enforce exclusive map visualization
  useEffect(() => {
    if (selectedRoute && selectedRoute.path.length > 0 && mapMain) {
      const bounds = new window.google.maps.LatLngBounds();
      selectedRoute.path.forEach(p => bounds.extend(p));
      mapMain.fitBounds(bounds);
    }
  }, [selectedRouteId, mapMain]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));

    if ((name === 'municipio_or' || name === 'municipio_des') && window.google) {
      const mun = municipios.find(m => m.id === parseInt(value));
      if (mun) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: `${mun.nombre}, Aragua, Venezuela` }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const loc = results[0].geometry.location;
            setDesignerViewState({ latitude: loc.lat(), longitude: loc.lng(), zoom: 12 });
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
    setRouteStops([]);
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
    if (route.geom) {
      const geojson = wellknown.parse(route.geom);
      if (geojson.type === 'LineString') {
        pts = geojson.coordinates.map(c => [c[1], c[0]]);
      }
    }
    setRoutePoints(pts);
    setRouteStops(route.paradas || []);
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
      numero_paradas: routeStops.filter(s => s.coord).length,
      paradas: routeStops
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

  const [routeToDelete, setRouteToDelete] = useState(null);

  const handleDeleteClick = (route, e) => {
    if (e) e.stopPropagation();
    setRouteToDelete(route);
  };

  const confirmDelete = async () => {
    if (!routeToDelete) return;
    try {
      await api.delete(`routes/routes/${routeToDelete.id}/`);
      if (selectedRouteId === routeToDelete.id) setSelectedRouteId(null);
      fetchData();
    } catch (err) {
      console.error("Error deleting route:", err);
    } finally {
      setRouteToDelete(null);
    }
  };


  const getTipoName = (id) => tiposRuta.find(t => t.id === id)?.nombre || 'Desconocido';

  if (!isLoaded) return <div className="h-full flex items-center justify-center">Cargando Google Maps...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] font-public-sans">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Gestión de Rutas</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">Trazado inteligente con Google Directions API</p>
        </div>
        {canCreate && (
          <button 
            onClick={handleOpenCreate}
            className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center shadow-md active:scale-95"
          >
            <span className="material-symbols-outlined mr-2 text-[18px]">add_road</span>
            Nueva Ruta
          </button>
        )}

      </div>

      <div className={`flex flex-col lg:flex-row gap-4 flex-1 min-h-0 transition-all duration-300 ${isModalOpen ? 'blur-sm grayscale-[0.2] opacity-50 pointer-events-none' : ''}`}>
        <div className="w-full lg:w-80 flex flex-col bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl overflow-hidden shrink-0">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low shrink-0 flex items-center justify-between">
            <h3 className="font-bold text-on-surface text-sm uppercase tracking-wide">Rutas Activas</h3>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-md">{routes.length}</span>
          </div>
          
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
             {loading ? (
                <div className="p-10 text-center text-on-surface-variant animate-pulse">Cargando...</div>
             ) : routes.length === 0 ? (
                <div className="p-10 text-center text-on-surface-variant">No hay rutas.</div>
             ) : (
                routes.map((route) => (
                  <div 
                    key={route.id} 
                    onClick={() => setSelectedRouteId(route.id)}
                    className={`p-4 rounded-lg cursor-pointer transition-all border ${selectedRouteId === route.id ? 'bg-primary/10 border-primary/30' : 'bg-surface hover:bg-surface-container border-transparent'}`}
                  >
                    <div className="flex justify-between items-start">
                       <h4 className="font-bold text-on-surface">{route.nombre}</h4>
                       <div className="flex">
                          {canUpdate && (
                            <button onClick={(e) => handleEdit(route, e)} className="text-on-surface-variant hover:text-primary p-1">
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                          )}
                          {canDelete && (
                            <button onClick={(e) => handleDeleteClick(route, e)} className="text-on-surface-variant hover:text-error p-1">
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          )}
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
                ))
             )}
          </div>
        </div>

        <div className="flex-1 bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl overflow-hidden relative min-h-[400px]">
           <GoogleMap
             key={selectedRouteId || 'main-map'}
             mapContainerStyle={mapContainerStyle}
             center={center}
             zoom={12}
             onLoad={setMapMain}
             onUnmount={() => setMapMain(null)}
             options={{
               disableDefaultUI: false,
               zoomControl: true,
               mapTypeControl: false,
             }}
           >
             {/* Isolated Route Layer: Only render the selected route */}
             {routes
               .filter(route => route.id === selectedRouteId)
               .map(route => (
                 route.path && route.path.length > 0 && (
                   <React.Fragment key={`route-layer-${route.id}`}>
                      <Polyline 
                        path={route.path} 
                        options={{ 
                          strokeColor: '#3B82F6', 
                          strokeWeight: 6, 
                          strokeOpacity: 0.9,
                          zIndex: 100 
                        }} 
                      />
                      
                      {/* Render all stops (paradas) */}
                      {route.paradas && route.paradas.map((stop, idx) => {
                        if (!stop.coord) return null;
                        const isOrigin = idx === 0;
                        const isDest = idx === route.paradas.length - 1;
                        const color = isOrigin ? '#3B82F6' : isDest ? '#EF4444' : '#F59E0B';
                        
                        return (
                          <Marker 
                            key={`stop-marker-${route.id}-${idx}`}
                            position={{ lat: stop.coord[0], lng: stop.coord[1] }}
                            icon={{
                              path: window.google.maps.SymbolPath.CIRCLE,
                              fillColor: color,
                              fillOpacity: 1,
                              strokeWeight: 2,
                              strokeColor: '#FFFFFF',
                              scale: 10,
                            }}
                            label={{ 
                              text: isOrigin ? "I" : isDest ? "F" : `${idx}`, 
                              color: "white", 
                              fontSize: "10px", 
                              fontWeight: "900" 
                            }}
                            title={stop.text || `Parada ${idx}`}
                          />
                        );
                      })}

                      {/* If no paradas stored (legacy), show at least Start/End from path */}
                      {(!route.paradas || route.paradas.length === 0) && (
                        <>
                          <Marker 
                            position={route.path[0]} 
                            icon={{
                              path: window.google.maps.SymbolPath.CIRCLE,
                              fillColor: '#3B82F6',
                              fillOpacity: 1,
                              strokeWeight: 2,
                              strokeColor: '#FFFFFF',
                              scale: 10,
                            }}
                            label={{ text: "I", color: "white", fontSize: "10px", fontWeight: "900" }}
                          />
                          <Marker 
                            position={route.path[route.path.length - 1]} 
                            icon={{
                              path: window.google.maps.SymbolPath.CIRCLE,
                              fillColor: '#EF4444',
                              fillOpacity: 1,
                              strokeWeight: 2,
                              strokeColor: '#FFFFFF',
                              scale: 10,
                            }}
                            label={{ text: "F", color: "white", fontSize: "10px", fontWeight: "900" }}
                          />
                        </>
                      )}
                   </React.Fragment>
                 )
               ))
             }
           </GoogleMap>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? "Editar Ruta" : "Nueva Ruta"}
        subtitle="Traza el recorrido usando puntos en el mapa (Rutas optimizadas por Google)"
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[75vh] min-h-[600px]">
          <form className="lg:col-span-4 space-y-8 overflow-y-auto pr-4 pb-4 custom-scrollbar" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <h3 className="text-sm font-extrabold text-primary uppercase tracking-wider border-b-2 border-primary/20 pb-2">Datos Básicos</h3>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide ml-1">Nombre de la Ruta</label>
                <input 
                  name="nombre" 
                  value={formData.nombre} 
                  onChange={handleInputChange} 
                  className="w-full bg-surface-container-lowest hover:bg-surface-container border border-outline-variant rounded-xl py-2.5 px-4 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm" 
                  required 
                  placeholder="Ej: Ruta Principal Centro" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide ml-1">Tipo</label>
                  <select 
                    name="tipo" 
                    value={formData.tipo} 
                    onChange={handleInputChange} 
                    className="w-full bg-surface-container-lowest hover:bg-surface-container border border-outline-variant rounded-xl py-2.5 px-4 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm" 
                    required
                  >
                    <option value="">Seleccione...</option>
                    {tiposRuta.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide ml-1">Vía</label>
                  <select 
                    name="tipo_via" 
                    value={formData.tipo_via} 
                    onChange={handleInputChange} 
                    className="w-full bg-surface-container-lowest hover:bg-surface-container border border-outline-variant rounded-xl py-2.5 px-4 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                  >
                    <option value="">Seleccione...</option>
                    {vias.map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <h3 className="text-sm font-extrabold text-primary uppercase tracking-wider border-b-2 border-primary/20 pb-2">Cobertura Geográfica</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide ml-1 flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary shadow-sm"></div>
                    Municipio Origen
                  </label>
                  <select 
                    name="municipio_or" 
                    value={formData.municipio_or} 
                    onChange={handleInputChange} 
                    className="w-full bg-surface-container-lowest hover:bg-surface-container border border-outline-variant rounded-xl py-2.5 px-4 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm" 
                    required
                  >
                    <option value="">Seleccione origen...</option>
                    {municipios.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide ml-1 flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-sm bg-error shadow-sm"></div>
                    Municipio Destino
                  </label>
                  <select 
                    name="municipio_des" 
                    value={formData.municipio_des} 
                    onChange={handleInputChange} 
                    className="w-full bg-surface-container-lowest hover:bg-surface-container border border-outline-variant rounded-xl py-2.5 px-4 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm" 
                    required
                  >
                    <option value="">Seleccione destino...</option>
                    {municipios.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10 shadow-sm">
               <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-extrabold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">analytics</span>
                    Métricas Google
                  </h4>
                  <button 
                    type="button" 
                    onClick={() => setRoutePoints([])} 
                    className="text-[10px] font-bold text-error uppercase hover:bg-error/10 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">refresh</span>
                    Resetear
                  </button>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-container-lowest rounded-xl p-3.5 border border-outline-variant shadow-sm flex flex-col items-center justify-center transition-transform hover:scale-105">
                    <span className="material-symbols-outlined text-primary mb-1.5">route</span>
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Distancia</p>
                    <p className="text-xl font-black text-on-surface mt-0.5">{formData.distancia_km || '0.00'}<span className="text-sm font-bold text-on-surface-variant ml-1">km</span></p>
                  </div>
                  <div className="bg-surface-container-lowest rounded-xl p-3.5 border border-outline-variant shadow-sm flex flex-col items-center justify-center transition-transform hover:scale-105">
                    <span className="material-symbols-outlined text-primary mb-1.5">pin_drop</span>
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Nodos</p>
                    <p className="text-xl font-black text-on-surface mt-0.5">{routePoints.length}</p>
                  </div>
               </div>
            </div>
          </form>
 
          <div className="lg:col-span-8 h-full rounded-2xl overflow-hidden border border-outline-variant relative bg-surface-container-lowest shadow-sm">
            <RouteDesigner 
              points={routePoints} 
              setPoints={setRoutePoints}
              stops={routeStops}
              setStops={setRouteStops}
              onDistanceUpdate={(dist, stopsCount) => setFormData(p => ({...p, distancia_km: dist, numero_paradas: stopsCount}))}
              setGeom={(wkt) => setFormData(p => ({...p, geom: wkt}))}
              municipios={municipios}
              onMunicipalityDetect={(type, id) => setFormData(p => ({ ...p, [type === 'origen' ? 'municipio_or' : 'municipio_des']: id }))}
              externalViewState={designerViewState}
              terminales={terminales}
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!routeToDelete}
        onClose={() => setRouteToDelete(null)}
        title="Eliminar Ruta"
        subtitle="Esta acción no se puede deshacer"
        icon="warning"
        maxWidthClass="max-w-md"
        actions={
          <>
            <button onClick={() => setRouteToDelete(null)} className="px-4 py-2 text-sm font-bold text-on-surface hover:bg-surface-variant rounded-lg transition-colors">Cancelar</button>
            <button onClick={confirmDelete} className="px-6 py-2 text-sm font-bold text-white bg-error hover:bg-error/90 rounded-lg shadow-sm transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">delete_forever</span>
              Eliminar
            </button>
          </>
        }
      >
        <div className="p-2 text-sm text-on-surface-variant">
          ¿Está seguro que desea eliminar la ruta <strong className="text-on-surface">"{routeToDelete?.nombre}"</strong>?
        </div>
      </Modal>
    </div>
  );
}
