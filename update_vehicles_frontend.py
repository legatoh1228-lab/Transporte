import sys
import re

with open('frontend/src/pages/Vehicles.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update initial formData
old_form_data = """    revision_tecnica_vence: '',
    foto: null
  });"""
new_form_data = """    revision_tecnica_vence: '',
    serial_motor: '',
    tipo_aceite: '',
    tamano_caucho: '',
    tipo_rin: '',
    medida_cadena: '',
    foto: null
  });"""
text = text.replace(old_form_data, new_form_data)

# 2. Add Mechanic Fields to Registration Modal
# Insert after: {/* Card 1: Technical Specs */} block
target_card1 = """                     </div>
                  </div>
               </div>

               {/* Card 2: Operación & Capacidad */}"""

repl_card1 = """                     </div>
                  </div>
               </div>

               {/* Card 1.5: Especificaciones Mecánicas */}
               <div className="bg-surface-container-low p-8 rounded-[40px] border border-outline-variant/30 shadow-sm">
                  <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-3 mb-8">
                     <span className="material-symbols-outlined text-[20px]">build_circle</span>
                     Especificaciones Mecánicas
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-6">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Serial de Motor</label>
                        <input name="serial_motor" value={formData.serial_motor || ''} onChange={handleInputChange} placeholder="Serial..." className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-mono font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase" />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Tipo de Aceite</label>
                        <input name="tipo_aceite" value={formData.tipo_aceite || ''} onChange={handleInputChange} placeholder="Ej: 15W-40" className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase" />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Tamaño de Caucho</label>
                        <input name="tamano_caucho" value={formData.tamano_caucho || ''} onChange={handleInputChange} placeholder="Ej: 175/70 R13" className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase" />
                     </div>
                  </div>
                  {formData.modalidad == '3' && (
                     <div className="mt-8 pt-8 border-t border-outline-variant/30 animate-in fade-in slide-in-from-top-4">
                        <h5 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                           <span className="material-symbols-outlined text-[16px]">two_wheeler</span>
                           Especificaciones de Motocicleta
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Tipo de Rin</label>
                              <input name="tipo_rin" value={formData.tipo_rin || ''} onChange={handleInputChange} placeholder="Ej: Rayos, Aleación" className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/20 transition-all uppercase" />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Medida de Cadena</label>
                              <input name="medida_cadena" value={formData.medida_cadena || ''} onChange={handleInputChange} placeholder="Ej: Paso 428, 520" className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/20 transition-all uppercase" />
                           </div>
                        </div>
                     </div>
                  )}
               </div>

               {/* Card 2: Operación & Capacidad */}"""
if target_card1 in text:
    text = text.replace(target_card1, repl_card1)
    print("Form Modal updated")

# 3. Add Mechanic Fields to Detail View Modal
# Insert it after "Configuración Técnica & Confort"
target_detail = """                       <div className="flex items-center gap-4 pt-2">
                         <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${selectedVehicle.aire_acondicionado ? 'bg-success/10 text-success' : 'bg-surface-variant text-on-surface-variant/40'}`}>
                            <span className="material-symbols-outlined text-[18px]">{selectedVehicle.aire_acondicionado ? 'ac_unit' : 'ac_unit_off'}</span>
                            <span className="text-[10px] font-black uppercase">Aire Acond.</span>
                         </div>
                         <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${selectedVehicle.accesibilidad ? 'bg-success/10 text-success' : 'bg-surface-variant text-on-surface-variant/40'}`}>
                            <span className="material-symbols-outlined text-[18px]">accessible</span>
                            <span className="text-[10px] font-black uppercase">Accesible</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-8">"""

repl_detail = """                       <div className="flex items-center gap-4 pt-2">
                         <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${selectedVehicle.aire_acondicionado ? 'bg-success/10 text-success' : 'bg-surface-variant text-on-surface-variant/40'}`}>
                            <span className="material-symbols-outlined text-[18px]">{selectedVehicle.aire_acondicionado ? 'ac_unit' : 'ac_unit_off'}</span>
                            <span className="text-[10px] font-black uppercase">Aire Acond.</span>
                         </div>
                         <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${selectedVehicle.accesibilidad ? 'bg-success/10 text-success' : 'bg-surface-variant text-on-surface-variant/40'}`}>
                            <span className="material-symbols-outlined text-[18px]">accessible</span>
                            <span className="text-[10px] font-black uppercase">Accesible</span>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Especificaciones Mecánicas Detail */}
                <div className="md:col-span-2 bg-surface-container-lowest p-8 rounded-[32px] border border-outline-variant/40 space-y-6 shadow-sm mt-0">
                   <h4 className="text-[11px] font-black text-secondary uppercase tracking-[0.3em] flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px]">build_circle</span>
                      Perfil Mecánico
                   </h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-surface-container-low/50 p-4 rounded-2xl border border-outline-variant/30 flex flex-col justify-center">
                         <span className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest mb-1">Serial de Motor</span>
                         <span className="font-mono font-black text-on-surface text-sm">{selectedVehicle.serial_motor || 'No especificado'}</span>
                      </div>
                      <div className="bg-surface-container-low/50 p-4 rounded-2xl border border-outline-variant/30 flex flex-col justify-center">
                         <span className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest mb-1">Aceite de Motor</span>
                         <span className="font-black text-on-surface text-sm">{selectedVehicle.tipo_aceite || 'No especificado'}</span>
                      </div>
                      <div className="bg-surface-container-low/50 p-4 rounded-2xl border border-outline-variant/30 flex flex-col justify-center">
                         <span className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest mb-1">Cauchos / Neumáticos</span>
                         <span className="font-black text-on-surface text-sm">{selectedVehicle.tamano_caucho || 'No especificado'}</span>
                      </div>
                      {selectedVehicle.modalidad == 3 && (
                         <div className="bg-secondary/5 p-4 rounded-2xl border border-secondary/20 flex flex-col justify-center col-span-2 sm:col-span-1">
                            <span className="text-[10px] font-black text-secondary/70 uppercase tracking-widest mb-1">Kit de Arrastre / Rin</span>
                            <span className="font-black text-secondary text-sm">
                               {selectedVehicle.tipo_rin || 'Rin N/A'} • {selectedVehicle.medida_cadena || 'Cadena N/A'}
                            </span>
                         </div>
                      )}
                   </div>
                </div>
                
                <div className="space-y-8 mt-0">"""

if target_detail in text:
    text = text.replace(target_detail, repl_detail)
    print("Detail view updated")

# 4. Modify layout to make the new block fit properly. 
# Currently the "Grid Details" container is `<div className="grid grid-cols-1 md:grid-cols-3 gap-8">`.
# `md:col-span-2` is the left column. If we add another `md:col-span-2` directly inside the grid, it will push the `space-y-8` (right column) to the next row!
# We need to wrap the left column blocks in their own `<div className="md:col-span-2 flex flex-col gap-8">`
# Let's fix that wrapper.

target_wrapper = """             {/* Grid Details */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 bg-surface-container-lowest p-8 rounded-[32px] border border-outline-variant/40 space-y-6 shadow-sm">"""

repl_wrapper = """             {/* Grid Details */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="md:col-span-2 flex flex-col gap-8">
                  <div className="bg-surface-container-lowest p-8 rounded-[32px] border border-outline-variant/40 space-y-6 shadow-sm">"""

if target_wrapper in text:
    text = text.replace(target_wrapper, repl_wrapper)
    print("Wrapper 1 updated")

target_wrapper2 = """                   </div>
                </div>

                {/* Especificaciones Mecánicas Detail */}
                <div className="md:col-span-2 bg-surface-container-lowest p-8 rounded-[32px] border border-outline-variant/40 space-y-6 shadow-sm mt-0">"""

repl_wrapper2 = """                   </div>
                  </div>

                  {/* Especificaciones Mecánicas Detail */}
                  <div className="bg-surface-container-lowest p-8 rounded-[32px] border border-outline-variant/40 space-y-6 shadow-sm mt-0">"""

if target_wrapper2 in text:
    text = text.replace(target_wrapper2, repl_wrapper2)
    print("Wrapper 2 updated")

target_wrapper3 = """                   </div>
                </div>
                
                <div className="space-y-8 mt-0">"""

repl_wrapper3 = """                   </div>
                  </div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-8 mt-0">"""

if target_wrapper3 in text:
    text = text.replace(target_wrapper3, repl_wrapper3)
    print("Wrapper 3 updated")


with open('frontend/src/pages/Vehicles.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
