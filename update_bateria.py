import os

file_path = 'frontend/src/pages/Vehicles.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update formData initial state
old_form_data = """    cps: '',
    observaciones: '',"""

new_form_data = """    cps: '',
    bateria_marca: '',
    bateria_amperaje: '',
    bateria_voltaje: '',
    bateria_fecha_instalacion: '',
    observaciones: '',"""
content = content.replace(old_form_data, new_form_data)

# 2. Add Battery Fields to Form
old_form_section = """                        <div className="space-y-5 mb-8">
                           <div className="flex items-center gap-3 border-b border-outline-variant/60 pb-3">
                              <span className="material-symbols-outlined text-primary">notes</span>
                              <h3 className="text-sm font-black text-on-surface uppercase tracking-wider">Observaciones (Opcional)</h3>
                           </div>"""

new_form_section = """                        {/* Sistema Eléctrico / Batería */}
                        <div className="space-y-5 mb-8">
                           <div className="flex items-center gap-3 border-b border-outline-variant/60 pb-3">
                              <span className="material-symbols-outlined text-primary">battery_charging_full</span>
                              <h3 className="text-sm font-black text-on-surface uppercase tracking-wider">Sistema Eléctrico (Batería)</h3>
                           </div>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                             <div className="flex flex-col gap-1.5">
                               <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Marca de Batería</label>
                               <input type="text" name="bateria_marca" value={formData.bateria_marca} onChange={handleInputChange} placeholder="Ej. Duncan" className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-black outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase" />
                             </div>
                             <div className="flex flex-col gap-1.5">
                               <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Amperaje</label>
                               <input type="text" name="bateria_amperaje" value={formData.bateria_amperaje} onChange={handleInputChange} placeholder="Ej. 800 AMP" className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-black outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase" />
                             </div>
                             <div className="flex flex-col gap-1.5">
                               <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Voltaje</label>
                               <select name="bateria_voltaje" value={formData.bateria_voltaje} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-black outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase">
                                  <option value="">Seleccione Voltaje</option>
                                  <option value="12V">12 Voltios (12V)</option>
                                  <option value="24V">24 Voltios (24V)</option>
                               </select>
                             </div>
                             <div className="flex flex-col gap-1.5">
                               <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Fecha de Instalación</label>
                               <input type="date" name="bateria_fecha_instalacion" value={formData.bateria_fecha_instalacion} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-black outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase" />
                             </div>
                           </div>
                        </div>

                        <div className="space-y-5 mb-8">
                           <div className="flex items-center gap-3 border-b border-outline-variant/60 pb-3">
                              <span className="material-symbols-outlined text-primary">notes</span>
                              <h3 className="text-sm font-black text-on-surface uppercase tracking-wider">Observaciones (Opcional)</h3>
                           </div>"""
content = content.replace(old_form_section, new_form_section)

# 3. Separate CPS column in Table Header
old_table_header = """                      <th 
                        className="py-4 px-6 font-black text-xs text-on-surface uppercase tracking-widest cursor-pointer group hover:bg-surface-container-high transition-colors"
                        onClick={() => handleSort('cps')}
                      >
                        <div className="flex items-center gap-2 relative">
                          <span>Modalidad / CPS</span>"""

new_table_header = """                      <th className="py-4 px-6 font-black text-xs text-on-surface uppercase tracking-widest cursor-pointer group hover:bg-surface-container-high transition-colors" onClick={() => handleSort('modalidad_nombre')}>
                        <div className="flex items-center gap-2 relative">
                          <span>Modalidad</span>
                        </div>
                      </th>
                      <th 
                        className="py-4 px-6 font-black text-xs text-on-surface uppercase tracking-widest cursor-pointer group hover:bg-surface-container-high transition-colors"
                        onClick={() => handleSort('cps')}
                      >
                        <div className="flex items-center gap-2 relative">
                          <span>CPS Autorizado</span>"""
content = content.replace(old_table_header, new_table_header)

# 4. Separate CPS column in Table Body
old_table_body = """                        <td className="py-4 px-6">
                           <span className="text-sm font-black text-on-surface">{v.modalidad_nombre || 'N/A'}</span>
                           <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest ml-1">{v.cps || 'S/C'}</span>
                           <span className="text-xs text-on-surface-variant block mt-0.5">{v.submodalidad_nombre || 'N/A'}</span>
                        </td>"""

new_table_body = """                        <td className="py-4 px-6">
                           <span className="text-sm font-black text-on-surface">{v.modalidad_nombre || 'N/A'}</span>
                           <span className="text-xs text-on-surface-variant block mt-0.5">{v.submodalidad_nombre || 'N/A'}</span>
                        </td>
                        <td className="py-4 px-6">
                           <div className="bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant w-max flex items-center gap-2">
                             <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
                             <span className="text-sm font-black text-on-surface">{v.cps || 'SIN REGISTRO'}</span>
                           </div>
                        </td>"""
content = content.replace(old_table_body, new_table_body)

# 5. Details Modal: CPS prominence
old_detail_cps = """                      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
                          <div className="w-10 h-10 bg-tertiary/10 rounded-xl flex items-center justify-center mb-2">
                             <span className="material-symbols-outlined text-tertiary">qr_code_scanner</span>
                          </div>
                          <span className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest block leading-none">CPS Autorizado</span>
                          <span className="text-sm font-black text-on-surface uppercase">{selectedVehicle.cps || 'No registrado'}</span>
                      </div>"""

new_detail_cps = """                      <div className="bg-primary border border-primary rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-md relative overflow-hidden">
                          <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
                          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-2 z-10">
                             <span className="material-symbols-outlined text-white">verified</span>
                          </div>
                          <span className="text-[10px] font-black text-white/70 uppercase tracking-widest block leading-none z-10">Código CPS Autorizado</span>
                          <span className="text-base font-black text-white uppercase z-10">{selectedVehicle.cps || 'SIN REGISTRO'}</span>
                      </div>"""
content = content.replace(old_detail_cps, new_detail_cps)

# 6. Details Modal: Add Battery section
old_detail_section = """                        {/* Mecánica Adicional */}
                        <div className="bg-surface-container border border-outline-variant/50 rounded-2xl p-5 mb-6">
                            <h4 className="text-sm font-black text-on-surface uppercase tracking-widest mb-4 flex items-center gap-2">
                               <span className="material-symbols-outlined text-primary">engineering</span>
                               Especificaciones Mecánicas Adicionales
                            </h4>"""

new_detail_section = """                        {/* Sistema Eléctrico / Batería */}
                        <div className="bg-surface-container border border-outline-variant/50 rounded-2xl p-5 mb-6">
                            <h4 className="text-sm font-black text-on-surface uppercase tracking-widest mb-4 flex items-center gap-2">
                               <span className="material-symbols-outlined text-primary">battery_charging_full</span>
                               Sistema Eléctrico y Batería
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-2">
                               <div className="flex flex-col">
                                   <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Marca Batería</span>
                                   <span className="text-sm font-bold text-on-surface">{selectedVehicle.bateria_marca || 'No Registrada'}</span>
                               </div>
                               <div className="flex flex-col">
                                   <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Amperaje</span>
                                   <span className="text-sm font-bold text-on-surface">{selectedVehicle.bateria_amperaje || 'No Registrado'}</span>
                               </div>
                               <div className="flex flex-col">
                                   <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Voltaje</span>
                                   <span className="text-sm font-bold text-on-surface">{selectedVehicle.bateria_voltaje || 'No Registrado'}</span>
                               </div>
                               <div className="flex flex-col">
                                   <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Instalación</span>
                                   <span className="text-sm font-bold text-on-surface">{selectedVehicle.bateria_fecha_instalacion || 'No Registrada'}</span>
                               </div>
                            </div>
                        </div>

                        {/* Mecánica Adicional */}
                        <div className="bg-surface-container border border-outline-variant/50 rounded-2xl p-5 mb-6">
                            <h4 className="text-sm font-black text-on-surface uppercase tracking-widest mb-4 flex items-center gap-2">
                               <span className="material-symbols-outlined text-primary">engineering</span>
                               Especificaciones Mecánicas Adicionales
                            </h4>"""
content = content.replace(old_detail_section, new_detail_section)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Vehicles.jsx updated successfully")
