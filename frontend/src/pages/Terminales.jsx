import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import wellknown from 'wellknown';
import { Modal } from '../components/common/Modal';
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

export default function Terminales() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });

  const [terminales, setTerminales] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [geocoderQuery, setGeocoderQuery] = useState('');
  const [geocoderResults, setGeocoderResults] = useState([]);
  const [map, setMap] = useState(null);

  const [formData, setFormData] = useState({
    id: null,
    nombre: '',
    municipio: '',
    tipo: 'Principal',
    capacidad_andenes: 0,
    estatus: 'Activo',
    location: null
  });

  const [mapPoint, setMapPoint] = useState(null); // {lat, lng}

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resTerm, resMun] = await Promise.all([
        api.get('fleet/terminales/'),
        api.get('catalogs/municipios/')
      ]);
      setTerminales(resTerm.data);
      setMunicipios(resMun.data);
    } catch (err) {
      console.error("Error fetching terminales:", err);
      setError("Error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTerminales = useMemo(() => {
    return terminales.filter(t => 
      t.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.municipio_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [terminales, searchTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMapPoint({ lat, lng });
    
    // Convert to WKT Point
    const wkt = wellknown.stringify({
      type: 'Point',
      coordinates: [lng, lat]
    });
    setFormData(prev => ({ ...prev, location: wkt }));
  };

  const handleGeocoderSearch = async (query) => {
    setGeocoderQuery(query);
    if (query.length > 2 && window.google) {
      const service = new window.google.maps.places.AutocompleteService();
      service.getPlacePredictions({ 
        input: query, 
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

  const handleSelectLocation = (place) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ placeId: place.place_id }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const loc = results[0].geometry.location;
        const lat = loc.lat();
        const lng = loc.lng();
        
        if (map) {
          map.panTo(loc);
          map.setZoom(16);
        }
        
        setMapPoint({ lat, lng });
        
        const wkt = wellknown.stringify({
          type: 'Point',
          coordinates: [lng, lat]
        });
        setFormData(prev => ({ ...prev, location: wkt }));
        
        setGeocoderQuery('');
        setGeocoderResults([]);
      }
    });
  };

  const resetForm = () => {
    setFormData({
      id: null,
      nombre: '',
      municipio: '',
      tipo: 'Principal',
      capacidad_andenes: 0,
      estatus: 'Activo',
      location: null
    });
    setMapPoint(null);
    setGeocoderQuery('');
    setGeocoderResults([]);
    setIsEditing(false);
    setError(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (terminal) => {
    setFormData({
      id: terminal.id,
      nombre: terminal.nombre,
      municipio: terminal.municipio,
      tipo: terminal.tipo,
      capacidad_andenes: terminal.capacidad_andenes,
      estatus: terminal.estatus,
      location: terminal.location
    });

    if (terminal.location) {
      const geojson = wellknown.parse(terminal.location);
      if (geojson && geojson.type === 'Point') {
        const [lng, lat] = geojson.coordinates;
        setMapPoint({ lat, lng });
        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(16);
        }
      }
    } else {
      setMapPoint(null);
    }

    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.nombre || !formData.municipio) {
      setError("Nombre y Municipio son obligatorios.");
      return;
    }

    try {
      if (isEditing) {
        await api.put(`fleet/terminales/${formData.id}/`, formData);
      } else {
        await api.post('fleet/terminales/', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Error saving terminal:", err);
      setError("Error al guardar el terminal.");
    }
  };

  const onLoad = useCallback(function callback(mapInstance) {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(function callback(mapInstance) {
    setMap(null);
  }, []);

  return (
    <div className="flex flex-col gap-6 font-public-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Registro de Terminales</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">Gestión y control de la infraestructura de terminales de pasajeros.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center shadow-md active:scale-95"
        >
          <span className="material-symbols-outlined mr-2 text-[18px]">add</span>
          Registrar Terminal
        </button>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-outline-variant bg-surface-container-low flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
            <input 
              type="text" 
              placeholder="Buscar por nombre o municipio..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2 pl-9 pr-4 text-sm outline-none transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-on-surface">
            <thead className="bg-surface-container text-xs uppercase text-on-surface-variant font-bold">
              <tr>
                <th className="px-6 py-4">Nombre del Terminal</th>
                <th className="px-6 py-4">Municipio</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Andenes</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-10 text-center text-on-surface-variant animate-pulse">Cargando terminales...</td></tr>
              ) : filteredTerminales.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-10 text-center text-on-surface-variant">No se encontraron terminales.</td></tr>
              ) : filteredTerminales.map((row) => (
                <tr key={row.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4 font-bold flex items-center gap-3 text-primary">
                    <span className="material-symbols-outlined text-[20px]">store</span>
                    {row.nombre}
                  </td>
                  <td className="px-6 py-4 font-medium">{row.municipio_nombre}</td>
                  <td className="px-6 py-4">{row.tipo}</td>
                  <td className="px-6 py-4 font-bold">{row.capacidad_andenes}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      row.estatus === 'Activo' ? 'bg-primary/10 text-primary' : 
                      row.estatus === 'Mantenimiento' ? 'bg-warning/10 text-warning' : 
                      'bg-error/10 text-error'
                    }`}>
                      {row.estatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleEdit(row)}
                      className="text-on-surface-variant hover:text-primary p-2 rounded-lg hover:bg-primary/5 transition-all" 
                      title="Configurar"
                    >
                      <span className="material-symbols-outlined text-[18px]">tune</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? "Editar Terminal" : "Registrar Nuevo Terminal"}
        subtitle="Ubicación y configuración de infraestructura (Google Maps)"
        icon="store"
        maxWidthClass="max-w-4xl"
        actions={
          <>
            <button 
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 text-sm font-bold text-on-surface hover:bg-surface-variant rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSubmit}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 text-sm font-bold rounded-lg shadow-md transition-all active:scale-95"
            >
              {isEditing ? "Actualizar" : "Guardar Terminal"}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[450px]">
          <div className="space-y-4 overflow-y-auto pr-2">
            {error && <div className="text-error text-xs bg-error-container/10 p-3 rounded-lg border border-error/20">{error}</div>}
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase ml-1">Nombre del Terminal <span className="text-error">*</span></label>
              <input 
                name="nombre" 
                value={formData.nombre} 
                onChange={handleInputChange}
                type="text" 
                className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2 text-sm outline-none" 
                placeholder="Ej. Terminal Central de Maracay"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase ml-1">Municipio <span className="text-error">*</span></label>
              <select 
                name="municipio" 
                value={formData.municipio} 
                onChange={handleInputChange}
                className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2 text-sm outline-none cursor-pointer"
              >
                <option value="">Seleccione...</option>
                {municipios.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase ml-1">Tipo de Terminal</label>
                <select 
                  name="tipo" 
                  value={formData.tipo} 
                  onChange={handleInputChange}
                  className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2 text-sm outline-none cursor-pointer"
                >
                  <option value="Principal">Principal</option>
                  <option value="Secundario">Secundario</option>
                  <option value="Parada">Parada de Transferencia</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase ml-1">Andenes</label>
                <input 
                  name="capacidad_andenes" 
                  value={formData.capacidad_andenes} 
                  onChange={handleInputChange}
                  type="number" 
                  className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2 text-sm outline-none" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase ml-1">Estado Operativo</label>
              <select 
                name="estatus" 
                value={formData.estatus} 
                onChange={handleInputChange}
                className="w-full bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2 text-sm outline-none cursor-pointer"
              >
                <option value="Activo">Activo</option>
                <option value="Mantenimiento">Mantenimiento</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>

            <div className="mt-4 p-4 bg-primary/5 border border-primary/10 rounded-xl">
              <h4 className="text-[10px] font-bold text-primary uppercase mb-2">Coordenadas del Terminal</h4>
              {mapPoint ? (
                <div className="flex gap-4 text-xs font-mono">
                  <div><span className="text-on-surface-variant">LAT:</span> {mapPoint.lat.toFixed(6)}</div>
                  <div><span className="text-on-surface-variant">LNG:</span> {mapPoint.lng.toFixed(6)}</div>
                </div>
              ) : (
                <p className="text-[11px] text-on-surface-variant italic">Haz clic en el mapa para ubicar el terminal</p>
              )}
            </div>
          </div>

          <div className="h-full rounded-xl overflow-hidden border border-outline-variant relative">
            {!isLoaded ? (
              <div className="w-full h-full flex items-center justify-center bg-surface-container-low">Cargando Mapa...</div>
            ) : (
              <>
                {/* Geocoder in Modal */}
                <div className="absolute top-4 left-4 z-[20] w-64">
                  <div className="relative">
                    <input 
                      className="w-full bg-surface-container-highest/90 backdrop-blur-md border border-outline-variant rounded-lg py-2 px-3 pl-9 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-lg" 
                      placeholder="Buscar ubicación..." 
                      value={geocoderQuery}
                      onChange={(e) => handleGeocoderSearch(e.target.value)}
                    />
                    <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                    {geocoderResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-highest rounded-lg shadow-xl border border-outline-variant overflow-hidden max-h-48 overflow-y-auto">
                        {geocoderResults.map(res => (
                          <div 
                            key={res.place_id} 
                            onClick={() => handleSelectLocation(res)}
                            className="px-3 py-2 text-xs hover:bg-primary/10 cursor-pointer border-b border-outline-variant last:border-0"
                          >
                            {res.description}
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
                  onClick={handleMapClick}
                  onLoad={onLoad}
                  onUnmount={onUnmount}
                  options={{
                    disableDefaultUI: false,
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false
                  }}
                >
                  {mapPoint && (
                    <Marker position={mapPoint} />
                  )}
                </GoogleMap>
              </>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
