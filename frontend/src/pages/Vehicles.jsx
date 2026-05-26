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

  // Excel Import States
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [currentLoaderStep, setCurrentLoaderStep] = useState(0);
  const [errorSearch, setErrorSearch] = useState('');
  const [toast, setToast] = useState(null); // { message: '', type: 'success' | 'error' | 'warning' }
  
  // Advanced Filter States
  const [filterModalidad, setFilterModalidad] = useState('');
  const [filterCombustible, setFilterCombustible] = useState('');
  const [filterCps, setFilterCps] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Sorting States
  const [sortField, setSortField] = useState('placa'); // 'placa' | 'anio' | 'capacidad' | 'cps'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'

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

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const loaderSteps = [
    "Estableciendo conexión segura y subiendo archivo Excel...",
    "Analizando estructura de columnas e identificando hoja 'REGISTRO FLOTA'...",
    "Procesando registros de la flota y aislando filas de forma atómica...",
    "Comprobando organizaciones asociadas y números de RIF...",
    "Validando números de placa y modalidades activas...",
    "Asociando vehículos bajo sus códigos CPS correspondientes...",
    "Estableciendo transacciones seguras en la base de datos...",
    "Finalizando importación de flota masiva. ¡Casi listo!"
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

  const handleCopyErrors = () => {
    if (!importResult?.errors) return;
    const text = `Reporte de Importación de Flota\nCreados: ${importResult.created}\nActualizados: ${importResult.updated}\n\nErrores/Alertas:\n` + importResult.errors.join('\n');
    navigator.clipboard.writeText(text)
      .then(() => showToast('¡Reporte copiado al portapapeles!', 'success'))
      .catch(err => console.error('Error al copiar:', err));
  };

  // Bulk Selection States
  const [selectedPlacas, setSelectedPlacas] = useState([]);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [bulkDeleteType, setBulkDeleteType] = useState('selected'); // 'selected' | 'all'
  const [bulkConfirmText, setBulkConfirmText] = useState('');
  const [deletingBulk, setDeletingBulk] = useState(false);

  const handleToggleSelect = (placa) => {
    setSelectedPlacas(prev => 
      prev.includes(placa) 
        ? prev.filter(p => p !== placa) 
        : [...prev, placa]
    );
  };

  const handleToggleSelectAllCurrentPage = () => {
    const currentPagePlacas = paginatedData.map(v => v.placa);
    const allSelected = currentPagePlacas.every(p => selectedPlacas.includes(p));
    
    if (allSelected) {
      setSelectedPlacas(prev => prev.filter(p => !currentPagePlacas.includes(p)));
    } else {
      setSelectedPlacas(prev => {
        const newPlacas = currentPagePlacas.filter(p => !prev.includes(p));
        return [...prev, ...newPlacas];
      });
    }
  };

  const handleBulkDelete = async () => {
    if (bulkConfirmText.toUpperCase() !== 'ELIMINAR') return;
    setDeletingBulk(true);
    try {
      const payload = bulkDeleteType === 'all' 
        ? { all: true } 
        : { placas: selectedPlacas };

      const response = await api.post('fleet/vehicles/bulk-delete/', payload);
      
      setSelectedPlacas([]);
      setIsBulkDeleteOpen(false);
      setBulkConfirmText('');
      fetchVehicles();
      showToast(response.data?.message || '¡Unidades eliminadas exitosamente!', 'success');
    } catch (err) {
      console.error("Error in bulk delete:", err);
      showToast(err.response?.data?.error || "Error al realizar la eliminación masiva.", 'error');
    } finally {
      setDeletingBulk(false);
    }
  };

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

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      dragActive || setDragActive(true);
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

  const handleImportExcel = async (e) => {
    e.preventDefault();
    if (!importFile) return;
    setImporting(true);
    setImportError(null);
    setImportResult(null);

    const data = new FormData();
    data.append('file', importFile);

    try {
      const response = await api.post('fleet/vehicles/import-excel/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000 // 2 minutes timeout
      });
      
      setImportProgress(100);
      setTimeout(() => {
        setImportResult(response.data);
        setImporting(false);
        fetchVehicles();
      }, 600);
    } catch (err) {
      console.error("Error importing vehicles:", err);
      setImportError(err.response?.data?.error || "Error al conectar con el servidor para importar la flota.");
      setImporting(false);
    }
  };

  const handleDelete = async (placa) => {
    if (window.confirm(`¿Está seguro de eliminar permanentemente la unidad ${placa}?`)) {
      try {
        await api.delete(`fleet/vehicles/${placa}/`);
        fetchVehicles();
        showToast(`Vehículo ${placa} eliminado correctamente`, 'success');
      } catch (err) {
        console.error("Error deleting vehicle:", err);
        showToast("No se pudo eliminar el vehículo.", 'error');
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

  const filteredVehicles = vehicles.filter(v => {
    // 1. Search term filter
    const matchesSearch = 
      v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.modelo.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Modalidad filter
    const matchesModalidad = filterModalidad === '' || String(v.modalidad) === String(filterModalidad);

    // 3. Combustible filter
    const matchesCombustible = filterCombustible === '' || String(v.combustible) === String(filterCombustible);

    // 4. CPS filter
    let matchesCps = true;
    if (filterCps !== '') {
      if (filterCps === 'SIN_CPS') {
        matchesCps = !v.cps || v.cps.trim() === '' || v.cps === '-';
      } else {
        matchesCps = v.cps && v.cps.toUpperCase().includes(filterCps);
      }
    }

    return matchesSearch && matchesModalidad && matchesCombustible && matchesCps;
  });

  const sortedAndFilteredVehicles = [...filteredVehicles].sort((a, b) => {
    if (!sortField) return 0;

    let valA = a[sortField];
    let valB = b[sortField];

    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = (valB || '').toLowerCase();
    } else {
      valA = valA || 0;
      valB = valB || 0;
    }

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
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
  } = usePagination(sortedAndFilteredVehicles, { itemsPerPage: 10, enableSearch: false, enableFilter: false });

  return (
    <div className={`space-y-6 font-public-sans transition-all duration-300 ${selectedPlacas.length > 0 ? 'pb-32' : 'pb-10'}`}>
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
          {canDelete && vehicles.length > 0 && (
            <button
              onClick={() => {
                const allPlacas = vehicles.map(v => v.placa);
                const allSelected = allPlacas.every(p => selectedPlacas.includes(p));
                if (allSelected) {
                  setSelectedPlacas([]);
                } else {
                  setSelectedPlacas(allPlacas);
                }
              }}
              className={`px-5 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 border ${
                vehicles.length > 0 && vehicles.every(v => selectedPlacas.includes(v.placa))
                  ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                  : 'bg-surface-container-high hover:bg-outline-variant text-on-surface border-outline-variant/30'
              }`}
              title={vehicles.length > 0 && vehicles.every(v => selectedPlacas.includes(v.placa)) ? 'Deseleccionar todas las unidades' : 'Seleccionar todas las unidades de la flota'}
            >
              <span className="material-symbols-outlined text-[18px]">
                {vehicles.length > 0 && vehicles.every(v => selectedPlacas.includes(v.placa)) ? 'check_box' : 'check_box_outline_blank'}
              </span>
              {vehicles.length > 0 && vehicles.every(v => selectedPlacas.includes(v.placa)) ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
            </button>
          )}
          {vehicles.length > 0 && (
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-5 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 border ${
                showAdvancedFilters || filterModalidad || filterCombustible || filterCps
                  ? 'bg-primary text-on-primary border-primary hover:bg-primary/90 shadow-lg shadow-primary/10'
                  : 'bg-surface-container-high hover:bg-outline-variant text-on-surface border-outline-variant/30'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {filterModalidad || filterCombustible || filterCps ? 'filter_alt' : 'filter_list'}
              </span>
              <span>Filtros</span>
              {(filterModalidad || filterCombustible || filterCps) && (
                <span className="w-5 h-5 bg-white text-primary rounded-full flex items-center justify-center text-[10px] font-black shadow-sm">
                  {[filterModalidad, filterCombustible, filterCps].filter(Boolean).length}
                </span>
              )}
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          {canCreate && (
            <>
              <button 
                onClick={() => setIsImportOpen(true)}
                className="px-6 py-3.5 bg-surface-container-highest text-on-surface hover:bg-outline-variant rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">upload_file</span>
                Importar Excel
              </button>
              <button 
                onClick={handleOpenCreate}
                className="px-8 py-3.5 bg-primary text-on-primary rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                Registrar Unidad
              </button>
            </>
          )}
        </div>
      </div>

      {/* Advanced Filters Collapsible Panel */}
      {showAdvancedFilters && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 grid grid-cols-1 sm:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-4 duration-250 shadow-sm">
          {/* Modalidad Filter */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Modalidad de Servicio</label>
            <select
              value={filterModalidad}
              onChange={(e) => setFilterModalidad(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/40 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all cursor-pointer"
            >
              <option value="">Todas las modalidades</option>
              {modalidades.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </div>

          {/* Combustible Filter */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Combustible</label>
            <select
              value={filterCombustible}
              onChange={(e) => setFilterCombustible(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/40 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all cursor-pointer"
            >
              <option value="">Todos los combustibles</option>
              {combustibles.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          {/* Estatus CPS Filter */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">Código CPS</label>
            <select
              value={filterCps}
              onChange={(e) => setFilterCps(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/40 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all cursor-pointer"
            >
              <option value="">Todos los CPS</option>
              <option value="DT9">DT9</option>
              <option value="DT10">DT10</option>
              <option value="SIN_CPS">Sin registro CPS</option>
            </select>
          </div>

          {/* Reset Action */}
          <div className="flex items-end justify-start">
            <button
              onClick={() => {
                setFilterModalidad('');
                setFilterCombustible('');
                setFilterCps('');
                setSearchTerm('');
              }}
              className="px-5 py-3 bg-surface-container-high hover:bg-outline-variant text-on-surface rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all w-full flex items-center justify-center gap-1.5 border border-outline-variant/30 active:scale-95 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
              Restablecer Filtros
            </button>
          </div>
        </div>
      )}

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
                  {canDelete && (
                    <th className="pl-8 pr-4 py-5 w-12 text-center border-b border-outline-variant/50">
                      <label className="flex items-center justify-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={paginatedData.length > 0 && paginatedData.every(v => selectedPlacas.includes(v.placa))}
                          onChange={handleToggleSelectAllCurrentPage}
                          className="w-4.5 h-4.5 rounded border-outline-variant text-primary focus:ring-primary/20 cursor-pointer"
                        />
                      </label>
                    </th>
                  )}
                  <th 
                    onClick={() => handleSort('placa')}
                    className={`${canDelete ? 'pl-4' : 'pl-8'} pr-8 py-5 text-[11px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/50 cursor-pointer select-none group/hdr hover:bg-primary/[0.02] transition-colors w-1/4`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Unidad / Identificación</span>
                      <span className={`material-symbols-outlined text-[16px] transition-all ${
                        sortField === 'placa' ? 'text-primary opacity-100' : 'text-outline-variant opacity-0 group-hover/hdr:opacity-100'
                      }`}>
                        {sortField === 'placa' && sortDirection === 'desc' ? 'arrow_downward' : 'arrow_upward'}
                      </span>
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('anio')}
                    className="px-8 py-5 text-[11px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/50 cursor-pointer select-none group/hdr hover:bg-primary/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Especificaciones</span>
                      <span className={`material-symbols-outlined text-[16px] transition-all ${
                        sortField === 'anio' ? 'text-primary opacity-100' : 'text-outline-variant opacity-0 group-hover/hdr:opacity-100'
                      }`}>
                        {sortField === 'anio' && sortDirection === 'desc' ? 'arrow_downward' : 'arrow_upward'}
                      </span>
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('cps')}
                    className="px-8 py-5 text-[11px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/50 cursor-pointer select-none group/hdr hover:bg-primary/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Modalidad / CPS</span>
                      <span className={`material-symbols-outlined text-[16px] transition-all ${
                        sortField === 'cps' ? 'text-primary opacity-100' : 'text-outline-variant opacity-0 group-hover/hdr:opacity-100'
                      }`}>
                        {sortField === 'cps' && sortDirection === 'desc' ? 'arrow_downward' : 'arrow_upward'}
                      </span>
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('capacidad')}
                    className="px-8 py-5 text-[11px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/50 cursor-pointer select-none group/hdr hover:bg-primary/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Capacidad</span>
                      <span className={`material-symbols-outlined text-[16px] transition-all ${
                        sortField === 'capacidad' ? 'text-primary opacity-100' : 'text-outline-variant opacity-0 group-hover/hdr:opacity-100'
                      }`}>
                        {sortField === 'capacidad' && sortDirection === 'desc' ? 'arrow_downward' : 'arrow_upward'}
                      </span>
                    </div>
                  </th>
                  <th className="px-8 py-5 text-[11px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/50 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {selectedPlacas.length > 0 && (
                  <tr className="bg-primary/[0.03] border-b border-primary/20 animate-in fade-in duration-300">
                    <td colSpan={canDelete ? 6 : 5} className="px-8 py-3 text-center text-xs font-bold text-primary">
                      {selectedPlacas.length === vehicles.length ? (
                        <div className="flex items-center justify-center gap-2">
                          <span>Todas las <strong className="font-black text-primary">{vehicles.length}</strong> unidades de la flota están seleccionadas.</span>
                          <button 
                            type="button"
                            onClick={() => setSelectedPlacas([])} 
                            className="text-error hover:underline font-black uppercase tracking-wider ml-1 text-[10px] bg-error/5 px-3 py-1 rounded-lg border border-error/20 hover:bg-error/10 transition-colors"
                          >
                            Desactivar Selección
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <span>Se han seleccionado <strong className="font-black text-primary">{selectedPlacas.length}</strong> unidades de esta página.</span>
                          <button 
                            type="button"
                            onClick={() => setSelectedPlacas(vehicles.map(v => v.placa))} 
                            className="text-primary hover:underline font-black uppercase tracking-wider ml-1 text-[10px] bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/20 transition-all active:scale-95"
                          >
                            Seleccionar las {vehicles.length} unidades de la flota
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
                {paginatedData.length > 0 ? paginatedData.map((v) => (
                  <tr key={v.placa} className={`hover:bg-primary/[0.02] transition-colors group ${selectedPlacas.includes(v.placa) ? 'bg-primary/[0.01]' : ''}`}>
                    {canDelete && (
                      <td className="pl-8 pr-4 py-5 text-center">
                        <label className="flex items-center justify-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={selectedPlacas.includes(v.placa)}
                            onChange={() => handleToggleSelect(v.placa)}
                            className="w-4.5 h-4.5 rounded border-outline-variant text-primary focus:ring-primary/20 cursor-pointer"
                          />
                        </label>
                      </td>
                    )}
                    <td className={`${canDelete ? 'pl-4' : 'pl-8'} pr-8 py-5`}>
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
                    <td colSpan={canDelete ? 6 : 5} className="px-8 py-20 text-center">
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
        title="Importación de Flota Masiva"
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
                {/* Simulated spinning loader circles */}
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
                    Procesando Flota de Transporte
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
                  Estamos analizando el Excel, comprobando identidades, registrando CPS activos y aislando transacciones de forma atómica para prevenir pérdidas de datos. Por favor, mantenga la pestaña abierta.
                </p>
              </div>
            </div>
          ) : importResult ? (
            /* Gorgeous Success Dashboard View */
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
            /* Gorgeous Full Error / Connection Failure Screen */
            <div className="text-center py-6 space-y-6 animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto shadow-lg shadow-error/10 border border-error/20 animate-pulse">
                <span className="material-symbols-outlined text-[44px]">error</span>
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-black text-primary uppercase tracking-wider">Error en la Importación</h4>
                <p className="text-[11px] text-on-surface-variant font-medium max-w-md mx-auto">
                  No se pudo procesar el archivo de flota debido a un conflicto o interrupción del servidor.
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
                  <li>Compruebe que el libro Excel tenga una pestaña nombrada exactamente <strong className="text-primary">"REGISTRO FLOTA"</strong>.</li>
                  <li>Verifique que no haya celdas con fórmulas rotas o columnas con nombres modificados.</li>
                  <li>El tamaño recomendado de la planilla es de hasta 1,000 registros para evitar sobrecargar los límites.</li>
                  <li>Asegúrese de que el servidor esté encendido y que su conexión de red sea estable.</li>
                </ul>
              </div>
            </div>
          ) : (
            /* Interactive Uploader View */
            <div className="space-y-6 animate-in fade-in duration-300">
               {/* Elegant Header Info Card */}
               <div className="bg-primary/5 border border-primary/20 p-5 rounded-3xl flex gap-4 shadow-sm">
                  <span className="material-symbols-outlined text-primary text-[28px] shrink-0 mt-0.5">info</span>
                  <div className="space-y-1">
                     <h5 className="text-xs font-black text-primary uppercase tracking-wider">Formato y Estructura Requerida</h5>
                     <p className="text-[11px] text-on-surface-variant/80 font-medium leading-relaxed">
                        El importador analizará únicamente la hoja llamada <strong className="text-primary">"REGISTRO FLOTA"</strong>. Las filas se procesarán a partir de la <strong>Fila 8</strong>, buscando columnas técnicas como: Municipio, Empresa/Organización, RIF, Placa, Código CPS (ej. DT9, DT10), y la modalidad (marcada bajo Minibús, Bus, u Otro).
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
                      onClick={() => document.getElementById('excel-file-input').click()}
                      className="mt-6 px-6 py-3 bg-primary text-on-primary hover:bg-primary/95 transition-all rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-primary/20 active:scale-95"
                    >
                       Seleccionar Archivo Excel
                    </button>
                  ) : (
                    <div className="flex gap-3 mt-6">
                      <button
                        type="button"
                        onClick={() => document.getElementById('excel-file-input').click()}
                        className="px-5 py-2.5 bg-surface-container-highest text-on-surface hover:bg-outline-variant transition-colors rounded-xl text-[9px] font-black uppercase tracking-widest border border-outline-variant/30"
                      >
                         Cambiar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImportFile(null);
                          setImportError(null);
                        }}
                        className="px-5 py-2.5 bg-error/10 text-error hover:bg-error/20 transition-colors rounded-xl text-[9px] font-black uppercase tracking-widest border border-error/20"
                      >
                         Eliminar
                      </button>
                    </div>
                  )}
                  
                  <input 
                    id="excel-file-input" 
                    type="file" 
                    accept=".xlsx" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files[0]) {
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
      {selectedPlacas.length > 0 && (
        <div className="fixed bottom-6 right-6 z-[1000] bg-slate-900/95 text-white backdrop-blur-md px-6 py-4 rounded-2xl flex items-center gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-slate-800/80 animate-in slide-in-from-bottom-8 duration-300">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px] text-sky-400">check_box</span>
            <span className="text-xs font-black uppercase tracking-wider text-slate-100">
              {selectedPlacas.length} {selectedPlacas.length === 1 ? 'unidad seleccionada' : 'unidades seleccionadas'}
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
              Eliminar Toda la Flota
            </button>
            <button
              onClick={() => setSelectedPlacas([])}
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
                  ? `Está a punto de vaciar por completo la base de datos de la flota. Se eliminarán permanentemente todas las ${vehicles.length} unidades y sus asignaciones asociadas.`
                  : `Está a punto de eliminar permanentemente las ${selectedPlacas.length} unidades seleccionadas y todas sus relaciones operativas asociadas en cascada.`}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-on-surface-variant font-bold leading-relaxed">
              Esta acción es completamente irreversible. Para confirmar la eliminación de seguridad, por favor escriba la palabra clave <strong className="text-error font-mono">ELIMINAR</strong> a continuación:
            </p>
            <input 
              type="text" 
              value={bulkConfirmText}
              onChange={(e) => setBulkConfirmText(e.target.value)}
              placeholder="Escribe ELIMINAR para confirmar..."
              className="w-full bg-surface-container border border-outline-variant rounded-2xl py-3.5 px-5 text-sm font-mono font-black text-center text-error outline-none focus:border-error focus:ring-4 focus:ring-error/10 uppercase tracking-widest transition-all"
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
              className="text-white/40 hover:text-white transition-colors shrink-0 ml-2"
              title="Cerrar"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;
