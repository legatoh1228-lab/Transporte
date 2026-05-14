import React, { useState, useEffect } from 'react';
import api from '../services/api';

import { Modal } from '../components/common/Modal';
import { usePermissions } from '../hooks/usePermissions';
import { usePagination } from '../hooks/usePagination';
import { PaginationControls } from '../components/common/PaginationControls';

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
  const [importResult, setImportResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ municipio: '', tipo: '', gremio: '' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, rif: null, razon_social: '' });
  const [viewModal, setViewModal] = useState({ isOpen: false, data: null });

  const [activeTab, setActiveTab] = useState('datos');
  const [tiposOrganizacion, setTiposOrganizacion] = useState([]);
  const [gremios, setGremios] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [rutasCatalog, setRutasCatalog] = useState([]);

  const [formData, setFormData] = useState({
    rif: '',
    razon_social: '',
    municipio: '',
    tipo: '',
    gremio: '',
    rep_legal_ci: '',
    rep_legal_nom: '',
    telefono: '',
    correo: '',
    direccion_fiscal: '',
    fecha_constitucion_mercantil: '',
    cupo_unidades: 0,
    cupo_maximo_unidades: 0,
    conteo_minibus: 0,
    conteo_bus: 0,
    conteo_otro: 0,
    rutas_urbanas: 0,
    rutas_suburbanas: 0,
    modalidad_cps: '',
    esta_activa: true,
    rutas: []
  });

  const fetchCatalogs = async () => {
    try {
      const [responseTipos, responseGremios, responseRutas, responseMunicipios] = await Promise.all([
        api.get('catalogs/tipos-organizacion/'),
        api.get('organizations/gremios/'),
        api.get('routes/rutas/'),
        api.get('catalogs/municipios/')
      ]);
      setTiposOrganizacion(responseTipos.data);
      setGremios(responseGremios.data);
      setRutasCatalog(responseRutas.data);
      setMunicipios(responseMunicipios.data);
    } catch (err) {
      console.error("Error fetching catalogs:", err);
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
      municipio: '',
      tipo: '',
      gremio: '',
      rep_legal_ci: '',
      rep_legal_nom: '',
      telefono: '',
      correo: '',
      direccion_fiscal: '',
      fecha_constitucion_mercantil: '',
      cupo_unidades: 0,
      cupo_maximo_unidades: 0,
      conteo_minibus: 0,
      conteo_bus: 0,
      conteo_otro: 0,
      rutas_urbanas: 0,
      rutas_suburbanas: 0,
      modalidad_cps: '',
      esta_activa: true,
      rutas: []
    });
    setActiveTab('datos');
    setIsEditing(false);
    setError(null);
  };

  const handleAddRuta = () => {
    setFormData(prev => ({
      ...prev,
      rutas: [...prev.rutas, {
        ruta_id: '',
        numero_resolucion: '',
        hora_salida_ida: '',
        hora_regreso_ida: '',
        frecuencia_ida_min: '',
        hora_salida_vuelta: '',
        hora_regreso_vuelta: '',
        frecuencia_vuelta_min: ''
      }]
    }));
  };

  const handleRemoveRuta = (index) => {
    setFormData(prev => ({
      ...prev,
      rutas: prev.rutas.filter((_, i) => i !== index)
    }));
  };

  const handleRutaChange = (index, field, value) => {
    setFormData(prev => {
      const newRutas = [...prev.rutas];
      newRutas[index][field] = value;
      return { ...prev, rutas: newRutas };
    });
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (org) => {
    setFormData({
      ...org,
      rutas: org.rutas || [],
      cupo_maximo_unidades: org.cupo_maximo_unidades || 0,
      modalidad_cps: org.modalidad_cps || '',
      gremio: org.gremio || '',
      municipio: org.municipio || ''
    });
    setActiveTab('datos');
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields in rutas
    for (const r of formData.rutas) {
      if (!r.ruta_id || !r.hora_salida_ida || !r.hora_regreso_ida || !r.frecuencia_ida_min || !r.hora_salida_vuelta || !r.hora_regreso_vuelta || !r.frecuencia_vuelta_min) {
        setError("Todos los campos de horario son obligatorios en las rutas agregadas.");
        setActiveTab('rutas');
        return;
      }
    }

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
      setError("Error al guardar la organización. Verifique los campos y que el RIF sea único.");
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('organizations/organizations/export_excel/', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'organizaciones.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error exporting excel:", err);
      alert("No se pudo exportar el archivo.");
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataFile = new FormData();
    formDataFile.append('file', file);

    try {
      setLoading(true);
      const response = await api.post('organizations/organizations/import_excel/', formDataFile, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setImportResult({ 
        success: true, 
        message: response.data.message,
        created: response.data.created,
        updated: response.data.updated
      });
      fetchOrgs();
      setTimeout(() => setImportResult(null), 8000);
    } catch (err) {
      console.error("Error importing excel:", err);
      alert(err.response?.data?.error || "Error al importar el archivo.");
    } finally {
      setLoading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleDeleteClick = (org) => {
    setDeleteModal({ isOpen: true, rif: org.rif, razon_social: org.razon_social });
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`organizations/organizations/${deleteModal.rif}/`);
      setDeleteModal({ isOpen: false, rif: null, razon_social: '' });
      fetchOrgs();
    } catch (err) {
      console.error("Error deleting organization:", err);
      alert("No se pudo eliminar la organización.");
    }
  };

  const filteredOrgs = organizations.filter(org => {
    const matchesSearch = org.rif.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.razon_social.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMun = !filters.municipio || org.municipio === parseInt(filters.municipio);
    const matchesTipo = !filters.tipo || org.tipo === parseInt(filters.tipo);
    const matchesGremio = !filters.gremio || org.gremio === parseInt(filters.gremio);
    
    return matchesSearch && matchesMun && matchesTipo && matchesGremio;
  });

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
  } = usePagination(filteredOrgs, { itemsPerPage: 10, enableSearch: false, enableFilter: false });

  return (
    <div className="space-y-6 font-public-sans">
      {/* Header Block */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <span className="material-symbols-outlined text-[20px]">corporate_fare</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Gestión de Operadoras</span>
          </div>
          <h1 className="font-headline-md text-headline-md text-on-surface font-black">Organizaciones Autorizadas</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-2xl">Control y seguimiento del registro legal de líneas, cooperativas y empresas de transporte público en el estado.</p>
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Registros', value: organizations.length, icon: 'list_alt', color: 'primary' },
          { label: 'Líneas Activas', value: organizations.filter(o => o.esta_activa).length, icon: 'check_circle', color: 'tertiary' },
          { label: 'Total Unidades', value: organizations.reduce((acc, o) => acc + (o.cupo_unidades || 0), 0), icon: 'directions_bus', color: 'secondary' },
          { label: 'Municipios', value: new Set(organizations.map(o => o.municipio)).size, icon: 'map', color: 'primary' }
        ].map((stat, i) => (
          <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl bg-${stat.color}/10 flex items-center justify-center text-${stat.color}`}>
              <span className="material-symbols-outlined text-[24px]">{stat.icon}</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-on-surface leading-none mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Import Result Banner */}
      {importResult && (
        <div className={`p-4 rounded-xl border flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300 ${importResult.success ? 'bg-tertiary-fixed text-on-tertiary-fixed border-tertiary-fixed-dim/50' : 'bg-error-container text-on-error-container border-error/20'}`}>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined">{importResult.success ? 'check_circle' : 'error'}</span>
            <div>
              <p className="text-sm font-black">{importResult.message}</p>
              {importResult.success && (
                <p className="text-[10px] font-medium opacity-80 uppercase tracking-wider">
                  Nuevos: {importResult.created} • Actualizados: {importResult.updated}
                </p>
              )}
            </div>
          </div>
          <button onClick={() => setImportResult(null)} className="hover:bg-black/5 p-1 rounded-full">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col gap-4 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-50 group-hover:opacity-100 transition-opacity"></div>
        
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
            <input 
              className="w-full pl-9 pr-3 py-2.5 bg-surface border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm" 
              placeholder="Buscar por RIF o Nombre..." 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
            <input 
              type="file" 
              id="import-excel" 
              className="absolute opacity-0 w-0 h-0" 
              accept=".xlsx, .xls"
              onChange={handleImport}
            />
            <button 
              onClick={() => document.getElementById('import-excel').click()}
              className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant px-4 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center border border-outline-variant shadow-sm"
            >
              <span className="material-symbols-outlined mr-2 text-[18px]">upload_file</span>
              Importar Excel
            </button>
            {canCreate && (
              <button 
                onClick={handleOpenCreate}
                className="bg-primary hover:bg-primary-container text-white px-5 py-2.5 rounded-lg text-sm font-black transition-colors flex items-center shadow-md hover:shadow-lg transform active:scale-95"
              >
                <span className="material-symbols-outlined mr-2 text-[20px]">add_business</span>
                Nueva Organización
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-outline-variant/30">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-on-surface-variant uppercase ml-1 tracking-tighter">Filtrar por Municipio</label>
            <select 
              value={filters.municipio} 
              onChange={(e) => setFilters({...filters, municipio: e.target.value})}
              className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-xs font-medium focus:border-primary outline-none"
            >
              <option value="">Todos los Municipios</option>
              {municipios.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-on-surface-variant uppercase ml-1 tracking-tighter">Filtrar por Tipo</label>
            <select 
              value={filters.tipo} 
              onChange={(e) => setFilters({...filters, tipo: e.target.value})}
              className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-xs font-medium focus:border-primary outline-none"
            >
              <option value="">Todos los Tipos</option>
              {tiposOrganizacion.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-on-surface-variant uppercase ml-1 tracking-tighter">Filtrar por Gremio</label>
            <select 
              value={filters.gremio} 
              onChange={(e) => setFilters({...filters, gremio: e.target.value})}
              className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-xs font-medium focus:border-primary outline-none"
            >
              <option value="">Todos los Gremios</option>
              {gremios.map(g => <option key={g.id} value={g.id}>{g.razon_social}</option>)}
            </select>
          </div>
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
                  <th className="px-6 py-4 font-label-bold text-label-bold text-on-surface-variant w-[180px]">Tipo / Gremio</th>
                  <th className="px-6 py-4 font-label-bold text-label-bold text-on-surface-variant">Rep. Legal</th>
                  <th className="px-6 py-4 font-label-bold text-label-bold text-on-surface-variant">Flota / Rutas</th>
                  <th className="px-6 py-4 font-label-bold text-label-bold text-on-surface-variant w-[100px]">Estado</th>
                  <th className="px-6 py-4 font-label-bold text-label-bold text-on-surface-variant text-right w-[100px]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40 bg-surface-container-lowest">
                {paginatedData.length > 0 ? paginatedData.map((org, i) => (
                  <tr key={org.rif} className={`hover:bg-surface-container-low transition-all group border-b border-outline-variant/30`}>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <div className="font-title-sm text-title-sm text-primary font-black tracking-tight">{org.rif}</div>
                        <div className="text-[9px] text-on-surface-variant font-bold uppercase mt-1 opacity-60">ID Registro</div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-body-md text-body-md text-on-surface font-black group-hover:text-primary transition-colors">{org.razon_social}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-on-surface-variant uppercase font-medium">{org.correo || 'Sin correo'}</span>
                        {org.municipio_nombre && (
                          <span className="text-[10px] bg-outline-variant/30 text-on-surface-variant px-1.5 py-0.5 rounded font-bold uppercase border border-outline-variant/50">
                            {org.municipio_nombre}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-secondary/10 text-secondary border border-secondary/20 uppercase w-fit">
                          {org.tipo_nombre || 'No especificado'}
                        </span>
                        {org.gremio_nombre && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-tertiary/10 text-tertiary border border-tertiary/20 uppercase w-fit">
                            {org.gremio_nombre}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-body-sm text-body-sm text-on-surface font-medium">{org.rep_legal_nom}</div>
                      <div className="text-[10px] text-on-surface-variant font-medium">C.I. {org.rep_legal_ci}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-surface-container-highest text-on-surface-variant border border-outline-variant" title="Minibús">M: {org.conteo_minibus}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-surface-container-highest text-on-surface-variant border border-outline-variant" title="Bus">B: {org.conteo_bus}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-surface-container-highest text-on-surface-variant border border-outline-variant" title="Otro">O: {org.conteo_otro}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary/10 text-primary border border-primary/20" title="Rutas Urbanas">U: {org.rutas_urbanas}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-secondary/10 text-secondary border border-secondary/20" title="Rutas Suburbanas">S: {org.rutas_suburbanas}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-sm text-[10px] font-label-bold uppercase tracking-wider border ${org.esta_activa ? 'bg-tertiary-fixed text-on-tertiary-fixed border-tertiary-fixed-dim/50' : 'bg-error-container text-on-error-container border-error/20'}`}>
                        {org.esta_activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setViewModal({ isOpen: true, data: org })}
                          className="text-on-surface-variant hover:text-secondary p-1 rounded-full hover:bg-surface-container-high transition-colors" title="Ver Detalles"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
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
                            onClick={() => handleDeleteClick(org)}
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
        <div className="p-4 border-t border-outline-variant bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-4">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalFiltered={totalFiltered}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={organizations.length}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            onPageChange={goToPage}
            onNextPage={nextPage}
            onPrevPage={prevPage}
          />
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
        <div className="flex gap-4 mb-6 border-b border-outline-variant">
          <button 
            type="button"
            className={`pb-2 px-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'datos' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
            onClick={() => setActiveTab('datos')}
          >
            Datos de la Organización
          </button>
          <button 
            type="button"
            className={`pb-2 px-4 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'rutas' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
            onClick={() => setActiveTab('rutas')}
          >
            Rutas y Horarios
            {formData.rutas.length > 0 && <span className="bg-primary text-on-primary text-[10px] px-1.5 py-0.5 rounded-full">{formData.rutas.length}</span>}
          </button>
        </div>

        {activeTab === 'datos' && (
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
            <label className="text-xs font-bold text-on-surface-variant ml-1">Municipio Sede</label>
            <select 
              name="municipio" value={formData.municipio} onChange={handleInputChange}
              className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm focus:border-primary outline-none transition-all focus:ring-1 focus:ring-primary"
            >
              <option value="">Seleccione...</option>
              {municipios.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant ml-1">Tipo de Organización *</label>
            <select 
              name="tipo" value={formData.tipo} onChange={handleInputChange} required
              className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm focus:border-primary outline-none transition-all focus:ring-1 focus:ring-primary"
            >
              <option value="">Seleccione...</option>
              {tiposOrganizacion.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant ml-1">Gremio / Federación</label>
            <select 
              name="gremio" value={formData.gremio} onChange={handleInputChange}
              className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm focus:border-primary outline-none transition-all focus:ring-1 focus:ring-primary"
            >
              <option value="">Ninguno / Particular</option>
              {gremios.map(g => <option key={g.id} value={g.id}>{g.razon_social}</option>)}
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
              type="date" name="fecha_constitucion_mercantil" value={formData.fecha_constitucion_mercantil} onChange={handleInputChange}
              className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm focus:border-primary outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant ml-1">Cupo Unidades</label>
            <input 
              type="number" name="cupo_unidades" value={formData.cupo_unidades} onChange={handleInputChange}
              placeholder="0" className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm focus:border-primary outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant ml-1">Cupo Máx. Unidades</label>
            <input 
              type="number" name="cupo_maximo_unidades" value={formData.cupo_maximo_unidades} onChange={handleInputChange}
              placeholder="0" className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm focus:border-primary outline-none"
            />
          </div>
          
          <div className="md:col-span-3 mt-4 pt-4 border-t border-outline-variant/30">
            <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">analytics</span>
              Resumen de Flota y Operaciones (Sincronizado con Excel)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant ml-1 uppercase">Minibús</label>
                <input type="number" name="conteo_minibus" value={formData.conteo_minibus} onChange={handleInputChange} className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm focus:border-primary outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant ml-1 uppercase">Bus</label>
                <input type="number" name="conteo_bus" value={formData.conteo_bus} onChange={handleInputChange} className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm focus:border-primary outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant ml-1 uppercase">Otro</label>
                <input type="number" name="conteo_otro" value={formData.conteo_otro} onChange={handleInputChange} className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm focus:border-primary outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant ml-1 uppercase">Rutas Urb.</label>
                <input type="number" name="rutas_urbanas" value={formData.rutas_urbanas} onChange={handleInputChange} className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm focus:border-primary outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant ml-1 uppercase">Rutas Sub.</label>
                <input type="number" name="rutas_suburbanas" value={formData.rutas_suburbanas} onChange={handleInputChange} className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm focus:border-primary outline-none" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant ml-1">Modalidad CPS</label>
            <select 
              name="modalidad_cps" value={formData.modalidad_cps} onChange={handleInputChange}
              className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm focus:border-primary outline-none"
            >
              <option value="">Seleccione...</option>
              <option value="DT9">DT9 (5-32 Puestos)</option>
              <option value="DT10">DT10 (32+ Puestos)</option>
            </select>
          </div>
          <div className="space-y-1 md:col-span-3">
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
          {error && <div className="md:col-span-3 text-error text-xs font-bold bg-error-container/10 p-2 rounded border border-error/20">{error}</div>}
        </form>
        )}

        {activeTab === 'rutas' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-surface-container-low p-4 rounded-xl border border-outline-variant">
              <div>
                <h3 className="font-bold text-on-surface text-sm">Asignación de Rutas y Horarios</h3>
                <p className="text-xs text-on-surface-variant mt-1">Defina las rutas autorizadas para esta organización y sus respectivos itinerarios operativos.</p>
              </div>
              <button 
                onClick={handleAddRuta}
                type="button"
                className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center"
              >
                <span className="material-symbols-outlined mr-1 text-[16px]">add</span> Agregar Ruta
              </button>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {formData.rutas.map((r, index) => (
                <div key={index} className="bg-surface-container border border-outline-variant rounded-xl p-5 relative">
                  <button 
                    onClick={() => handleRemoveRuta(index)}
                    className="absolute top-4 right-4 text-outline hover:text-error transition-colors"
                    title="Eliminar Ruta"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface-variant">Seleccionar Ruta *</label>
                      <select 
                        value={r.ruta_id} onChange={(e) => handleRutaChange(index, 'ruta_id', e.target.value)}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2 px-3 text-sm focus:border-primary outline-none"
                      >
                        <option value="">Seleccione una ruta...</option>
                        {rutasCatalog.map(ruta => <option key={ruta.id} value={ruta.id}>{ruta.nombre}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface-variant">Resolución/Permiso</label>
                      <input 
                        type="text" value={r.numero_resolucion} onChange={(e) => handleRutaChange(index, 'numero_resolucion', e.target.value)}
                        placeholder="Nro. del Documento" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2 px-3 text-sm focus:border-primary outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/50">
                    {/* Ida */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">trending_up</span> Itinerario de Ida
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-on-surface-variant">Desde *</label>
                          <input type="time" value={r.hora_salida_ida} onChange={(e) => handleRutaChange(index, 'hora_salida_ida', e.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-md py-1.5 px-2 text-xs outline-none focus:border-primary"/>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-on-surface-variant">Hasta *</label>
                          <input type="time" value={r.hora_regreso_ida} onChange={(e) => handleRutaChange(index, 'hora_regreso_ida', e.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-md py-1.5 px-2 text-xs outline-none focus:border-primary"/>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-on-surface-variant">Frec. (min) *</label>
                          <input type="number" placeholder="Ej: 60" value={r.frecuencia_ida_min} onChange={(e) => handleRutaChange(index, 'frecuencia_ida_min', e.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-md py-1.5 px-2 text-xs outline-none focus:border-primary"/>
                        </div>
                      </div>
                    </div>

                    {/* Vuelta */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">trending_down</span> Itinerario de Regreso
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-on-surface-variant">Desde *</label>
                          <input type="time" value={r.hora_salida_vuelta} onChange={(e) => handleRutaChange(index, 'hora_salida_vuelta', e.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-md py-1.5 px-2 text-xs outline-none focus:border-primary"/>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-on-surface-variant">Hasta *</label>
                          <input type="time" value={r.hora_regreso_vuelta} onChange={(e) => handleRutaChange(index, 'hora_regreso_vuelta', e.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-md py-1.5 px-2 text-xs outline-none focus:border-primary"/>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-on-surface-variant">Frec. (min) *</label>
                          <input type="number" placeholder="Ej: 60" value={r.frecuencia_vuelta_min} onChange={(e) => handleRutaChange(index, 'frecuencia_vuelta_min', e.target.value)} className="w-full bg-surface-container border border-outline-variant rounded-md py-1.5 px-2 text-xs outline-none focus:border-primary"/>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {formData.rutas.length === 0 && (
                <div className="text-center p-8 border-2 border-dashed border-outline-variant rounded-xl text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-50">route</span>
                  <p className="text-sm font-medium">Esta organización no tiene rutas asignadas.</p>
                </div>
              )}
            </div>
            {error && <div className="text-error text-xs font-bold bg-error-container/10 p-3 rounded border border-error/20">{error}</div>}
          </div>
        )}
      </Modal>

      {/* Custom Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        title="Confirmar Eliminación"
        subtitle="Esta acción no se puede deshacer"
        icon="warning"
        maxWidthClass="max-w-md"
        actions={
          <>
            <button 
              onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })} 
              className="px-4 py-2 text-sm font-bold text-on-surface hover:bg-surface-variant rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={confirmDelete} 
              className="px-6 py-2 text-sm font-bold text-white bg-error hover:bg-error/90 rounded-lg shadow-md transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">delete_forever</span>
              Eliminar Permanentemente
            </button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center p-4">
          <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center text-error mb-4">
            <span className="material-symbols-outlined text-[32px]">delete_sweep</span>
          </div>
          <h3 className="text-xl font-black text-on-surface mb-2">Eliminar Registro Legal</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Esta acción eliminará de forma permanente a la operadora <span className="font-bold text-on-surface">"{deleteModal.razon_social}"</span> (RIF: {deleteModal.rif}) del sistema nacional de transporte.
          </p>
          <div className="mt-6 p-4 bg-error-container/10 border-2 border-dashed border-error/30 rounded-xl w-full">
            <p className="text-[11px] text-error font-black uppercase tracking-tighter leading-tight text-center">
              ¡ATENCIÓN! Esta operación es irreversible y resultará en la pérdida total de expedientes, rutas, horarios y unidades vinculadas.
            </p>
          </div>
        </div>
      </Modal>

      {/* Organization Details Modal (Preview) */}
      <Modal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ ...viewModal, isOpen: false })}
        title="Detalles de la Organización"
        subtitle="Vista previa completa de la información registrada"
        icon="info"
        maxWidthClass="max-w-3xl"
        actions={
          <>
            <button onClick={() => setViewModal({ ...viewModal, isOpen: false })} className="px-6 py-2 text-sm font-bold text-on-surface hover:bg-surface-variant rounded-lg transition-colors border border-outline-variant">Cerrar</button>
            {canUpdate && (
              <button 
                onClick={() => {
                  setViewModal({ ...viewModal, isOpen: false });
                  handleEdit(viewModal.data);
                }} 
                className="px-6 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-md transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Editar Información
              </button>
            )}
          </>
        }
      >
        {viewModal.data && (
          <div className="space-y-6">
            {/* Header / Summary Card */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex items-start gap-4">
              <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-[32px]">apartment</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-black text-on-surface">{viewModal.data.razon_social}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${viewModal.data.esta_activa ? 'bg-tertiary-fixed text-on-tertiary-fixed border-tertiary-fixed-dim/50' : 'bg-error-container text-on-error-container border-error/20'}`}>
                    {viewModal.data.esta_activa ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                <p className="text-primary font-black text-sm mt-1">{viewModal.data.rif}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                   <span className="bg-surface-container-highest text-on-surface-variant px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-outline-variant">{viewModal.data.tipo_nombre}</span>
                   {viewModal.data.gremio_nombre && <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-secondary/20">{viewModal.data.gremio_nombre}</span>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Legal & Contact */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] border-b border-outline-variant pb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">contact_page</span>
                  Información Legal y Contacto
                </h4>
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Representante Legal</span>
                    <span className="text-sm font-bold text-on-surface">{viewModal.data.rep_legal_nom || 'No registrado'}</span>
                    <span className="text-[11px] text-on-surface-variant opacity-70">C.I. {viewModal.data.rep_legal_ci || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Teléfono y Correo</span>
                    <span className="text-sm font-bold text-on-surface">{viewModal.data.telefono || 'N/A'}</span>
                    <span className="text-[11px] text-primary font-bold underline underline-offset-2">{viewModal.data.correo || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Dirección Fiscal</span>
                    <span className="text-xs font-medium text-on-surface leading-relaxed italic">"{viewModal.data.direccion_fiscal || 'Sin dirección registrada'}"</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Fleet & CPS */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] border-b border-outline-variant pb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">analytics</span>
                  Capacidad y Operaciones
                </h4>
                
                {/* Fleet Breakdown Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-surface-container-low p-2 rounded-xl border border-outline-variant flex flex-col items-center">
                    <span className="text-[9px] font-black text-on-surface-variant uppercase">Minibús</span>
                    <span className="text-lg font-black text-primary">{viewModal.data.conteo_minibus}</span>
                  </div>
                  <div className="bg-surface-container-low p-2 rounded-xl border border-outline-variant flex flex-col items-center">
                    <span className="text-[9px] font-black text-on-surface-variant uppercase">Bus</span>
                    <span className="text-lg font-black text-primary">{viewModal.data.conteo_bus}</span>
                  </div>
                  <div className="bg-surface-container-low p-2 rounded-xl border border-outline-variant flex flex-col items-center">
                    <span className="text-[9px] font-black text-on-surface-variant uppercase">Otro</span>
                    <span className="text-lg font-black text-primary">{viewModal.data.conteo_otro}</span>
                  </div>
                </div>

                <div className="bg-surface-container-highest/30 p-3 rounded-xl border border-outline-variant/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Estado CPS</span>
                    <span className="text-[10px] font-black text-secondary uppercase">{viewModal.data.modalidad_cps || 'DT9'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[20px]">verified</span>
                    <p className="text-xs font-black text-on-surface">VIGENTE HASTA EL 01/06/2030</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Rutas Urbanas</span>
                    <span className="text-lg font-black text-on-surface">{viewModal.data.rutas_urbanas}</span>
                  </div>
                  <div className="flex-1 border-l border-outline-variant pl-4">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Rutas Suburb.</span>
                    <span className="text-lg font-black text-on-surface">{viewModal.data.rutas_suburbanas}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Routes List */}
            {viewModal.data.rutas && viewModal.data.rutas.length > 0 && (
              <div className="space-y-3 pt-4">
                <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] border-b border-outline-variant pb-2">Rutas y Horarios Autorizados</h4>
                <div className="grid grid-cols-1 gap-2">
                  {viewModal.data.rutas.map((r, i) => (
                    <div key={i} className="flex flex-col gap-2 p-4 bg-surface-container rounded-xl border border-outline-variant hover:border-primary/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[20px]">route</span>
                          </div>
                          <div>
                            <p className="text-sm font-black text-on-surface">{r.ruta_nombre || 'Ruta Registrada'}</p>
                            <span className="text-[9px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded font-black uppercase tracking-tighter border border-secondary/20">{r.tipo_ruta || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-tighter">Resolución</p>
                          <p className="text-xs font-bold text-primary">{r.numero_resolucion || 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 py-2 border-y border-outline-variant/30 mt-1">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-on-surface-variant uppercase opacity-60">Origen / Destino</span>
                          <span className="text-[11px] font-black text-on-surface flex items-center gap-1">
                            {r.municipio_or} <span className="material-symbols-outlined text-[14px] opacity-50">arrow_forward</span> {r.municipio_des}
                          </span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[9px] font-bold text-on-surface-variant uppercase opacity-60">Itinerario General</span>
                          <span className="text-[11px] font-black text-secondary uppercase italic">
                            {r.hora_salida_ida?.substring(0,5)} - {r.hora_regreso_ida?.substring(0,5)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Organizaciones;
