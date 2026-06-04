import re

with open('frontend/src/pages/Operadores.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update formData initial state
text = text.replace(
    "    certificado_medico_vence: '',",
    "    certificado_medico_vence: '',\n    certificado_saberes: false,\n    fecha_emision_saberes: '',\n    fecha_vencimiento_saberes: '',"
)

# 2. Update handleInputChange for checkboxes
# If checkbox, take checked instead of value
old_handle_input = """  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };"""
new_handle_input = """  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };"""
text = text.replace(old_handle_input, new_handle_input)

# 3. Update handleSubmit dates
old_dates = """    if (!formData.fecha_nacimiento) data.delete('fecha_nacimiento');
    if (!formData.vence_lic) data.delete('vence_lic');
    if (!formData.certificado_medico_vence) data.delete('certificado_medico_vence');
    if (!formData.fecha_ingreso) data.delete('fecha_ingreso');"""
new_dates = """    if (!formData.fecha_nacimiento) data.delete('fecha_nacimiento');
    if (!formData.vence_lic) data.delete('vence_lic');
    if (!formData.certificado_medico_vence) data.delete('certificado_medico_vence');
    if (!formData.fecha_emision_saberes) data.delete('fecha_emision_saberes');
    if (!formData.fecha_vencimiento_saberes) data.delete('fecha_vencimiento_saberes');
    if (!formData.fecha_ingreso) data.delete('fecha_ingreso');"""
text = text.replace(old_dates, new_dates)

# 4. Update magic button for codigo_op
old_codigo_op = """                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Código Operador</label>
                     <input 
                       name="codigo_op" value={formData.codigo_op || ''} onChange={handleInputChange}
                       placeholder="Ej: OP-772" className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase tracking-widest"
                       required
                     />
                   </div>"""
new_codigo_op = """                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Código Operador</label>
                     <div className="flex gap-2">
                       <input 
                         name="codigo_op" value={formData.codigo_op || ''} onChange={handleInputChange}
                         placeholder="Ej: OP-772" className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase tracking-widest"
                         required
                       />
                       <button
                         type="button"
                         onClick={() => setFormData(prev => ({...prev, codigo_op: `OP-${Math.floor(1000 + Math.random() * 9000)}`}))}
                         className="bg-primary/10 text-primary px-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/20 transition-all border border-primary/20 flex items-center justify-center"
                         title="Generar Código Automático"
                       >
                         <span className="material-symbols-outlined text-[20px]">magic_button</span>
                       </button>
                     </div>
                   </div>"""
text = text.replace(old_codigo_op, new_codigo_op)

# 5. Update Card 2: License Data
old_card2 = """              {/* Card 2: License Data */}
              <div className="bg-surface-container-low p-8 rounded-[40px] border border-outline-variant/30 shadow-sm">
                 <h4 className="text-[11px] font-black text-secondary uppercase tracking-[0.3em] flex items-center gap-3 mb-8">
                    <span className="material-symbols-outlined text-[20px]">id_card</span>
                    Licencia e Instrucción Vial
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-6">
                   <div className="space-y-1.5 md:col-span-1">
                     <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Grado Licencia</label>
                     <select 
                       name="licencia_grado" value={formData.licencia_grado || 5} onChange={handleInputChange}
                       className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-black outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                     >
                       <option value={2}>Grado 2 (Moto)</option>
                       <option value={3}>Grado 3 (Vehículos)</option>
                       <option value={4}>Grado 4 (Público)</option>
                       <option value={5}>Grado 5 (Carga pesada)</option>
                     </select>
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Vence Licencia</label>
                     <input 
                       type="date" name="vence_lic" value={formData.vence_lic || ''} onChange={handleInputChange}
                       className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                       required
                     />
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Certificado Médico</label>
                     <input 
                       type="date" name="certificado_medico_vence" value={formData.certificado_medico_vence || ''} onChange={handleInputChange}
                       className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                     />
                   </div>
                 </div>
              </div>"""

new_card2 = """              {/* Card 2: License Data */}
              <div className="bg-surface-container-low p-8 rounded-[40px] border border-outline-variant/30 shadow-sm space-y-8">
                 <div>
                   <h4 className="text-[11px] font-black text-secondary uppercase tracking-[0.3em] flex items-center gap-3 mb-6">
                      <span className="material-symbols-outlined text-[20px]">id_card</span>
                      Licencia y Salud Vial
                   </h4>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-6">
                     <div className="space-y-1.5 md:col-span-1">
                       <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Grado Licencia</label>
                       <select 
                         name="licencia_grado" value={formData.licencia_grado || 5} onChange={handleInputChange}
                         className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-black outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                       >
                         <option value={2}>Grado 2 (Moto)</option>
                         <option value={3}>Grado 3 (Vehículos)</option>
                         <option value={4}>Grado 4 (Público)</option>
                         <option value={5}>Grado 5 (Carga pesada)</option>
                       </select>
                     </div>
                     <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Vence Licencia</label>
                       <input 
                         type="date" name="vence_lic" value={formData.vence_lic || ''} onChange={handleInputChange}
                         className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                         required
                       />
                     </div>
                     <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Certificado Médico</label>
                       <input 
                         type="date" name="certificado_medico_vence" value={formData.certificado_medico_vence || ''} onChange={handleInputChange}
                         className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                       />
                     </div>
                   </div>
                 </div>

                 <div className="pt-6 border-t border-outline-variant/30">
                   <div className="flex items-center justify-between mb-6">
                     <h4 className="text-[11px] font-black text-secondary uppercase tracking-[0.3em] flex items-center gap-3">
                        <span className="material-symbols-outlined text-[20px]">school</span>
                        Certificado de Saberes
                     </h4>
                     <label className="flex items-center gap-3 cursor-pointer">
                        <span className="text-sm font-bold text-on-surface-variant">¿Posee Certificado?</span>
                        <div className="relative inline-block w-12 h-6 rounded-full bg-surface-container-highest transition-colors">
                          <input type="checkbox" name="certificado_saberes" checked={formData.certificado_saberes || false} onChange={handleInputChange} className="peer sr-only" />
                          <div className="absolute inset-0 rounded-full peer-checked:bg-secondary transition-colors"></div>
                          <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-6"></div>
                        </div>
                     </label>
                   </div>
                   
                   <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 transition-all duration-300 ${formData.certificado_saberes ? 'opacity-100 max-h-40' : 'opacity-40 max-h-40 pointer-events-none'}`}>
                     <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Fecha de Emisión</label>
                       <input 
                         type="date" name="fecha_emision_saberes" value={formData.fecha_emision_saberes || ''} onChange={handleInputChange} disabled={!formData.certificado_saberes}
                         className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/20 transition-all disabled:bg-surface-container-low"
                       />
                     </div>
                     <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Fecha de Vencimiento</label>
                       <input 
                         type="date" name="fecha_vencimiento_saberes" value={formData.fecha_vencimiento_saberes || ''} onChange={handleInputChange} disabled={!formData.certificado_saberes}
                         className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/20 transition-all disabled:bg-surface-container-low"
                       />
                     </div>
                   </div>
                 </div>
              </div>"""
text = text.replace(old_card2, new_card2)

# 6. Update Detail View
pattern_detail = re.compile(r'\{\/\* Grid Details \*\/\}\s*<div className="grid grid-cols-1 md:grid-cols-2 gap-8">.*?<\/div>\n\s*<\/div>\n\s*\)\}\n\s*<\/Modal>', re.DOTALL)

new_detail = """{/* Grid Details Re-designed */}
             <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Main Content (7 cols) */}
                <div className="md:col-span-7 flex flex-col gap-8">
                   {/* Socio-Laboral */}
                   <div className="bg-surface-container-lowest p-8 rounded-[32px] border border-outline-variant/40 shadow-sm flex flex-col">
                      <h4 className="text-[11px] font-black text-secondary uppercase tracking-[0.3em] flex items-center gap-3 mb-6">
                         <span className="material-symbols-outlined text-[20px]">assignment_ind</span>
                         Información Socio-Laboral
                      </h4>
                      <div className="grid grid-cols-2 gap-4 flex-1">
                         <div className="bg-surface-container-low/50 p-4 rounded-2xl border border-outline-variant/30 flex flex-col justify-center">
                            <span className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest mb-1">Estado Civil</span>
                            <span className="font-black text-on-surface text-sm uppercase">{selectedOperator.estado_civil || 'N/A'}</span>
                         </div>
                         <div className="bg-surface-container-low/50 p-4 rounded-2xl border border-outline-variant/30 flex flex-col justify-center">
                            <span className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest mb-1">Instrucción</span>
                            <span className="font-black text-on-surface text-sm">{selectedOperator.grado_instruccion || 'N/A'}</span>
                         </div>
                         <div className="bg-surface-container-low/50 p-4 rounded-2xl border border-outline-variant/30 flex flex-col justify-center">
                            <span className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest mb-1">N° de Hijos</span>
                            <span className="font-black text-on-surface text-lg">{selectedOperator.numero_hijos || 0}</span>
                         </div>
                         <div className="bg-surface-container-low/50 p-4 rounded-2xl border border-outline-variant/30 flex flex-col justify-center">
                            <span className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest mb-1">Fecha Ingreso</span>
                            <span className="font-black text-on-surface text-sm">{selectedOperator.fecha_ingreso || 'N/A'}</span>
                         </div>
                         <div className="col-span-2 bg-surface-container-low/50 p-4 rounded-2xl border border-outline-variant/30 flex items-center justify-between">
                            <span className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest">Tallas de Uniforme</span>
                            <div className="flex gap-3">
                              <span className="px-2.5 py-1 bg-surface-container-high rounded-lg text-xs font-bold" title="Camisa"><span className="opacity-50 mr-1">C:</span>{selectedOperator.talla_camisa || '-'}</span>
                              <span className="px-2.5 py-1 bg-surface-container-high rounded-lg text-xs font-bold" title="Pantalón"><span className="opacity-50 mr-1">P:</span>{selectedOperator.talla_pantalon || '-'}</span>
                              <span className="px-2.5 py-1 bg-surface-container-high rounded-lg text-xs font-bold" title="Zapatos"><span className="opacity-50 mr-1">Z:</span>{selectedOperator.talla_calzado || '-'}</span>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Conduccion y Saberes */}
                   <div className="bg-surface-container-lowest p-8 rounded-[32px] border border-outline-variant/40 shadow-sm">
                      <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-3 mb-6">
                         <span className="material-symbols-outlined text-[20px]">id_card</span>
                         Licencia e Instrucción Vial
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="col-span-2 flex justify-between items-center bg-primary/5 p-4 rounded-2xl border border-primary/10">
                            <span className="text-sm font-semibold text-primary">Licencia de Conducir</span>
                            <div className="flex items-center gap-3">
                               <span className="px-3 py-1 bg-primary text-on-primary font-black rounded-lg text-xs uppercase">Grado {selectedOperator.licencia_grado}</span>
                               <span className={`font-black text-sm ${new Date(selectedOperator.vence_lic) < new Date() ? 'text-error animate-pulse' : 'text-on-surface'}`}>
                                 Vence: {selectedOperator.vence_lic}
                               </span>
                            </div>
                         </div>
                         <div className="col-span-2 flex justify-between items-center bg-surface-container-low/50 p-4 rounded-2xl border border-outline-variant/30">
                            <span className="text-sm font-semibold text-on-surface-variant">Certificado Médico</span>
                            <span className={`font-black text-sm ${new Date(selectedOperator.certificado_medico_vence) < new Date() ? 'text-error' : 'text-on-surface'}`}>{selectedOperator.certificado_medico_vence || 'N/A'}</span>
                         </div>
                         
                         <div className="col-span-2 mt-4">
                            <h5 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-3 flex items-center gap-2 border-b border-outline-variant/20 pb-2">
                               <span className="material-symbols-outlined text-[16px]">school</span> Certificado de Saberes
                            </h5>
                            {selectedOperator.certificado_saberes ? (
                               <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-secondary/5 p-3 rounded-xl border border-secondary/10 flex flex-col">
                                     <span className="text-[10px] font-black text-secondary/70 uppercase tracking-widest">Emisión</span>
                                     <span className="font-bold text-secondary text-sm">{selectedOperator.fecha_emision_saberes || 'N/A'}</span>
                                  </div>
                                  <div className="bg-secondary/5 p-3 rounded-xl border border-secondary/10 flex flex-col">
                                     <span className="text-[10px] font-black text-secondary/70 uppercase tracking-widest">Vencimiento</span>
                                     <span className="font-bold text-secondary text-sm">{selectedOperator.fecha_vencimiento_saberes || 'N/A'}</span>
                                  </div>
                               </div>
                            ) : (
                               <div className="flex items-center gap-3 bg-surface-container-low p-3 rounded-xl opacity-60">
                                  <span className="material-symbols-outlined text-on-surface-variant">cancel</span>
                                  <span className="text-sm font-bold text-on-surface-variant">No posee certificado registrado</span>
                               </div>
                            )}
                         </div>
                      </div>
                   </div>
                </div>

                {/* Sidebar Content (5 cols) */}
                <div className="md:col-span-5 flex flex-col gap-8">
                   {/* Health Profile */}
                   <div className="bg-surface-container-lowest p-6 rounded-[32px] border border-outline-variant/40 shadow-sm flex-1">
                      <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-3 mb-6">
                         <span className="material-symbols-outlined text-[20px]">medical_services</span>
                         Perfil de Salud
                      </h4>
                      <div className="space-y-4">
                         <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Grupo Sanguíneo</span>
                            <span className="px-3 py-1 bg-error/10 text-error font-black rounded-lg text-sm">{selectedOperator.tipo_sangre || 'N/A'}</span>
                         </div>
                         <div className="flex justify-between items-center pt-4 border-t border-outline-variant/20">
                            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Nacimiento</span>
                            <span className="font-black text-on-surface">{selectedOperator.fecha_nacimiento || 'N/A'}</span>
                         </div>
                      </div>
                   </div>

                   {/* Emergency Contact */}
                   <div className="bg-error/5 p-6 rounded-[32px] border border-error/20 shadow-sm flex-1 relative overflow-hidden">
                      <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
                         <span className="material-symbols-outlined text-[100px] text-error">emergency</span>
                      </div>
                      <h4 className="text-[11px] font-black text-error uppercase tracking-[0.3em] flex items-center gap-3 mb-4">
                         <span className="material-symbols-outlined text-[20px]">contact_emergency</span>
                         Emergencias
                      </h4>
                      <div className="space-y-2 relative z-10">
                         <p className="text-xs font-black text-on-surface-variant uppercase tracking-widest">Avisar a:</p>
                         <p className="font-black text-on-surface text-lg leading-none truncate" title={selectedOperator.contacto_emergencia_nombre}>{selectedOperator.contacto_emergencia_nombre || 'No registrado'}</p>
                         {selectedOperator.contacto_emergencia_telefono && (
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-error/10 w-fit">
                               <span className="material-symbols-outlined text-[16px] text-error">call</span>
                               <span className="font-bold text-on-surface">{selectedOperator.contacto_emergencia_telefono}</span>
                            </div>
                         )}
                      </div>
                   </div>
                </div>

                {/* Full Width Address */}
                <div className="md:col-span-12 bg-surface-container-lowest p-6 px-8 rounded-[32px] border border-outline-variant/40 shadow-sm flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                       <span className="material-symbols-outlined">home_pin</span>
                    </div>
                    <div className="flex flex-col gap-1">
                       <span className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-[0.2em]">Domicilio de Habitación</span>
                       <span className="text-sm font-bold text-on-surface leading-relaxed">
                         {selectedOperator.direccion || 'Sin dirección domiciliaria registrada en el sistema.'}
                       </span>
                    </div>
                </div>
             </div>
          </div>
        )}
      </Modal>"""

if bool(pattern_detail.search(text)):
    text = pattern_detail.sub(new_detail, text)
else:
    print("Warning: regex pattern for Detail View did not match!")

with open('frontend/src/pages/Operadores.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Operadores UI completely updated.")
