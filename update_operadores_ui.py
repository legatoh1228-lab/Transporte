import sys

with open('frontend/src/pages/Operadores.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Add fields to formData
text = text.replace(
'''    certificado_medico_vence: '',
    tipo_sangre: '',
    foto: null
  });''',
'''    certificado_medico_vence: '',
    estado_civil: '',
    numero_hijos: 0,
    grado_instruccion: '',
    talla_camisa: '',
    talla_pantalon: '',
    talla_calzado: '',
    fecha_ingreso: '',
    tipo_sangre: '',
    foto: null
  });'''
)

text = text.replace(
'''      certificado_medico_vence: '',
      tipo_sangre: '',
      foto: null
    });''',
'''      certificado_medico_vence: '',
      estado_civil: '',
      numero_hijos: 0,
      grado_instruccion: '',
      talla_camisa: '',
      talla_pantalon: '',
      talla_calzado: '',
      fecha_ingreso: '',
      tipo_sangre: '',
      foto: null
    });'''
)

text = text.replace(
'''    // Ensure dates are null if empty
    if (!formData.fecha_nacimiento) data.delete('fecha_nacimiento');
    if (!formData.vence_lic) data.delete('vence_lic');
    if (!formData.certificado_medico_vence) data.delete('certificado_medico_vence');''',
'''    // Ensure dates are null if empty
    if (!formData.fecha_nacimiento) data.delete('fecha_nacimiento');
    if (!formData.vence_lic) data.delete('vence_lic');
    if (!formData.certificado_medico_vence) data.delete('certificado_medico_vence');
    if (!formData.fecha_ingreso) data.delete('fecha_ingreso');'''
)

text = text.replace(
'''              {/* Card 3: Contact Data */}
              <div className="bg-surface-container-low p-8 rounded-[40px] border border-outline-variant/30 shadow-sm">
                 <h4 className="text-[11px] font-black text-on-surface uppercase tracking-[0.3em] flex items-center gap-3 mb-8">
                    <span className="material-symbols-outlined text-[20px]">contact_phone</span>
                    Ubicación y Contacto
                 </h4>''',
'''              {/* Card 3: Socio-Laboral Data */}
              <div className="bg-surface-container-low p-8 rounded-[40px] border border-outline-variant/30 shadow-sm mb-6">
                 <h4 className="text-[11px] font-black text-secondary uppercase tracking-[0.3em] flex items-center gap-3 mb-8">
                    <span className="material-symbols-outlined text-[20px]">assignment_ind</span>
                    Información Socio-Laboral
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-6">
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Estado Civil</label>
                     <select 
                       name="estado_civil" value={formData.estado_civil || ''} onChange={handleInputChange}
                       className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-black outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                     >
                       <option value="">Seleccione...</option>
                       <option value="Soltero(a)">Soltero(a)</option>
                       <option value="Casado(a)">Casado(a)</option>
                       <option value="Divorciado(a)">Divorciado(a)</option>
                       <option value="Viudo(a)">Viudo(a)</option>
                       <option value="Concubinato">Concubinato</option>
                     </select>
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">N° de Hijos</label>
                     <input 
                       type="number" name="numero_hijos" value={formData.numero_hijos || 0} onChange={handleInputChange}
                       className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                     />
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Instrucción</label>
                     <select 
                       name="grado_instruccion" value={formData.grado_instruccion || ''} onChange={handleInputChange}
                       className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-black outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                     >
                       <option value="">Seleccione...</option>
                       <option value="Primaria">Primaria</option>
                       <option value="Bachiller">Bachiller</option>
                       <option value="TSU">TSU</option>
                       <option value="Universitario">Universitario</option>
                     </select>
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Fecha Ingreso</label>
                     <input 
                       type="date" name="fecha_ingreso" value={formData.fecha_ingreso || ''} onChange={handleInputChange}
                       className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                     />
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Tallas (Camisa / Pantalón)</label>
                     <div className="flex gap-2">
                       <input 
                         name="talla_camisa" value={formData.talla_camisa || ''} onChange={handleInputChange} placeholder="Camisa"
                         className="w-1/2 bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-3 text-sm font-bold outline-none"
                       />
                       <input 
                         name="talla_pantalon" value={formData.talla_pantalon || ''} onChange={handleInputChange} placeholder="Pantalón"
                         className="w-1/2 bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-3 text-sm font-bold outline-none"
                       />
                     </div>
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Talla Calzado</label>
                     <input 
                       name="talla_calzado" value={formData.talla_calzado || ''} onChange={handleInputChange}
                       className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                     />
                   </div>
                 </div>
              </div>

              {/* Card 4: Contact Data */}
              <div className="bg-surface-container-low p-8 rounded-[40px] border border-outline-variant/30 shadow-sm">
                 <h4 className="text-[11px] font-black text-on-surface uppercase tracking-[0.3em] flex items-center gap-3 mb-8">
                    <span className="material-symbols-outlined text-[20px]">contact_phone</span>
                    Ubicación y Contacto
                 </h4>'''
)

text = text.replace(
'''              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-surface-container-lowest p-8 rounded-[32px] border border-outline-variant/40 space-y-6 shadow-sm">
                   <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px]">id_card</span>
                      Credenciales de Conducción
                   </h4>''',
'''              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-surface-container-lowest p-8 rounded-[32px] border border-outline-variant/40 space-y-6 shadow-sm">
                   <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px]">id_card</span>
                      Credenciales de Conducción
                   </h4>'''
)

text = text.replace(
'''                 <div className="bg-surface-container-lowest p-8 rounded-[32px] border border-outline-variant/40 space-y-6 shadow-sm">
                   <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px]">medical_services</span>
                      Información Sanitaria & Ubicación
                   </h4>''',
'''                 <div className="bg-surface-container-lowest p-8 rounded-[32px] border border-outline-variant/40 space-y-6 shadow-sm">
                   <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px]">assignment_ind</span>
                      Socio-Laboral
                   </h4>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-outline-variant/10">
                         <span className="text-sm font-semibold text-on-surface-variant">Estado Civil</span>
                         <span className="font-black text-on-surface">{selectedOperator.estado_civil || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-outline-variant/10">
                         <span className="text-sm font-semibold text-on-surface-variant">Instrucción</span>
                         <span className="font-black text-on-surface">{selectedOperator.grado_instruccion || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-outline-variant/10">
                         <span className="text-sm font-semibold text-on-surface-variant">Hijos</span>
                         <span className="font-black text-on-surface">{selectedOperator.numero_hijos || 0}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-outline-variant/10">
                         <span className="text-sm font-semibold text-on-surface-variant">Fecha Ingreso</span>
                         <span className="font-black text-on-surface">{selectedOperator.fecha_ingreso || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                         <span className="text-sm font-semibold text-on-surface-variant">Uniformes</span>
                         <span className="font-black text-on-surface text-xs text-right leading-tight">C:{selectedOperator.talla_camisa||'-'} P:{selectedOperator.talla_pantalon||'-'} Z:{selectedOperator.talla_calzado||'-'}</span>
                      </div>
                   </div>
                </div>

                <div className="bg-surface-container-lowest p-8 rounded-[32px] border border-outline-variant/40 space-y-6 shadow-sm">
                   <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px]">medical_services</span>
                      Información Sanitaria & Ubicación
                   </h4>'''
)


with open('frontend/src/pages/Operadores.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("Operadores.jsx update script written and executed.")
