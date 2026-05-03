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
    codigo_op: '',
    nombres: '',
    apellidos: '',
    telefono: '',
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
      codigo_op: '',
      nombres: '',
      apellidos: '',
      telefono: '',
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
    setFormData(operator);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`personnel/operators/${formData.cedula}/`, formData);
      } else {
        await api.post('personnel/operators/', formData);
      }
      setIsModalOpen(false);
      fetchOperators();
      resetForm();
    } catch (err) {
      console.error("Error saving operator:", err);
      setError("Error al guardar los datos. Verifique los campos.");
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
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1 md:col-span-1">
            <label className="text-xs font-bold text-on-surface-variant ml-1">Cédula</label>
            <input 
              name="cedula" value={formData.cedula} onChange={handleInputChange} disabled={isEditing}
              placeholder="Ej: V-12345678" className="w-full bg-surface-container border border-outline-variant rounded-lg py-2.5 px-3 text-sm focus:border-primary outline-none"
            />
          </div>
          <div className="space-y-1 md:col-span-1">
            <label className="text-xs font-bold text-on-surface-variant ml-1">Código Operador</label>
            <input 
              name="codigo_op" value={formData.codigo_op} onChange={handleInputChange}
              placeholder="Ej: OP-001" className="w-full bg-surface-container border border-outline-variant rounded-lg py-2.5 px-3 text-sm focus:border-primary outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant ml-1">Nombres</label>
            <input 
              name="nombres" value={formData.nombres} onChange={handleInputChange}
              placeholder="Nombres" className="w-full bg-surface-container border border-outline-variant rounded-lg py-2.5 px-3 text-sm focus:border-primary outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant ml-1">Apellidos</label>
            <input 
              name="apellidos" value={formData.apellidos} onChange={handleInputChange}
              placeholder="Apellidos" className="w-full bg-surface-container border border-outline-variant rounded-lg py-2.5 px-3 text-sm focus:border-primary outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant ml-1">Grado Licencia</label>
            <select 
              name="licencia_grado" value={formData.licencia_grado} onChange={handleInputChange}
              className="w-full bg-surface-container border border-outline-variant rounded-lg py-2.5 px-3 text-sm focus:border-primary outline-none"
            >
              <option value={2}>2do Grado</option>
              <option value={3}>3er Grado</option>
              <option value={4}>4to Grado</option>
              <option value={5}>5to Grado</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant ml-1">Vencimiento Licencia</label>
            <input 
              type="date" name="vence_lic" value={formData.vence_lic} onChange={handleInputChange}
              className="w-full bg-surface-container border border-outline-variant rounded-lg py-2.5 px-3 text-sm focus:border-primary outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant ml-1">Vence Certificado Médico</label>
            <input 
              type="date" name="certificado_medico_vence" value={formData.certificado_medico_vence} onChange={handleInputChange}
              className="w-full bg-surface-container border border-outline-variant rounded-lg py-2.5 px-3 text-sm focus:border-primary outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant ml-1">Teléfono</label>
            <input 
              name="telefono" value={formData.telefono} onChange={handleInputChange}
              placeholder="Ej: 0412-1234567" className="w-full bg-surface-container border border-outline-variant rounded-lg py-2.5 px-3 text-sm focus:border-primary outline-none"
            />
          </div>
          {error && <div className="md:col-span-2 text-error text-xs font-bold bg-error-container/10 p-2 rounded border border-error/20">{error}</div>}
        </form>
      </Modal>
    </div>
  );
}
