import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Polyline, Marker } from '@react-google-maps/api';
import wellknown from 'wellknown';
import api from '../services/api';
import { GOOGLE_MAPS_API_KEY } from '../config';

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
    libraries: ['places']
  });

  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [map, setMap] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await api.get('routes/routes/');
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

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        <div className="w-full lg:w-1/3 flex flex-col bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl overflow-hidden">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low shrink-0">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
              <input 
                type="text" 
                placeholder="Buscar ruta..." 
                className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none transition-all font-medium"
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
                  onClick={() => setSelectedRouteId(route.id)}
                  className={`group p-4 rounded-lg cursor-pointer transition-all border ${isSelected ? 'bg-primary/10 border-primary/30 shadow-sm' : 'bg-surface hover:bg-surface-container-low border-transparent'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined text-[20px]">route</span>
                      </div>
                      <div>
                        <h4 className={`font-bold text-sm ${isSelected ? 'text-primary' : 'text-on-surface'}`}>{route.nombre}</h4>
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mt-0.5">{route.tipo_nombre || 'General'}</p>
                      </div>
                    </div>
                    {isSelected && <span className="material-symbols-outlined text-primary text-[18px] animate-bounce-x">chevron_right</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-full lg:w-2/3 bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl overflow-hidden relative">
          <div className="absolute top-4 left-4 z-[20] w-72">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Buscar lugar o dirección..." 
                className="w-full bg-surface-container-highest/90 backdrop-blur-md border border-outline-variant rounded-lg py-3 px-4 pl-11 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-xl transition-all"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">location_on</span>
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-highest rounded-xl shadow-2xl border border-outline-variant overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {searchResults.map(res => (
                    <div 
                      key={res.place_id} 
                      onClick={() => selectPlace(res)}
                      className="px-4 py-3 text-xs hover:bg-primary/10 cursor-pointer border-b border-outline-variant last:border-0 transition-colors flex items-center gap-3"
                    >
                      <span className="material-symbols-outlined text-on-surface-variant text-[16px]">place</span>
                      <span className="flex-1 truncate">{res.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <GoogleMap
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
            {selectedRoute && selectedRoute.path.length > 0 && (
              <>
                <Polyline
                  path={selectedRoute.path}
                  options={{
                    strokeColor: '#3B82F6',
                    strokeOpacity: 0.9,
                    strokeWeight: 6,
                  }}
                />
                <Marker 
                  position={selectedRoute.path[0]} 
                  label={{ text: "A", color: "white", fontWeight: "bold" }}
                />
                <Marker 
                  position={selectedRoute.path[selectedRoute.path.length - 1]} 
                  label={{ text: "B", color: "white", fontWeight: "bold" }}
                />
              </>
            )}
          </GoogleMap>

          {selectedRoute && (
            <div className="absolute bottom-6 left-6 right-6 lg:left-auto lg:w-80 p-5 bg-surface-container-highest/95 backdrop-blur-xl border border-outline-variant rounded-2xl shadow-2xl z-10 animate-in slide-in-from-bottom-4 duration-300">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <span className="material-symbols-outlined text-primary text-[20px]">analytics</span>
                    </div>
                    <h4 className="font-bold text-sm text-on-surface">Detalles de Ruta</h4>
                  </div>
                  <span className="px-2 py-1 bg-tertiary/10 text-tertiary text-[10px] font-bold rounded uppercase">{selectedRoute.tipo_nombre}</span>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant">
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">Distancia</p>
                    <p className="text-xl font-black text-primary">{selectedRoute.distancia_km || '0.00'}<small className="ml-1 text-[10px] font-bold">KM</small></p>
                  </div>
                  <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant">
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">Paradas</p>
                    <p className="text-xl font-black text-primary">{selectedRoute.numero_paradas || 0}</p>
                  </div>
               </div>
               <div className="mt-4 flex items-center gap-2 text-[10px] font-medium text-on-surface-variant bg-surface-container-low p-2 rounded-lg">
                  <span className="material-symbols-outlined text-[14px]">info</span>
                  <span>Datos actualizados en tiempo real por el sistema.</span>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
