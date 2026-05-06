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
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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
    revision_tecnica_vence: ''
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
      revision_tecnica_vence: ''
    });
    setIsEditing(false);
    setError(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (vehicle) => {
    setFormData(vehicle);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`fleet/vehicles/${formData.placa}/`, formData);
      } else {
        await api.post('fleet/vehicles/', formData);
      }
      setIsModalOpen(false);
      fetchVehicles();
      resetForm();
    } catch (err) {
      console.error("Error saving vehicle:", err);
      setError("Error al guardar el vehículo. Verifique los datos.");
    }
  };

  const handleDelete = async (placa) => {
    if (window.confirm(`¿Está seguro de eliminar el vehículo ${placa}?`)) {
      try {
        await api.delete(`fleet/vehicles/${placa}/`);
        fetchVehicles();
      } catch (err) {
        console.error("Error deleting vehicle:", err);
        alert("No se pudo eliminar el vehículo.");
      }
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.modelo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-public-sans">
      {/* Header Block */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant pb-4">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface">Registro de Vehículos</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-2xl">Gestione la base de datos de la flota, monitoree el estado operativo y registre nuevas unidades de transporte en el Estado Aragua.</p>
        </div>
      </div>

      {/* Controls Bento Card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col lg:flex-row gap-4 justify-between items-center relative overflow-hidden group shadow-sm">
        <div className="absolute top-0 left-0 w-1 h-full bg-secondary opacity-50 group-hover:opacity-100 transition-opacity"></div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
            <input 
              className="w-full pl-9 pr-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
              placeholder="Placa, marca o modelo..." 
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
              className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-bold text-label-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Nuevo Vehículo
            </button>
          )}
        </div>

      </div>

      {/* Data Table Container */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center text-on-surface-variant font-body-md animate-pulse">Cargando flota institucional...</div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="px-6 py-4 font-label-bold text-label-bold text-on-surface-variant w-[140px]">Placa</th>
                  <th className="px-6 py-4 font-label-bold text-label-bold text-on-surface-variant w-[160px]">Modalidad</th>
                  <th className="px-6 py-4 font-label-bold text-label-bold text-on-surface-variant">Marca / Modelo</th>
                  <th className="px-6 py-4 font-label-bold text-label-bold text-on-surface-variant w-[120px]">Año</th>
                  {(canUpdate || canDelete) && <th className="px-6 py-4 font-label-bold text-label-bold text-on-surface-variant text-right w-[120px]">Acciones</th>}
                </tr>

              </thead>
              <tbody className="divide-y divide-outline-variant/40 bg-surface-container-lowest">
                {filteredVehicles.length > 0 ? filteredVehicles.map((v, i) => (
                  <tr key={v.placa} className={`hover:bg-surface-container-low/60 transition-colors group ${i % 2 !== 0 ? 'bg-surface-container/10' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="font-title-sm text-title-sm text-primary font-bold tracking-wider bg-surface-container py-1 px-2 rounded inline-block border border-outline-variant/50">{v.placa}</div>
                    </td>
                    <td className="px-6 py-4 font-body-sm text-body-sm text-on-surface">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-outline">directions_bus</span>
                        {v.modalidad_nombre || 'No asignada'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-body-sm text-body-sm text-on-surface font-bold">{v.marca}</div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">{v.modelo}</div>
                    </td>
                    <td className="px-6 py-4 font-body-sm text-body-sm text-on-surface">
                      {v.anio}
                    </td>
                    {(canUpdate || canDelete) && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {canUpdate && (
                            <button onClick={() => handleEdit(v)} className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded hover:bg-primary/10">
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                          )}
                          {canDelete && (
                            <button onClick={() => handleDelete(v.placa)} className="p-2 text-on-surface-variant hover:text-error transition-colors rounded hover:bg-error/10">
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    )}

                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="p-10 text-center text-on-surface-variant font-body-sm">No se encontraron vehículos registrados.</td>
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
        title={isEditing ? "Editar Vehículo" : "Registrar Vehículo"}
        subtitle={isEditing ? `Actualizando datos de la unidad ${formData.placa}` : "Ingrese las especificaciones técnicas de la unidad"}
        icon="directions_bus"
        maxWidthClass="max-w-4xl"
        actions={
          <>
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-on-surface hover:bg-surface-variant rounded-lg transition-colors">Cancelar</button>
            <button onClick={handleSubmit} className="px-6 py-2 text-sm font-bold text-on-primary bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-all">
              {isEditing ? "Actualizar Unidad" : "Registrar Unidad"}
            </button>
          </>
        }
      >
        <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant ml-1">Placa</label>
            <input 
              name="placa" value={formData.placa} onChange={handleInputChange} disabled={isEditing}
              placeholder="Ej: AB123CD" className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm focus:border-primary outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant ml-1">Modalidad</label>
            <select 
              name="modalidad" value={formData.modalidad} onChange={handleInputChange}
              className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm focus:border-primary outline-none"
            >
              <option value="">Seleccione...</option>
              {modalidades.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant ml-1">Sub-Modalidad</label>
            <select 
              name="submodalidad" value={formData.submodalidad} onChange={handleInputChange}
              className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm focus:border-primary outline-none"
            >
              <option value="">Seleccione...</option>
              {subModalidades.filter(sm => sm.modalidad == formData.modalidad).map(sm => <option key={sm.id} value={sm.id}>{sm.nombre}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant ml-1">Marca</label>
            <input 
              name="marca" value={formData.marca} onChange={handleInputChange}
              placeholder="Ej: Encava" className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm focus:border-primary outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant ml-1">Modelo</label>
            <input 
              name="modelo" value={formData.modelo} onChange={handleInputChange}
              placeholder="Ej: E-NT610" className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm focus:border-primary outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant ml-1">Año</label>
            <input 
              type="number" name="anio" value={formData.anio} onChange={handleInputChange}
              className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm focus:border-primary outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant ml-1">Transmisión</label>
            <select 
              name="transmision" value={formData.transmision} onChange={handleInputChange}
              className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm focus:border-primary outline-none"
            >
              <option value="">Seleccione...</option>
              {transmisiones.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant ml-1">Combustible</label>
            <select 
              name="combustible" value={formData.combustible} onChange={handleInputChange}
              className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm focus:border-primary outline-none"
            >
              <option value="">Seleccione...</option>
              {combustibles.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant ml-1">Capacidad Sentados</label>
            <input 
              type="number" name="capacidad" value={formData.capacidad} onChange={handleInputChange}
              className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm focus:border-primary outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant ml-1">Vence Seguro</label>
            <input 
              type="date" name="seguro_vence" value={formData.seguro_vence} onChange={handleInputChange}
              className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm focus:border-primary outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface-variant ml-1">Vence Revisión Técnica</label>
            <input 
              type="date" name="revision_tecnica_vence" value={formData.revision_tecnica_vence} onChange={handleInputChange}
              className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 px-3 text-sm focus:border-primary outline-none"
            />
          </div>
          <div className="flex items-center gap-4 md:col-span-1 pt-4 ml-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="aire_acondicionado" checked={formData.aire_acondicionado} onChange={handleInputChange} className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary" />
              <span className="text-xs font-bold text-on-surface-variant">Aire Acond.</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="accesibilidad" checked={formData.accesibilidad} onChange={handleInputChange} className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary" />
              <span className="text-xs font-bold text-on-surface-variant">Accesibilidad</span>
            </label>
          </div>
          {error && <div className="md:col-span-3 text-error text-xs font-bold bg-error-container/10 p-2 rounded border border-error/20">{error}</div>}
        </form>
      </Modal>
    </div>
  );
};

export default Vehicles;
