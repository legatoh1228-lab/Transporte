import re

with open('frontend/src/pages/Insumos.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add state for movimientos and historial modal
state_repl = """  const [movimientos, setMovimientos] = useState([]);
  const [isHistorialOpen, setIsHistorialOpen] = useState(false);"""
  
text = text.replace("const [selectedInsumo, setSelectedInsumo] = useState(null);", 
                    "const [selectedInsumo, setSelectedInsumo] = useState(null);\n" + state_repl)

# 2. Fetch movimientos in fetchData
fetch_target = """      const [insumosRes, vehiculosRes] = await Promise.all([
        api.get('inventory/insumos/'),
        api.get('fleet/vehiculos/')
      ]);
      setInsumos(insumosRes.data);
      setVehiculos(vehiculosRes.data);"""

fetch_repl = """      const [insumosRes, vehiculosRes, movimientosRes] = await Promise.all([
        api.get('inventory/insumos/'),
        api.get('fleet/vehiculos/'),
        api.get('inventory/movimientos/')
      ]);
      setInsumos(insumosRes.data);
      setVehiculos(vehiculosRes.data);
      setMovimientos(movimientosRes.data);"""

text = text.replace(fetch_target, fetch_repl)

# 3. Add openHistorial function
historial_func = """  const openHistorial = (insumo) => {
    setSelectedInsumo(insumo);
    setIsHistorialOpen(true);
  };"""

text = text.replace("const openMovimiento = (insumo, tipo) => {", historial_func + "\n\n  const openMovimiento = (insumo, tipo) => {")

# 4. Add "Historial" button in the card
btn_target = """                  {canEdit && (
                    <button onClick={() => openEditInsumo(insumo)} className="w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center text-on-surface-variant/50 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                  )}
                </div>"""

btn_repl = """                  <div className="flex gap-1">
                    <button onClick={() => openHistorial(insumo)} className="w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center text-on-surface-variant/50 hover:text-primary transition-colors" title="Ver Historial">
                      <span className="material-symbols-outlined text-[18px]">history</span>
                    </button>
                    {canEdit && (
                      <button onClick={() => openEditInsumo(insumo)} className="w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center text-on-surface-variant/50 hover:text-primary transition-colors" title="Editar">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                    )}
                  </div>
                </div>"""

text = text.replace(btn_target, btn_repl)

# 5. Add Historial Modal at the end of the file
modal_target = """      </Modal>
    </div>
  );
};"""

modal_repl = """      </Modal>

      {/* Modal Historial */}
      <Modal isOpen={isHistorialOpen} onClose={() => setIsHistorialOpen(false)} title={`Historial de Movimientos: ${selectedInsumo?.nombre}`} icon="history">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {movimientos.filter(m => m.insumo === selectedInsumo?.id).length === 0 ? (
            <p className="text-center text-on-surface-variant py-8">No hay movimientos registrados para este insumo.</p>
          ) : (
            movimientos.filter(m => m.insumo === selectedInsumo?.id).map(mov => (
              <div key={mov.id} className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${mov.tipo === 'ENTRADA' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                    <span className="material-symbols-outlined text-[20px]">{mov.tipo === 'ENTRADA' ? 'arrow_downward' : 'arrow_upward'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-on-surface block">{mov.tipo} de {mov.cantidad} {mov.insumo_unidad}</span>
                    <span className="text-xs text-on-surface-variant">{new Date(mov.fecha).toLocaleString()}</span>
                    {mov.vehiculo_placa && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase ml-2">Vehículo: {mov.vehiculo_placa}</span>}
                    {mov.observaciones && <p className="text-xs text-on-surface-variant mt-1">{mov.observaciones}</p>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="pt-6 border-t border-outline-variant/30 text-right">
          <button onClick={() => setIsHistorialOpen(false)} className="px-6 py-2.5 bg-surface-container-highest hover:bg-surface-variant text-on-surface rounded-xl font-bold transition-all">Cerrar</button>
        </div>
      </Modal>
    </div>
  );
};"""

text = text.replace(modal_target, modal_repl)

with open('frontend/src/pages/Insumos.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("Patched Insumos.jsx")
