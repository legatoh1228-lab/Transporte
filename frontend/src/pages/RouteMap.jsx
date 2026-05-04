import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import wellknown from 'wellknown';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Helper component to center map when selected route changes
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

const RouteMap = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState([10.2469, -67.5958]); // Default Maracay
  const [mapZoom, setMapZoom] = useState(13);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await api.get('routes/routes/');
      
      const processedRoutes = response.data.map(route => {
        let coordinates = [];
        if (route.geom) {
          try {
            const geojson = wellknown.parse(route.geom);
            if (geojson && geojson.type === 'LineString') {
              coordinates = geojson.coordinates.map(coord => [coord[1], coord[0]]);
            }
          } catch (e) {
            console.error("Error parsing geom for route", route.id, e);
          }
        }
        return { ...route, coordinates };
      }).filter(r => r.coordinates.length > 0);
      
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
    if (route.coordinates.length > 0) {
      setMapCenter(route.coordinates[0]);
      setMapZoom(14);
    }
  };

  return (
    <div className="-m-container-margin md:-m-8 flex h-[calc(100vh-64px)] overflow-hidden font-public-sans bg-surface-container">
      {/* Sidebar */}
      <aside className="w-[380px] bg-surface-container-lowest border-r border-outline-variant flex flex-col z-[1001] shadow-[4px_0_24px_rgba(0,0,0,0.03)] shrink-0">
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
        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <ChangeView center={mapCenter} zoom={mapZoom} />
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {routes.map(route => (
            <Polyline
              key={route.id}
              positions={route.coordinates}
              pathOptions={{
                color: selectedRouteId === route.id ? '#032448' : '#74777f',
                weight: selectedRouteId === route.id ? 6 : 3,
                opacity: selectedRouteId === route.id ? 1 : 0.4
              }}
              eventHandlers={{
                click: () => handleSelectRoute(route)
              }}
            />
          ))}

          {selectedRoute && selectedRoute.coordinates.length > 0 && (
            <Marker position={selectedRoute.coordinates[0]}>
              <Popup>{selectedRoute.nombre}</Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Status Badge */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
          <div className="bg-surface-container-highest/80 backdrop-blur border border-outline-variant px-4 py-2 rounded-full shadow-sm flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary-fixed-dim relative">
              <span className="absolute inset-0 rounded-full bg-tertiary-fixed-dim animate-ping opacity-75"></span>
            </span>
            <span className="font-label-bold text-label-bold text-on-surface uppercase tracking-wider">
              {routes.length} Rutas Cargadas
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RouteMap;
