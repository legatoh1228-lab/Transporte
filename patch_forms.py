import re

with open('frontend/src/pages/Insumos.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update Insumo form
target_insumo_form = """        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Nombre</label>
              <input required name="nombre" value={formData.nombre} onChange={handleInputChange} placeholder="Ej: Aceite 15W-40 PDV" className="w-full bg-surface-container border border-outline-variant rounded-2xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Categoría</label>
              <input required name="categoria" value={formData.categoria} onChange={handleInputChange} placeholder="Ej: Aceites, Neumáticos..." className="w-full bg-surface-container border border-outline-variant rounded-2xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Unidad de Medida</label>
              <select name="unidad_medida" value={formData.unidad_medida} onChange={handleInputChange} className="w-full bg-surface-container border border-outline-variant rounded-2xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all">
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
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Alerta de Stock Mínimo</label>
              <input required type="number" step="0.01" name="stock_minimo" value={formData.stock_minimo} onChange={handleInputChange} className="w-full bg-surface-container border border-outline-variant rounded-2xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
            </div>
            <div className="col-span-1 md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Descripción</label>
              <textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} rows="3" className="w-full bg-surface-container border border-outline-variant rounded-2xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"></textarea>
            </div>
          </div>
          <div className="flex gap-4 pt-4 border-t border-outline-variant/30">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 bg-surface-container-highest hover:bg-surface-variant text-on-surface rounded-2xl font-bold transition-all">Cancelar</button>
            <button type="submit" className="flex-1 py-3.5 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all">{selectedInsumo ? 'Guardar Cambios' : 'Crear Insumo'}</button>
          </div>
        </form>"""

repl_insumo_form = """        <form onSubmit={handleSubmit} className="space-y-8">
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

if target_insumo_form in text:
    text = text.replace(target_insumo_form, repl_insumo_form)
else:
    print("Could not find target_insumo_form")

# 2. Update Movimiento form
target_movimiento_form = """        <form onSubmit={handleMovimientoSubmit} className="space-y-6">
          <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30 mb-6 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest block mb-1">Insumo</span>
              <span className="font-bold">{selectedInsumo?.nombre}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest block mb-1">Stock</span>
              <span className="font-black text-primary">{selectedInsumo?.stock_actual} {selectedInsumo?.unidad_medida}</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Cantidad de {movimientoTipo === 'ENTRADA' ? 'Entrada' : 'Salida'} ({selectedInsumo?.unidad_medida})</label>
              <input required type="number" step="0.01" max={movimientoTipo === 'SALIDA' ? selectedInsumo?.stock_actual : undefined} name="cantidad" value={movimientoData.cantidad} onChange={handleMovimientoChange} className="w-full bg-surface-container border border-outline-variant rounded-2xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all text-2xl text-center font-mono tracking-tighter" />
            </div>
            {movimientoTipo === 'SALIDA' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Vehículo Destino (Opcional)</label>
                <select name="vehiculo_destino" value={movimientoData.vehiculo_destino} onChange={handleMovimientoChange} className="w-full bg-surface-container border border-outline-variant rounded-2xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase">
                  <option value="">Ninguno / Otro Uso</option>
                  {vehiculos.map(v => (
                    <option key={v.id} value={v.id}>{v.placa} - {v.marca} {v.modelo}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Motivo / Observaciones</label>
              <textarea name="observaciones" value={movimientoData.observaciones} onChange={handleMovimientoChange} rows="2" placeholder="Ej: Mantenimiento preventivo, Reemplazo..." className="w-full bg-surface-container border border-outline-variant rounded-2xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"></textarea>
            </div>
          </div>
          <div className="flex gap-4 pt-4 border-t border-outline-variant/30">
            <button type="button" onClick={() => setIsMovimientoModalOpen(false)} className="flex-1 py-3.5 bg-surface-container-highest hover:bg-surface-variant text-on-surface rounded-2xl font-bold transition-all">Cancelar</button>
            <button type="submit" className={`flex-1 py-3.5 text-white rounded-2xl font-bold shadow-lg transition-all ${movimientoTipo === 'ENTRADA' ? 'bg-success hover:bg-success/90 shadow-success/20' : 'bg-error hover:bg-error/90 shadow-error/20'}`}>Registrar {movimientoTipo}</button>
          </div>
        </form>"""

repl_movimiento_form = """        <form onSubmit={handleMovimientoSubmit} className="space-y-6">
          <div className="bg-surface-container-lowest p-6 rounded-[24px] border border-outline-variant/40 shadow-sm space-y-6">
            <div className="flex justify-between items-center bg-surface-container p-5 rounded-2xl border border-outline-variant/30">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${movimientoTipo === 'ENTRADA' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                  <span className="material-symbols-outlined text-[24px]">{movimientoTipo === 'ENTRADA' ? 'inventory' : 'outbox'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest block mb-0.5">Insumo a Procesar</span>
                  <span className="font-bold text-base text-on-surface">{selectedInsumo?.nombre}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest block mb-0.5">Disponibilidad</span>
                <div className="flex items-baseline gap-1.5 justify-end">
                  <span className="font-black text-2xl text-primary tracking-tighter">{selectedInsumo?.stock_actual}</span>
                  <span className="text-xs font-bold text-on-surface-variant">{selectedInsumo?.unidad_medida}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">
                  Cantidad de {movimientoTipo === 'ENTRADA' ? 'Ingreso' : 'Egreso'}
                </label>
                <div className="relative">
                  <span className={`material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[24px] ${movimientoTipo === 'ENTRADA' ? 'text-success' : 'text-error'}`}>
                    {movimientoTipo === 'ENTRADA' ? 'add' : 'remove'}
                  </span>
                  <input required type="number" step="0.01" max={movimientoTipo === 'SALIDA' ? selectedInsumo?.stock_actual : undefined} name="cantidad" value={movimientoData.cantidad} onChange={handleMovimientoChange} placeholder="0.00" className={`w-full bg-surface-container border border-outline-variant rounded-2xl py-5 pl-14 pr-14 text-center font-bold outline-none focus:ring-2 transition-all text-3xl font-mono tracking-tighter ${movimientoTipo === 'ENTRADA' ? 'focus:ring-success/20 text-success' : 'focus:ring-error/20 text-error'}`} />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant/50 text-sm">{selectedInsumo?.unidad_medida}</span>
                </div>
              </div>
              
              {movimientoTipo === 'SALIDA' && (
                <div className="space-y-1.5 pt-4">
                  <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Vehículo Asignado</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px]">directions_car</span>
                    <select name="vehiculo_destino" value={movimientoData.vehiculo_destino} onChange={handleMovimientoChange} className="w-full bg-surface-container border border-outline-variant rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase appearance-none">
                      <option value="">Uso General / Sin Asignar</option>
                      {vehiculos.map(v => (
                        <option key={v.id} value={v.id}>{v.placa} - {v.marca} {v.modelo}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              
              <div className="space-y-1.5 pt-4">
                <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Justificación u Observaciones</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-4 text-on-surface-variant/50 text-[20px]">notes</span>
                  <textarea name="observaciones" value={movimientoData.observaciones} onChange={handleMovimientoChange} rows="3" placeholder={movimientoTipo === 'ENTRADA' ? "Nº de factura, proveedor, o nota..." : "Mantenimiento preventivo, reemplazo..."} className="w-full bg-surface-container border border-outline-variant rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse md:flex-row gap-4 pt-4 border-t border-outline-variant/30">
            <button type="button" onClick={() => setIsMovimientoModalOpen(false)} className="md:w-1/3 py-4 bg-surface-container-highest hover:bg-surface-variant text-on-surface rounded-2xl font-bold transition-all">Cancelar</button>
            <button type="submit" className={`md:w-2/3 py-4 text-white rounded-2xl font-black shadow-lg transition-all uppercase tracking-wider flex items-center justify-center gap-3 ${movimientoTipo === 'ENTRADA' ? 'bg-success hover:bg-success/90 shadow-success/20' : 'bg-error hover:bg-error/90 shadow-error/20'}`}>
              <span className="material-symbols-outlined">{movimientoTipo === 'ENTRADA' ? 'check_circle' : 'warning'}</span>
              Procesar {movimientoTipo}
            </button>
          </div>
        </form>"""

if target_movimiento_form in text:
    text = text.replace(target_movimiento_form, repl_movimiento_form)
else:
    print("Could not find target_movimiento_form")

with open('frontend/src/pages/Insumos.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("Forms patched.")
