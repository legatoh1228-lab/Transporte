import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Polyline, Marker } from '@react-google-maps/api';
import wellknown from 'wellknown';
import api from '../services/api';
import { GOOGLE_MAPS_API_KEY } from '../config';

const LIBRARIES = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: 10.2469,
  lng: -67.5958
};

// Dark theme for Google Maps
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

export default function RouteMap() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES
  });

  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [map, setMap] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeTab, setActiveTab] = useState('list');

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await api.get('routes/rutas/');
      const processedRoutes = response.data.map(route => {
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
      if (processedRoutes.length > 0 && !selectedRouteId) {
        setSelectedRouteId(processedRoutes[0].id);
      }
    } catch (err) {
      console.error("Error fetching routes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRouteSelect = (id) => {
    setSelectedRouteId(id);
    setActiveTab('details');
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const selectedRoute = useMemo(() => 
    routes.find(r => r.id === selectedRouteId), 
    [routes, selectedRouteId]
  );

  const filteredRoutes = useMemo(() => 
    routes.filter(r => r.nombre.toLowerCase().includes(searchTerm.toLowerCase())),
    [routes, searchTerm]
  );

  useEffect(() => {
    if (selectedRoute && selectedRoute.path.length > 0 && map) {
      const bounds = new window.google.maps.LatLngBounds();
      selectedRoute.path.forEach(p => bounds.extend(p));
      map.fitBounds(bounds);
    }
  }, [selectedRouteId, map]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query || query.length < 3 || !window.google) {
      setSearchResults([]);
      return;
    }

    const service = new window.google.maps.places.AutocompleteService();
    service.getPlacePredictions({ 
      input: query, 
      componentRestrictions: { country: 've' } 
    }, (predictions, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
        setSearchResults(predictions);
      } else {
        setSearchResults([]);
      }
    });
  };

  const selectPlace = (place) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ placeId: place.place_id }, (results, status) => {
      if (status === 'OK' && results[0] && map) {
        const loc = results[0].geometry.location;
        map.panTo(loc);
        map.setZoom(15);
        setSearchQuery('');
        setSearchResults([]);
      }
    });
  };

  const onLoad = useCallback(function callback(mapInstance) {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(function callback(mapInstance) {
    setMap(null);
  }, []);

  if (!isLoaded) return <div className="h-full flex items-center justify-center bg-surface-container-low text-on-surface">Cargando Google Maps...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] font-public-sans overflow-hidden">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Explorador de Rutas</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">Monitoreo y visualización de líneas de transporte público</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        <div className="w-full lg:w-80 flex flex-col bg-surface-container-lowest border border-outline-variant shadow-lg rounded-2xl overflow-hidden shrink-0 transition-all duration-300">
          {/* Tabs Header */}
          <div className="flex border-b border-outline-variant bg-surface-container-low p-1 gap-1">
            <button 
              onClick={() => setActiveTab('list')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'list' ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
            >
              <span className="material-symbols-outlined text-[18px]">list</span>
              Explorar
            </button>
            <button 
              onClick={() => setActiveTab('details')}
              disabled={!selectedRouteId}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'details' ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30'}`}
            >
              <span className="material-symbols-outlined text-[18px]">info</span>
              Detalles
            </button>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden relative">
            {/* List Tab */}
            <div className={`absolute inset-0 flex flex-col transition-transform duration-300 ${activeTab === 'list' ? 'translate-x-0' : '-translate-x-full'}`}>
              <div className="p-4 border-b border-outline-variant bg-surface-container-lowest shrink-0">
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px] transition-colors group-focus-within:text-primary">search</span>
                  <input 
                    type="text" 
                    placeholder="Filtrar rutas..." 
                    className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition-all font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
                {loading ? (
                  <div className="flex items-center justify-center p-8 text-on-surface-variant animate-pulse">Cargando...</div>
                ) : filteredRoutes.map(route => {
                  const isSelected = selectedRouteId === route.id;
                  return (
                    <div 
                      key={route.id}
                      onClick={() => handleRouteSelect(route.id)}
                      className={`group p-3 rounded-xl cursor-pointer transition-all border ${isSelected ? 'bg-primary/5 border-primary/20 shadow-sm' : 'bg-transparent hover:bg-surface-container-low border-transparent'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'}`}>
                            <span className="material-symbols-outlined text-[18px]">route</span>
                          </div>
                          <div className="min-w-0">
                            <h4 className={`font-bold text-xs truncate ${isSelected ? 'text-primary' : 'text-on-surface'}`}>{route.nombre}</h4>
                            <p className="text-[9px] text-on-surface-variant uppercase font-bold tracking-wider">{route.tipo_nombre || 'General'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Details Tab */}
            <div className={`absolute inset-0 flex flex-col transition-transform duration-300 ${activeTab === 'details' ? 'translate-x-0' : 'translate-x-full'}`}>
              {selectedRoute ? (
                <div className="flex flex-col h-full bg-surface-container-lowest">
                  <div className="p-5 border-b border-outline-variant bg-surface-container-low/50">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined">route</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-black text-on-surface truncate leading-tight">{selectedRoute.nombre}</h3>
                        <span className="px-2 py-0.5 bg-tertiary/10 text-tertiary text-[9px] font-black rounded-full uppercase tracking-tighter">{selectedRoute.tipo_nombre}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-surface-container-low p-3 rounded-2xl border border-outline-variant/50">
                        <div className="flex items-center gap-1.5 mb-1 text-primary">
                          <span className="material-symbols-outlined text-[16px]">distance</span>
                          <span className="text-[9px] font-black uppercase tracking-wider">Distancia</span>
                        </div>
                        <p className="text-xl font-black text-on-surface">{selectedRoute.distancia_km || '0.00'}<small className="ml-0.5 text-[10px] font-bold opacity-60">KM</small></p>
                      </div>
                      <div className="bg-surface-container-low p-3 rounded-2xl border border-outline-variant/50">
                        <div className="flex items-center gap-1.5 mb-1 text-primary">
                          <span className="material-symbols-outlined text-[16px]">pin_drop</span>
                          <span className="text-[9px] font-black uppercase tracking-wider">Paradas</span>
                        </div>
                        <p className="text-xl font-black text-on-surface">{selectedRoute.numero_paradas || 0}</p>
                      </div>
                    </div>

                    {selectedRoute.paradas && selectedRoute.paradas.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.1em] flex items-center gap-2 px-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                          Itinerario de Ruta
                        </h4>
                        <div className="relative pl-3 ml-1">
                          <div className="absolute left-0 top-3 bottom-3 w-[2px] bg-gradient-to-b from-primary via-outline-variant to-error z-0 opacity-30"></div>
                          <div className="space-y-4 relative z-10">
                            {selectedRoute.paradas.map((stop, idx) => {
                              const isOrigin = idx === 0;
                              const isDest = idx === selectedRoute.paradas.length - 1;
                              const color = isOrigin ? 'bg-primary' : isDest ? 'bg-error' : 'bg-[#F59E0B]';
                              
                              return (
                                <div 
                                  key={idx} 
                                  onClick={() => {
                                    if (map && stop.coord) {
                                      map.panTo({ lat: stop.coord[0], lng: stop.coord[1] });
                                      map.setZoom(16);
                                    }
                                  }}
                                  className="group flex items-start gap-4 cursor-pointer"
                                >
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold text-[9px] shadow-md ring-4 ring-surface-container-lowest ${color} text-white transition-all group-hover:scale-125`}>
                                    {isOrigin ? 'I' : isDest ? 'F' : idx}
                                  </div>
                                  <div className="flex-1 min-w-0 pt-0.5">
                                    <p className="text-[11px] font-bold text-on-surface group-hover:text-primary transition-colors truncate">{stop.text || 'Sin nombre'}</p>
                                    <p className="text-[9px] text-on-surface-variant font-medium mt-0.5">{isOrigin ? 'Origen' : isDest ? 'Destino' : `Parada ${idx}`}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 bg-surface-container-low/30 border-t border-outline-variant mt-auto">
                    <button 
                      onClick={() => setActiveTab('list')}
                      className="w-full py-2.5 rounded-xl border border-outline-variant text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                      Volver al listado
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 opacity-40">
                  <span className="material-symbols-outlined text-6xl">route</span>
                  <p className="text-sm font-bold">Selecciona una ruta para ver sus detalles</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl overflow-hidden relative">
          <GoogleMap
            key={selectedRouteId || 'route-map'}
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={12}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              styles: darkTheme,
              disableDefaultUI: false,
              zoomControl: true,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: true
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
    </div>
  );
}
