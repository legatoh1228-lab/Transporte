import os

file_path = 'frontend/src/pages/Asignaciones.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports for map
if "import { MapContainer" not in content:
    content = content.replace("import { usePagination } from '../hooks/usePagination';",
                              "import { usePagination } from '../hooks/usePagination';\nimport { MapContainer, TileLayer, Polyline } from 'react-leaflet';\nimport 'leaflet/dist/leaflet.css';")

# 2. Add selected object lookups
old_lookups = """    const selectedOperatorObj = formData.operador ? allOperators.find(op => op.cedula === formData.operador) : null;
    const selectedVehicleObj = formData.vehiculo ? orgVehicles.find(v => v.placa === formData.vehiculo) : null;"""

new_lookups = """    const selectedOperatorObj = formData.operador ? allOperators.find(op => op.cedula === formData.operador) : null;
    const selectedColectorObj = formData.colector ? allColectores.find(c => c.cedula === formData.colector) : null;
    const selectedVehicleObj = formData.vehiculo ? orgVehicles.find(v => v.placa === formData.vehiculo) : null;
    const selectedRouteObj = formData.ruta ? allRoutes.find(r => String(r.id) === String(formData.ruta)) : null;

    // Helper para parsear la ruta en el mapa (Leaflet usa [Lat, Lng], GeoJSON usa [Lng, Lat])
    const getRouteCoordinates = (geom) => {
        if (!geom || !geom.coordinates) return [];
        if (geom.type === 'LineString') {
            return geom.coordinates.map(coord => [coord[1], coord[0]]);
        }
        if (geom.type === 'MultiLineString') {
            return geom.coordinates.map(line => line.map(coord => [coord[1], coord[0]]));
        }
        return [];
    };"""

content = content.replace(old_lookups, new_lookups)

# 3. Add Colector and Route Map Preview
old_preview_container = """                    {/* Right: Previews */}
                    <div className="lg:col-span-5 flex flex-col gap-5 lg:border-l border-outline-variant/30 lg:pl-6 pt-4 lg:pt-0 border-t lg:border-t-0">
                        {/* Operador Preview */}"""

new_preview_container = """                    {/* Right: Previews */}
                    <div className="lg:col-span-5 flex flex-col gap-4 lg:border-l border-outline-variant/30 lg:pl-6 pt-4 lg:pt-0 border-t lg:border-t-0 max-h-[75vh] overflow-y-auto custom-scrollbar pr-2">
                        {/* Route Map Preview */}
                        <div className={`p-5 rounded-2xl border transition-all duration-300 overflow-hidden ${selectedRouteObj ? 'bg-surface-container-lowest border-tertiary/30 shadow-sm' : 'bg-surface-container-lowest/50 border-outline-variant border-dashed'}`}>
                            <span className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest block mb-4">Vista Previa de Ruta</span>
                            {selectedRouteObj ? (
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-[20px]">alt_route</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-on-surface truncate">{selectedRouteObj.nombre}</p>
                                            <p className="text-xs text-on-surface-variant font-medium truncate">{selectedRouteObj.municipio_or_nombre} → {selectedRouteObj.municipio_des_nombre}</p>
                                        </div>
                                    </div>
                                    {selectedRouteObj.geom && getRouteCoordinates(selectedRouteObj.geom).length > 0 ? (
                                        <div className="w-full h-40 rounded-xl overflow-hidden border border-outline-variant/30 mt-2 z-0 relative isolate">
                                            <MapContainer 
                                                bounds={selectedRouteObj.geom.type === 'LineString' ? getRouteCoordinates(selectedRouteObj.geom) : getRouteCoordinates(selectedRouteObj.geom).flat()} 
                                                zoom={12} 
                                                style={{ height: '100%', width: '100%', zIndex: 0 }}
                                                scrollWheelZoom={false}
                                                dragging={false}
                                                zoomControl={false}
                                            >
                                                <TileLayer
                                                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                                />
                                                <Polyline 
                                                    positions={getRouteCoordinates(selectedRouteObj.geom)} 
                                                    color="var(--color-primary)" 
                                                    weight={4} 
                                                    opacity={0.8}
                                                />
                                            </MapContainer>
                                        </div>
                                    ) : (
                                        <div className="w-full h-24 rounded-xl bg-tertiary/5 border border-tertiary/20 text-tertiary flex items-center justify-center shadow-inner mt-2">
                                            <div className="text-center">
                                                <span className="material-symbols-outlined text-[24px]">map</span>
                                                <p className="text-[10px] font-bold uppercase mt-1">Sin trazo satelital</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center text-on-surface-variant/50 h-24">
                                    <span className="material-symbols-outlined text-[32px] mb-2">map</span>
                                    <p className="text-xs font-medium">Seleccione una ruta para ver su mapa</p>
                                </div>
                            )}
                        </div>

                        {/* Operador Preview */}"""

content = content.replace(old_preview_container, new_preview_container)

old_vehicle_preview_end = """                                </div>
                            )}
                        </div>
                    </div>"""

new_vehicle_preview_end = """                                </div>
                            )}
                        </div>

                        {/* Colector Preview */}
                        <div className={`p-5 rounded-2xl border transition-all duration-300 ${selectedColectorObj ? 'bg-surface-container-lowest border-success/30 shadow-sm' : 'bg-surface-container-lowest/50 border-outline-variant border-dashed'}`}>
                            <span className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest block mb-4">Perfil del Colector</span>
                            {selectedColectorObj ? (
                                <div className="flex items-center gap-4">
                                    {selectedColectorObj.foto ? (
                                        <img src={selectedColectorObj.foto} alt="Colector" className="w-14 h-14 rounded-full object-cover border-2 border-success/20 shadow-sm shrink-0" />
                                    ) : (
                                        <div className="w-14 h-14 rounded-full bg-success/10 border-2 border-success/20 text-success flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-[28px]">group</span>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm text-on-surface truncate">{selectedColectorObj.nombres} {selectedColectorObj.apellidos}</p>
                                        <p className="text-xs text-on-surface-variant mt-0.5 font-medium truncate">CI: {selectedColectorObj.cedula}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center text-on-surface-variant/50 h-16">
                                    <span className="material-symbols-outlined text-[28px] mb-1">group</span>
                                    <p className="text-[10px] font-medium">Sin colector seleccionado</p>
                                </div>
                            )}
                        </div>

                    </div>"""

content = content.replace(old_vehicle_preview_end, new_vehicle_preview_end)


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Asignaciones.jsx updated successfully")
