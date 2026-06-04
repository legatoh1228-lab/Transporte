import re

with open('frontend/src/pages/Vehicles.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update initial formData
old_form_data = """    tipo_rin: '',
    medida_cadena: '',
    foto: null
  });"""
new_form_data = """    tipo_rin: '',
    medida_cadena: '',
    fecha_mantenimiento_general: '',
    fecha_cambio_aceite: '',
    fecha_mantenimiento_motor: '',
    detalles_mantenimiento_motor: '',
    fecha_reemplazo_piezas: '',
    reemplazo_piezas_detalles: '',
    foto: null
  });"""
text = text.replace(old_form_data, new_form_data)

# 2. Add Maintenance Fields to Registration Modal
# Insert after: {/* Card 1.5: Especificaciones Mecánicas */} block
target_card2 = """               {/* Card 2: Operación & Capacidad */}"""

repl_card2 = """               {/* Card 1.8: Historial de Mantenimiento */}
               <div className="bg-surface-container-low p-8 rounded-[40px] border border-outline-variant/30 shadow-sm">
                  <h4 className="text-[11px] font-black text-warning uppercase tracking-[0.3em] flex items-center gap-3 mb-8">
                     <span className="material-symbols-outlined text-[20px]">engineering</span>
                     Registro de Mantenimiento Preventivo / Correctivo
                  </h4>
                  <div className="space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Último Mantenimiento General</label>
                           <input type="date" name="fecha_mantenimiento_general" value={formData.fecha_mantenimiento_general || ''} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-warning/20 transition-all" />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Último Cambio de Aceite</label>
                           <input type="date" name="fecha_cambio_aceite" value={formData.fecha_cambio_aceite || ''} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-warning/20 transition-all" />
                        </div>
                     </div>
                     
                     <div className="pt-4 border-t border-outline-variant/30 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Reemplazo de Piezas (Fecha)</label>
                           <input type="date" name="fecha_reemplazo_piezas" value={formData.fecha_reemplazo_piezas || ''} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-warning/20 transition-all" />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Piezas Reemplazadas (Detalles)</label>
                           <input name="reemplazo_piezas_detalles" value={formData.reemplazo_piezas_detalles || ''} onChange={handleInputChange} placeholder="Ej: Pastillas de freno, empacaduras..." className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-warning/20 transition-all" />
                        </div>
                     </div>

                     <div className="pt-4 border-t border-outline-variant/30 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Mantenimiento de Motor (Fecha)</label>
                           <input type="date" name="fecha_mantenimiento_motor" value={formData.fecha_mantenimiento_motor || ''} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-warning/20 transition-all" />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Mantenimiento de Motor (Detalles)</label>
                           <input name="detalles_mantenimiento_motor" value={formData.detalles_mantenimiento_motor || ''} onChange={handleInputChange} placeholder="Ej: Anillado, rectificación..." className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-warning/20 transition-all" />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Card 2: Operación & Capacidad */}"""
text = text.replace(target_card2, repl_card2)

# 3. Add to Detail View Modal
target_detail = """              {/* Right Column */}"""

repl_detail = """                {/* Historial de Mantenimiento Detail */}
                <div className="bg-surface-container-lowest p-8 rounded-[32px] border border-outline-variant/40 space-y-6 shadow-sm mt-0">
                   <h4 className="text-[11px] font-black text-warning uppercase tracking-[0.3em] flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px]">engineering</span>
                      Historial de Mantenimiento
                   </h4>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex items-center gap-4 p-4 bg-surface-container-low/30 rounded-2xl border border-outline-variant/20">
                         <div className="w-12 h-12 rounded-full bg-warning/10 text-warning flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-[24px]">handyman</span>
                         </div>
                         <div>
                            <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest block mb-1">Mantenimiento General</span>
                            <span className="text-sm font-black text-on-surface uppercase">{selectedVehicle.fecha_mantenimiento_general || 'Sin registro'}</span>
                         </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-surface-container-low/30 rounded-2xl border border-outline-variant/20">
                         <div className="w-12 h-12 rounded-full bg-warning/10 text-warning flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-[24px]">oil_barrel</span>
                         </div>
                         <div>
                            <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest block mb-1">Cambio de Aceite</span>
                            <span className="text-sm font-black text-on-surface uppercase">{selectedVehicle.fecha_cambio_aceite || 'Sin registro'}</span>
                         </div>
                      </div>
                   </div>
                   
                   <div className="space-y-4 pt-2">
                      <div className="p-5 bg-surface-container-low/20 rounded-2xl border border-outline-variant/20">
                         <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest flex items-center gap-2">
                               <span className="material-symbols-outlined text-[16px]">car_repair</span>
                               Reemplazo de Piezas
                            </span>
                            <span className="text-xs font-bold text-on-surface-variant">{selectedVehicle.fecha_reemplazo_piezas || '--/--/----'}</span>
                         </div>
                         <p className="text-sm font-bold text-on-surface">{selectedVehicle.reemplazo_piezas_detalles || 'No se han registrado detalles de piezas reemplazadas.'}</p>
                      </div>
                      
                      <div className="p-5 bg-surface-container-low/20 rounded-2xl border border-outline-variant/20">
                         <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest flex items-center gap-2">
                               <span className="material-symbols-outlined text-[16px]">car_engine</span>
                               Mantenimiento de Motor
                            </span>
                            <span className="text-xs font-bold text-on-surface-variant">{selectedVehicle.fecha_mantenimiento_motor || '--/--/----'}</span>
                         </div>
                         <p className="text-sm font-bold text-on-surface">{selectedVehicle.detalles_mantenimiento_motor || 'No se han registrado detalles del motor.'}</p>
                      </div>
                   </div>
                </div>
              </div>

              {/* Right Column */}"""
text = text.replace(target_detail, repl_detail)

with open('frontend/src/pages/Vehicles.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("Updated Vehicles UI with maintenance history.")
