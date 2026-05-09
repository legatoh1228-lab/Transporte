import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Modal } from '../components/common/Modal';
import { usePermissions } from '../hooks/usePermissions';

const Vehicles = () => {
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission('Vehículos', 'Crear');
  const canUpdate = hasPermission('Vehículos', 'Actualizar');
  const canDelete = hasPermission('Vehículos', 'Eliminar');

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Catalogs
  const [modalidades, setModalidades] = useState([]);
  const [subModalidades, setSubModalidades] = useState([]);
  const [transmisiones, setTransmisiones] = useState([]);
  const [combustibles, setCombustibles] = useState([]);

  const [formData, setFormData] = useState({
    placa: '',
    modalidad: '',
    submodalidad: '',
    marca: '',
    modelo: '',
    anio: new Date().getFullYear(),
    color: '',
    transmision: '',
    capacidad: 0,
    capacidad_pie: 0,
    combustible: '',
    aire_acondicionado: false,
    accesibilidad: false,
    seguro_vence: '',
    revision_tecnica_vence: '',
    foto: null
  });

  const fetchCatalogs = async () => {
    try {
      const [m, sm, t, c] = await Promise.all([
        api.get('catalogs/modalidades/'),
        api.get('catalogs/submodalidades/'),
        api.get('catalogs/transmisiones/'),
        api.get('catalogs/combustibles/')
      ]);
      setModalidades(m.data);
      setSubModalidades(sm.data);
      setTransmisiones(t.data);
      setCombustibles(c.data);
    } catch (err) {
      console.error("Error fetching catalogs:", err);
    }
  };

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await api.get('fleet/vehicles/');
      setVehicles(response.data);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError('No se pudo conectar con el servidor de flota.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchCatalogs();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleViewDetail = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailOpen(true);
  };

  const resetForm = () => {
    setFormData({
      placa: '',
      modalidad: '',
      submodalidad: '',
      marca: '',
      modelo: '',
      anio: new Date().getFullYear(),
      color: '',
      transmision: '',
      capacidad: 0,
      capacidad_pie: 0,
      combustible: '',
      aire_acondicionado: false,
      accesibilidad: false,
      seguro_vence: '',
      revision_tecnica_vence: '',
      foto: null
    });
    setImagePreview(null);
    setImageFile(null);
    setIsEditing(false);
    setError(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (vehicle) => {
    setFormData({
      ...vehicle,
      modalidad: vehicle.modalidad || '',
      submodalidad: vehicle.submodalidad || '',
      transmision: vehicle.transmision || '',
      combustible: vehicle.combustible || '',
      foto: null // We don't send back the URL as a file
    });
    setImagePreview(vehicle.foto);
    setImageFile(null);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'foto') {
          if (imageFile) data.append('foto', imageFile);
        } else if (formData[key] !== null && formData[key] !== undefined) {
          data.append(key, formData[key]);
        }
      });

      if (isEditing) {
        await api.put(`fleet/vehicles/${formData.placa}/`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('fleet/vehicles/', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setIsModalOpen(false);
      fetchVehicles();
      resetForm();
    } catch (err) {
      console.error("Error saving vehicle:", err);
      setError("Error al guardar el vehículo. Verifique los datos y que la placa sea única.");
    }
  };

  const handleDelete = async (placa) => {
    if (window.confirm(`¿Está seguro de eliminar permanentemente la unidad ${placa}?`)) {
      try {
        await api.delete(`fleet/vehicles/${placa}/`);
        fetchVehicles();
      } catch (err) {
        console.error("Error deleting vehicle:", err);
        alert("No se pudo eliminar el vehículo.");
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const filteredVehicles = vehicles.filter(v => 
    v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.modelo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-public-sans pb-10">
      {/* Header Block */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant pb-6">
        <div>
          <h1 className="text-4xl font-black text-on-surface tracking-tighter leading-none">Gestión de Flota</h1>
          <p className="text-sm font-bold text-on-surface-variant mt-2 max-w-2xl opacity-70">Monitoreo técnico y registro de unidades operativas del sistema de transporte institucional.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-surface-container-high px-4 py-2 rounded-2xl border border-outline-variant/50 flex items-center gap-3 shadow-sm">
              <span className="material-symbols-outlined text-primary text-[20px]">directions_bus</span>
              <div className="flex flex-col">
                 <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest leading-none">Total Unidades</span>
                 <span className="text-lg font-black text-on-surface leading-tight">{vehicles.length}</span>
              </div>
           </div>
        </div>
      </div>

      {/* Controls Bento Card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-5 flex flex-col lg:flex-row gap-5 justify-between items-center relative overflow-hidden shadow-sm">
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-80 group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px] group-focus-within:text-primary transition-colors">search</span>
            <input 
              className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low border border-outline-variant rounded-2xl text-sm font-bold text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all" 
              placeholder="Buscar por placa, marca o modelo..." 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          {canCreate && (
            <button 
              onClick={handleOpenCreate}
              className="px-8 py-3.5 bg-primary text-on-primary rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Registrar Unidad
            </button>
          )}
        </div>
      </div>

      {/* Data Table Container */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-[32px] overflow-hidden flex flex-col shadow-sm border-b-4 border-b-primary/10">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-32 text-center">
               <div className="inline-block w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
               <p className="text-sm font-black text-on-surface-variant uppercase tracking-widest animate-pulse">Sincronizando Base de Datos...</p>
            </div>
          ) : (
            <table className="w-full text-left border-separate border-spacing-0 min-w-[1000px]">
              <thead>
                <tr className="bg-surface-container-high">
                  <th className="px-8 py-5 text-[11px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/50">Unidad / Identificación</th>
                  <th className="px-8 py-5 text-[11px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/50">Especificaciones</th>
                  <th className="px-8 py-5 text-[11px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/50">Modalidad</th>
                  <th className="px-8 py-5 text-[11px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/50">Capacidad</th>
                  <th className="px-8 py-5 text-[11px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/50 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filteredVehicles.length > 0 ? filteredVehicles.map((v) => (
                  <tr key={v.placa} className="hover:bg-primary/[0.02] transition-colors group">
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-4">
                          <div className="w-16 h-12 rounded-xl bg-surface-container-high overflow-hidden border border-outline-variant/50 flex-shrink-0 relative">
                             {v.foto ? (
                               <img src={v.foto} alt="Vehículo" className="w-full h-full object-cover" />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center text-primary/30">
                                 <span className="material-symbols-outlined text-[24px]">local_shipping</span>
                               </div>
                             )}
                          </div>
                          <div>
                             <div className="font-mono font-black text-primary text-base tracking-tighter leading-none">{v.placa}</div>
                             <div className="text-[11px] text-on-surface-variant font-bold mt-1 opacity-60 uppercase tracking-widest">{v.marca} {v.modelo}</div>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-on-surface">{v.anio} • {v.combustible_nombre}</span>
                          <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-tighter">{v.transmision_nombre}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className="inline-flex px-3 py-1 bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-tighter rounded-lg border border-secondary/20">
                          {v.modalidad_nombre}
                       </span>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-2 text-on-surface">
                          <span className="material-symbols-outlined text-[18px] opacity-40">airline_seat_recline_normal</span>
                          <span className="text-sm font-black">{v.capacidad}</span>
                          <span className="text-[10px] font-bold text-on-surface-variant">asientos</span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                        <div className="flex items-center justify-center gap-2">
                           <button 
                             onClick={() => handleViewDetail(v)}
                             className="w-11 h-11 rounded-2xl text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-all flex items-center justify-center border border-transparent hover:border-primary/20"
                             title="Ver Ficha Técnica"
                           >
                             <span className="material-symbols-outlined text-[22px]">visibility</span>
                           </button>
                           {canUpdate && (
                             <button 
                               onClick={() => handleEdit(v)}
                               className="w-11 h-11 rounded-2xl text-on-surface-variant hover:text-secondary hover:bg-secondary/10 transition-all flex items-center justify-center border border-transparent hover:border-secondary/20"
                               title="Editar"
                             >
                               <span className="material-symbols-outlined text-[22px]">edit_square</span>
                             </button>
                           )}
                           {canDelete && (
                             <button 
                               onClick={() => handleDelete(v.placa)}
                               className="w-11 h-11 rounded-2xl text-on-surface-variant hover:text-error hover:bg-error/10 transition-all flex items-center justify-center border border-transparent hover:border-error/20"
                               title="Eliminar"
                             >
                               <span className="material-symbols-outlined text-[22px]">delete</span>
                             </button>
                           )}
                        </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center">
                       <div className="flex flex-col items-center opacity-30">
                          <span className="material-symbols-outlined text-[64px] mb-4">no_transportation</span>
                          <p className="font-black text-lg">No se encontraron vehículos</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail Modal (Ficha Técnica del Vehículo) */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Ficha Técnica de Unidad"
        icon="info"
        maxWidthClass="max-w-5xl"
        actions={
          <button onClick={() => setIsDetailOpen(false)} className="bg-surface-container-highest px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all">Cerrar Expediente</button>
        }
      >
        {selectedVehicle && (
          <div className="space-y-10 font-public-sans py-2">
             {/* Header Section */}
             <div className="flex flex-col md:flex-row items-center gap-10 bg-surface-container-low p-10 rounded-[40px] border border-outline-variant/30 shadow-inner">
                <div className="w-64 h-44 rounded-[32px] bg-white shadow-2xl overflow-hidden border-4 border-white flex-shrink-0 relative group">
                    {selectedVehicle.foto ? (
                      <img src={selectedVehicle.foto} alt="Vehículo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
                        <span className="material-symbols-outlined text-[80px]">local_shipping</span>
                      </div>
                    )}
                </div>
                <div className="text-center md:text-left space-y-3 flex-1">
                   <div className="inline-flex px-4 py-1.5 bg-primary/10 text-primary text-[11px] font-black uppercase tracking-[0.2em] rounded-full mb-2">
                      Unidad Institucional
                   </div>
                   <h2 className="text-5xl font-mono font-black text-primary tracking-tighter leading-tight drop-shadow-sm">
                      {selectedVehicle.placa}
                   </h2>
                   <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-3">
                      <div className="flex items-center gap-3 text-on-surface-variant font-bold text-sm bg-surface-container-highest/30 px-4 py-2 rounded-xl">
                         <span className="material-symbols-outlined text-[20px] text-primary">precision_manufacturing</span>
                         {selectedVehicle.marca} {selectedVehicle.modelo}
                      </div>
                      <div className="flex items-center gap-3 text-on-surface-variant font-bold text-sm bg-surface-container-highest/30 px-4 py-2 rounded-xl">
                         <span className="material-symbols-outlined text-[20px] text-primary">calendar_today</span>
                         Año {selectedVehicle.anio}
                      </div>
                   </div>
                </div>
             </div>

             {/* Grid Details */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 bg-surface-container-lowest p-8 rounded-[32px] border border-outline-variant/40 space-y-6 shadow-sm">
                   <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px]">settings_suggest</span>
                      Configuración Técnica & Confort
                   </h4>
                   <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                      <div className="space-y-1 py-2 border-b border-outline-variant/10">
                         <span className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest block leading-none">Modalidad</span>
                         <span className="text-sm font-black text-on-surface uppercase">{selectedVehicle.modalidad_nombre}</span>
                      </div>
                      <div className="space-y-1 py-2 border-b border-outline-variant/10">
                         <span className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest block leading-none">Transmisión</span>
                         <span className="text-sm font-black text-on-surface uppercase">{selectedVehicle.transmision_nombre}</span>
                      </div>
                      <div className="space-y-1 py-2 border-b border-outline-variant/10">
                         <span className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest block leading-none">Combustible</span>
                         <span className="text-sm font-black text-on-surface uppercase">{selectedVehicle.combustible_nombre}</span>
                      </div>
                      <div className="space-y-1 py-2 border-b border-outline-variant/10">
                         <span className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest block leading-none">Color de Unidad</span>
                         <span className="text-sm font-black text-on-surface uppercase">{selectedVehicle.color || 'No especificado'}</span>
                      </div>
                      <div className="flex items-center gap-4 pt-2">
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

                <div className="bg-surface-container-lowest p-8 rounded-[32px] border border-outline-variant/40 space-y-6 shadow-sm">
                   <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
                      Estatus Legal
                   </h4>
                   <div className="space-y-6">
                      <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30">
                         <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest block mb-2">Vencimiento de Seguro</span>
                         <span className={`text-sm font-black ${new Date(selectedVehicle.seguro_vence) < new Date() ? 'text-error animate-pulse' : 'text-on-surface'}`}>
                            {selectedVehicle.seguro_vence || 'Sin registro'}
                         </span>
                      </div>
                      <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30">
                         <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest block mb-2">Revisión Técnica</span>
                         <span className={`text-sm font-black ${new Date(selectedVehicle.revision_tecnica_vence) < new Date() ? 'text-error animate-pulse' : 'text-on-surface'}`}>
                            {selectedVehicle.revision_tecnica_vence || 'Sin registro'}
                         </span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </Modal>

      {/* Registration/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? "Modificar Unidad" : "Registrar Nueva Unidad"}
        icon={isEditing ? "edit_square" : "local_shipping"}
        maxWidthClass="max-w-5xl"
        actions={
          <div className="flex gap-4 w-full justify-end">
            <button onClick={() => setIsModalOpen(false)} className="px-8 py-3 text-sm font-black text-on-surface-variant hover:bg-surface-container-highest rounded-2xl transition-all uppercase tracking-widest">Cancelar</button>
            <button onClick={handleSubmit} className="px-10 py-3 text-sm font-black text-on-primary bg-primary hover:bg-primary/90 rounded-2xl shadow-xl shadow-primary/20 transition-all uppercase tracking-widest active:scale-95">
              {isEditing ? "Guardar Cambios" : "Completar Registro"}
            </button>
          </div>
        }
      >
        <form className="space-y-10 py-4">
          {error && (
            <div className="bg-error/10 border border-error/20 p-5 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
              <span className="material-symbols-outlined text-error text-[24px]">warning</span>
              <p className="text-[11px] font-black text-error uppercase tracking-widest">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Photo and Key Identifiers */}
            <div className="lg:col-span-4 space-y-8">
               <div className="flex flex-col items-center justify-center p-10 bg-surface-container-low rounded-[40px] border-2 border-dashed border-outline-variant/50 relative group transition-all hover:bg-surface-container shadow-inner">
                  <div className="w-full aspect-[4/3] rounded-[32px] bg-white shadow-2xl overflow-hidden border-4 border-white mb-6 relative transition-transform duration-500 group-hover:scale-[1.02]">
                     {imagePreview ? (
                       <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary opacity-40">
                         <span className="material-symbols-outlined text-[64px]">add_photo_alternate</span>
                       </div>
                     )}
                     <label className="absolute inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer">
                        <span className="material-symbols-outlined text-white text-[32px]">upload</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                     </label>
                  </div>
                  <h5 className="text-[11px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Imagen del Vehículo</h5>
                  <p className="text-[10px] text-on-surface-variant/50 mt-2 text-center leading-relaxed">Formato horizontal recomendado<br/>JPG, PNG (Máx 2MB)</p>
               </div>

               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Placa de Identificación <span className="text-error">*</span></label>
                  <input 
                    name="placa" value={formData.placa} onChange={handleInputChange} disabled={isEditing}
                    placeholder="AAA000" className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-4 px-5 text-xl font-mono font-black text-primary outline-none focus:ring-4 focus:ring-primary/10 transition-all uppercase tracking-tighter shadow-sm"
                    required
                  />
               </div>
            </div>

            {/* Right Column: Detailed Tech Specs */}
            <div className="lg:col-span-8 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-5">
                    <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-3">
                       <span className="material-symbols-outlined text-[20px]">branding_watermark</span>
                       Marca & Modelo
                    </h4>
                    <div className="space-y-4">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Fabricante / Marca <span className="text-error">*</span></label>
                          <input 
                            name="marca" value={formData.marca} onChange={handleInputChange}
                            placeholder="Ej: Encava, Iveco..." className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            required
                          />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Modelo Específico <span className="text-error">*</span></label>
                          <input 
                            name="modelo" value={formData.modelo} onChange={handleInputChange}
                            placeholder="Ej: E-NT610, Daily..." className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            required
                          />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                             <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Año <span className="text-error">*</span></label>
                             <input 
                               type="number" name="anio" value={formData.anio} onChange={handleInputChange}
                               className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-black outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                               required
                             />
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Color</label>
                             <input 
                               name="color" value={formData.color} onChange={handleInputChange}
                               placeholder="Blanco, Azul..." className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                             />
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-5">
                    <h4 className="text-[11px] font-black text-secondary uppercase tracking-[0.2em] flex items-center gap-3">
                       <span className="material-symbols-outlined text-[20px]">settings</span>
                       Configuración Mecánica
                    </h4>
                    <div className="space-y-4">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Transmisión <span className="text-error">*</span></label>
                          <select 
                            name="transmision" value={formData.transmision} onChange={handleInputChange}
                            className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-black outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                            required
                          >
                            <option value="">Seleccione...</option>
                            {transmisiones.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                          </select>
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Combustible <span className="text-error">*</span></label>
                          <select 
                            name="combustible" value={formData.combustible} onChange={handleInputChange}
                            className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-black outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                            required
                          >
                            <option value="">Seleccione...</option>
                            {combustibles.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                          </select>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                             <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Pasajeros <span className="text-error">*</span></label>
                             <input 
                               type="number" name="capacidad" value={formData.capacidad} onChange={handleInputChange}
                               className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-black outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                               required
                             />
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Parados</label>
                             <input 
                               type="number" name="capacidad_pie" value={formData.capacidad_pie} onChange={handleInputChange}
                               className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-black outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                             />
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-5">
                    <h4 className="text-[11px] font-black text-on-surface-variant uppercase tracking-[0.2em] flex items-center gap-3">
                       <span className="material-symbols-outlined text-[20px]">assignment_ind</span>
                       Operación & Modalidad
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Modalidad <span className="text-error">*</span></label>
                          <select 
                            name="modalidad" value={formData.modalidad} onChange={handleInputChange}
                            className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-black outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            required
                          >
                            <option value="">Seleccione...</option>
                            {modalidades.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                          </select>
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Sub-Modalidad <span className="text-error">*</span></label>
                          <select 
                            name="submodalidad" value={formData.submodalidad} onChange={handleInputChange}
                            className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-black outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            required
                          >
                            <option value="">Seleccione...</option>
                            {subModalidades.filter(sm => sm.modalidad == formData.modalidad).map(sm => <option key={sm.id} value={sm.id}>{sm.nombre}</option>)}
                          </select>
                       </div>
                    </div>
                    <div className="flex items-center gap-8 pt-2 px-1">
                       <label className="flex items-center gap-3 cursor-pointer group">
                          <div className="relative">
                             <input type="checkbox" name="aire_acondicionado" checked={formData.aire_acondicionado} onChange={handleInputChange} className="peer hidden" />
                             <div className="w-10 h-6 bg-surface-container-highest rounded-full peer-checked:bg-primary transition-all"></div>
                             <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:left-5"></div>
                          </div>
                          <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest group-hover:text-primary transition-colors">Aire Acond.</span>
                       </label>
                       <label className="flex items-center gap-3 cursor-pointer group">
                          <div className="relative">
                             <input type="checkbox" name="accesibilidad" checked={formData.accesibilidad} onChange={handleInputChange} className="peer hidden" />
                             <div className="w-10 h-6 bg-surface-container-highest rounded-full peer-checked:bg-primary transition-all"></div>
                             <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:left-5"></div>
                          </div>
                          <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest group-hover:text-primary transition-colors">Accesible</span>
                       </label>
                    </div>
                 </div>

                 <div className="space-y-5">
                    <h4 className="text-[11px] font-black text-error uppercase tracking-[0.2em] flex items-center gap-3">
                       <span className="material-symbols-outlined text-[20px]">verified_user</span>
                       Control de Vigencias
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Vence Seguro</label>
                          <input 
                            type="date" name="seguro_vence" value={formData.seguro_vence} onChange={handleInputChange}
                            className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-error/20 transition-all"
                          />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Revisión Técnica</label>
                          <input 
                            type="date" name="revision_tecnica_vence" value={formData.revision_tecnica_vence} onChange={handleInputChange}
                            className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-error/20 transition-all"
                          />
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Vehicles;
