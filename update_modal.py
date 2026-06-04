import sys
import re

with open('frontend/src/pages/Colectores.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = re.compile(r'\{\/\* Grid Details \*\/\}\s*<div className="grid grid-cols-1 md:grid-cols-2 gap-8">.*?<\/div>\n\s*<\/div>\n\s*\)\}\n\s*<\/Modal>', re.DOTALL)

repl = """{/* Grid Details Re-designed */}
             <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Socio-Laboral */}
                <div className="md:col-span-7 bg-surface-container-lowest p-8 rounded-[32px] border border-outline-variant/40 shadow-sm flex flex-col h-full">
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

if bool(pattern.search(text)):
    new_text = pattern.sub(repl, text)
    with open('frontend/src/pages/Colectores.jsx', 'w', encoding='utf-8') as f:
        f.write(new_text)
    print("Modal successfully updated!")
else:
    print("Regex match failed.")
