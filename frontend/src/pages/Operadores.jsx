import React, { useState, useEffect } from 'react';
import { Modal } from '../components/common/Modal';
import api from '../services/api';
import { usePermissions } from '../hooks/usePermissions';

export default function Operadores() {
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission('Operadores', 'Crear');
  const canUpdate = hasPermission('Operadores', 'Actualizar');
  const canDelete = hasPermission('Operadores', 'Eliminar');

  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    cedula: '',
    tipo_identificacion: 'V',
    numero_cedula: '',
    codigo_op: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    prefijo_telefono: '0414',
    numero_telefono: '',
    direccion: '',
    fecha_nacimiento: '',
    licencia_grado: 5,
    vence_lic: '',
    certificado_medico_vence: '',
    tipo_sangre: '',
    foto: null
  });

  const fetchOperators = async () => {
    try {
      setLoading(true);
      const response = await api.get('personnel/operators/');
      setOperators(response.data);
    } catch (err) {
      console.error("Error fetching operators:", err);
      setError("Error al cargar operadores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperators();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, foto: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      cedula: '',
      tipo_identificacion: 'V',
      numero_cedula: '',
      codigo_op: '',
      nombres: '',
      apellidos: '',
      telefono: '',
      prefijo_telefono: '0414',
      numero_telefono: '',
      direccion: '',
      fecha_nacimiento: '',
      licencia_grado: 5,
      vence_lic: '',
      certificado_medico_vence: '',
      tipo_sangre: '',
      foto: null
    });
    setImagePreview(null);
    setIsEditing(false);
    setError(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (operator) => {
    let tipo_identificacion = 'V';
    let numero_cedula = operator.cedula;
    if (operator.cedula && operator.cedula.includes('-')) {
      [tipo_identificacion, numero_cedula] = operator.cedula.split('-');
    } else if (operator.cedula && /^[A-Z]/i.test(operator.cedula[0])) {
      tipo_identificacion = operator.cedula[0].toUpperCase();
      numero_cedula = operator.cedula.substring(1).replace(/^-/, '');
    }

    let prefijo_telefono = '0414';
    let numero_telefono = operator.telefono || '';
    if (operator.telefono && operator.telefono.includes('-')) {
      [prefijo_telefono, numero_telefono] = operator.telefono.split('-');
    } else if (operator.telefono && operator.telefono.length > 4) {
      prefijo_telefono = operator.telefono.substring(0, 4);
      numero_telefono = operator.telefono.substring(4);
    }

    setFormData({
      ...operator,
      tipo_identificacion,
      numero_cedula,
      prefijo_telefono,
      numero_telefono,
      foto: null // Don't reset to operator.foto as it's a URL string
    });
    setImagePreview(operator.foto);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleViewDetail = (operator) => {
    setSelectedOperator(operator);
    setIsDetailOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    
    // Reconstruct values
    const fullCedula = `${formData.tipo_identificacion}-${formData.numero_cedula}`;
    const fullTelefono = formData.numero_telefono ? `${formData.prefijo_telefono}-${formData.numero_telefono}` : '';

    // Append fields
    Object.keys(formData).forEach(key => {
      if (key === 'foto') {
        if (formData.foto instanceof File) {
          data.append('foto', formData.foto);
        }
      } else if (['tipo_identificacion', 'numero_cedula', 'prefijo_telefono', 'numero_telefono', 'cedula', 'telefono'].includes(key)) {
        // Skip these as we handle them manually
      } else if (formData[key] !== null && formData[key] !== undefined) {
        data.append(key, formData[key]);
      }
    });

    data.append('cedula', fullCedula);
    if (fullTelefono) data.append('telefono', fullTelefono);

    // Ensure dates are null if empty
    if (!formData.fecha_nacimiento) data.delete('fecha_nacimiento');
    if (!formData.vence_lic) data.delete('vence_lic');
    if (!formData.certificado_medico_vence) data.delete('certificado_medico_vence');

    try {
      if (isEditing) {
        await api.put(`personnel/operators/${fullCedula}/`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('personnel/operators/', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setIsModalOpen(false);
      fetchOperators();
      resetForm();
    } catch (err) {
      console.error("Error saving operator:", err);
      if (err.response && err.response.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError("Error al guardar los datos. Verifique los campos.");
      }
    }
  };

  const handleDelete = async (cedula) => {
    if (window.confirm("¿Está seguro de eliminar este operador?")) {
      try {
        await api.delete(`personnel/operators/${cedula}/`);
        fetchOperators();
      } catch (err) {
        console.error("Error deleting operator:", err);
        alert("No se pudo eliminar el operador.");
      }
    }
  };

  const filteredOperators = operators.filter(op => 
    op.cedula.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${op.nombres} ${op.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 font-public-sans pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight">Personal Operador</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">Gestión integral de conductores y personal técnico</p>
        </div>
        {canCreate && (
          <button 
            onClick={handleOpenCreate}
            className="bg-primary text-on-primary px-6 py-3 rounded-2xl text-sm font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            Añadir Operador
          </button>
        )}
      </div>

      {/* Main Content Card */}
      <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded-[32px] overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-6 border-b border-outline-variant/50 bg-surface-container-low/30 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50">search</span>
            <input 
              type="text" 
              placeholder="Buscar por cédula, nombre o código..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Operators Grid/Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center flex flex-col items-center gap-4">
               <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
               <p className="text-on-surface-variant font-bold animate-pulse">Sincronizando base de datos...</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-on-surface border-collapse">
              <thead className="bg-surface-container-high/50 text-[11px] uppercase text-on-surface-variant font-black tracking-widest border-b border-outline-variant">
                <tr>
                  <th className="px-8 py-5">Perfil</th>
                  <th className="px-6 py-5">Identificación</th>
                  <th className="px-6 py-5">Grado / Estado</th>
                  <th className="px-6 py-5">Vencimiento Lic.</th>
                  <th className="px-6 py-5 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {filteredOperators.length > 0 ? filteredOperators.map((row) => (
                  <tr key={row.cedula} className="hover:bg-primary/[0.02] transition-colors group">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-surface-container-high flex-shrink-0 overflow-hidden border border-outline-variant/50 group-hover:scale-105 transition-transform">
                            {row.foto ? (
                              <img src={row.foto} alt={row.nombres} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
                                <span className="material-symbols-outlined text-[24px]">person</span>
                              </div>
                            )}
                         </div>
                         <div>
                            <div className="font-black text-on-surface text-[15px]">{row.nombres} {row.apellidos}</div>
                            <div className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider opacity-60">{row.codigo_op}</div>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-black text-primary font-mono tracking-tighter text-lg">{row.cedula}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="inline-flex items-center w-fit px-2.5 py-1 rounded-lg text-[10px] font-black bg-secondary-container text-on-secondary-container uppercase tracking-tighter">
                          Grado {row.licencia_grado}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">calendar_today</span>
                          <span className="font-bold text-on-surface-variant">{row.vence_lic}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleViewDetail(row)}
                            className="w-10 h-10 rounded-xl text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-all flex items-center justify-center"
                            title="Ver Ficha Detallada"
                          >
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </button>
                          {canUpdate && (
                            <button 
                              onClick={() => handleEdit(row)}
                              className="w-10 h-10 rounded-xl text-on-surface-variant hover:text-secondary hover:bg-secondary/10 transition-all flex items-center justify-center"
                              title="Editar Registro"
                            >
                              <span className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                          )}
                          {canDelete && (
                            <button 
                              onClick={() => handleDelete(row.cedula)}
                              className="w-10 h-10 rounded-xl text-on-surface-variant hover:text-error hover:bg-error/10 transition-all flex items-center justify-center"
                              title="Eliminar"
                            >
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                          )}
                        </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                       <div className="flex flex-col items-center opacity-30">
                          <span className="material-symbols-outlined text-[48px] mb-2">person_off</span>
                          <p className="font-black">No se encontraron registros</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail Modal (Ficha de Operador) */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Ficha del Operador"
        icon="badge"
        maxWidthClass="max-w-5xl"
        actions={
          <button onClick={() => setIsDetailOpen(false)} className="bg-surface-container-highest px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all shadow-sm">Cerrar Expediente</button>
        }
      >
        {selectedOperator && (
          <div className="space-y-10 font-public-sans py-2">
             {/* Header Section */}
             <div className="flex flex-col md:flex-row items-center gap-10 bg-surface-container-low p-10 rounded-[40px] border border-outline-variant/30 shadow-inner">
                <div className="w-40 h-40 rounded-[48px] bg-white shadow-2xl overflow-hidden border-4 border-white flex-shrink-0 relative group">
                    {selectedOperator.foto ? (
                      <img src={selectedOperator.foto} alt="Perfil" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
                        <span className="material-symbols-outlined text-[72px]">person</span>
                      </div>
                    )}
                </div>
                <div className="text-center md:text-left space-y-3 flex-1">
                   <div className="inline-flex px-4 py-1.5 bg-primary/10 text-primary text-[11px] font-black uppercase tracking-[0.2em] rounded-full mb-2">
                      ID Sistema: {selectedOperator.codigo_op}
                   </div>
                   <h2 className="text-4xl font-black text-on-surface tracking-tighter leading-tight">
                      {selectedOperator.nombres} {selectedOperator.apellidos}
                   </h2>
                   <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-3">
                      <div className="flex items-center gap-3 text-on-surface-variant font-bold text-sm bg-surface-container-highest/30 px-4 py-2 rounded-xl border border-outline-variant/20">
                         <span className="material-symbols-outlined text-[20px] text-primary">fingerprint</span>
                         {selectedOperator.cedula}
                      </div>
                      <div className="flex items-center gap-3 text-on-surface-variant font-bold text-sm bg-surface-container-highest/30 px-4 py-2 rounded-xl border border-outline-variant/20">
                         <span className="material-symbols-outlined text-[20px] text-primary">call</span>
                         {selectedOperator.telefono || 'Sin Teléfono'}
                      </div>
                   </div>
                </div>
             </div>

             {/* Grid Details */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-surface-container-lowest p-8 rounded-[32px] border border-outline-variant/40 space-y-6 shadow-sm">
                   <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px]">id_card</span>
                      Credenciales de Conducción
                   </h4>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-outline-variant/10">
                         <span className="text-sm font-semibold text-on-surface-variant">Grado de Licencia</span>
                         <span className="px-3 py-1 bg-secondary-container text-on-secondary-container font-black rounded-lg text-xs uppercase">Grado {selectedOperator.licencia_grado}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-outline-variant/10">
                         <span className="text-sm font-semibold text-on-surface-variant">Vencimiento Licencia</span>
                         <span className={`font-black ${new Date(selectedOperator.vence_lic) < new Date() ? 'text-error animate-pulse' : 'text-on-surface'}`}>
                           {selectedOperator.vence_lic}
                         </span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                         <span className="text-sm font-semibold text-on-surface-variant">Certificado Médico</span>
                         <span className="font-black text-on-surface">{selectedOperator.certificado_medico_vence || 'N/A'}</span>
                      </div>
                   </div>
                </div>

                <div className="bg-surface-container-lowest p-8 rounded-[32px] border border-outline-variant/40 space-y-6 shadow-sm">
                   <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px]">medical_services</span>
                      Información Sanitaria & Ubicación
                   </h4>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-outline-variant/10">
                         <span className="text-sm font-semibold text-on-surface-variant">Grupo Sanguíneo</span>
                         <span className="px-3 py-1 bg-error/10 text-error font-black rounded-lg">{selectedOperator.tipo_sangre || 'No especificado'}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-outline-variant/10">
                         <span className="text-sm font-semibold text-on-surface-variant">Fecha de Nacimiento</span>
                         <span className="font-black text-on-surface">{selectedOperator.fecha_nacimiento || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col gap-2 py-3">
                         <span className="text-sm font-semibold text-on-surface-variant">Domicilio de Habitación</span>
                         <span className="text-sm font-bold text-on-surface/80 leading-relaxed italic border-l-4 border-primary/20 pl-4 py-1">
                           {selectedOperator.direccion || 'Sin dirección registrada'}
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
        title={isEditing ? "Modificar Operador" : "Registrar Nuevo Operador"}
        icon={isEditing ? "edit_square" : "person_add"}
        maxWidthClass="max-w-5xl"
        actions={
          <div className="flex gap-4 w-full justify-end">
            <button onClick={() => setIsModalOpen(false)} className="px-8 py-3 text-sm font-black text-on-surface-variant hover:bg-surface-container-highest rounded-2xl transition-all uppercase tracking-widest">Cancelar</button>
            <button onClick={handleSubmit} className="px-10 py-3 text-sm font-black text-on-primary bg-primary hover:bg-primary/90 rounded-2xl shadow-xl shadow-primary/20 transition-all uppercase tracking-widest active:scale-95">
              {isEditing ? "Guardar Cambios" : "Finalizar Registro"}
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
            {/* Left Column: Photo and Personal Data */}
            <div className="lg:col-span-4 space-y-6">
               {/* Photo Card */}
               <div className="bg-surface-container-low p-8 rounded-[40px] border border-outline-variant/30 shadow-sm space-y-6">
                  <div className="flex flex-col items-center">
                     <div className="w-36 h-36 rounded-[48px] bg-surface-container-lowest shadow-inner overflow-hidden border-2 border-dashed border-outline-variant/50 relative group transition-all hover:border-primary/50">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary/30">
                            <span className="material-symbols-outlined text-[64px]">add_a_photo</span>
                          </div>
                        )}
                        <label className="absolute inset-0 bg-primary/60 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer">
                           <div className="flex flex-col items-center gap-2 text-white">
                              <span className="material-symbols-outlined text-[32px]">upload</span>
                              <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">Cambiar<br/>Foto</span>
                           </div>
                           <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                     </div>
                     <p className="text-[10px] font-bold text-on-surface-variant/40 mt-4 uppercase tracking-[0.2em] text-center">Formato Cuadrado<br/>JPG/PNG</p>
                  </div>
               </div>

               {/* Health Profile Card */}
               <div className="bg-surface-container-low p-6 rounded-[32px] border border-outline-variant/30 space-y-4">
                  <h4 className="text-[11px] font-black text-on-surface-variant uppercase tracking-[0.2em] flex items-center gap-3 ml-1">
                    <span className="material-symbols-outlined text-[20px]">medical_services</span>
                    Perfil de Salud
                  </h4>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Fecha Nacimiento</label>
                      <input 
                        type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento || ''} onChange={handleInputChange}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Tipo de Sangre</label>
                      <select 
                        name="tipo_sangre" value={formData.tipo_sangre || ''} onChange={handleInputChange}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-4 text-sm font-black outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      >
                        <option value="">No Específicado...</option>
                        <option value="A+">A+</option>
                        <option value="O+">O+</option>
                        <option value="B+">B+</option>
                        <option value="AB+">AB+</option>
                        <option value="A-">A-</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>
               </div>
            </div>

            {/* Right Column: Identity, License and Contact */}
            <div className="lg:col-span-8 space-y-6">
              {/* Card 1: Identity */}
              <div className="bg-surface-container-low p-8 rounded-[40px] border border-outline-variant/30 shadow-sm">
                 <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-3 mb-8">
                    <span className="material-symbols-outlined text-[20px]">fingerprint</span>
                    Credenciales de Identidad
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Documento de Identidad</label>
                     <div className="flex shadow-sm rounded-2xl overflow-hidden border border-outline-variant focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                       <select 
                         name="tipo_identificacion" value={formData.tipo_identificacion || 'V'} onChange={handleInputChange} disabled={isEditing}
                         className="bg-surface-container-high border-r border-outline-variant py-3.5 px-5 text-sm font-black outline-none w-[90px]"
                       >
                         <option value="V">V-</option>
                         <option value="E">E-</option>
                         <option value="P">P-</option>
                       </select>
                       <input 
                         name="numero_cedula" value={formData.numero_cedula || ''} onChange={handleInputChange} disabled={isEditing}
                         placeholder="00000000" className="w-full bg-surface-container-lowest py-3.5 px-5 text-sm font-bold outline-none uppercase tracking-widest"
                         required
                       />
                     </div>
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Código Operador</label>
                     <input 
                       name="codigo_op" value={formData.codigo_op || ''} onChange={handleInputChange}
                       placeholder="Ej: OP-772" className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase tracking-widest"
                       required
                     />
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Nombres</label>
                     <input 
                       name="nombres" value={formData.nombres || ''} onChange={handleInputChange}
                       placeholder="Nombres completos..." className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                       required
                     />
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Apellidos</label>
                     <input 
                       name="apellidos" value={formData.apellidos || ''} onChange={handleInputChange}
                       placeholder="Apellidos completos..." className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                       required
                     />
                   </div>
                 </div>
              </div>

              {/* Card 2: License Data */}
              <div className="bg-surface-container-low p-8 rounded-[40px] border border-outline-variant/30 shadow-sm">
                 <h4 className="text-[11px] font-black text-secondary uppercase tracking-[0.3em] flex items-center gap-3 mb-8">
                    <span className="material-symbols-outlined text-[20px]">id_card</span>
                    Licencia e Instrucción Vial
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-6">
                   <div className="space-y-1.5 md:col-span-1">
                     <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Grado Licencia</label>
                     <select 
                       name="licencia_grado" value={formData.licencia_grado || 5} onChange={handleInputChange}
                       className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-black outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                     >
                       <option value={2}>Grado 2 (Moto)</option>
                       <option value={3}>Grado 3 (Vehículos)</option>
                       <option value={4}>Grado 4 (Público)</option>
                       <option value={5}>Grado 5 (Carga pesada)</option>
                     </select>
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Vence Licencia</label>
                     <input 
                       type="date" name="vence_lic" value={formData.vence_lic || ''} onChange={handleInputChange}
                       className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                       required
                     />
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Certificado Médico</label>
                     <input 
                       type="date" name="certificado_medico_vence" value={formData.certificado_medico_vence || ''} onChange={handleInputChange}
                       className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                     />
                   </div>
                 </div>
              </div>

              {/* Card 3: Contact Data */}
              <div className="bg-surface-container-low p-8 rounded-[40px] border border-outline-variant/30 shadow-sm">
                 <h4 className="text-[11px] font-black text-on-surface uppercase tracking-[0.3em] flex items-center gap-3 mb-8">
                    <span className="material-symbols-outlined text-[20px]">contact_phone</span>
                    Ubicación y Contacto
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-6">
                   <div className="md:col-span-4 space-y-1.5">
                     <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Teléfono Móvil</label>
                     <div className="flex shadow-sm rounded-2xl overflow-hidden border border-outline-variant focus-within:ring-2 focus-within:ring-on-surface/20 transition-all">
                       <select 
                         name="prefijo_telefono" value={formData.prefijo_telefono || '0414'} onChange={handleInputChange}
                         className="bg-surface-container-high border-r border-outline-variant py-3.5 px-4 text-sm font-black outline-none w-[90px]"
                       >
                         <option value="0414">0414</option>
                         <option value="0424">0424</option>
                         <option value="0412">0412</option>
                         <option value="0416">0416</option>
                       </select>
                       <input 
                         name="numero_telefono" value={formData.numero_telefono || ''} onChange={handleInputChange}
                         placeholder="0000000" className="w-full bg-surface-container-lowest py-3.5 px-4 text-sm font-bold outline-none tracking-widest"
                         maxLength={7}
                       />
                     </div>
                   </div>
                   <div className="md:col-span-8 space-y-1.5">
                     <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Dirección Domiciliaria</label>
                     <input 
                       name="direccion" value={formData.direccion || ''} onChange={handleInputChange}
                       placeholder="Estado, Municipio, Parroquia, Sector..." className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-on-surface/20 transition-all"
                     />
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
