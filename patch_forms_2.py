import re

with open('frontend/src/pages/Insumos.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

target_insumo_form = """        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-surface-container-lowest p-6 rounded-[24px] border border-outline-variant/40 shadow-sm space-y-6">
            <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[18px]">label</span>
              Identificación del Insumo
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Nombre Comercial</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px]">inventory_2</span>
                  <input required name="nombre" value={formData.nombre} onChange={handleInputChange} placeholder="Ej: Aceite 15W-40 Multigrado PDV" className="w-full bg-surface-container border border-outline-variant rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Clasificación / Categoría</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px]">category</span>
                  <input required name="categoria" value={formData.categoria} onChange={handleInputChange} placeholder="Ej: Lubricantes, Filtros..." className="w-full bg-surface-container border border-outline-variant rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Medida Base</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px]">straighten</span>
                  <select name="unidad_medida" value={formData.unidad_medida} onChange={handleInputChange} className="w-full bg-surface-container border border-outline-variant rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase appearance-none">
                    <option value="Unidad">Unidad(es)</option>
                    <option value="Litro">Litro(s)</option>
                    <option value="Paila">Paila(s)</option>
                    <option value="Kilo">Kilo(s)</option>
                    <option value="Bulto">Bulto(s)</option>
                    <option value="Par">Par(es)</option>
                    <option value="Galon">Galón/Galones</option>
                    <option value="Tambor">Tambor(es)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-[24px] border border-outline-variant/40 shadow-sm space-y-6">
            <h4 className="text-[11px] font-black text-warning uppercase tracking-[0.3em] flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              Control de Inventario
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Alerta de Stock Crítico</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-warning/70 text-[20px]">notifications_active</span>
                  <input required type="number" step="0.01" name="stock_minimo" value={formData.stock_minimo} onChange={handleInputChange} placeholder="0" className="w-full bg-surface-container border border-outline-variant rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-warning/20 transition-all font-mono" />
                </div>
                <p className="text-[10px] text-on-surface-variant ml-2 mt-1">El sistema emitirá una alerta visual cuando el stock llegue a este nivel.</p>
              </div>
              <div className="col-span-1 md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Especificaciones Técnicas / Detalles</label>
                <textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} rows="3" placeholder="Información adicional sobre uso, compatibilidad o almacenamiento..." className="w-full bg-surface-container border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"></textarea>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse md:flex-row gap-4 pt-4 border-t border-outline-variant/30">
            <button type="button" onClick={() => setIsModalOpen(false)} className="md:w-1/3 py-4 bg-surface-container-highest hover:bg-surface-variant text-on-surface rounded-2xl font-bold transition-all">Cancelar</button>
            <button type="submit" className="md:w-2/3 py-4 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all uppercase tracking-wider">{selectedInsumo ? 'Actualizar Insumo' : 'Registrar Insumo'}</button>
          </div>
        </form>"""

repl_insumo_form = """        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="relative bg-surface-container-lowest p-8 rounded-[32px] border border-outline-variant/40 shadow-sm space-y-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] flex items-center gap-3 border-b border-outline-variant/20 pb-4">
              <span className="material-symbols-outlined text-[20px]">inventory_2</span>
              Identificación del Insumo
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-2">Nombre Comercial</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors text-[22px]">label</span>
                  <input required name="nombre" value={formData.nombre} onChange={handleInputChange} placeholder="Ej: Aceite 15W-40 Multigrado PDV" className="w-full bg-surface-container hover:bg-surface-container-high border-2 border-transparent focus:border-primary/30 rounded-[20px] py-4 pl-14 pr-5 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all uppercase shadow-inner" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-2">Categoría / Tipo de Insumo</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors text-[22px]">category</span>
                  <input required list="categorias-list" name="categoria" value={formData.categoria} onChange={handleInputChange} placeholder="Selecciona o escribe..." className="w-full bg-surface-container hover:bg-surface-container-high border-2 border-transparent focus:border-primary/30 rounded-[20px] py-4 pl-14 pr-5 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all uppercase shadow-inner" />
                  <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-on-surface-variant/40 pointer-events-none text-[20px]">arrow_drop_down</span>
                  <datalist id="categorias-list">
                    <option value="Lubricantes y Aceites" />
                    <option value="Neumáticos y Cauchos" />
                    <option value="Filtros" />
                    <option value="Frenos (Pastillas / Bandas)" />
                    <option value="Baterías" />
                    <option value="Kits de Arrastre" />
                    <option value="Piezas de Motor" />
                    <option value="Sistemas Eléctricos" />
                    <option value="Limpieza y Mantenimiento" />
                    <option value="Herramientas" />
                  </datalist>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-2">Unidad de Medida Base</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors text-[22px]">straighten</span>
                  <select name="unidad_medida" value={formData.unidad_medida} onChange={handleInputChange} className="w-full bg-surface-container hover:bg-surface-container-high border-2 border-transparent focus:border-primary/30 rounded-[20px] py-4 pl-14 pr-5 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all uppercase appearance-none shadow-inner cursor-pointer">
                    <option value="Unidad">Unidad(es)</option>
                    <option value="Litro">Litro(s)</option>
                    <option value="Paila">Paila(s)</option>
                    <option value="Kilo">Kilo(s)</option>
                    <option value="Bulto">Bulto(s)</option>
                    <option value="Par">Par(es)</option>
                    <option value="Galon">Galón / Galones</option>
                    <option value="Tambor">Tambor(es)</option>
                    <option value="Kit">Kit(s)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-on-surface-variant/40 pointer-events-none text-[20px]">expand_more</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative bg-surface-container-lowest p-8 rounded-[32px] border border-outline-variant/40 shadow-sm space-y-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-warning/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <h4 className="text-xs font-black text-warning uppercase tracking-[0.2em] flex items-center gap-3 border-b border-outline-variant/20 pb-4">
              <span className="material-symbols-outlined text-[20px]">warning</span>
              Control de Inventario
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-2">Alerta de Stock Crítico</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-warning/50 group-focus-within:text-warning transition-colors text-[22px]">notifications_active</span>
                  <input required type="number" step="0.01" name="stock_minimo" value={formData.stock_minimo} onChange={handleInputChange} placeholder="0" className="w-full bg-surface-container hover:bg-surface-container-high border-2 border-transparent focus:border-warning/30 rounded-[20px] py-4 pl-14 pr-5 text-sm font-bold outline-none focus:ring-4 focus:ring-warning/10 transition-all font-mono shadow-inner" />
                </div>
                <div className="flex items-start gap-2 text-on-surface-variant/70 mt-2 px-2">
                   <span className="material-symbols-outlined text-[14px]">info</span>
                   <p className="text-[10px] font-bold">El sistema emitirá una alerta visual cuando el stock llegue a este nivel crítico.</p>
                </div>
              </div>
              
              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-2">Especificaciones Técnicas / Detalles Adicionales</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-5 top-5 text-on-surface-variant/40 group-focus-within:text-primary transition-colors text-[22px]">notes</span>
                  <textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} rows="3" placeholder="Información adicional sobre uso, compatibilidad con vehículos o detalles de almacenamiento..." className="w-full bg-surface-container hover:bg-surface-container-high border-2 border-transparent focus:border-primary/30 rounded-[20px] py-4 pl-14 pr-5 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none shadow-inner"></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse md:flex-row gap-4 pt-6 border-t border-outline-variant/30">
            <button type="button" onClick={() => setIsModalOpen(false)} className="md:w-1/3 py-4.5 bg-surface-container hover:bg-surface-variant text-on-surface rounded-[20px] font-black uppercase tracking-wider transition-all text-xs">Cancelar</button>
            <button type="submit" className="md:w-2/3 py-4.5 bg-primary hover:bg-primary/90 text-on-primary rounded-[20px] font-black shadow-xl shadow-primary/30 transition-all uppercase tracking-wider flex items-center justify-center gap-3 text-xs">
              <span className="material-symbols-outlined text-[20px]">{selectedInsumo ? 'save' : 'add_circle'}</span>
              {selectedInsumo ? 'Actualizar Insumo' : 'Registrar Nuevo Insumo'}
            </button>
          </div>
        </form>"""

if target_insumo_form in text:
    text = text.replace(target_insumo_form, repl_insumo_form)
else:
    print("Could not find target_insumo_form")

with open('frontend/src/pages/Insumos.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("Forms patched again.")
