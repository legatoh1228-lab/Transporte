import React, { useState, useEffect } from 'react';
import api from '../services/api';

import { Modal } from '../components/common/Modal';
import { usePermissions } from '../hooks/usePermissions';

const Organizaciones = () => {
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission('Organizaciones', 'Crear');
  const canUpdate = hasPermission('Organizaciones', 'Actualizar');
  const canDelete = hasPermission('Organizaciones', 'Eliminar');

  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Catalogs
  const [tiposOrganizacion, setTiposOrganizacion] = useState([]);

  const [formData, setFormData] = useState({
    rif: '',
    razon_social: '',
    tipo: '',
    rep_legal_ci: '',
    rep_legal_nom: '',
    telefono: '',
    correo: '',
    direccion_fiscal: '',
    fecha_constitucion: '',
    esta_activa: true
  });

  const fetchCatalogs = async () => {
    try {
      const response = await api.get('catalogs/tipos-organizacion/');
      setTiposOrganizacion(response.data);
    } catch (err) {
      console.error("Error fetching org types:", err);
    }
  };

  const fetchOrgs = async () => {
    try {
      setLoading(true);
      const response = await api.get('organizations/organizations/');
      setOrganizations(response.data);
    } catch (err) {
      console.error('Error fetching organizations:', err);
      setError('No se pudo conectar con el servidor de organizaciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
    fetchCatalogs();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      rif: '',
      razon_social: '',
      tipo: '',
      rep_legal_ci: '',
      rep_legal_nom: '',
      telefono: '',
      correo: '',
      direccion_fiscal: '',
      fecha_constitucion: '',
      esta_activa: true
    });
    setIsEditing(false);
    setError(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (org) => {
    setFormData(org);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`organizations/organizations/${formData.rif}/`, formData);
      } else {
        await api.post('organizations/organizations/', formData);
      }
      setIsModalOpen(false);
      fetchOrgs();
      resetForm();
    } catch (err) {
      console.error("Error saving organization:", err);
      setError("Error al guardar la organización. Verifique los campos.");
    }
  };

  const handleDelete = async (rif) => {
    if (window.confirm(`¿Está seguro de eliminar la organización con RIF ${rif}?`)) {
      try {
        await api.delete(`organizations/organizations/${rif}/`);
        fetchOrgs();
      } catch (err) {
        console.error("Error deleting organization:", err);
        alert("No se pudo eliminar la organización.");
      }
    }
  };

  const filteredOrgs = organizations.filter(org => 
    org.rif.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.razon_social.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-public-sans">
      {/* Header Block */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant pb-4">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface">Empresas y Organizaciones</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-2xl">Administración del registro de líneas, cooperativas y empresas de transporte autorizadas en el Estado Aragua.</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col lg:flex-row gap-4 justify-between items-center shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-50 group-hover:opacity-100 transition-opacity"></div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
            <input 
              className="w-full pl-9 pr-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
              placeholder="RIF, Razón Social..." 
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
              className="bg-primary hover:bg-primary-container text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm"
            >
              <span className="material-symbols-outlined mr-2 text-[18px]">add_business</span>
              Nueva Organización
            </button>
          )}
        </div>
      </div>

      {/* Data Table Container */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-20 text-center text-on-surface-variant font-body-md animate-pulse">Cargando organizaciones autorizadas...</div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="px-6 py-4 font-label-bold text-label-bold text-on-surface-variant w-[160px]">RIF</th>
                  <th className="px-6 py-4 font-label-bold text-label-bold text-on-surface-variant">Razón Social</th>
                  <th className="px-6 py-4 font-label-bold text-label-bold text-on-surface-variant w-[180px]">Tipo</th>
                  <th className="px-6 py-4 font-label-bold text-label-bold text-on-surface-variant">Rep. Legal</th>
                  <th className="px-6 py-4 font-label-bold text-label-bold text-on-surface-variant w-[100px]">Estado</th>
                  <th className="px-6 py-4 font-label-bold text-label-bold text-on-surface-variant text-right w-[100px]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40 bg-surface-container-lowest">
                {filteredOrgs.length > 0 ? filteredOrgs.map((org, i) => (
                  <tr key={org.rif} className={`hover:bg-surface-container-low/60 transition-colors group ${i % 2 !== 0 ? 'bg-surface-container/10' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="font-title-sm text-title-sm text-primary font-bold bg-surface-container py-1 px-2 rounded border border-outline-variant/50 inline-block">{org.rif}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-body-sm text-body-sm text-on-surface font-bold">{org.razon_social}</div>
                      <div className="text-[10px] text-on-surface-variant uppercase font-medium">{org.correo || 'Sin correo'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-secondary/10 text-secondary border border-secondary/20 uppercase">
                        {org.tipo_nombre || 'No especificado'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-body-sm text-body-sm text-on-surface font-medium">{org.rep_legal_nom}</div>
                      <div className="text-[10px] text-on-surface-variant font-medium">C.I. {org.rep_legal_ci}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-sm text-[10px] font-label-bold uppercase tracking-wider border ${org.esta_activa ? 'bg-tertiary-fixed text-on-tertiary-fixed border-tertiary-fixed-dim/50' : 'bg-error-container text-on-error-container border-error/20'}`}>
                        {org.esta_activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {canUpdate && (
                          <button 
                            onClick={() => handleEdit(org)}
                            className="text-on-surface-variant hover:text-primary p-1 rounded-full hover:bg-surface-container-high transition-colors" title="Editar"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                        )}
                        {canDelete && (
                          <button 
                            onClick={() => handleDelete(org.rif)}
                            className="text-on-surface-variant hover:text-error p-1 rounded-full hover:bg-surface-container-high transition-colors" title="Eliminar"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-on-surface-variant font-body-sm">No se encontraron organizaciones registradas.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        {/* Table Footer */}
        <div className="p-4 border-t border-outline-variant bg-surface-container-low flex items-center justify-between">
          <p className="font-body-sm text-body-sm text-on-surface-variant">Mostrando <span className="font-medium text-on-surface">{filteredOrgs.length}</span> organizaciones</p>
        </div>
      </div>

      {/* Registration/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? "Editar Organización" : "Nueva Organización"}
        subtitle={isEditing ? `Modificando registro de ${formData.rif}` : "Ingrese los datos legales de la nueva entidad de transporte"}
        icon="business"
        maxWidthClass="max-w-4xl"
        actions={
          <>
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-on-surface hover:bg-surface-variant rounded-lg transition-colors">Cancelar</button>
            <button onClick={handleSubmit} className="px-6 py-2 text-sm font-bold text-on-primary bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-all">
              {isEditing ? "Actualizar" : "Registrar Empresa"}
            </button>
          </>
        }
      >
        <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant ml-1">RIF</label>
            <input 
              name="rif" value={formData.rif} onChange={handleInputChange} disabled={isEditing}
              placeholder="Ej: J-12345678-9" className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm focus:border-primary outline-none"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-bold text-on-surface-variant ml-1">Razón Social</label>
            <input 
              name="razon_social" value={formData.razon_social} onChange={handleInputChange}
              placeholder="Nombre legal de la empresa o cooperativa" className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm focus:border-primary outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant ml-1">Tipo de Organización</label>
            <select 
              name="tipo" value={formData.tipo} onChange={handleInputChange}
              className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm focus:border-primary outline-none"
            >
              <option value="">Seleccione...</option>
              {tiposOrganizacion.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant ml-1">Cédula Rep. Legal</label>
            <input 
              name="rep_legal_ci" value={formData.rep_legal_ci} onChange={handleInputChange}
              placeholder="Cédula" className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm focus:border-primary outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant ml-1">Nombre Rep. Legal</label>
            <input 
              name="rep_legal_nom" value={formData.rep_legal_nom} onChange={handleInputChange}
              placeholder="Nombre Completo" className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm focus:border-primary outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant ml-1">Teléfono de Contacto</label>
            <input 
              name="telefono" value={formData.telefono} onChange={handleInputChange}
              placeholder="Ej: 0243-1234567" className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm focus:border-primary outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant ml-1">Correo Electrónico</label>
            <input 
              name="correo" value={formData.correo} onChange={handleInputChange}
              placeholder="email@ejemplo.com" className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm focus:border-primary outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant ml-1">Fecha Constitución</label>
            <input 
              type="date" name="fecha_constitucion" value={formData.fecha_constitucion} onChange={handleInputChange}
              className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm focus:border-primary outline-none"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-bold text-on-surface-variant ml-1">Dirección Fiscal</label>
            <textarea 
              name="direccion_fiscal" value={formData.direccion_fiscal} onChange={handleInputChange}
              rows="2" className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm focus:border-primary outline-none resize-none"
            ></textarea>
          </div>
          <div className="flex items-center gap-2 pt-4 ml-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="esta_activa" checked={formData.esta_activa} onChange={handleInputChange} className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary" />
              <span className="text-xs font-bold text-on-surface-variant">Organización Activa</span>
            </label>
          </div>
          {error && <div className="md:col-span-2 lg:col-span-3 text-error text-xs font-bold bg-error-container/10 p-2 rounded border border-error/20">{error}</div>}
        </form>
      </Modal>
    </div>
  );
};

export default Organizaciones;
