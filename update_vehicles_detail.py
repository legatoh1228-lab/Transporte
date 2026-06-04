import sys

with open('frontend/src/pages/Vehicles.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

target_detail = """                       <div className="flex items-center gap-4 pt-2">
                         <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${selectedVehicle.aire_acondicionado ? 'bg-success/10 text-success' : 'bg-surface-variant text-on-surface-variant/40'}`}>
                            <span className="material-symbols-outlined text-[18px]">{selectedVehicle.aire_acondicionado ? 'ac_unit' : 'ac_unit_off'}</span>
                            <span className="text-[10px] font-black uppercase">Aire Acond.</span>
                         </div>
                         <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${selectedVehicle.accesibilidad ? 'bg-success/10 text-success' : 'bg-surface-variant text-on-surface-variant/40'}`}>
                            <span className="material-symbols-outlined text-[18px]">accessible</span>
                            <span className="text-[10px] font-black uppercase">Accesible</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-8">"""

repl_detail = """                       <div className="flex items-center gap-4 pt-2">
                         <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${selectedVehicle.aire_acondicionado ? 'bg-success/10 text-success' : 'bg-surface-variant text-on-surface-variant/40'}`}>
                            <span className="material-symbols-outlined text-[18px]">{selectedVehicle.aire_acondicionado ? 'ac_unit' : 'ac_unit_off'}</span>
                            <span className="text-[10px] font-black uppercase">Aire Acond.</span>
                         </div>
                         <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${selectedVehicle.accesibilidad ? 'bg-success/10 text-success' : 'bg-surface-variant text-on-surface-variant/40'}`}>
                            <span className="material-symbols-outlined text-[18px]">accessible</span>
                            <span className="text-[10px] font-black uppercase">Accesible</span>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Especificaciones Mecánicas Detail */}
                <div className="bg-surface-container-lowest p-8 rounded-[32px] border border-outline-variant/40 space-y-6 shadow-sm mt-0">
                   <h4 className="text-[11px] font-black text-secondary uppercase tracking-[0.3em] flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px]">build_circle</span>
                      Perfil Mecánico
                   </h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-surface-container-low/50 p-4 rounded-2xl border border-outline-variant/30 flex flex-col justify-center">
                         <span className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest mb-1">Serial de Motor</span>
                         <span className="font-mono font-black text-on-surface text-sm">{selectedVehicle.serial_motor || 'No especificado'}</span>
                      </div>
                      <div className="bg-surface-container-low/50 p-4 rounded-2xl border border-outline-variant/30 flex flex-col justify-center">
                         <span className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest mb-1">Aceite de Motor</span>
                         <span className="font-black text-on-surface text-sm">{selectedVehicle.tipo_aceite || 'No especificado'}</span>
                      </div>
                      <div className="bg-surface-container-low/50 p-4 rounded-2xl border border-outline-variant/30 flex flex-col justify-center">
                         <span className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest mb-1">Cauchos / Neumáticos</span>
                         <span className="font-black text-on-surface text-sm">{selectedVehicle.tamano_caucho || 'No especificado'}</span>
                      </div>
                      {selectedVehicle.modalidad == 3 && (
                         <div className="bg-secondary/5 p-4 rounded-2xl border border-secondary/20 flex flex-col justify-center col-span-2 sm:col-span-1">
                            <span className="text-[10px] font-black text-secondary/70 uppercase tracking-widest mb-1">Kit de Arrastre / Rin</span>
                            <span className="font-black text-secondary text-sm">
                               {selectedVehicle.tipo_rin || 'Rin N/A'} • {selectedVehicle.medida_cadena || 'Cadena N/A'}
                            </span>
                         </div>
                      )}
                   </div>
                </div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-8 mt-0">"""

if target_detail in text:
    text = text.replace(target_detail, repl_detail)
    print("Detail view successfully updated")
else:
    print("Target not found in detail view!")

with open('frontend/src/pages/Vehicles.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
