import React, { useState, useEffect, useMemo, useRef } from 'react';
import Map, { Source, Layer, Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import wellknown from 'wellknown';
import api from '../services/api';
import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';

const MAPBOX_TOKEN = 'pk.eyJ1IjoibGVnYXRvaCIsImEiOiJjbW9zbzA4OXcwMHgwMnFyM3J1dHc1a2IyIn0.XQgEj2Clkl9A46opIMUklA';
const geocodingClient = mbxGeocoding({ accessToken: MAPBOX_TOKEN });

const RouteMap = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewState, setViewState] = useState({
    latitude: 10.2469,
    longitude: -67.5958,
    zoom: 13
  });
  const [popupInfo, setPopupInfo] = useState(null);
  const [geocoderResults, setGeocoderResults] = useState([]);
  const [geocoderQuery, setGeocoderQuery] = useState('');
  const mapRef = useRef();

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await api.get('routes/routes/');
      
      const processedRoutes = response.data.map(route => {
        let geojson = null;
        if (route.geom) {
          try {
            geojson = wellknown.parse(route.geom);
          } catch (e) {
            console.error("Error parsing geom for route", route.id, e);
          }
        }
        return { ...route, geojson };
      }).filter(r => r.geojson);
      
      setRoutes(processedRoutes);
    } catch (error) {
      console.error("Error fetching routes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRoutes = useMemo(() => {
    return routes.filter(r => 
      r.nombre.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [routes, searchQuery]);

  const selectedRoute = useMemo(() => 
    routes.find(r => r.id === selectedRouteId), 
    [routes, selectedRouteId]
  );

  const handleSelectRoute = (route) => {
    setSelectedRouteId(route.id);
    if (route.geojson && route.geojson.coordinates.length > 0) {
      const firstCoord = route.geojson.coordinates[0];
      setViewState(prev => ({
        ...prev,
        latitude: firstCoord[1],
        longitude: firstCoord[0],
        zoom: 14,
        transitionDuration: 1000
      }));
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
          countries: ['VE'] // Focus on Venezuela
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
      zoom: 15,
      transitionDuration: 1000
    }));
    setGeocoderQuery(feature.place_name);
    setGeocoderResults([]);
  };

  // GeoJSON data for all routes
  const routesGeoJSON = useMemo(() => ({
    type: 'FeatureCollection',
    features: routes.map(route => ({
      type: 'Feature',
      properties: { 
        id: route.id, 
        name: route.nombre,
        color: selectedRouteId === route.id ? '#00E5FF' : '#94A3B8'
      },
      geometry: route.geojson
    }))
  }), [routes, selectedRouteId]);

  return (
    <div className="-m-container-margin md:-m-8 flex h-[calc(100vh-64px)] overflow-hidden font-public-sans bg-surface-container">
      {/* Sidebar */}
      <aside className="w-[380px] bg-surface-container-lowest border-r border-outline-variant flex flex-col z-[10] shadow-[4px_0_24px_rgba(0,0,0,0.03)] shrink-0">
        <div className="p-6 border-b border-outline-variant shrink-0 bg-surface-container-lowest">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-title-sm text-title-sm text-on-surface">Explorador de Rutas</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Gestión de trayectos geoespaciales</p>
            </div>
            <button aria-label="Refresh Routes" onClick={fetchRoutes} className="bg-primary hover:bg-primary-fixed-variant text-on-primary rounded flex items-center justify-center p-2 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[20px]">{loading ? 'sync' : 'refresh'}</span>
            </button>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
            <input 
              className="w-full bg-surface-container-low border border-outline-variant rounded py-2.5 pl-9 pr-3 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
              placeholder="Buscar por nombre..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-surface p-4 flex flex-col gap-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 opacity-50">
              <span className="material-symbols-outlined animate-spin text-4xl mb-2">sync</span>
              <p className="text-sm font-medium">Cargando rutas...</p>
            </div>
          ) : filteredRoutes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 opacity-50 text-center">
              <span className="material-symbols-outlined text-4xl mb-2">map_off</span>
              <p className="text-sm font-medium">No se encontraron rutas</p>
            </div>
          ) : (
            filteredRoutes.map(route => (
              <div 
                key={route.id}
                onClick={() => handleSelectRoute(route)}
                className={`bg-surface-container-lowest rounded-lg border p-4 cursor-pointer relative overflow-hidden transition-all hover:shadow-md ${selectedRouteId === route.id ? 'border-primary' : 'border-outline-variant hover:border-outline'}`}
              >
                {selectedRouteId === route.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>}
                <div className="flex justify-between items-start mb-2">
                  <span className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">ID: {route.id}</span>
                  <span className="bg-primary-container text-on-primary-container px-2 py-0.5 rounded font-label-sm text-label-sm">{route.tipo_nombre || 'Ruta'}</span>
                </div>
                <h3 className="font-title-sm text-title-sm text-on-surface mb-1">{route.nombre}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">route</span> {route.distancia_km || '0'} km
                </p>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Map Area */}
      <section className="flex-1 relative bg-surface-dim overflow-hidden">
        {/* Geocoder UI */}
        <div className="absolute top-6 left-6 z-[20] w-72">
          <div className="relative shadow-2xl">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-[20px]">location_on</span>
            <input 
              className="w-full bg-surface-container-highest/90 backdrop-blur-md border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" 
              placeholder="Buscar ubicación..." 
              type="text"
              value={geocoderQuery}
              onChange={(e) => handleGeocoderSearch(e.target.value)}
            />
            {geocoderResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-highest/95 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                {geocoderResults.map(result => (
                  <div 
                    key={result.id}
                    onClick={() => handleSelectLocation(result)}
                    className="px-4 py-3 text-xs text-on-surface hover:bg-primary/20 cursor-pointer border-b border-white/5 last:border-0 transition-colors"
                  >
                    {result.place_name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/navigation-night-v1"
          mapboxAccessToken={MAPBOX_TOKEN}
          ref={mapRef}
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl position="bottom-right" />
          
          <Source type="geojson" data={routesGeoJSON}>
            <Layer
              id="routes-layer"
              type="line"
              paint={{
                'line-color': ['get', 'color'],
                'line-width': ['case', ['==', ['get', 'id'], selectedRouteId], 6, 3],
                'line-opacity': ['case', ['==', ['get', 'id'], selectedRouteId], 1, 0.5]
              }}
              layout={{
                'line-join': 'round',
                'line-cap': 'round'
              }}
            />
          </Source>

          {selectedRoute && selectedRoute.geojson && selectedRoute.geojson.coordinates.length > 0 && (
            <Marker 
              longitude={selectedRoute.geojson.coordinates[0][0]} 
              latitude={selectedRoute.geojson.coordinates[0][1]}
              onClick={e => {
                e.originalEvent.stopPropagation();
                setPopupInfo(selectedRoute);
              }}
            >
              <div className="text-primary animate-bounce">
                <span className="material-symbols-outlined text-3xl">location_on</span>
              </div>
            </Marker>
          )}

          {popupInfo && (
            <Popup
              anchor="top"
              longitude={popupInfo.geojson.coordinates[0][0]}
              latitude={popupInfo.geojson.coordinates[0][1]}
              onClose={() => setPopupInfo(null)}
              className="z-[20]"
            >
              <div className="p-2 min-w-[150px]">
                <h4 className="font-bold text-sm mb-1">{popupInfo.nombre}</h4>
                <p className="text-[10px] text-on-surface-variant">{popupInfo.distancia_km} km • {popupInfo.tipo_nombre || 'Ruta'}</p>
              </div>
            </Popup>
          )}
        </Map>

        {/* Status Badge */}
        <div className="absolute top-6 right-6 z-[10] pointer-events-none">
          <div className="bg-primary/20 backdrop-blur-md border border-primary/30 px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-primary relative">
              <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75"></span>
            </span>
            <span className="font-bold text-xs text-primary uppercase tracking-widest">
              {routes.length} Rutas Geoespaciales
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RouteMap;
