import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Modal } from '../components/common/Modal';
import { usePermissions } from '../hooks/usePermissions';
import { usePagination } from '../hooks/usePagination';
import { PaginationControls } from '../components/common/PaginationControls';

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
    const [operadores, setOperadores] = useState([]);
    const [isPropietarioOperador, setIsPropietarioOperador] = useState(false);

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
    serial_carroceria: '',
    propietario: '',
    propietario_identificacion: '',
    cps: '',
    combustible: '',
    aire_acondicionado: false,
    accesibilidad: false,
    seguro_vence: '',
    rcv_vence: '',
    certificado_vence: '',
    revision_tecnica_vence: '',
    foto: null
  });

  const fetchCatalogs = async () => {
    try {
      const [m, sm, t, c, ops] = await Promise.all([
        api.get('catalogs/modalidades/'),
        api.get('catalogs/submodalidades/'),
        api.get('catalogs/transmisiones/'),
        api.get('catalogs/combustibles/'),
        api.get('personnel/operators/')
      ]);
      setModalidades(m.data);
      setSubModalidades(sm.data);
      setTransmisiones(t.data);
      setCombustibles(c.data);
      setOperadores(ops.data);
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
      serial_carroceria: '',
      propietario: '',
      propietario_identificacion: '',
      cps: '',
      combustible: '',
      aire_acondicionado: false,
      accesibilidad: false,
      seguro_vence: '',
      rcv_vence: '',
      certificado_vence: '',
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
    
    if (name === 'operador_as_propietario') {
      const selectedOp = operadores.find(op => op.cedula === value);
      if (selectedOp) {
        setFormData(prev => ({
          ...prev,
          propietario: `${selectedOp.nombres} ${selectedOp.apellidos}`,
          propietario_identificacion: selectedOp.cedula
        }));
      }
      return;
    }

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

  const {
    paginatedData,
    currentPage,
    totalPages,
    totalFiltered,
    startIndex,
    endIndex,
    hasNextPage,
    hasPrevPage,
    goToPage,
    nextPage,
    prevPage
  } = usePagination(filteredVehicles, { itemsPerPage: 10, enableSearch: false, enableFilter: false });

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
                  <th className="px-8 py-5 text-[11px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/50">Modalidad / CPS</th>
                  <th className="px-8 py-5 text-[11px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/50">Capacidad</th>
                  <th className="px-8 py-5 text-[11px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/50 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {paginatedData.length > 0 ? paginatedData.map((v) => (
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
                       <div className="flex flex-col gap-1">
                          <span className="inline-flex w-fit px-3 py-1 bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-tighter rounded-lg border border-secondary/20">
                              {v.modalidad_nombre}
                           </span>
                           <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest ml-1">{v.cps || 'S/C'}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-on-surface">
                           <span className="material-symbols-outlined text-[18px] opacity-40">
                              {v.modalidad == 3 ? 'motorcycle' : 'airline_seat_recline_normal'}
                           </span>
                           <span className="text-sm font-black">{v.capacidad}</span>
                           <span className="text-[10px] font-bold text-on-surface-variant">
                              {v.modalidad == 3 ? 'puestos' : 'asientos'}
                           </span>
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
        <div className="p-4 border-t border-outline-variant bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-4">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalFiltered={totalFiltered}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={vehicles.length}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            onPageChange={goToPage}
            onNextPage={nextPage}
            onPrevPage={prevPage}
          />
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
                      <div className="space-y-1 py-2 border-b border-outline-variant/10">
                          <span className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest block leading-none">CPS Autorizado</span>
                          <span className="text-sm font-black text-on-surface uppercase">{selectedVehicle.cps || 'No registrado'}</span>
                       </div>
                       <div className="space-y-1 py-2 border-b border-outline-variant/10">
                          <span className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest block leading-none">
                             {selectedVehicle.modalidad == 3 ? 'Puestos Adicionales' : 'Capacidad Total'}
                          </span>
                          <span className="text-sm font-black text-on-surface uppercase">
                             {selectedVehicle.capacidad} {selectedVehicle.modalidad == 3 ? 'puestos' : 'pasajeros'}
                          </span>
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

                <div className="space-y-8">
                  <div className="bg-surface-container-lowest p-8 rounded-[32px] border border-outline-variant/40 space-y-6 shadow-sm">
                    <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-3">
                       <span className="material-symbols-outlined text-[20px]">person</span>
                       Propiedad & Identificación
                    </h4>
                    <div className="space-y-4">
                       <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30">
                          <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest block mb-1">Propietario</span>
                          <span className="text-sm font-black text-on-surface uppercase">{selectedVehicle.propietario || 'Sin registro'}</span>
                       </div>
                       <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30">
                          <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest block mb-1">Cédula / RIF</span>
                          <span className="text-sm font-black text-on-surface uppercase">{selectedVehicle.propietario_identificacion || 'Sin registro'}</span>
                       </div>
                       <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30">
                          <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest block mb-1">Serial de Carrocería</span>
                          <span className="text-sm font-mono font-black text-on-surface uppercase">{selectedVehicle.serial_carroceria || 'Sin registro'}</span>
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
                         <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest block mb-2">Vencimiento RCV</span>
                         <span className={`text-sm font-black ${new Date(selectedVehicle.rcv_vence) < new Date() ? 'text-error animate-pulse' : 'text-on-surface'}`}>
                            {selectedVehicle.rcv_vence || 'Sin registro'}
                         </span>
                      </div>
                      <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30">
                         <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest block mb-2">Certificado de Circulación</span>
                         <span className={`text-sm font-black ${new Date(selectedVehicle.certificado_vence) < new Date() ? 'text-error animate-pulse' : 'text-on-surface'}`}>
                            {selectedVehicle.certificado_vence || 'Sin registro'}
                         </span>
                      </div>
                      {selectedVehicle.modalidad != 3 && (
                        <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30">
                           <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest block mb-2">Seguro de Casco</span>
                           <span className={`text-sm font-black ${new Date(selectedVehicle.seguro_vence) < new Date() ? 'text-error animate-pulse' : 'text-on-surface'}`}>
                              {selectedVehicle.seguro_vence || 'Sin registro'}
                           </span>
                        </div>
                      )}
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
        <form className="space-y-8 py-4">
          {error && (
            <div className="bg-error/10 border border-error/20 p-5 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
              <span className="material-symbols-outlined text-error text-[24px]">warning</span>
              <p className="text-[11px] font-black text-error uppercase tracking-widest">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Essential Identification */}
            <div className="lg:col-span-4 space-y-6">
               <div className="bg-surface-container-low p-8 rounded-[40px] border border-outline-variant/30 shadow-sm space-y-6">
                  <div className="flex flex-col items-center">
                     <div className="w-full aspect-[4/3] rounded-[32px] bg-surface-container-lowest shadow-inner overflow-hidden border-2 border-dashed border-outline-variant/50 relative group transition-all hover:border-primary/50">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary/30">
                            <span className="material-symbols-outlined text-[64px]">local_shipping</span>
                          </div>
                        )}
                        <label className="absolute inset-0 bg-primary/60 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer">
                           <div className="flex flex-col items-center gap-2 text-white">
                              <span className="material-symbols-outlined text-[32px]">add_a_photo</span>
                              <span className="text-[10px] font-black uppercase tracking-widest">Cambiar Foto</span>
                           </div>
                           <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                     </div>
                     <p className="text-[10px] font-bold text-on-surface-variant/40 mt-4 uppercase tracking-[0.2em]">Imagen Referencial de Unidad</p>
                  </div>

                  <div className="pt-4 space-y-2">
                     <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Placa de Identificación</label>
                     <input 
                       name="placa" value={formData.placa} onChange={handleInputChange} disabled={isEditing}
                       placeholder="Placa..." className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-4 px-6 text-2xl font-mono font-black text-primary outline-none focus:ring-4 focus:ring-primary/10 transition-all uppercase tracking-tighter shadow-sm disabled:opacity-50"
                       required
                     />
                  </div>
               </div>

               <div className="bg-surface-container-low p-6 rounded-[32px] border border-outline-variant/30 space-y-4">
                  <h4 className="text-[11px] font-black text-on-surface-variant uppercase tracking-[0.2em] flex items-center gap-3 ml-1">
                     <span className="material-symbols-outlined text-[20px]">tune</span>
                     Extras de Confort
                  </h4>
                  {formData.modalidad != '3' ? (
                     <div className="space-y-3">
                        <label className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 cursor-pointer hover:border-primary/30 transition-all group">
                           <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">ac_unit</span>
                              <span className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest">Aire Acondicionado</span>
                           </div>
                           <div className="relative">
                              <input type="checkbox" name="aire_acondicionado" checked={formData.aire_acondicionado} onChange={handleInputChange} className="peer hidden" />
                              <div className="w-10 h-6 bg-surface-variant rounded-full peer-checked:bg-primary transition-all"></div>
                              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:left-5"></div>
                           </div>
                        </label>
                        <label className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 cursor-pointer hover:border-primary/30 transition-all group">
                           <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">accessible</span>
                              <span className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest">Accesibilidad</span>
                           </div>
                           <div className="relative">
                              <input type="checkbox" name="accesibilidad" checked={formData.accesibilidad} onChange={handleInputChange} className="peer hidden" />
                              <div className="w-10 h-6 bg-surface-variant rounded-full peer-checked:bg-primary transition-all"></div>
                              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:left-5"></div>
                           </div>
                        </label>
                     </div>
                  ) : (
                     <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 text-[10px] font-bold text-on-surface-variant/40 uppercase italic text-center py-6">
                        No aplica para motocicletas
                     </div>
                  )}
               </div>
            </div>

            {/* Right Column: Details and Legal */}
            <div className="lg:col-span-8 space-y-6">
               {/* Card 1: Technical Specs */}
               <div className="bg-surface-container-low p-8 rounded-[40px] border border-outline-variant/30 shadow-sm">
                  <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-3 mb-8">
                     <span className="material-symbols-outlined text-[20px]">settings_suggest</span>
                     Especificaciones de la Unidad
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Marca / Fabricante</label>
                        <input name="marca" value={formData.marca} onChange={handleInputChange} placeholder="Ej: Encava" className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" required />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Modelo</label>
                        <input name="modelo" value={formData.modelo} onChange={handleInputChange} placeholder="Ej: E-NT610" className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" required />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Año</label>
                           <input type="number" name="anio" value={formData.anio} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-black outline-none focus:ring-2 focus:ring-primary/20 transition-all" required />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Color</label>
                           <input name="color" value={formData.color} onChange={handleInputChange} placeholder="Blanco" className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Transmisión</label>
                           <select name="transmision" value={formData.transmision} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-black outline-none focus:ring-2 focus:ring-primary/20 transition-all" required>
                              <option value="">Seleccione...</option>
                              {transmisiones.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                           </select>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Combustible</label>
                           <select name="combustible" value={formData.combustible} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-black outline-none focus:ring-2 focus:ring-primary/20 transition-all" required>
                              <option value="">Seleccione...</option>
                              {combustibles.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                           </select>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Card 2: Operación & Capacidad */}
               <div className="bg-surface-container-low p-8 rounded-[40px] border border-outline-variant/30 shadow-sm">
                  <h4 className="text-[11px] font-black text-secondary uppercase tracking-[0.3em] flex items-center gap-3 mb-8">
                     <span className="material-symbols-outlined text-[20px]">route</span>
                     Asignación Operativa & Capacidad
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Modalidad de Servicio</label>
                        <select name="modalidad" value={formData.modalidad} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-black outline-none focus:ring-2 focus:ring-secondary/20 transition-all" required>
                           <option value="">Seleccione...</option>
                           {modalidades.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                        </select>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Sub-Modalidad</label>
                        <select name="submodalidad" value={formData.submodalidad} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-black outline-none focus:ring-2 focus:ring-secondary/20 transition-all" required>
                           <option value="">Seleccione modalidad primero...</option>
                           {subModalidades.filter(sm => sm.modalidad == formData.modalidad).map(sm => <option key={sm.id} value={sm.id}>{sm.nombre}</option>)}
                        </select>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">CPS Autorizado</label>
                           <select name="cps" value={formData.cps} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-black outline-none focus:ring-2 focus:ring-secondary/20 transition-all" required>
                              <option value="">Seleccione...</option>
                              <option value="DT9">DT9</option>
                              <option value="DT10">DT10</option>
                           </select>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">
                              {formData.modalidad == '3' ? 'Puestos' : 'Capacidad Total'}
                           </label>
                           <input type="number" name="capacidad" value={formData.capacidad} onChange={handleInputChange} placeholder="0" className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-black outline-none focus:ring-2 focus:ring-secondary/20 transition-all" required />
                        </div>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Serial de Carrocería</label>
                        <input name="serial_carroceria" value={formData.serial_carroceria} onChange={handleInputChange} placeholder="Serial..." className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-mono font-bold outline-none focus:ring-2 focus:ring-secondary/20 transition-all" />
                     </div>
                  </div>
               </div>

               {/* Card 3: Propiedad & Documentación */}
               <div className="bg-surface-container-low p-8 rounded-[40px] border border-outline-variant/30 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                     <h4 className="text-[11px] font-black text-on-surface uppercase tracking-[0.3em] flex items-center gap-3">
                        <span className="material-symbols-outlined text-[20px]">badge</span>
                        Propiedad & Documentación Legal
                     </h4>
                     <label className="flex items-center gap-2 cursor-pointer bg-surface-container-lowest px-4 py-2 rounded-xl border border-outline-variant/30 hover:border-primary/50 transition-all group">
                        <input type="checkbox" checked={isPropietarioOperador} onChange={(e) => setIsPropietarioOperador(e.target.checked)} className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20" />
                        <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest group-hover:text-primary transition-colors">¿Es un Operador?</span>
                     </label>
                  </div>

                  <div className="space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                           {isPropietarioOperador && (
                              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                                 <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Seleccionar de Lista</label>
                                 <select name="operador_as_propietario" onChange={handleInputChange} className="w-full bg-surface-container-lowest text-on-surface border border-outline-variant rounded-2xl py-3 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                                    <option value="">Buscar operador...</option>
                                    {operadores.map(op => <option key={op.cedula} value={op.cedula} className="bg-surface-container-lowest text-on-surface">{op.cedula} - {op.nombres} {op.apellidos}</option>)}
                                 </select>
                              </div>
                           )}
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Nombre del Propietario</label>
                              <input name="propietario" value={formData.propietario} onChange={handleInputChange} placeholder="Nombre completo" className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-on-surface/20 transition-all" />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Identificación / RIF</label>
                              <input name="propietario_identificacion" value={formData.propietario_identificacion} onChange={handleInputChange} placeholder="V-00.000.000" className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-on-surface/20 transition-all" />
                           </div>
                        </div>

                        <div className="space-y-5">
                           <h5 className="text-[10px] font-black text-error uppercase tracking-[0.2em] flex items-center gap-2 mb-2 ml-1">
                              <span className="material-symbols-outlined text-[16px]">verified</span>
                              Vigencia de Documentos
                           </h5>
                           <div className="grid grid-cols-1 gap-4">
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-1">
                                    <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Vence RCV</label>
                                    <input type="date" name="rcv_vence" value={formData.rcv_vence} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-2 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-error/20 transition-all" />
                                 </div>
                                 <div className="space-y-1">
                                    <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Vence Certificado</label>
                                    <input type="date" name="certificado_vence" value={formData.certificado_vence} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-2 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-error/20 transition-all" />
                                 </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 {formData.modalidad != '3' && (
                                    <div className="space-y-1">
                                       <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Seguro Casco</label>
                                       <input type="date" name="seguro_vence" value={formData.seguro_vence} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-2 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-error/20 transition-all" />
                                    </div>
                                 )}
                                 <div className="space-y-1">
                                    <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Rev. Técnica</label>
                                    <input type="date" name="revision_tecnica_vence" value={formData.revision_tecnica_vence} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-2 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-error/20 transition-all" />
                                 </div>
                              </div>
                           </div>
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
