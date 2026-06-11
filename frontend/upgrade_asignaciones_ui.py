import os

file_path = 'src/pages/Asignaciones.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_preview_start = """                    {/* Right: Previews */}
                    <div className="lg:col-span-5 flex flex-col gap-4 lg:border-l border-outline-variant/30 lg:pl-6 pt-4 lg:pt-0 border-t lg:border-t-0 max-h-[75vh] overflow-y-auto custom-scrollbar pr-2 pb-10">
                        {/* Route Map Preview */}
                        <div className={`p-5 rounded-2xl border transition-all duration-300 overflow-visible ${selectedRouteObj ? 'bg-surface-container-lowest border-tertiary/30 shadow-sm' : 'bg-surface-container-lowest/50 border-outline-variant border-dashed'}`}>"""

# We'll replace everything from old_preview_start to the end of the previews section.
# Let's find the string boundaries.
start_idx = content.find("                    {/* Right: Previews */}")
end_idx = content.find("                    </div>\n                </div>\n            </Modal>")

new_previews = """                    {/* Right: Previews */}
                    <div className="lg:col-span-5 flex flex-col gap-6 lg:border-l border-outline-variant/30 lg:pl-8 pt-4 lg:pt-0 border-t lg:border-t-0 max-h-[75vh] overflow-y-auto custom-scrollbar pr-2 pb-10">
                        
                        <div className="mb-2">
                            <h3 className="text-xl font-black text-on-surface tracking-tight">Resumen Visual</h3>
                            <p className="text-sm font-medium text-on-surface-variant mt-1">Previsualización de los recursos asignados</p>
                        </div>

                        {/* Route Map Preview */}
                        <div className={`p-6 rounded-[24px] border transition-all duration-500 overflow-visible group ${selectedRouteObj ? 'bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-tertiary/30' : 'bg-surface-container-lowest/50 border-outline-variant/50 border-dashed'}`}>
                            <div className="flex items-center gap-2 mb-5">
                                <span className="material-symbols-outlined text-[18px] text-tertiary/70">map</span>
                                <span className="text-[11px] font-black text-tertiary/80 uppercase tracking-[0.15em]">Vista Previa de Ruta</span>
                            </div>
                            {selectedRouteObj ? (
                                <div className="flex flex-col gap-4 min-h-[100px]">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-tertiary/20 to-tertiary/5 text-tertiary flex items-center justify-center shrink-0 shadow-inner">
                                            <span className="material-symbols-outlined text-[24px]">alt_route</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-base text-on-surface truncate">{selectedRouteObj.nombre}</p>
                                            <p className="text-sm text-on-surface-variant font-medium truncate mt-0.5">{selectedRouteObj.municipio_or_nombre || 'N/A'} → {selectedRouteObj.municipio_des_nombre || 'N/A'}</p>
                                        </div>
                                    </div>
                                    {(() => {
                                        const coords = selectedRouteObj.geom ? getRouteCoordinates(selectedRouteObj.geom) : [];
                                        return coords.length > 1 ? (
                                            <div className="w-full h-48 rounded-[20px] overflow-hidden border border-outline-variant/30 mt-2 z-0 relative isolate shadow-inner group-hover:border-tertiary/40 transition-colors" style={{ minHeight: '192px' }}>
                                                <MapContainer 
                                                    center={coords[0]}
                                                    zoom={12}
                                                    style={{ height: '100%', width: '100%', zIndex: 0 }}
                                                    scrollWheelZoom={false}
                                                    dragging={true}
                                                    zoomControl={true}
                                                >
                                                    <MapUpdater bounds={coords} />
                                                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                                                    <Polyline positions={coords} color="#0ea5e9" weight={6} opacity={0.9} />
                                                </MapContainer>
                                            </div>
                                        ) : (
                                            <div className="w-full h-32 rounded-[20px] bg-tertiary/5 border border-tertiary/20 text-tertiary flex flex-col items-center justify-center shadow-inner mt-2" style={{ minHeight: '128px' }}>
                                                <span className="material-symbols-outlined text-[32px] opacity-80">map</span>
                                                <p className="text-[11px] font-bold uppercase mt-2 tracking-widest opacity-80">Sin trazo satelital</p>
                                            </div>
                                        );
                                    })()}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center text-on-surface-variant/40 h-32 bg-surface-container/30 rounded-[20px]" style={{ minHeight: '128px' }}>
                                    <span className="material-symbols-outlined text-[40px] mb-2 opacity-50">map</span>
                                    <p className="text-sm font-medium">Seleccione una ruta</p>
                                </div>
                            )}
                        </div>

                        {/* Operador Preview */}
                        <div className={`p-6 rounded-[24px] border transition-all duration-500 group ${selectedOperatorObj ? 'bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-primary/30' : 'bg-surface-container-lowest/50 border-outline-variant/50 border-dashed'}`}>
                            <div className="flex items-center gap-2 mb-5">
                                <span className="material-symbols-outlined text-[18px] text-primary/70">badge</span>
                                <span className="text-[11px] font-black text-primary/80 uppercase tracking-[0.15em]">Perfil del Operador</span>
                            </div>
                            {selectedOperatorObj ? (
                                <div className="flex items-center gap-5">
                                    {selectedOperatorObj.foto ? (
                                        <img src={selectedOperatorObj.foto} alt="Operador" className="w-[72px] h-[72px] rounded-full object-cover border-[3px] border-white shadow-md shrink-0 ring-2 ring-primary/20" />
                                    ) : (
                                        <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-[3px] border-white shadow-md text-primary flex items-center justify-center shrink-0 ring-2 ring-primary/20">
                                            <span className="material-symbols-outlined text-[36px]">person</span>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-base text-on-surface truncate">{selectedOperatorObj.nombres} {selectedOperatorObj.apellidos}</p>
                                        <p className="text-sm text-on-surface-variant mt-0.5 font-medium truncate">CI: {selectedOperatorObj.cedula}</p>
                                        <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-md mt-2 border border-primary/10">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                            <p className="text-[10px] uppercase font-black tracking-wider">Operador Activo</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center text-on-surface-variant/40 h-24 bg-surface-container/30 rounded-[20px]">
                                    <span className="material-symbols-outlined text-[36px] mb-2 opacity-50">account_circle</span>
                                    <p className="text-sm font-medium">Seleccione un operador</p>
                                </div>
                            )}
                        </div>

                        {/* Colector Preview */}
                        <div className={`p-6 rounded-[24px] border transition-all duration-500 group ${selectedColectorObj ? 'bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-success/30' : 'bg-surface-container-lowest/50 border-outline-variant/50 border-dashed'}`}>
                            <div className="flex items-center gap-2 mb-5">
                                <span className="material-symbols-outlined text-[18px] text-success/70">group</span>
                                <span className="text-[11px] font-black text-success/80 uppercase tracking-[0.15em]">Perfil del Colector</span>
                            </div>
                            {selectedColectorObj ? (
                                <div className="flex items-center gap-5">
                                    {selectedColectorObj.foto ? (
                                        <img src={selectedColectorObj.foto} alt="Colector" className="w-[60px] h-[60px] rounded-full object-cover border-[3px] border-white shadow-md shrink-0 ring-2 ring-success/20" />
                                    ) : (
                                        <div className="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-success/20 to-success/5 border-[3px] border-white shadow-md text-success flex items-center justify-center shrink-0 ring-2 ring-success/20">
                                            <span className="material-symbols-outlined text-[28px]">group</span>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-base text-on-surface truncate">{selectedColectorObj.nombres} {selectedColectorObj.apellidos}</p>
                                        <p className="text-sm text-on-surface-variant mt-0.5 font-medium truncate">CI: {selectedColectorObj.cedula}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center text-on-surface-variant/40 h-24 bg-surface-container/30 rounded-[20px]">
                                    <span className="material-symbols-outlined text-[36px] mb-2 opacity-50">group</span>
                                    <p className="text-sm font-medium">Sin colector seleccionado</p>
                                </div>
                            )}
                        </div>

                        {/* Vehicle Preview */}
                        <div className={`p-6 rounded-[24px] border transition-all duration-500 group ${selectedVehicleObj ? 'bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-secondary/30' : 'bg-surface-container-lowest/50 border-outline-variant/50 border-dashed'}`}>
                            <div className="flex items-center gap-2 mb-5">
                                <span className="material-symbols-outlined text-[18px] text-secondary/70">directions_bus</span>
                                <span className="text-[11px] font-black text-secondary/80 uppercase tracking-[0.15em]">Unidad Asignada</span>
                            </div>
                            {selectedVehicleObj ? (
                                <div className="flex flex-col gap-5">
                                    {selectedVehicleObj.foto ? (
                                        <div className="relative w-full h-40 rounded-[20px] overflow-hidden shadow-inner group-hover:shadow-md transition-shadow">
                                            <img src={selectedVehicleObj.foto} alt="Vehículo" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 border border-black/10 rounded-[20px] pointer-events-none"></div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-32 rounded-[20px] bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 text-secondary flex items-center justify-center shadow-inner">
                                            <span className="material-symbols-outlined text-[48px] opacity-80">directions_bus</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-end bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30">
                                        <div className="min-w-0 pr-4">
                                            <p className="font-black text-base text-on-surface truncate">{selectedVehicleObj.marca} {selectedVehicleObj.modelo}</p>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Placa</span>
                                                <span className="bg-surface-container text-on-surface font-black px-2 py-0.5 rounded text-sm border border-outline-variant/50 shadow-sm">{selectedVehicleObj.placa}</span>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 flex flex-col items-end">
                                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Capacidad</p>
                                            <div className="flex items-center gap-1.5 bg-secondary/10 px-2.5 py-1 rounded-lg border border-secondary/20 text-secondary">
                                                <span className="material-symbols-outlined text-[16px]">groups</span>
                                                <span className="text-sm font-black">{selectedVehicleObj.capacidad} <span className="text-[10px] uppercase font-bold opacity-80">pax</span></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center text-on-surface-variant/40 h-32 bg-surface-container/30 rounded-[20px]">
                                    <span className="material-symbols-outlined text-[40px] mb-2 opacity-50">directions_bus</span>
                                    <p className="text-sm font-medium">Seleccione una unidad</p>
                                </div>
                            )}
                        </div>

"""

new_content = content[:start_idx] + new_previews + content[end_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("UI Upgraded successfully")
