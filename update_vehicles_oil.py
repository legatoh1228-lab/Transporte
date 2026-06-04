import re

with open('frontend/src/pages/Vehicles.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update initial formData
old_form_data = """    tipo_aceite: '',
    tamano_caucho: '',"""
new_form_data = """    tipo_aceite: '',
    aceite_clasificacion: '',
    aceite_marca: '',
    tamano_caucho: '',"""

if old_form_data in text:
    text = text.replace(old_form_data, new_form_data)
else:
    # Let's try matching something else to ensure we update formData
    print("WARNING: Could not find old_form_data. Trying another method.")
    text = text.replace("tipo_aceite: '',", "tipo_aceite: '',\n    aceite_clasificacion: '',\n    aceite_marca: '',")

# 2. Update the Registration Modal (Especificaciones Mecánicas)
target_mech = """                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Tipo de Aceite</label>
                        <input name="tipo_aceite" value={formData.tipo_aceite || ''} onChange={handleInputChange} placeholder="Ej: 15W-40" className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase" />
                     </div>"""

repl_mech = """                     <div className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Viscosidad del Aceite</label>
                           <input name="tipo_aceite" value={formData.tipo_aceite || ''} onChange={handleInputChange} placeholder="Ej: 15W-40" className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase" />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Tipo / Clasificación</label>
                           <select name="aceite_clasificacion" value={formData.aceite_clasificacion || ''} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase">
                              <option value="">Seleccione...</option>
                              <option value="Mineral">Mineral</option>
                              <option value="Semi-Sintético">Semi-Sintético</option>
                              <option value="Sintético">Sintético</option>
                              <option value="Alto Kilometraje">Alto Kilometraje</option>
                           </select>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Marca de Aceite</label>
                           <input name="aceite_marca" value={formData.aceite_marca || ''} onChange={handleInputChange} placeholder="Ej: Castrol, Motul..." className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase" />
                        </div>
                     </div>"""

if target_mech in text:
    text = text.replace(target_mech, repl_mech)
else:
    print("WARNING: Could not find target_mech.")

# 3. Update the Detail View
target_detail = """                      <div className="bg-surface-container-low/50 p-4 rounded-2xl border border-outline-variant/30 flex flex-col justify-center">
                         <span className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest mb-1">Aceite de Motor</span>
                         <span className="font-black text-on-surface text-sm">{selectedVehicle.tipo_aceite || 'No especificado'}</span>
                      </div>"""

repl_detail = """                      <div className="bg-surface-container-low/50 p-4 rounded-2xl border border-outline-variant/30 flex flex-col justify-center">
                         <span className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest mb-1">Aceite de Motor</span>
                         <span className="font-black text-on-surface text-sm">
                            {selectedVehicle.tipo_aceite || 'S/N Viscosidad'} • {selectedVehicle.aceite_clasificacion || 'S/N Tipo'}
                            <span className="block text-xs font-bold text-primary/70 mt-0.5">{selectedVehicle.aceite_marca || 'Marca no especificada'}</span>
                         </span>
                      </div>"""

if target_detail in text:
    text = text.replace(target_detail, repl_detail)
else:
    print("WARNING: Could not find target_detail.")

with open('frontend/src/pages/Vehicles.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("Updated Vehicles UI with oil fields.")
