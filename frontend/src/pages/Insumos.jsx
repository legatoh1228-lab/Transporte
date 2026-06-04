import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Modal } from '../components/common/Modal';
import { usePermissions } from '../hooks/usePermissions';

const Insumos = () => {
  const [insumos, setInsumos] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMovimientoModalOpen, setIsMovimientoModalOpen] = useState(false);
  const [movimientoTipo, setMovimientoTipo] = useState('ENTRADA'); // ENTRADA o SALIDA
  const [selectedInsumo, setSelectedInsumo] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [isHistorialOpen, setIsHistorialOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    unidad_medida: 'Unidad',
    stock_minimo: 0,
    descripcion: '',
    foto: null,
    fotoPreview: null
  });

  const [movimientoData, setMovimientoData] = useState({
    cantidad: '',
    vehiculo_destino: '',
    observaciones: ''
  });

  const { hasPermission } = usePermissions();
  const canCreate = hasPermission('Insumos', 'Crear');
  const canUpdate = hasPermission('Insumos', 'Actualizar');
  const canDelete = hasPermission('Insumos', 'Eliminar');

  const fetchData = async () => {
    try {
      const [insumosRes, vehiculosRes, movimientosRes] = await Promise.all([
        api.get('inventory/insumos/'),
        api.get('fleet/vehicles/'),
        api.get('inventory/movimientos/')
      ]);
      setInsumos(insumosRes.data);
      setVehiculos(vehiculosRes.data);
      setMovimientos(movimientosRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteInsumo = async (id) => {
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

  const handleInputChange = (e) => {
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
  };

  const handleMovimientoChange = (e) => {
    const { name, value } = e.target;
    setMovimientoData({ ...movimientoData, [name]: value });
  };

  const handleSubmit = async (e) => {
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
    } catch (error) {
      console.error("Error saving insumo:", error);
      alert("Ocurrió un error al guardar el insumo");
    }
  };

  const handleMovimientoSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        insumo: selectedInsumo.id,
        tipo: movimientoTipo,
        cantidad: movimientoData.cantidad,
        observaciones: movimientoData.observaciones
      };
      if (movimientoTipo === 'SALIDA' && movimientoData.vehiculo_destino) {
        payload.vehiculo_destino = movimientoData.vehiculo_destino;
      }
      await api.post('inventory/movimientos/', payload);
      setIsMovimientoModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving movimiento:", error);
      alert("Ocurrió un error al registrar el movimiento");
    }
  };

  const openNewInsumo = () => {
    setSelectedInsumo(null);
    setFormData({
      nombre: '',
      categoria: '',
      unidad_medida: 'Unidad',
      stock_minimo: 0,
      descripcion: '',
      foto: null,
      fotoPreview: null
    });
    setIsModalOpen(true);
  };

  const openEditInsumo = (insumo) => {
    setSelectedInsumo(insumo);
    setFormData({
      nombre: insumo.nombre,
      categoria: insumo.categoria,
      unidad_medida: insumo.unidad_medida,
      stock_minimo: insumo.stock_minimo,
      descripcion: insumo.descripcion || '',
      foto: null,
      fotoPreview: insumo.foto || null
    });
    setIsModalOpen(true);
  };

    const openHistorial = (insumo) => {
    setSelectedInsumo(insumo);
    setIsHistorialOpen(true);
  };

  const openMovimiento = (insumo, tipo) => {
    setSelectedInsumo(insumo);
    setMovimientoTipo(tipo);
    setMovimientoData({
      cantidad: '',
      vehiculo_destino: '',
      observaciones: ''
    });
    setIsMovimientoModalOpen(true);
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div></div>;

  const categoriasDB = [...new Set(insumos.map(i => i.categoria))].filter(Boolean);
  const categoriasPredefinidas = [
    "Lubricantes y Aceites", "Neumáticos y Cauchos", "Filtros", 
    "Frenos (Pastillas / Bandas)", "Baterías", "Kits de Arrastre", 
    "Piezas de Motor", "Sistemas Eléctricos", "Limpieza y Mantenimiento", "Herramientas"
  ];
  const categoriasFinales = [...new Set([...categoriasPredefinidas, ...categoriasDB])];

  const unidadesDB = [...new Set(insumos.map(i => i.unidad_medida))].filter(Boolean);
  const unidadesPredefinidas = [
    "Unidad", "Litro", "Paila", "Kilo", "Bulto", "Par", "Galon", "Tambor", "Kit"
  ];
  const unidadesFinales = [...new Set([...unidadesPredefinidas, ...unidadesDB])];

  return (
    <div className="min-h-screen bg-surface font-public-sans text-on-surface">
      {/* HEADER PREMIUM */}
      <div className="bg-surface-container relative overflow-hidden rounded-b-[40px] shadow-sm mb-8">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-8 py-16 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20">
                <span className="material-symbols-outlined text-[18px]">inventory</span>
                <span className="text-xs font-bold tracking-widest uppercase">Módulo de Almacén</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight text-on-surface">
                Insumos & Repuestos
              </h1>
              <p className="text-lg text-on-surface-variant max-w-2xl font-medium">
                Gestione el stock de aceites, cauchos y repuestos de la flota vehicular. Registre entradas y asigne repuestos a vehículos específicos.
              </p>
            </div>
            {canCreate && (
              <button onClick={openNewInsumo} className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-on-primary font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-3 transition-all hover:-translate-y-1 active:translate-y-0 group whitespace-nowrap">
                <span className="material-symbols-outlined transition-transform group-hover:scale-110">add_circle</span>
                Nuevo Insumo
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insumos.map((insumo) => {
            const isLowStock = parseFloat(insumo.stock_actual) <= parseFloat(insumo.stock_minimo);
            return (
              <div key={insumo.id} className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${isLowStock ? 'bg-error' : 'bg-primary'}`}></div>
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="bg-surface-container py-1 px-3 rounded-lg backdrop-blur-md bg-white/10 border border-white/20">
                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70">{insumo.categoria}</span>
                  </div>
                  <div className="flex gap-1 bg-surface-container-low rounded-xl p-0.5">
                    <button onClick={() => openHistorial(insumo)} className="w-8 h-8 rounded-lg hover:bg-surface-variant flex items-center justify-center text-on-surface-variant/50 hover:text-primary transition-colors" title="Ver Ficha y Historial">
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                    {canUpdate && (
                      <button onClick={() => openEditInsumo(insumo)} className="w-8 h-8 rounded-lg hover:bg-surface-variant flex items-center justify-center text-on-surface-variant/50 hover:text-primary transition-colors" title="Editar">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                    )}
                    {canDelete && (
                      <button onClick={() => handleDeleteInsumo(insumo.id)} className="w-8 h-8 rounded-lg hover:bg-error/10 flex items-center justify-center text-on-surface-variant/50 hover:text-error transition-colors" title="Eliminar">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
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
                </div>
                
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 block mb-1">Stock Actual</span>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-black tracking-tighter ${isLowStock ? 'text-error' : 'text-primary'}`}>{insumo.stock_actual}</span>
                      <span className="text-sm font-bold text-on-surface-variant uppercase">{insumo.unidad_medida}</span>
                    </div>
                  </div>
                  {isLowStock && (
                    <div className="flex items-center gap-1.5 text-error bg-error/10 px-2 py-1 rounded-md">
                      <span className="material-symbols-outlined text-[14px]">warning</span>
                      <span className="text-[10px] font-bold uppercase">Stock Bajo</span>
                    </div>
                  )}
                </div>

                {canUpdate && (
                  <div className="flex gap-3 pt-4 border-t border-outline-variant/20">
                    <button onClick={() => openMovimiento(insumo, 'ENTRADA')} className="flex-1 py-2.5 bg-success/10 hover:bg-success/20 text-success rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                      <span className="material-symbols-outlined text-[18px]">add_circle</span>
                      Entrada
                    </button>
                    <button onClick={() => openMovimiento(insumo, 'SALIDA')} className="flex-1 py-2.5 bg-error/10 hover:bg-error/20 text-error rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                      <span className="material-symbols-outlined text-[18px]">remove_circle</span>
                      Salida
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {insumos.length === 0 && (
          <div className="text-center py-20 bg-surface-container-lowest rounded-3xl border border-dashed border-outline-variant">
            <span className="material-symbols-outlined text-[60px] text-on-surface-variant/30 mb-4">inventory_2</span>
            <h3 className="text-xl font-bold text-on-surface mb-2">No hay insumos registrados</h3>
            <p className="text-on-surface-variant">Comience añadiendo un nuevo insumo al sistema.</p>
          </div>
        )}
      </div>

      {/* Modal Insumo */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedInsumo ? "Editar Insumo" : "Nuevo Insumo"} icon="inventory_2">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="relative bg-surface-container-lowest p-8 rounded-[32px] border border-outline-variant/40 shadow-sm space-y-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] flex items-center gap-3 border-b border-outline-variant/20 pb-4">
              <span className="material-symbols-outlined text-[20px]">inventory_2</span>
              Identificación del Insumo
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              <div className="space-y-2 md:col-span-2 flex items-center gap-6">
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
              </div>

              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-2">Categoría / Tipo de Insumo</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors text-[22px]">category</span>
                  <input required list="categorias-list" name="categoria" value={formData.categoria} onChange={handleInputChange} placeholder="Selecciona o escribe..." className="w-full bg-surface-container hover:bg-surface-container-high border-2 border-transparent focus:border-primary/30 rounded-[20px] py-4 pl-14 pr-5 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all uppercase shadow-inner" />
                  <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-on-surface-variant/40 pointer-events-none text-[20px]">arrow_drop_down</span>
                  <datalist id="categorias-list">
                    {categoriasFinales.map((cat, idx) => (
                      <option key={idx} value={cat} />
                    ))}
                  </datalist>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-2">Unidad de Medida Base</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors text-[22px]">straighten</span>
                  <input required list="unidades-list" name="unidad_medida" value={formData.unidad_medida} onChange={handleInputChange} placeholder="Escribe o selecciona..." className="w-full bg-surface-container hover:bg-surface-container-high border-2 border-transparent focus:border-primary/30 rounded-[20px] py-4 pl-14 pr-5 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all uppercase shadow-inner" />
                  <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-on-surface-variant/40 pointer-events-none text-[20px]">arrow_drop_down</span>
                  <datalist id="unidades-list">
                    {unidadesFinales.map((uni, idx) => (
                      <option key={idx} value={uni} />
                    ))}
                  </datalist>
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
            {((selectedInsumo && canUpdate) || (!selectedInsumo && canCreate)) && (
              <button type="submit" className="md:w-2/3 py-4.5 bg-primary hover:bg-primary/90 text-on-primary rounded-[20px] font-black shadow-xl shadow-primary/30 transition-all uppercase tracking-wider flex items-center justify-center gap-3 text-xs">
                <span className="material-symbols-outlined text-[20px]">{selectedInsumo ? 'save' : 'add_circle'}</span>
                {selectedInsumo ? 'Actualizar Insumo' : 'Registrar Nuevo Insumo'}
              </button>
            )}
          </div>
        </form>
      </Modal>

      {/* Modal Movimiento */}
      <Modal isOpen={isMovimientoModalOpen} onClose={() => setIsMovimientoModalOpen(false)} title={movimientoTipo === 'ENTRADA' ? "Registrar Entrada" : "Registrar Salida / Uso"} icon={movimientoTipo === 'ENTRADA' ? "add_circle" : "remove_circle"}>
        <form onSubmit={handleMovimientoSubmit} className="space-y-6">
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
        </form>
      </Modal>

      {/* Modal Ficha y Historial */}
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
      </Modal>
    </div>
  );
};

export default Insumos;
