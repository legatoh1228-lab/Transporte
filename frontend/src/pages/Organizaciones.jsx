import React, { useState, useEffect } from 'react';
import api from '../services/api';

import { Modal } from '../components/common/Modal';
import { usePermissions } from '../hooks/usePermissions';
import { usePagination } from '../hooks/usePagination';
import { PaginationControls } from '../components/common/PaginationControls';
import { buildPdfHeader, addTableAndSave } from '../utils/pdfExport';

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
  const [toast, setToast] = useState(null); // { message: '', type: 'success' | 'error' | 'warning' }

  // Excel Import States
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [currentLoaderStep, setCurrentLoaderStep] = useState(0);
  const [errorSearch, setErrorSearch] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loaderSteps = [
    "Estableciendo conexión segura y subiendo archivo Excel...",
    "Analizando estructura de columnas e identificando hoja 'ORGANIZACIONES'...",
    "Procesando registros de organizaciones y aislando filas de forma atómica...",
    "Comprobando gremios federados y códigos de RIF...",
    "Validando números telefónicos, correos y representantes legales...",
    "Verificando cuotas (cupos) de unidades autorizadas en el sistema...",
    "Estableciendo transacciones seguras en la base de datos...",
    "Finalizando importación de organizaciones. ¡Casi listo!"
  ];

  useEffect(() => {
    let progressInterval;
    let stepInterval;

    if (importing) {
      setImportProgress(2);
      setCurrentLoaderStep(0);

      progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev < 30) {
            return prev + Math.floor(Math.random() * 8) + 4;
          } else if (prev < 85) {
            return prev + Math.floor(Math.random() * 3) + 1;
          } else if (prev < 98) {
            return prev + (Math.random() > 0.6 ? 1 : 0);
          }
          return prev;
        });
      }, 800);

      stepInterval = setInterval(() => {
        setCurrentLoaderStep(prev => {
          if (prev < loaderSteps.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 4000);
    } else {
      setImportProgress(0);
      setCurrentLoaderStep(0);
    }

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [importing]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.xlsx')) {
        setImportFile(file);
        setImportResult(null);
        setImportError(null);
      } else {
        setImportError("Solo se admiten archivos de Excel (.xlsx)");
      }
    }
  };

  const handleCopyErrors = () => {
    if (!importResult?.errors) return;
    const text = `Reporte de Importación de Organizaciones\nCreadas: ${importResult.created}\nActualizadas: ${importResult.updated}\n\nErrores/Alertas:\n` + importResult.errors.join('\n');
    navigator.clipboard.writeText(text)
      .then(() => showToast('¡Reporte copiado al portapapeles!', 'success'))
      .catch(err => console.error('Error al copiar:', err));
  };

  // Bulk Selection States
  const [selectedRifs, setSelectedRifs] = useState([]);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [bulkDeleteType, setBulkDeleteType] = useState('selected'); // 'selected' | 'all'
  const [bulkConfirmText, setBulkConfirmText] = useState('');
  const [deletingBulk, setDeletingBulk] = useState(false);

  const handleToggleSelect = (rif) => {
    setSelectedRifs(prev => 
      prev.includes(rif) 
        ? prev.filter(r => r !== rif) 
        : [...prev, rif]
    );
  };

  const handleBulkDelete = async () => {
    if (bulkConfirmText.toUpperCase() !== 'ELIMINAR') return;
    setDeletingBulk(true);
    try {
      const payload = bulkDeleteType === 'all' 
        ? { all: true } 
        : { rifs: selectedRifs };

      const response = await api.post('organizations/organizations/bulk-delete/', payload);
      
      setSelectedRifs([]);
      setIsBulkDeleteOpen(false);
      setBulkConfirmText('');
      fetchOrgs();
      showToast(response.data?.message || '¡Organizaciones eliminadas exitosamente!', 'success');
    } catch (err) {
      console.error("Error in bulk delete:", err);
      showToast(err.response?.data?.error || "Error al realizar la eliminación masiva.", 'error');
    } finally {
      setDeletingBulk(false);
    }
  };

  const [activeTab, setActiveTab] = useState('datos');
  const [tiposOrganizacion, setTiposOrganizacion] = useState([]);
  const [gremios, setGremios] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [rutasCatalog, setRutasCatalog] = useState([]);
  const [registeredVehiclesCount, setRegisteredVehiclesCount] = useState(0);

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
      const [responseOrgs, responseVehicles] = await Promise.all([
        api.get('organizations/organizations/'),
        api.get('fleet/vehicles/')
      ]);
      setOrganizations(responseOrgs.data);
      setRegisteredVehiclesCount(responseVehicles.data.length);
    } catch (err) {
      console.error('Error fetching organizations or vehicles:', err);
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
        hora_regreso_ida: ''
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
      if (!r.ruta_id || !r.hora_salida_ida || !r.hora_regreso_ida) {
        setError("Todos los campos de horario de servicio son obligatorios en las rutas agregadas.");
        setActiveTab('rutas');
        return;
      }
    }

    try {
      if (isEditing) {
        await api.put(`organizations/organizations/${formData.rif}/`, formData);
        showToast("Organización actualizada correctamente.", 'success');
      } else {
        await api.post('organizations/organizations/', formData);
        showToast("Organización registrada correctamente.", 'success');
      }
      setIsModalOpen(false);
      fetchOrgs();
      resetForm();
    } catch (err) {
      console.error("Error saving organization:", err);
      const serverError = err.response?.data;
      let errorMsg = "Error al guardar la organización.";
      if (serverError && typeof serverError === 'object') {
        errorMsg = Object.entries(serverError)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join(' | ');
      }
      setError(errorMsg);
      showToast("Error al guardar los datos de la organización.", 'error');
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
      showToast("Archivo exportado correctamente.", 'success');
    } catch (err) {
      console.error("Error exporting excel:", err);
      showToast("No se pudo exportar el archivo.", 'error');
    }
  };

  const handleImportExcel = async (e) => {
    e.preventDefault();
    if (!importFile) return;
    setImporting(true);
    setImportError(null);
    setImportResult(null);

    const data = new FormData();
    data.append('file', importFile);

    try {
      const response = await api.post('organizations/organizations/import_excel/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000 // 2 minutes
      });
      
      setImportProgress(100);
      setTimeout(() => {
        setImportResult(response.data);
        setImporting(false);
        fetchOrgs();
        showToast('¡Importación de organizaciones finalizada!', 'success');
      }, 600);
    } catch (err) {
      console.error("Error importing organizations:", err);
      setImportError(err.response?.data?.error || "Error al conectar con el servidor para importar las organizaciones.");
      setImporting(false);
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
      showToast("Organización eliminada con éxito.", 'success');
    } catch (err) {
      console.error("Error deleting organization:", err);
      showToast("No se pudo eliminar la organización.", 'error');
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

  const generatePDF = () => {
    const { doc, startY } = buildPdfHeader(
      'ORGANIZACIONES AUTORIZADAS',
      'Registro legal de líneas, cooperativas y empresas de transporte público',
      'Transporte Aragua Digital',
      organizations.length
    );
    const head = ['RIF', 'Razón Social', 'Tipo', 'Municipio', 'Gremio', 'Minibús', 'Bus', 'Otro', 'Activa'];
    const body = filteredOrgs.map(o => [
      o.rif,
      o.razon_social,
      o.tipo_nombre || '—',
      o.municipio_nombre || '—',
      o.gremio_nombre || '—',
      String(o.conteo_minibus || 0),
      String(o.conteo_bus || 0),
      String(o.conteo_otro || 0),
      o.esta_activa ? 'SÍ' : 'NO',
    ]);
    addTableAndSave(doc, startY, head, body, `Organizaciones_${Date.now()}.pdf`);
  };

  return (
    <div className={`space-y-4 font-public-sans transition-all duration-300 ${selectedRifs.length > 0 ? 'pb-28' : 'pb-8'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-outline-variant pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-primary mb-1">
            <span className="material-symbols-outlined text-[18px]">corporate_fare</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Gestión de Operadoras</span>
          </div>
          <h1 className="text-[22px] text-on-surface font-black leading-tight tracking-tight">Organizaciones Autorizadas</h1>
          <p className="text-[13px] text-on-surface-variant mt-0.5 max-w-xl leading-snug">Control y seguimiento del registro legal de líneas, cooperativas y empresas de transporte.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total Registros', value: organizations.length, icon: 'list_alt', color: 'primary', tooltip: 'Cantidad total de organizaciones registradas' },
          { label: 'Líneas Activas', value: organizations.filter(o => o.esta_activa).length, icon: 'check_circle', color: 'tertiary', tooltip: 'Organizaciones con estatus activo en el sistema' },
          { label: 'Cupos de Flota', value: organizations.reduce((acc, o) => acc + (o.cupo_unidades || 0), 0), icon: 'toll', color: 'secondary', tooltip: 'Suma de los cupos máximos de unidades autorizados para todas las operadoras' },
          { label: 'Vehículos Registrados', value: registeredVehiclesCount, icon: 'directions_bus', color: 'tertiary', tooltip: 'Total de vehículos físicos reales registrados y asignados en la base de datos' },
          { label: 'Municipios', value: new Set(organizations.map(o => o.municipio)).size, icon: 'map', color: 'primary', tooltip: 'Cantidad de municipios sedes con presencia de operadoras' }
        ].map((stat, i) => (
          <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3.5 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow cursor-help" title={stat.tooltip}>
            <div className={`w-10 h-10 rounded-lg bg-${stat.color}/10 flex items-center justify-center text-${stat.color}`}>
              <span className="material-symbols-outlined text-[22px]">{stat.icon}</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider leading-none">{stat.label}</p>
              <p className="text-xl font-black text-on-surface leading-none mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col gap-3 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-40 group-hover:opacity-100 transition-opacity"></div>
        
        <div className="flex flex-col lg:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
            <input 
              className="w-full pl-9 pr-3 py-2 bg-surface border border-outline-variant rounded-lg text-[13px] text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
              placeholder="Buscar por RIF o Razón Social..." 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
            {canCreate && (
              <button 
                onClick={() => {
                  setImportFile(null);
                  setImportResult(null);
                  setImportError(null);
                  setIsImportOpen(true);
                }}
                className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant px-4 py-2 rounded-lg text-[13px] font-bold transition-colors flex items-center border border-outline-variant shadow-sm active:scale-[0.98] transform"
              >
                <span className="material-symbols-outlined mr-1.5 text-[18px]">upload_file</span>
                Importar Excel
              </button>
            )}
            <button 
              onClick={handleExport}
              className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant px-4 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 border border-outline-variant shadow-sm"
              title="Exportar a Excel"
            >
              <span className="material-symbols-outlined text-[18px] text-[#1d6f42]">table_view</span>
              Excel
            </button>
            <button 
              onClick={generatePDF}
              className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant px-4 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 border border-outline-variant shadow-sm"
              title="Exportar a PDF"
            >
              <span className="material-symbols-outlined text-[18px] text-error">picture_as_pdf</span>
              PDF
            </button>
            {canCreate && (
              <button 
                onClick={handleOpenCreate}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-[13px] font-black transition-colors flex items-center shadow-md hover:shadow-lg transform active:scale-[0.98]"
              >
                <span className="material-symbols-outlined mr-1.5 text-[18px]">add_business</span>
                Nueva Organización
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-outline-variant/30">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase ml-0.5 tracking-wide">Municipio</label>
            <select 
              value={filters.municipio} 
              onChange={(e) => setFilters({...filters, municipio: e.target.value})}
              className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-[12px] font-medium focus:border-primary outline-none"
            >
              <option value="">Todos los Municipios</option>
              {municipios.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase ml-0.5 tracking-wide">Tipo</label>
            <select 
              value={filters.tipo} 
              onChange={(e) => setFilters({...filters, tipo: e.target.value})}
              className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-[12px] font-medium focus:border-primary outline-none"
            >
              <option value="">Todos los Tipos</option>
              {tiposOrganizacion.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase ml-0.5 tracking-wide">Gremio</label>
            <select 
              value={filters.gremio} 
              onChange={(e) => setFilters({...filters, gremio: e.target.value})}
              className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-[12px] font-medium focus:border-primary outline-none"
            >
              <option value="">Todos los Gremios</option>
              {gremios.map(g => <option key={g.id} value={g.id}>{g.razon_social}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-16 text-center text-on-surface-variant text-sm animate-pulse">Cargando organizaciones autorizadas...</div>
          ) : (
            <div className="w-full overflow-x-auto pb-4">
<table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low/80 border-b border-outline-variant">
                <tr>
                  <th className="pl-4 pr-2 py-3 w-[44px] text-center">
                    <label className="flex items-center justify-center cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={paginatedData.length > 0 && paginatedData.every(org => selectedRifs.includes(org.rif))}
                        onChange={(e) => {
                          if (e.target.checked) {
                            const newSelected = [...selectedRifs];
                            paginatedData.forEach(org => {
                              if (!newSelected.includes(org.rif)) newSelected.push(org.rif);
                            });
                            setSelectedRifs(newSelected);
                          } else {
                            const pageRifs = paginatedData.map(org => org.rif);
                            setSelectedRifs(selectedRifs.filter(r => !pageRifs.includes(r)));
                          }
                        }}
                        className="w-3.5 h-3.5 rounded border-outline-variant text-primary focus:ring-primary/20"
                      />
                    </label>
                  </th>
                  <th className="px-4 py-3 text-[11px] font-black text-on-surface-variant uppercase tracking-wider whitespace-nowrap">RIF</th>
                  <th className="px-4 py-3 text-[11px] font-black text-on-surface-variant uppercase tracking-wider">Razón Social</th>
                  <th className="px-4 py-3 text-[11px] font-black text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Tipo / Gremio</th>
                  <th className="px-4 py-3 text-[11px] font-black text-on-surface-variant uppercase tracking-wider">Rep. Legal</th>
                  <th className="px-4 py-3 text-[11px] font-black text-on-surface-variant uppercase tracking-wider">Flota / Rutas</th>
                  <th className="px-4 py-3 text-[11px] font-black text-on-surface-variant uppercase tracking-wider whitespace-nowrap text-center">Estado</th>
                  <th className="pl-4 pr-5 py-3 text-[11px] font-black text-on-surface-variant uppercase tracking-wider text-right whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30 bg-surface-container-lowest">
                {selectedRifs.length > 0 && (
                  <tr className="bg-primary/[0.04]">
                    <td colSpan={8} className="px-4 py-2.5 text-center text-[12px] font-bold text-primary align-middle">
                      {selectedRifs.length === organizations.length ? (
                        <div className="flex items-center justify-center gap-3">
                          <span>Todas las <strong className="font-black">{organizations.length}</strong> organizaciones están seleccionadas</span>
                          <button 
                            type="button"
                            onClick={() => setSelectedRifs([])} 
                            className="text-error font-black uppercase tracking-wide text-[10px] bg-error/5 px-2.5 py-1 rounded-md border border-error/20 hover:bg-error/10 transition-colors"
                          >
                            Deseleccionar todo
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-3">
                          <span><strong className="font-black">{selectedRifs.length}</strong> seleccionadas en esta página</span>
                          <button 
                            type="button"
                            onClick={() => setSelectedRifs(organizations.map(org => org.rif))} 
                            className="text-primary font-black uppercase tracking-wide text-[10px] bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20 hover:bg-primary/15 transition-all active:scale-[0.98]"
                          >
                            Seleccionar todas ({organizations.length})
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
                {paginatedData.length > 0 ? paginatedData.map((org, i) => (
                  <tr key={org.rif} className={`hover:bg-surface-container-low/60 transition-colors group ${selectedRifs.includes(org.rif) ? 'bg-primary/[0.04] hover:bg-primary/[0.07]' : ''}`}>
                    <td className="pl-4 pr-2 py-3 text-center align-middle">
                      <label className="flex items-center justify-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox"
                          checked={selectedRifs.includes(org.rif)}
                          onChange={() => handleToggleSelect(org.rif)}
                          className="w-3.5 h-3.5 rounded border-outline-variant text-primary focus:ring-primary/20"
                        />
                      </label>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap align-middle">
                      <span className="font-mono text-[13px] text-primary font-black tracking-wide">{org.rif}</span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="text-[13px] text-on-surface font-semibold group-hover:text-primary transition-colors leading-snug line-clamp-1" title={org.razon_social}>{org.razon_social}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-on-surface-variant/70">{org.correo || 'Sin correo'}</span>
                        {org.municipio_nombre && (
                          <span className="text-[10px] bg-surface-container-high text-on-surface-variant px-1.5 py-0.5 rounded font-semibold whitespace-nowrap">
                            {org.municipio_nombre}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-secondary/8 text-secondary border border-secondary/15 uppercase w-fit whitespace-nowrap">
                          {org.tipo_nombre || 'No especificado'}
                        </span>
                        {org.gremio_nombre && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-tertiary/8 text-tertiary border border-tertiary/15 uppercase w-fit whitespace-nowrap max-w-[150px] truncate" title={org.gremio_nombre}>
                            {org.gremio_nombre}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      {org.rep_legal_nom ? (
                        <>
                          <div className="text-[13px] text-on-surface font-medium leading-tight line-clamp-1" title={org.rep_legal_nom}>{org.rep_legal_nom}</div>
                          {org.rep_legal_ci && (
                            <div className="text-[11px] text-on-surface-variant/70 font-mono mt-0.5 whitespace-nowrap">C.I. {org.rep_legal_ci}</div>
                          )}
                        </>
                      ) : (
                        <span className="text-[12px] text-on-surface-variant/40 italic">No registrado</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 w-full min-w-[130px] max-w-[180px]">
                        <div className="flex items-center justify-between text-[10px] text-on-surface-variant border-b border-outline-variant/20 pb-0.5">
                          <span className="font-bold">Minibuses</span>
                          <span className="font-black text-on-surface">{org.conteo_minibus}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-on-surface-variant border-b border-outline-variant/20 pb-0.5">
                          <span className="font-bold">Buses</span>
                          <span className="font-black text-on-surface">{org.conteo_bus}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-on-surface-variant border-b border-outline-variant/20 pb-0.5">
                          <span className="font-bold">Otros</span>
                          <span className="font-black text-on-surface">{org.conteo_otro}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-primary font-bold mt-0.5">
                          <span>Rutas Urbanas</span>
                          <span className="font-black">{org.rutas_urbanas}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-secondary font-bold">
                          <span>Rutas Suburbanas</span>
                          <span className="font-black">{org.rutas_suburbanas}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle text-center whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${org.esta_activa ? 'bg-tertiary-fixed text-on-tertiary-fixed border-tertiary-fixed-dim/50' : 'bg-error-container text-on-error-container border-error/20'}`}>
                        {org.esta_activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="pl-4 pr-5 py-3 text-right align-middle whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button 
                          onClick={() => setViewModal({ isOpen: true, data: org })}
                          className="text-on-surface-variant hover:text-secondary p-1.5 rounded-lg hover:bg-surface-container-high transition-colors" title="Ver Detalles"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        {canUpdate && (
                          <button 
                            onClick={() => handleEdit(org)}
                            className="text-on-surface-variant hover:text-primary p-1.5 rounded-lg hover:bg-surface-container-high transition-colors" title="Editar"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                        )}
                        {canDelete && (
                          <button 
                            onClick={() => handleDeleteClick(org)}
                            className="text-on-surface-variant hover:text-error p-1.5 rounded-lg hover:bg-surface-container-high transition-colors" title="Eliminar"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="8" className="px-4 py-12 text-center text-on-surface-variant text-sm align-middle">No se encontraron organizaciones registradas.</td>
                  </tr>
                )}
              </tbody>
            </table>
</div>
          )}
        </div>
        {/* Table Footer */}
        <div className="px-4 py-3 border-t border-outline-variant bg-surface-container-low/60 flex flex-col sm:flex-row items-center justify-between gap-3">
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
            {((isEditing && canUpdate) || (!isEditing && canCreate)) && (
              <button onClick={handleSubmit} className="px-6 py-2 text-sm font-bold text-on-primary bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-all">
                {isEditing ? "Actualizar" : "Registrar Empresa"}
              </button>
            )}
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
                <p className="text-xs text-on-surface-variant mt-1">Defina las rutas autorizadas para esta organización y sus respectivos horarios de servicio.</p>
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

                  <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/60">
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-primary uppercase tracking-[0.15em] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">schedule</span> Horario de Servicio
                      </h4>
                      <p className="text-[11px] text-on-surface-variant font-medium">Especifique el horario operativo en el que esta organización presta el servicio para la ruta.</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block ml-0.5">Hora Inicio / Apertura *</label>
                          <div className="relative">
                            <input 
                              type="time" 
                              value={r.hora_salida_ida || ''} 
                              onChange={(e) => handleRutaChange(index, 'hora_salida_ida', e.target.value)} 
                              className="w-full bg-surface border border-outline-variant rounded-lg py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-mono"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block ml-0.5">Hora Fin / Cierre *</label>
                          <div className="relative">
                            <input 
                              type="time" 
                              value={r.hora_regreso_ida || ''} 
                              onChange={(e) => handleRutaChange(index, 'hora_regreso_ida', e.target.value)} 
                              className="w-full bg-surface border border-outline-variant rounded-lg py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-mono"
                            />
                          </div>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
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
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2 border-y border-outline-variant/30 mt-1">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-on-surface-variant uppercase opacity-60">Origen / Destino</span>
                          <span className="text-[11px] font-black text-on-surface flex items-center gap-1">
                            {r.municipio_or} <span className="material-symbols-outlined text-[14px] opacity-50">arrow_forward</span> {r.municipio_des}
                          </span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[9px] font-bold text-on-surface-variant uppercase opacity-60">Horario de Servicio</span>
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

      {/* Excel Import Modal */}
      <Modal
        isOpen={isImportOpen}
        onClose={() => {
          if (!importing) {
            setIsImportOpen(false);
            setImportResult(null);
            setImportError(null);
            setImportFile(null);
            setErrorSearch('');
          }
        }}
        title="Importación de Organizaciones Masiva"
        icon="upload_file"
        maxWidthClass="max-w-3xl"
        actions={
          importing ? (
            <div className="flex items-center gap-3 w-full justify-between">
              <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest animate-pulse">
                Procesando transacción atómica...
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black text-primary bg-primary/10 px-3 py-1 rounded-lg">
                  {importProgress}%
                </span>
              </div>
            </div>
          ) : importResult ? (
            <div className="flex gap-4 w-full justify-end">
              <button 
                onClick={handleCopyErrors}
                disabled={!importResult.errors || importResult.errors.length === 0}
                className="px-6 py-2.5 text-xs font-black text-primary hover:bg-primary/10 border border-primary/20 rounded-xl transition-all uppercase tracking-widest flex items-center gap-2 disabled:opacity-30 disabled:pointer-events-none"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                Copiar Reporte
              </button>
              <button 
                onClick={() => {
                  setImportResult(null);
                  setImportFile(null);
                  setErrorSearch('');
                }}
                className="px-6 py-2.5 text-xs font-black text-on-surface-variant hover:bg-surface-container-highest rounded-xl transition-all uppercase tracking-widest border border-outline-variant/30"
              >
                Cargar Otro
              </button>
              <button 
                onClick={() => {
                  setIsImportOpen(false);
                  setImportResult(null);
                  setImportFile(null);
                  setErrorSearch('');
                }}
                className="px-8 py-2.5 text-xs font-black text-on-primary bg-primary hover:bg-primary/90 rounded-xl shadow-md transition-all uppercase tracking-widest active:scale-95 shadow-primary/20"
              >
                Listo
              </button>
            </div>
          ) : importError ? (
            <div className="flex gap-4 w-full justify-end">
              <button 
                onClick={() => {
                  setImportError(null);
                  setImportFile(null);
                }}
                className="px-8 py-2.5 text-xs font-black text-on-primary bg-primary hover:bg-primary/95 transition-all rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-primary/20 active:scale-95"
              >
                Cargar Otro Archivo
              </button>
            </div>
          ) : (
            <div className="flex gap-4 w-full justify-end">
              <button 
                onClick={() => setIsImportOpen(false)} 
                disabled={importing}
                className="px-6 py-2.5 text-xs font-black text-on-surface-variant hover:bg-surface-container-highest rounded-xl transition-all uppercase tracking-widest disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                onClick={handleImportExcel} 
                disabled={!importFile}
                className="px-8 py-2.5 text-xs font-black text-on-primary bg-primary hover:bg-primary/90 rounded-xl shadow-md transition-all uppercase tracking-widest disabled:opacity-50 active:scale-95 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">publish</span>
                <span>Iniciar Importación</span>
              </button>
            </div>
          )
        }
      >
        <div className="space-y-6 py-4 font-public-sans text-on-surface">
          {importing ? (
            /* Premium Pulsing Loader View */
            <div className="text-center py-10 space-y-8 animate-in fade-in duration-300">
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-primary/10"></div>
                <div 
                  className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"
                  style={{ animationDuration: '1.2s' }}
                ></div>
                <div 
                  className="absolute inset-2 rounded-full border-2 border-secondary/15 border-b-secondary border-t-transparent border-r-transparent border-l-transparent animate-spin"
                  style={{ animationDuration: '0.8s', animationDirection: 'reverse' }}
                ></div>
                <span className="material-symbols-outlined text-[48px] text-primary animate-pulse">database</span>
              </div>
              
              <div className="space-y-4 max-w-lg mx-auto">
                <div className="space-y-1">
                  <h5 className="text-base font-black text-primary uppercase tracking-widest">
                    Procesando Registro de Operadoras
                  </h5>
                  <p className="text-xs font-black text-secondary tracking-wider uppercase animate-pulse">
                    {loaderSteps[currentLoaderStep]}
                  </p>
                </div>
                
                {/* Glow progress bar */}
                <div className="relative w-full h-3 bg-surface-container-high rounded-full overflow-hidden border border-outline-variant/30 shadow-inner">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(3,36,72,0.5)]"
                    style={{ width: `${importProgress}%` }}
                  ></div>
                </div>
                
                <p className="text-[11px] text-on-surface-variant/70 font-medium leading-relaxed">
                  Estamos analizando el archivo Excel, cruzando los RIF con el catálogo de gremios y aplicando transacciones atómicas para registrar cada operadora sin pérdida de datos. Por favor, mantenga esta pestaña activa.
                </p>
              </div>
            </div>
          ) : importResult ? (
            /* Success Dashboard View */
            <div className="space-y-6 animate-in zoom-in duration-300">
              <div className="text-center space-y-4 border-b border-outline-variant/30 pb-6">
                <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto shadow-lg shadow-success/10 border border-success/20 animate-in zoom-in duration-500">
                  <span className="material-symbols-outlined text-[44px]">check_circle</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-2xl font-black text-primary tracking-tight">¡Procesamiento Completado!</h4>
                  <p className="text-xs text-on-surface-variant font-medium max-w-md mx-auto">
                    El servidor ha procesado el archivo Excel de forma atómica a nivel de fila de manera exitosa.
                  </p>
                </div>
              </div>

              {/* Bento Grid Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="bg-success/[0.03] border border-success/20 px-5 py-4 rounded-2xl flex flex-col items-center justify-center shadow-sm hover:scale-[1.02] transition-transform">
                  <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center text-success mb-2">
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  </div>
                  <span className="text-[10px] font-black text-success uppercase tracking-widest block mb-1">Creadas</span>
                  <span className="text-3xl font-mono font-black text-success">{importResult.created}</span>
                </div>
                
                <div className="bg-primary/[0.03] border border-primary/20 px-5 py-4 rounded-2xl flex flex-col items-center justify-center shadow-sm hover:scale-[1.02] transition-transform">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                    <span className="material-symbols-outlined text-[18px]">update</span>
                  </div>
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest block mb-1">Actualizadas</span>
                  <span className="text-3xl font-mono font-black text-primary">{importResult.updated}</span>
                </div>

                <div className={`${importResult.errors && importResult.errors.length > 0 ? 'bg-warning/[0.03] border-warning/30 text-warning' : 'bg-surface-container border-outline-variant/30 text-on-surface-variant/40'} border px-5 py-4 rounded-2xl flex flex-col items-center justify-center shadow-sm hover:scale-[1.02] transition-transform`}>
                  <div className={`w-8 h-8 rounded-full ${importResult.errors && importResult.errors.length > 0 ? 'bg-warning/10 text-warning' : 'bg-outline-variant/20'} flex items-center justify-center mb-2`}>
                    <span className="material-symbols-outlined text-[18px]">{importResult.errors && importResult.errors.length > 0 ? 'warning' : 'verified'}</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest block mb-1">Alertas/Omisiones</span>
                  <span className="text-3xl font-mono font-black">{importResult.errors ? importResult.errors.length : 0}</span>
                </div>
              </div>

              {/* Warnings & Omission Details Dashboard */}
              {importResult.errors && importResult.errors.length > 0 && (
                <div className="space-y-3 bg-surface-container/30 border border-outline-variant/30 p-5 rounded-3xl animate-in slide-in-from-bottom-4 duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-warning text-[20px]">warning</span>
                      <span className="text-[11px] font-black text-primary uppercase tracking-widest">
                        Reporte de Alertas ({importResult.errors.length})
                      </span>
                    </div>
                    
                    {/* Inline Search Bar for Errors */}
                    <div className="relative group shrink-0">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[16px] group-focus-within:text-primary transition-colors">search</span>
                      <input 
                        type="text" 
                        value={errorSearch}
                        onChange={(e) => setErrorSearch(e.target.value)}
                        placeholder="Buscar alerta por fila..."
                        className="pl-8 pr-3 py-1.5 bg-surface border border-outline-variant/50 rounded-xl text-[10px] font-bold text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none w-full sm:w-48 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="max-h-48 overflow-y-auto pr-1 space-y-2 scrollbar-thin select-text">
                    {importResult.errors
                      .filter(err => err.toLowerCase().includes(errorSearch.toLowerCase()))
                      .map((err, i) => {
                        const rowMatch = err.match(/^Fila\s+(\d+)\s*:/i) || err.match(/^Error en fila\s+(\d+)\s*:/i);
                        const rowNum = rowMatch ? rowMatch[1] : null;
                        const cleanMsg = rowNum ? err.replace(/^Fila\s+\d+\s*:\s*/i, '').replace(/^Error en fila\s+\d+\s*:\s*/i, '') : err;

                        return (
                          <div key={i} className="flex gap-3 p-3 bg-surface border border-outline-variant/30 rounded-xl items-start hover:border-warning/30 transition-colors">
                            {rowNum ? (
                              <span className="px-2 py-0.5 bg-warning/10 text-warning border border-warning/20 text-[9px] font-black font-mono uppercase tracking-tighter rounded-md mt-0.5 shrink-0">
                                Fila {rowNum}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-warning/10 text-warning border border-warning/20 text-[9px] font-black font-mono uppercase tracking-tighter rounded-md mt-0.5 shrink-0">
                                Info
                              </span>
                            )}
                            <p className="text-[11px] font-medium text-on-surface-variant leading-relaxed">
                              {cleanMsg}
                            </p>
                          </div>
                        );
                      })}
                    {importResult.errors.filter(err => err.toLowerCase().includes(errorSearch.toLowerCase())).length === 0 && (
                      <div className="p-8 text-center text-on-surface-variant/40 text-xs font-bold uppercase tracking-wider">
                        No se encontraron alertas para "{errorSearch}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : importError ? (
            /* Error / Connection Failure Screen */
            <div className="text-center py-6 space-y-6 animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto shadow-lg shadow-error/10 border border-error/20 animate-pulse">
                <span className="material-symbols-outlined text-[44px]">error</span>
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-black text-primary uppercase tracking-wider">Error en la Importación</h4>
                <p className="text-[11px] text-on-surface-variant font-medium max-w-md mx-auto">
                  No se pudo procesar el archivo debido a un conflicto o interrupción del servidor.
                </p>
              </div>

              <div className="bg-error/[0.02] border border-error/15 p-5 rounded-2xl max-w-2xl mx-auto text-left space-y-3 shadow-inner">
                <div className="flex items-center gap-2 text-error">
                  <span className="material-symbols-outlined text-[18px]">terminal</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">Detalle técnico devuelto:</span>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant/50 p-4 rounded-xl max-h-36 overflow-y-auto font-mono text-[10.5px] text-on-surface select-text leading-relaxed whitespace-pre-wrap">
                  {typeof importError === 'object' 
                    ? JSON.stringify(importError, null, 2) 
                    : String(importError)}
                </div>
              </div>

              {/* Troubleshooting Card */}
              <div className="bg-surface-container border border-outline-variant/40 p-5 rounded-2xl max-w-2xl mx-auto text-left space-y-3">
                <h5 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">lightbulb</span>
                  Guía rápida para solucionar el error:
                </h5>
                <ul className="text-[11px] text-on-surface-variant/80 space-y-2 list-inside list-disc font-medium">
                  <li>Compruebe que el libro Excel contenga una pestaña llamada exactamente <strong className="text-primary">"ORGANIZACIONES"</strong>.</li>
                  <li>Asegúrese de que el RIF, Razón Social, y Tipo sean válidos y estén bien formateados.</li>
                  <li>Verifique que no haya celdas con errores de fórmulas rotas en su archivo.</li>
                  <li>Asegúrese de que su servidor esté en línea y su red sea estable.</li>
                </ul>
              </div>
            </div>
          ) : (
            /* Interactive Drag-and-Drop Uploader View */
            <div className="space-y-6 animate-in fade-in duration-300">
               <div className="bg-primary/5 border border-primary/20 p-5 rounded-3xl flex gap-4 shadow-sm">
                  <span className="material-symbols-outlined text-primary text-[28px] shrink-0 mt-0.5">info</span>
                  <div className="space-y-1">
                     <h5 className="text-xs font-black text-primary uppercase tracking-wider">Formato y Estructura Requerida</h5>
                     <p className="text-[11px] text-on-surface-variant/80 font-medium leading-relaxed">
                        El importador analizará únicamente la hoja llamada <strong className="text-primary">"ORGANIZACIONES"</strong>. Las filas se procesarán a partir de la <strong>Fila 8</strong>, buscando columnas clave como RIF, Razón Social, Municipio, Tipo de Organización, Gremio, y Representante Legal.
                     </p>
                  </div>
               </div>

               <div 
                 onDragEnter={handleDrag}
                 onDragOver={handleDrag}
                 onDragLeave={handleDrag}
                 onDrop={handleDrop}
                 className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-[32px] p-12 transition-all duration-300 ${
                   dragActive 
                     ? 'border-primary bg-primary/5 scale-[0.99] shadow-inner shadow-primary/10' 
                     : importFile 
                       ? 'border-success/60 bg-success/[0.02] shadow-sm' 
                       : 'border-outline-variant hover:border-primary/50 hover:bg-surface-container-low/20'
                 }`}
               >
                  <span className={`material-symbols-outlined text-[64px] mb-4 transition-all duration-300 ${importFile ? 'text-success animate-bounce' : dragActive ? 'text-primary scale-110' : 'text-outline-variant'}`}>
                     {importFile ? 'task' : dragActive ? 'downloading' : 'upload_file'}
                  </span>
                  
                  <p className="text-sm text-on-surface font-black text-center max-w-sm overflow-hidden text-ellipsis whitespace-nowrap px-4">
                     {importFile ? importFile.name : dragActive ? "¡Suelta el archivo aquí!" : "Arrastra tu planilla de Excel (.xlsx)"}
                  </p>
                  
                  <p className="text-[10px] text-on-surface-variant/60 font-bold text-center mt-1">
                     {importFile ? `${(importFile.size / 1024).toFixed(1)} KB` : "O selecciona el archivo desde tu explorador"}
                  </p>
                  
                  {!importFile ? (
                    <button
                      type="button"
                      onClick={() => document.getElementById('excel-file-input-org').click()}
                      className="mt-6 px-6 py-2.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm active:scale-95"
                    >
                       Seleccionar Archivo Excel
                    </button>
                  ) : (
                    <div className="flex gap-3 mt-6">
                      <button
                        type="button"
                        onClick={() => document.getElementById('excel-file-input-org').click()}
                        className="px-5 py-2 bg-surface-container-high hover:bg-surface-container-highest text-[10px] font-black uppercase tracking-widest rounded-lg border border-outline-variant transition-all active:scale-95"
                      >
                         Cambiar
                      </button>
                      <button
                        type="button"
                        onClick={() => setImportFile(null)}
                        className="px-5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all active:scale-95"
                      >
                         Quitar
                      </button>
                    </div>
                  )}
                  
                  <input 
                    type="file" 
                    id="excel-file-input-org" 
                    className="hidden" 
                    accept=".xlsx, .xls"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setImportFile(e.target.files[0]);
                        setImportResult(null);
                        setImportError(null);
                      }
                    }}
                  />
               </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Bulk Actions Floating Bar */}
      {selectedRifs.length > 0 && (
        <div className="fixed bottom-6 right-6 z-[1000] bg-slate-900/95 text-white backdrop-blur-md px-6 py-4 rounded-2xl flex items-center gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-slate-800/80 animate-in slide-in-from-bottom-8 duration-300">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px] text-sky-400">check_box</span>
            <span className="text-xs font-black uppercase tracking-wider text-slate-100">
              {selectedRifs.length} {selectedRifs.length === 1 ? 'organización seleccionada' : 'organizaciones seleccionadas'}
            </span>
          </div>
          <div className="w-px h-6 bg-slate-700/50"></div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setBulkDeleteType('selected');
                setBulkConfirmText('');
                setIsBulkDeleteOpen(true);
              }}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:shadow-lg hover:shadow-rose-600/10 active:scale-95 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[14px]">delete</span>
              Eliminar Selección
            </button>
            <button
              onClick={() => {
                setBulkDeleteType('all');
                setBulkConfirmText('');
                setIsBulkDeleteOpen(true);
              }}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white border border-slate-700/60 hover:border-slate-500 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:shadow-lg hover:shadow-slate-800/10 active:scale-95 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[14px]">delete_forever</span>
              Eliminar Todas
            </button>
            <button
              onClick={() => setSelectedRifs([])}
              className="px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
            >
              Desactivar
            </button>
          </div>
        </div>
      )}

      {/* Bulk Delete Safety Confirmation Modal */}
      <Modal
        isOpen={isBulkDeleteOpen}
        onClose={() => {
          if (!deletingBulk) {
            setIsBulkDeleteOpen(false);
            setBulkConfirmText('');
          }
        }}
        title="Confirmación de Seguridad"
        icon="warning"
        maxWidthClass="max-w-md"
        actions={
          <div className="flex gap-3 w-full justify-end">
            <button 
              disabled={deletingBulk}
              onClick={() => {
                setIsBulkDeleteOpen(false);
                setBulkConfirmText('');
              }} 
              className="px-6 py-2.5 text-xs font-black text-on-surface-variant hover:bg-surface-container-highest rounded-xl transition-all uppercase tracking-widest border border-outline-variant/30 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button 
              disabled={deletingBulk || bulkConfirmText.toUpperCase() !== 'ELIMINAR'}
              onClick={handleBulkDelete}
              className="px-8 py-2.5 text-xs font-black text-on-error bg-error hover:bg-error/90 rounded-xl shadow-md transition-all uppercase tracking-widest disabled:opacity-30 disabled:pointer-events-none active:scale-95 flex items-center gap-2"
            >
              {deletingBulk ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Eliminando...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  <span>Confirmar Eliminación</span>
                </>
              )}
            </button>
          </div>
        }
      >
        <div className="space-y-6 py-2 font-public-sans text-on-surface">
          <div className="bg-error/5 border border-error/25 p-5 rounded-2xl flex gap-4 text-error">
            <span className="material-symbols-outlined text-[32px] shrink-0 mt-0.5 animate-pulse">warning</span>
            <div className="space-y-1">
              <h5 className="text-xs font-black uppercase tracking-wider">Operación Altamente Destructiva</h5>
              <p className="text-[11px] text-on-surface-variant/80 font-medium leading-relaxed">
                {bulkDeleteType === 'all' 
                  ? `Está a punto de vaciar por completo la base de datos de las organizaciones. Se eliminarán permanentemente todas las ${organizations.length} organizaciones y todas sus flotas y asignaciones operativas asociadas en cascada.`
                  : `Está a punto de eliminar permanentemente las ${selectedRifs.length} organizaciones seleccionadas y todas sus relaciones operativas en cascada.`}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Escriba "ELIMINAR" para confirmar:</label>
            <input 
              type="text" 
              value={bulkConfirmText} 
              onChange={(e) => setBulkConfirmText(e.target.value)}
              placeholder="ELIMINAR" 
              className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl py-3 px-4 text-sm font-black text-error outline-none focus:ring-4 focus:ring-error/10 transition-all uppercase tracking-widest text-center"
              disabled={deletingBulk}
            />
          </div>
        </div>
      </Modal>

      {/* Premium Floating Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-[3000] animate-in slide-in-from-top-6 fade-in duration-300">
          <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] border backdrop-blur-md max-w-sm ${
            toast.type === 'error'
              ? 'bg-rose-950/95 border-rose-800 text-rose-200 shadow-rose-950/20'
              : toast.type === 'warning'
                ? 'bg-amber-950/95 border-amber-800 text-amber-200 shadow-amber-950/20'
                : 'bg-emerald-950/95 border-emerald-800 text-emerald-200 shadow-emerald-950/20'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              toast.type === 'error' ? 'bg-rose-500/20' : toast.type === 'warning' ? 'bg-amber-500/20' : 'bg-emerald-500/20'
            }`}>
              <span className={`material-symbols-outlined text-[20px] ${
                toast.type === 'error' ? 'text-rose-400' : toast.type === 'warning' ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {toast.type === 'error' ? 'cancel' : toast.type === 'warning' ? 'warning' : 'check_circle'}
              </span>
            </div>
            <div className="flex-1 space-y-0.5 min-w-0">
              <h5 className={`text-[10px] font-black uppercase tracking-widest ${
                toast.type === 'error' ? 'text-rose-300/70' : toast.type === 'warning' ? 'text-amber-300/70' : 'text-emerald-300/70'
              }`}>
                {toast.type === 'error' ? 'Error' : toast.type === 'warning' ? 'Atención' : 'Transacción Exitosa'}
              </h5>
              <p className="text-xs font-bold leading-relaxed text-white break-words">
                {toast.message}
              </p>
            </div>
            <button 
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white transition-colors shrink-0 p-1 rounded-full hover:bg-white/5"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Organizaciones;
