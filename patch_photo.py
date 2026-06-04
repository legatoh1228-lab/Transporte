import re

with open('frontend/src/pages/Insumos.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update form state
state_target = """  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    unidad_medida: 'Unidad',
    stock_minimo: 0,
    descripcion: ''
  });"""
state_repl = """  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    unidad_medida: 'Unidad',
    stock_minimo: 0,
    descripcion: '',
    foto: null,
    fotoPreview: null
  });"""
text = text.replace(state_target, state_repl)

# 2. Update openNewInsumo
new_target = """    setFormData({
      nombre: '',
      categoria: '',
      unidad_medida: 'Unidad',
      stock_minimo: 0,
      descripcion: ''
    });"""
new_repl = """    setFormData({
      nombre: '',
      categoria: '',
      unidad_medida: 'Unidad',
      stock_minimo: 0,
      descripcion: '',
      foto: null,
      fotoPreview: null
    });"""
text = text.replace(new_target, new_repl)

# 3. Update openEditInsumo
edit_target = """    setFormData({
      nombre: insumo.nombre,
      categoria: insumo.categoria,
      unidad_medida: insumo.unidad_medida,
      stock_minimo: insumo.stock_minimo,
      descripcion: insumo.descripcion || ''
    });"""
edit_repl = """    setFormData({
      nombre: insumo.nombre,
      categoria: insumo.categoria,
      unidad_medida: insumo.unidad_medida,
      stock_minimo: insumo.stock_minimo,
      descripcion: insumo.descripcion || '',
      foto: null,
      fotoPreview: insumo.foto || null
    });"""
text = text.replace(edit_target, edit_repl)

# 4. Update handleDelete
handle_delete = """  const handleDeleteInsumo = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este insumo? Se perderá todo su historial.')) {
      try {
        await api.delete(`inventory/insumos/${id}/`);
        fetchData();
      } catch (error) {
        console.error("Error al eliminar insumo:", error);
        alert("Ocurrió un error al eliminar el insumo.");
      }
    }
  };

  const handleInputChange = (e) => {"""
text = text.replace("  const handleInputChange = (e) => {", handle_delete)

# 5. Update handleInputChange for files
input_target = """  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };"""
input_repl = """  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setFormData({ ...formData, [name]: file, fotoPreview: previewUrl });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };"""
text = text.replace(input_target, input_repl)

# 6. Update handleSubmit for FormData
submit_target = """  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedInsumo) {
        await api.put(`inventory/insumos/${selectedInsumo.id}/`, formData);
      } else {
        await api.post('inventory/insumos/', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {"""
submit_repl = """  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('nombre', formData.nombre);
    data.append('categoria', formData.categoria);
    data.append('unidad_medida', formData.unidad_medida);
    data.append('stock_minimo', formData.stock_minimo);
    data.append('descripcion', formData.descripcion);
    if (formData.foto) {
      data.append('foto', formData.foto);
    }
    
    try {
      if (selectedInsumo) {
        await api.put(`inventory/insumos/${selectedInsumo.id}/`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('inventory/insumos/', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {"""
text = text.replace(submit_target, submit_repl)

# 7. Update Card to include Image and Delete
card_target = """                <div className="flex justify-between items-start mb-4">
                  <div className="bg-surface-container py-1 px-3 rounded-lg">
                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70">{insumo.categoria}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openHistorial(insumo)} className="w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center text-on-surface-variant/50 hover:text-primary transition-colors" title="Ver Historial">
                      <span className="material-symbols-outlined text-[18px]">history</span>
                    </button>
                    {canEdit && (
                      <button onClick={() => openEditInsumo(insumo)} className="w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center text-on-surface-variant/50 hover:text-primary transition-colors" title="Editar">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                    )}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-on-surface mb-1">{insumo.nombre}</h3>
                <p className="text-sm text-on-surface-variant mb-6 line-clamp-2 min-h-[40px]">{insumo.descripcion || 'Sin descripción'}</p>"""

card_repl = """                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="bg-surface-container py-1 px-3 rounded-lg backdrop-blur-md bg-white/10 border border-white/20">
                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70">{insumo.categoria}</span>
                  </div>
                  <div className="flex gap-1 bg-surface-container-low rounded-xl p-0.5">
                    <button onClick={() => openHistorial(insumo)} className="w-8 h-8 rounded-lg hover:bg-surface-variant flex items-center justify-center text-on-surface-variant/50 hover:text-primary transition-colors" title="Ver Ficha y Historial">
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                    {canEdit && (
                      <>
                        <button onClick={() => openEditInsumo(insumo)} className="w-8 h-8 rounded-lg hover:bg-surface-variant flex items-center justify-center text-on-surface-variant/50 hover:text-primary transition-colors" title="Editar">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button onClick={() => handleDeleteInsumo(insumo.id)} className="w-8 h-8 rounded-lg hover:bg-error/10 flex items-center justify-center text-on-surface-variant/50 hover:text-error transition-colors" title="Eliminar">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-4 items-center mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-surface-container-highest shrink-0 overflow-hidden border border-outline-variant/30 flex items-center justify-center shadow-inner relative group cursor-pointer" onClick={() => openHistorial(insumo)}>
                    {insumo.foto ? (
                      <img src={insumo.foto} alt={insumo.nombre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant/20">inventory_2</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-on-surface mb-1 leading-tight">{insumo.nombre}</h3>
                    <p className="text-sm text-on-surface-variant line-clamp-2">{insumo.descripcion || 'Sin descripción detallada.'}</p>
                  </div>
                </div>"""
text = text.replace(card_target, card_repl)

# 8. Add Foto field in Form
form_target = """              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-2">Nombre Comercial</label>"""
form_repl = """              <div className="space-y-2 md:col-span-2 flex items-center gap-6">
                <div className="relative w-28 h-28 rounded-3xl bg-surface-container-high border-2 border-dashed border-outline-variant/50 flex flex-col items-center justify-center overflow-hidden group cursor-pointer hover:border-primary/50 transition-colors shrink-0">
                  <input type="file" name="foto" accept="image/*" onChange={handleInputChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  {formData.fotoPreview ? (
                    <img src={formData.fotoPreview} alt="Vista previa" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-3xl text-on-surface-variant/30 group-hover:text-primary/50 transition-colors mb-1">add_a_photo</span>
                      <span className="text-[9px] font-bold text-on-surface-variant/50 uppercase">Subir Foto</span>
                    </>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-2">Nombre Comercial</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors text-[22px]">label</span>
                    <input required name="nombre" value={formData.nombre} onChange={handleInputChange} placeholder="Ej: Aceite 15W-40 Multigrado PDV" className="w-full bg-surface-container hover:bg-surface-container-high border-2 border-transparent focus:border-primary/30 rounded-[20px] py-4 pl-14 pr-5 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all uppercase shadow-inner" />
                  </div>
                </div>
              </div>"""
text = text.replace(form_target, form_repl)

# 9. Improve Historial Modal (Convert to Ficha Técnica)
modal_historial_target = """      {/* Modal Historial */}
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
      </Modal>"""

modal_historial_repl = """      {/* Modal Ficha y Historial */}
      <Modal isOpen={isHistorialOpen} onClose={() => setIsHistorialOpen(false)} title="Ficha del Insumo" icon="visibility">
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 bg-surface-container-lowest rounded-3xl border border-outline-variant/30 overflow-hidden flex flex-col items-center p-6 shadow-sm relative">
              {selectedInsumo?.foto ? (
                <img src={selectedInsumo.foto} alt={selectedInsumo.nombre} className="w-48 h-48 object-cover rounded-2xl shadow-inner mb-4" />
              ) : (
                <div className="w-48 h-48 bg-surface-container-high rounded-2xl mb-4 flex items-center justify-center border border-outline-variant/20">
                  <span className="material-symbols-outlined text-6xl text-on-surface-variant/20">inventory_2</span>
                </div>
              )}
              <div className="text-center w-full">
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 block mb-1">{selectedInsumo?.categoria}</span>
                <h3 className="text-lg font-black text-on-surface leading-tight mb-2">{selectedInsumo?.nombre}</h3>
                <div className="bg-primary/5 rounded-xl p-3 border border-primary/10 mt-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary/70 block mb-1">Stock Actual</span>
                  <div className="flex items-baseline justify-center gap-1.5">
                    <span className="text-3xl font-black text-primary tracking-tighter">{selectedInsumo?.stock_actual}</span>
                    <span className="text-xs font-bold text-on-surface-variant">{selectedInsumo?.unidad_medida}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-2/3 bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 shadow-sm">
              <h4 className="text-xs font-black text-on-surface uppercase tracking-[0.2em] flex items-center gap-2 mb-4 border-b border-outline-variant/20 pb-3">
                <span className="material-symbols-outlined text-[18px]">history</span>
                Registro de Movimientos
              </h4>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {movimientos.filter(m => m.insumo === selectedInsumo?.id).length === 0 ? (
                  <div className="text-center py-10 bg-surface-container rounded-2xl border border-dashed border-outline-variant/50">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-2">pending_actions</span>
                    <p className="text-sm font-bold text-on-surface-variant">Sin movimientos registrados.</p>
                  </div>
                ) : (
                  movimientos.filter(m => m.insumo === selectedInsumo?.id).map(mov => (
                    <div key={mov.id} className="p-3 bg-surface-container hover:bg-surface-container-high transition-colors rounded-[20px] border border-outline-variant/30 flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${mov.tipo === 'ENTRADA' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                          <span className="material-symbols-outlined text-[24px]">{mov.tipo === 'ENTRADA' ? 'inventory' : 'outbox'}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${mov.tipo === 'ENTRADA' ? 'bg-success text-white' : 'bg-error text-white'}`}>{mov.tipo}</span>
                            <span className="font-black text-sm text-on-surface">{mov.cantidad} {mov.insumo_unidad}</span>
                          </div>
                          <span className="text-[10px] font-bold text-on-surface-variant block">{new Date(mov.fecha).toLocaleString()}</span>
                          {mov.vehiculo_placa && <span className="text-[10px] font-black text-primary flex items-center gap-1 mt-1"><span className="material-symbols-outlined text-[12px]">directions_car</span> Vehículo: {mov.vehiculo_placa}</span>}
                          {mov.observaciones && <p className="text-[11px] font-medium text-on-surface-variant/80 mt-1 italic">"{mov.observaciones}"</p>}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="pt-4 text-right">
            <button onClick={() => setIsHistorialOpen(false)} className="px-8 py-3.5 bg-surface-container hover:bg-surface-variant text-on-surface rounded-2xl font-black uppercase tracking-wider text-xs transition-all">Cerrar Ficha</button>
          </div>
        </div>
      </Modal>"""

text = text.replace(modal_historial_target, modal_historial_repl)

with open('frontend/src/pages/Insumos.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("Added photo and delete logic.")
