import sys

with open('frontend/src/pages/Operadores.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add alert banner above Header Section
target_header = """             {/* Header Section */}
             <div className="flex flex-col md:flex-row items-center gap-10 bg-surface-container-low p-10 rounded-[40px] border border-outline-variant/30 shadow-inner">"""

repl_header = """             {/* Alerts */}
             {(!selectedOperator.certificado_saberes || (selectedOperator.fecha_vencimiento_saberes && new Date(selectedOperator.fecha_vencimiento_saberes) < new Date())) && (
               <div className="bg-error p-4 rounded-3xl border border-error/50 shadow-lg flex items-center justify-center gap-3 animate-pulse">
                  <span className="material-symbols-outlined text-on-error text-[28px]">warning</span>
                  <span className="font-black text-on-error uppercase tracking-widest text-sm">
                    {selectedOperator.certificado_saberes ? "ALERTA: Certificado de Saberes Vencido" : "ALERTA CRÍTICA: Operador sin Certificado de Saberes"}
                  </span>
               </div>
             )}

             {/* Header Section */}
             <div className="flex flex-col md:flex-row items-center gap-10 bg-surface-container-low p-10 rounded-[40px] border border-outline-variant/30 shadow-inner">"""

if target_header in text:
    text = text.replace(target_header, repl_header)
    print("Header replaced")

# 2. Update the Saberes Card inner rendering
target_card = """                         <div className="col-span-2 mt-4">
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
                         </div>"""

repl_card = """                         <div className="col-span-2 mt-4">
                            <h5 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-3 flex items-center gap-2 border-b border-outline-variant/20 pb-2">
                               <span className="material-symbols-outlined text-[16px]">school</span> Certificado de Saberes
                            </h5>
                            {selectedOperator.certificado_saberes ? (
                               <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-secondary/5 p-3 rounded-xl border border-secondary/10 flex flex-col">
                                     <span className="text-[10px] font-black text-secondary/70 uppercase tracking-widest">Emisión</span>
                                     <span className="font-bold text-secondary text-sm">{selectedOperator.fecha_emision_saberes || 'N/A'}</span>
                                  </div>
                                  <div className={`p-3 rounded-xl border flex flex-col ${selectedOperator.fecha_vencimiento_saberes && new Date(selectedOperator.fecha_vencimiento_saberes) < new Date() ? 'bg-error/10 border-error/50' : 'bg-secondary/5 border-secondary/10'}`}>
                                     <span className={`text-[10px] font-black uppercase tracking-widest ${selectedOperator.fecha_vencimiento_saberes && new Date(selectedOperator.fecha_vencimiento_saberes) < new Date() ? 'text-error' : 'text-secondary/70'}`}>Vencimiento</span>
                                     <span className={`font-bold text-sm ${selectedOperator.fecha_vencimiento_saberes && new Date(selectedOperator.fecha_vencimiento_saberes) < new Date() ? 'text-error animate-pulse' : 'text-secondary'}`}>{selectedOperator.fecha_vencimiento_saberes || 'N/A'}</span>
                                  </div>
                               </div>
                            ) : (
                               <div className="flex items-center justify-center gap-3 bg-error/10 border border-error/30 p-4 rounded-xl text-error">
                                  <span className="material-symbols-outlined text-[24px]">gpp_bad</span>
                                  <span className="text-sm font-black uppercase tracking-widest">Atención: No posee certificado de saberes</span>
                               </div>
                            )}
                         </div>"""

if target_card in text:
    text = text.replace(target_card, repl_card)
    print("Card replaced")

with open('frontend/src/pages/Operadores.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
