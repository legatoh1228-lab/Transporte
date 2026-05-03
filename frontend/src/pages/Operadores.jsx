import React, { useState, useEffect } from 'react';
import { Modal } from '../components/common/Modal';
import api from '../services/api';

export default function Operadores() {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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
    tipo_sangre: ''
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
      tipo_sangre: ''
    });
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
      numero_telefono
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Format data before sending
    const payload = { ...formData };
    
    // Reconstruct cedula and telefono
    payload.cedula = `${payload.tipo_identificacion}-${payload.numero_cedula}`;
    if (payload.numero_telefono) {
      payload.telefono = `${payload.prefijo_telefono}-${payload.numero_telefono}`;
    } else {
      payload.telefono = null;
    }

    if (!payload.fecha_nacimiento) payload.fecha_nacimiento = null;
    if (!payload.certificado_medico_vence) payload.certificado_medico_vence = null;
    if (!payload.vence_lic) payload.vence_lic = null;

    try {
      if (isEditing) {
        await api.put(`personnel/operators/${payload.cedula}/`, payload);
      } else {
        await api.post('personnel/operators/', payload);
      }
      setIsModalOpen(false);
      fetchOperators();
      resetForm();
    } catch (err) {
      console.error("Error saving operator:", err);
      if (err.response && err.response.data) {
        const errorMsgs = Object.entries(err.response.data)
          .map(([key, msgs]) => `${key}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(" | ");
        setError(`Error: ${errorMsgs}`);
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
    <div className="flex flex-col gap-6 font-public-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Registro de Operadores</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">Administración y control del personal de transporte del Estado Aragua</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center shadow-md hover:shadow-lg active:scale-95"
        >
          <span className="material-symbols-outlined mr-2 text-[18px]">person_add</span>
          Nuevo Operador
        </button>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-outline-variant bg-surface-container-low flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
            <input 
              type="text" 
              placeholder="Buscar por cédula o nombre..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary rounded-lg py-2 pl-9 pr-4 text-sm outline-none transition-all focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center text-on-surface-variant animate-pulse font-medium">Cargando personal...</div>
          ) : (
            <table className="w-full text-left text-sm text-on-surface">
              <thead className="bg-surface-container-high text-[11px] uppercase text-on-surface-variant font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Cédula</th>
                  <th className="px-6 py-4">Operador</th>
                  <th className="px-6 py-4">Grado Lic.</th>
                  <th className="px-6 py-4 whitespace-nowrap">Vencimiento Lic.</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {filteredOperators.length > 0 ? filteredOperators.map((row) => (
                  <tr key={row.cedula} className="hover:bg-surface-container-low/60 transition-colors group">
                    <td className="px-6 py-4 font-bold whitespace-nowrap text-primary">{row.cedula}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-on-surface">{row.nombres} {row.apellidos}</div>
                      <div className="text-[11px] text-on-surface-variant uppercase font-medium">{row.codigo_op}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-secondary/10 text-secondary border border-secondary/20 uppercase">
                        Grado {row.licencia_grado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{row.vence_lic}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(row)}
                          className="text-on-surface-variant hover:text-primary p-2 rounded-lg hover:bg-primary/10 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(row.cedula)}
                          className="text-on-surface-variant hover:text-error p-2 rounded-lg hover:bg-error/10 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-on-surface-variant font-medium">No se encontraron operadores.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Registration/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? "Editar Operador" : "Nuevo Operador"}
        subtitle={isEditing ? `Modificando registro de ${formData.cedula}` : "Ingrese los datos del nuevo personal"}
        icon="person_add"
        actions={
          <>
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-on-surface hover:bg-surface-variant rounded-lg transition-colors">Cancelar</button>
            <button onClick={handleSubmit} className="px-6 py-2 text-sm font-bold text-on-primary bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-all">
              {isEditing ? "Actualizar" : "Registrar"}
            </button>
          </>
        }
      >
        <form className="flex flex-col gap-6">
          {error && (
            <div className="text-error text-sm font-bold bg-error-container/10 p-3 rounded-lg border border-error/20 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          {/* Datos Personales */}
          <div>
            <h3 className="text-sm font-bold text-primary mb-3 flex items-center gap-2 border-b border-outline-variant pb-2">
              <span className="material-symbols-outlined text-[18px]">person</span>
              Datos Personales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant ml-1">Documento de Identidad <span className="text-error">*</span></label>
                <div className="flex">
                  <select 
                    name="tipo_identificacion" value={formData.tipo_identificacion || 'V'} onChange={handleInputChange} disabled={isEditing}
                    className="bg-surface-container border border-r-0 border-outline-variant rounded-l-lg py-2.5 px-3 text-sm focus:border-primary outline-none transition-colors w-[70px] text-center font-bold text-on-surface"
                  >
                    <option value="V">V</option>
                    <option value="E">E</option>
                    <option value="J">J</option>
                    <option value="G">G</option>
                    <option value="P">P</option>
                  </select>
                  <input 
                    name="numero_cedula" value={formData.numero_cedula || ''} onChange={handleInputChange} disabled={isEditing}
                    placeholder="12345678" className="w-full bg-surface-container border border-outline-variant rounded-r-lg py-2.5 px-3 text-sm focus:border-primary outline-none transition-colors"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant ml-1">Código Operador <span className="text-error">*</span></label>
                <input 
                  name="codigo_op" value={formData.codigo_op || ''} onChange={handleInputChange}
                  placeholder="Ej: OP-001" className="w-full bg-surface-container border border-outline-variant rounded-lg py-2.5 px-3 text-sm focus:border-primary outline-none transition-colors"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant ml-1">Nombres <span className="text-error">*</span></label>
                <input 
                  name="nombres" value={formData.nombres || ''} onChange={handleInputChange}
                  placeholder="Ej: Juan Carlos" className="w-full bg-surface-container border border-outline-variant rounded-lg py-2.5 px-3 text-sm focus:border-primary outline-none transition-colors"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant ml-1">Apellidos <span className="text-error">*</span></label>
                <input 
                  name="apellidos" value={formData.apellidos || ''} onChange={handleInputChange}
                  placeholder="Ej: Pérez Gómez" className="w-full bg-surface-container border border-outline-variant rounded-lg py-2.5 px-3 text-sm focus:border-primary outline-none transition-colors"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant ml-1">Fecha de Nacimiento</label>
                <input 
                  type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento || ''} onChange={handleInputChange}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg py-2.5 px-3 text-sm focus:border-primary outline-none transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant ml-1">Tipo de Sangre</label>
                <select 
                  name="tipo_sangre" value={formData.tipo_sangre || ''} onChange={handleInputChange}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg py-2.5 px-3 text-sm focus:border-primary outline-none transition-colors"
                >
                  <option value="">Seleccione...</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
          </div>

          {/* Datos de Contacto */}
          <div>
            <h3 className="text-sm font-bold text-primary mb-3 flex items-center gap-2 border-b border-outline-variant pb-2">
              <span className="material-symbols-outlined text-[18px]">contact_phone</span>
              Datos de Contacto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant ml-1">Teléfono Móvil</label>
                <div className="flex">
                  <select 
                    name="prefijo_telefono" value={formData.prefijo_telefono || '0414'} onChange={handleInputChange}
                    className="bg-surface-container border border-r-0 border-outline-variant rounded-l-lg py-2.5 px-2 text-sm focus:border-primary outline-none transition-colors w-[85px] font-bold text-on-surface"
                  >
                    <optgroup label="Movistar">
                      <option value="0414">0414</option>
                      <option value="0424">0424</option>
                    </optgroup>
                    <optgroup label="Digitel">
                      <option value="0412">0412</option>
                      <option value="0422">0422</option>
                    </optgroup>
                    <optgroup label="Movilnet">
                      <option value="0416">0416</option>
                      <option value="0426">0426</option>
                    </optgroup>
                    <optgroup label="Fijo">
                      <option value="0212">0212</option>
                      <option value="0243">0243</option>
                    </optgroup>
                  </select>
                  <input 
                    name="numero_telefono" value={formData.numero_telefono || ''} onChange={handleInputChange}
                    placeholder="1234567" className="w-full bg-surface-container border border-outline-variant rounded-r-lg py-2.5 px-3 text-sm focus:border-primary outline-none transition-colors tracking-wide"
                    maxLength={7}
                  />
                </div>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-on-surface-variant ml-1">Dirección</label>
                <textarea 
                  name="direccion" value={formData.direccion || ''} onChange={handleInputChange} rows="2"
                  placeholder="Dirección de habitación..." className="w-full bg-surface-container border border-outline-variant rounded-lg py-2.5 px-3 text-sm focus:border-primary outline-none transition-colors resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Credenciales y Licencia */}
          <div>
            <h3 className="text-sm font-bold text-primary mb-3 flex items-center gap-2 border-b border-outline-variant pb-2">
              <span className="material-symbols-outlined text-[18px]">id_card</span>
              Credenciales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant ml-1">Grado de Licencia</label>
                <select 
                  name="licencia_grado" value={formData.licencia_grado || 5} onChange={handleInputChange}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg py-2.5 px-3 text-sm focus:border-primary outline-none transition-colors"
                >
                  <option value={2}>2do Grado</option>
                  <option value={3}>3er Grado</option>
                  <option value={4}>4to Grado</option>
                  <option value={5}>5to Grado</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant ml-1">Vencimiento de Licencia <span className="text-error">*</span></label>
                <input 
                  type="date" name="vence_lic" value={formData.vence_lic || ''} onChange={handleInputChange}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg py-2.5 px-3 text-sm focus:border-primary outline-none transition-colors"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant ml-1">Vencimiento Certificado Médico</label>
                <input 
                  type="date" name="certificado_medico_vence" value={formData.certificado_medico_vence || ''} onChange={handleInputChange}
                  className="w-full bg-surface-container border border-outline-variant rounded-lg py-2.5 px-3 text-sm focus:border-primary outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
