import sys
import re

with open('frontend/src/pages/Colectores.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix detail view (Credenciales de Conducción -> should be Socio Laboral for Colectores, but I'll check if it's there)
# Actually, the user specifically mentioned "el formulario de colector para que los campos funcionen". 
# The issue with the form fields is definitely name="codigo_op" which doesn't match the state.
target_codigo = """                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Código Colector</label>
                     <input 
                       name="codigo_op" value={formData.codigo_col || ''} onChange={handleInputChange}
                       placeholder="Ej: OP-772" className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase tracking-widest"
                       required
                     />
                   </div>"""

repl_codigo = """                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Código Colector</label>
                     <div className="flex gap-2">
                       <input 
                         name="codigo_col" value={formData.codigo_col || ''} onChange={handleInputChange}
                         placeholder="Ej: COL-772" className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase tracking-widest"
                         required
                       />
                       <button
                         type="button"
                         onClick={() => setFormData(prev => ({...prev, codigo_col: `COL-${Math.floor(1000 + Math.random() * 9000)}`}))}
                         className="bg-primary/10 text-primary px-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/20 transition-all border border-primary/20 flex items-center justify-center"
                         title="Generar Código Automático"
                       >
                         <span className="material-symbols-outlined text-[20px]">magic_button</span>
                       </button>
                     </div>
                   </div>"""

text = text.replace(target_codigo, repl_codigo)

# Let's fix the Detail View because it still has "Credenciales de Conducción" 
detail_conduccion = """                 <div className="bg-surface-container-lowest p-8 rounded-[32px] border border-outline-variant/40 space-y-6 shadow-sm">
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
                </div>"""

detail_sociolaboral = """                 <div className="bg-surface-container-lowest p-8 rounded-[32px] border border-outline-variant/40 space-y-6 shadow-sm">
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
                </div>"""

text = text.replace(detail_conduccion, detail_sociolaboral)

with open('frontend/src/pages/Colectores.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Colectores fixed.")
