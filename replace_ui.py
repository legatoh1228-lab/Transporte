import re

with open('frontend/src/pages/Colectores.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace Table Headers
text = text.replace(
'''              <thead className="bg-surface-container-high/50 text-[11px] uppercase text-on-surface-variant font-black tracking-widest border-b border-outline-variant">
                <tr>
                  <th className="px-8 py-5">Perfil</th>
                  <th className="px-6 py-5">Identificación</th>
                  <th className="px-6 py-5">Grado / Estado</th>
                  <th className="px-6 py-5">Vencimiento Lic.</th>
                  <th className="px-6 py-5 text-center">Acciones</th>
                </tr>
              </thead>''',
'''              <thead className="bg-surface-container-high/50 text-[11px] uppercase text-on-surface-variant font-black tracking-widest border-b border-outline-variant">
                <tr>
                  <th className="px-8 py-5">Perfil</th>
                  <th className="px-6 py-5">Identificación</th>
                  <th className="px-6 py-5">Estado Civil</th>
                  <th className="px-6 py-5">Ingreso</th>
                  <th className="px-6 py-5 text-center">Acciones</th>
                </tr>
              </thead>'''
)

# Replace Table Cells
text = text.replace(
'''                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="inline-flex items-center w-fit px-2.5 py-1 rounded-lg text-[10px] font-black bg-secondary-container text-on-secondary-container uppercase tracking-tighter">
                          Grado {row.licencia_grado}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">calendar_today</span>
                          <span className="font-bold text-on-surface-variant">{row.vence_lic}</span>
                       </div>
                    </td>''',
'''                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="inline-flex items-center w-fit px-2.5 py-1 rounded-lg text-[10px] font-black bg-secondary-container text-on-secondary-container uppercase tracking-tighter">
                          {row.estado_civil || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">calendar_today</span>
                          <span className="font-bold text-on-surface-variant">{row.fecha_ingreso || 'N/A'}</span>
                       </div>
                    </td>'''
)

# Replace Card 2 Form Data
text = text.replace(
'''              {/* Card 2: License Data */}
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
              </div>''',
'''              {/* Card 2: Socio-Laboral Data */}
              <div className="bg-surface-container-low p-8 rounded-[40px] border border-outline-variant/30 shadow-sm">
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
              </div>'''
)

# Detail view replacements
text = text.replace(
'''                 <div className="bg-surface-container-lowest p-8 rounded-[32px] border border-outline-variant/40 space-y-6 shadow-sm">
                   <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px]">id_card</span>
                      Credenciales de Conducción
                   </h4>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-outline-variant/10">
                         <span className="text-sm font-semibold text-on-surface-variant">Grado de Licencia</span>
                         <span className="px-3 py-1 bg-secondary-container text-on-secondary-container font-black rounded-lg text-xs uppercase">Grado {selectedOperator.licencia_grado}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-outline-variant/10">
                         <span className="text-sm font-semibold text-on-surface-variant">Vencimiento Licencia</span>
                         <span className={`font-black ${new Date(selectedOperator.vence_lic) < new Date() ? 'text-error animate-pulse' : 'text-on-surface'}`}>
                           {selectedOperator.vence_lic}
                         </span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                         <span className="text-sm font-semibold text-on-surface-variant">Certificado Médico</span>
                         <span className="font-black text-on-surface">{selectedOperator.certificado_medico_vence || 'N/A'}</span>
                      </div>
                   </div>
                </div>''',
'''                 <div className="bg-surface-container-lowest p-8 rounded-[32px] border border-outline-variant/40 space-y-6 shadow-sm">
                   <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px]">assignment_ind</span>
                      Información Socio-Laboral
                   </h4>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-outline-variant/10">
                         <span className="text-sm font-semibold text-on-surface-variant">Estado Civil</span>
                         <span className="px-3 py-1 bg-secondary-container text-on-secondary-container font-black rounded-lg text-xs uppercase">{selectedOperator.estado_civil || 'N/A'}</span>
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
                         <span className="font-black text-on-surface">C: {selectedOperator.talla_camisa || '-'} / P: {selectedOperator.talla_pantalon || '-'} / Z: {selectedOperator.talla_calzado || '-'}</span>
                      </div>
                   </div>
                </div>'''
)

text = text.replace(
'''    const head = ['Cédula', 'Nombres', 'Apellidos', 'Código', 'Grado Lic.', 'Vence Lic.', 'Cert. Médico', 'Teléfono'];
    const body = filteredOperators.map(op => [
      op.cedula,
      op.nombres,
      op.apellidos,
      op.codigo_col || '—',
      `Grado ${op.licencia_grado}`,
      op.vence_lic || '—',
      op.certificado_medico_vence || '—',
      op.telefono || '—',
    ]);''',
'''    const head = ['Cédula', 'Nombres', 'Apellidos', 'Código', 'Est. Civil', 'Instrucción', 'Ingreso', 'Teléfono'];
    const body = filteredOperators.map(op => [
      op.cedula,
      op.nombres,
      op.apellidos,
      op.codigo_col || '—',
      op.estado_civil || '—',
      op.grado_instruccion || '—',
      op.fecha_ingreso || '—',
      op.telefono || '—',
    ]);'''
)

text = text.replace(
'''    // Ensure dates are null if empty
    if (!formData.fecha_nacimiento) data.delete('fecha_nacimiento');
    if (!formData.vence_lic) data.delete('vence_lic');
    if (!formData.certificado_medico_vence) data.delete('certificado_medico_vence');''',
'''    // Ensure dates are null if empty
    if (!formData.fecha_nacimiento) data.delete('fecha_nacimiento');
    if (!formData.fecha_ingreso) data.delete('fecha_ingreso');'''
)

with open('frontend/src/pages/Colectores.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("Reemplazo de UI listo")
