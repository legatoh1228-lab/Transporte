import sys

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()

    # Update formData state
    text = text.replace(
'''    fecha_ingreso: '',
    tipo_sangre: '',
    foto: null
  });''',
'''    fecha_ingreso: '',
    tipo_sangre: '',
    correo_electronico: '',
    contacto_emergencia_nombre: '',
    contacto_emergencia_telefono: '',
    foto: null
  });'''
    )
    
    text = text.replace(
'''      fecha_ingreso: '',
      tipo_sangre: '',
      foto: null
    });''',
'''      fecha_ingreso: '',
      tipo_sangre: '',
      correo_electronico: '',
      contacto_emergencia_nombre: '',
      contacto_emergencia_telefono: '',
      foto: null
    });'''
    )

    # Update form card
    replacement_form = '''              {/* Card Contact Data */}
              <div className="bg-surface-container-low p-8 rounded-[40px] border border-outline-variant/30 shadow-sm">
                 <h4 className="text-[11px] font-black text-on-surface uppercase tracking-[0.3em] flex items-center gap-3 mb-8">
                    <span className="material-symbols-outlined text-[20px]">contact_phone</span>
                    Ubicación y Contactos
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-6">
                   <div className="md:col-span-4 space-y-1.5">
                     <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Teléfono Móvil</label>
                     <div className="flex shadow-sm rounded-2xl overflow-hidden border border-outline-variant focus-within:ring-2 focus-within:ring-on-surface/20 transition-all">
                       <select 
                         name="prefijo_telefono" value={formData.prefijo_telefono || '0414'} onChange={handleInputChange}
                         className="bg-surface-container-high border-r border-outline-variant py-3.5 px-4 text-sm font-black outline-none w-[90px]"
                       >
                         <option value="0414">0414</option>
                         <option value="0424">0424</option>
                         <option value="0412">0412</option>
                         <option value="0416">0416</option>
                       </select>
                       <input 
                         name="numero_telefono" value={formData.numero_telefono || ''} onChange={handleInputChange}
                         placeholder="0000000" className="w-full bg-surface-container-lowest py-3.5 px-4 text-sm font-bold outline-none tracking-widest"
                         maxLength={7}
                       />
                     </div>
                   </div>
                   <div className="md:col-span-8 space-y-1.5">
                     <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Correo Electrónico</label>
                     <input 
                       type="email" name="correo_electronico" value={formData.correo_electronico || ''} onChange={handleInputChange}
                       placeholder="correo@ejemplo.com" className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-on-surface/20 transition-all"
                     />
                   </div>
                   <div className="md:col-span-12 space-y-1.5">
                     <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Dirección Domiciliaria</label>
                     <textarea 
                       name="direccion" value={formData.direccion || ''} onChange={handleInputChange}
                       placeholder="Estado, Municipio, Parroquia, Avenida/Calle, Residencia..." rows={2}
                       className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-on-surface/20 transition-all resize-none"
                     ></textarea>
                   </div>
                   <div className="md:col-span-12 border-t border-outline-variant/30 pt-6 mt-2">
                     <h5 className="text-[10px] font-black text-error uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                       <span className="material-symbols-outlined text-[16px]">medical_services</span> En caso de emergencia
                     </h5>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Llamar a (Nombre)</label>
                         <input 
                           name="contacto_emergencia_nombre" value={formData.contacto_emergencia_nombre || ''} onChange={handleInputChange}
                           placeholder="Nombre del familiar o contacto..." className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-error/20 transition-all"
                         />
                       </div>
                       <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Teléfono de Emergencia</label>
                         <input 
                           name="contacto_emergencia_telefono" value={formData.contacto_emergencia_telefono || ''} onChange={handleInputChange}
                           placeholder="0414-0000000" className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-error/20 transition-all"
                         />
                       </div>
                     </div>
                   </div>
                 </div>
              </div>'''

    target = '''              {/* Card 4: Contact Data */}
              <div className="bg-surface-container-low p-8 rounded-[40px] border border-outline-variant/30 shadow-sm">
                 <h4 className="text-[11px] font-black text-on-surface uppercase tracking-[0.3em] flex items-center gap-3 mb-8">
                    <span className="material-symbols-outlined text-[20px]">contact_phone</span>
                    Ubicación y Contacto
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-6">
                   <div className="md:col-span-4 space-y-1.5">
                     <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Teléfono Móvil</label>
                     <div className="flex shadow-sm rounded-2xl overflow-hidden border border-outline-variant focus-within:ring-2 focus-within:ring-on-surface/20 transition-all">
                       <select 
                         name="prefijo_telefono" value={formData.prefijo_telefono || '0414'} onChange={handleInputChange}
                         className="bg-surface-container-high border-r border-outline-variant py-3.5 px-4 text-sm font-black outline-none w-[90px]"
                       >
                         <option value="0414">0414</option>
                         <option value="0424">0424</option>
                         <option value="0412">0412</option>
                         <option value="0416">0416</option>
                       </select>
                       <input 
                         name="numero_telefono" value={formData.numero_telefono || ''} onChange={handleInputChange}
                         placeholder="0000000" className="w-full bg-surface-container-lowest py-3.5 px-4 text-sm font-bold outline-none tracking-widest"
                         maxLength={7}
                       />
                     </div>
                   </div>
                   <div className="md:col-span-8 space-y-1.5">
                     <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Dirección Domiciliaria</label>
                     <input 
                       name="direccion" value={formData.direccion || ''} onChange={handleInputChange}
                       placeholder="Estado, Municipio, Parroquia, Sector..." className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-on-surface/20 transition-all"
                     />
                   </div>
                 </div>
              </div>'''

    target2 = '''              {/* Card 3: Contact Data */}
              <div className="bg-surface-container-low p-8 rounded-[40px] border border-outline-variant/30 shadow-sm">
                 <h4 className="text-[11px] font-black text-on-surface uppercase tracking-[0.3em] flex items-center gap-3 mb-8">
                    <span className="material-symbols-outlined text-[20px]">contact_phone</span>
                    Ubicación y Contacto
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-6">
                   <div className="md:col-span-4 space-y-1.5">
                     <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Teléfono Móvil</label>
                     <div className="flex shadow-sm rounded-2xl overflow-hidden border border-outline-variant focus-within:ring-2 focus-within:ring-on-surface/20 transition-all">
                       <select 
                         name="prefijo_telefono" value={formData.prefijo_telefono || '0414'} onChange={handleInputChange}
                         className="bg-surface-container-high border-r border-outline-variant py-3.5 px-4 text-sm font-black outline-none w-[90px]"
                       >
                         <option value="0414">0414</option>
                         <option value="0424">0424</option>
                         <option value="0412">0412</option>
                         <option value="0416">0416</option>
                       </select>
                       <input 
                         name="numero_telefono" value={formData.numero_telefono || ''} onChange={handleInputChange}
                         placeholder="0000000" className="w-full bg-surface-container-lowest py-3.5 px-4 text-sm font-bold outline-none tracking-widest"
                         maxLength={7}
                       />
                     </div>
                   </div>
                   <div className="md:col-span-8 space-y-1.5">
                     <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Dirección Domiciliaria</label>
                     <input 
                       name="direccion" value={formData.direccion || ''} onChange={handleInputChange}
                       placeholder="Estado, Municipio, Parroquia, Sector..." className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-on-surface/20 transition-all"
                     />
                   </div>
                 </div>
              </div>'''

    if target in text:
        text = text.replace(target, replacement_form)
    elif target2 in text:
        text = text.replace(target2, replacement_form)

    # Detail View Update
    detail_target = '''                      <div className="flex items-center gap-3 text-on-surface-variant font-bold text-sm bg-surface-container-highest/30 px-4 py-2 rounded-xl border border-outline-variant/20">
                         <span className="material-symbols-outlined text-[20px] text-primary">call</span>
                         {selectedOperator.telefono || 'Sin Teléfono'}
                      </div>'''
    detail_repl = '''                      <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 text-on-surface-variant font-bold text-sm bg-surface-container-highest/30 px-4 py-2 rounded-xl border border-outline-variant/20">
                           <span className="material-symbols-outlined text-[18px] text-primary">call</span>
                           {selectedOperator.telefono || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2 text-on-surface-variant font-bold text-sm bg-surface-container-highest/30 px-4 py-2 rounded-xl border border-outline-variant/20">
                           <span className="material-symbols-outlined text-[18px] text-primary">mail</span>
                           {selectedOperator.correo_electronico || 'N/A'}
                        </div>
                      </div>'''
    
    text = text.replace(detail_target, detail_repl)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(text)

update_file('frontend/src/pages/Operadores.jsx')
update_file('frontend/src/pages/Colectores.jsx')
print("Forms updated!")
