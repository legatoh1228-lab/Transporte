import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { usePermissions } from '../hooks/usePermissions';


const FLOTA_ASIGNACION = { id: 'flota', name: 'Vehículos Activos', icon: 'directions_car' };

const SYSTEM_CATALOGS = [
  { id: 'modalidades', name: 'Modalidades Vehiculares', endpoint: 'catalogs/modalidades/', icon: 'category' },
  { id: 'submodalidades', name: 'Sub-Modalidades', endpoint: 'catalogs/submodalidades/', icon: 'account_tree', parentField: 'modalidad', parentEndpoint: 'catalogs/modalidades/', parentLabel: 'Modalidad Padre' },
  { id: 'combustibles', name: 'Tipos de Combustible', endpoint: 'catalogs/combustibles/', icon: 'local_gas_station' },
  { id: 'transmisiones', name: 'Sistemas de Transmisión', endpoint: 'catalogs/transmisiones/', icon: 'settings_applications' },
  { id: 'tipos-ruta', name: 'Clasificación de Rutas', endpoint: 'catalogs/tipos-ruta/', icon: 'alt_route' },
  { id: 'vias', name: 'Tipos de Vías', endpoint: 'catalogs/vias/', icon: 'add_road' },
  { id: 'tipos-organizacion', name: 'Tipos de Organización', endpoint: 'catalogs/tipos-organizacion/', icon: 'corporate_fare' },
  { id: 'ejes', name: 'Ejes Territoriales', endpoint: 'catalogs/ejes/', icon: 'map', hasColor: true },
  { id: 'municipios', name: 'Municipios', endpoint: 'catalogs/municipios/', icon: 'location_city', parentField: 'eje', parentEndpoint: 'catalogs/ejes/', parentLabel: 'Eje Territorial' },
];

export default function Catalogos() {
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission('Configuración', 'Actualizar');
  const canCreate = hasPermission('Configuración', 'Crear');
  const canDelete = hasPermission('Configuración', 'Eliminar');

  const [activeCatalog, setActiveCatalog] = useState('flota');

  const [vehiculos, setVehiculos] = useState([]);
  const [operadores, setOperadores] = useState([]);
  const [catalogData, setCatalogData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({});
  const [parentOptions, setParentOptions] = useState([]);

  useEffect(() => {
    if (activeCatalog === 'flota') {
      fetchFlotaData();
    } else {
      fetchCatalogData(activeCatalog);
    }
  }, [activeCatalog]);

  const fetchFlotaData = async () => {
    setLoading(true);
    try {
      const [resVehiculos, resOperadores] = await Promise.all([
        api.get('fleet/vehicles/'),
        api.get('personnel/operators/')
      ]);
      setVehiculos(resVehiculos.data);
      setOperadores(resOperadores.data);
    } catch (error) {
      console.error("Error fetching fleet data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalogData = async (catId) => {
    setLoading(true);
    const cat = SYSTEM_CATALOGS.find(c => c.id === catId);
    if (cat) {
      try {
        const res = await api.get(cat.endpoint);
        setCatalogData(res.data);
      } catch (error) {
        console.error(`Error fetching catalog ${catId}:`, error);
        setCatalogData([]);
      }
    }
    setLoading(false);
  };

  const handleAssignOperator = async (vehiculoPlaca, operadorCedula) => {
    setSavingId(vehiculoPlaca);
    try {
      if (operadorCedula) {
        await api.post('fleet/vehiculo-operadores/', {
          vehiculo: vehiculoPlaca,
          operador: operadorCedula,
          estatus: 'Activo'
        });
      }
      await fetchFlotaData();
    } catch (error) {
      console.error("Error asigando operador:", error);
      alert("Error al asignar el operador");
    } finally {
      setSavingId(null);
    }
  };

  const openModal = async (mode, item = null) => {
    setModalMode(mode);
    setFormData(mode === 'edit' ? { ...item } : { nombre: '' });
    
    const cat = SYSTEM_CATALOGS.find(c => c.id === activeCatalog);
    if (cat?.parentEndpoint) {
      try {
        const res = await api.get(cat.parentEndpoint);
        setParentOptions(res.data);
      } catch (err) {
        console.error("Error loading parent options", err);
      }
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({});
    setParentOptions([]);
  };

  const handleSaveCatalog = async (e) => {
    e.preventDefault();
    const cat = SYSTEM_CATALOGS.find(c => c.id === activeCatalog);
    if (!cat) return;
    
    try {
      if (modalMode === 'add') {
        await api.post(cat.endpoint, formData);
      } else {
        await api.put(`${cat.endpoint}${formData.id}/`, formData);
      }
      closeModal();
      fetchCatalogData(activeCatalog);
    } catch (error) {
      console.error("Error saving catalog item:", error);
      alert("Error al guardar el registro.");
    }
  };

  const handleDeleteCatalog = async (item) => {
    const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar "${item.nombre || item.id}"? Esta acción no se puede deshacer.`);
    if (!confirmDelete) return;

    const cat = SYSTEM_CATALOGS.find(c => c.id === activeCatalog);
    if (!cat) return;

    try {
      await api.delete(`${cat.endpoint}${item.id}/`);
      fetchCatalogData(activeCatalog);
    } catch (error) {
      console.error("Error deleting catalog item:", error);
      alert("No se puede eliminar porque está en uso por otros registros.");
    }
  };

  const renderContent = () => {
    if (activeCatalog === 'flota') {
      return (
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="text-center py-10 text-on-surface-variant animate-pulse">Cargando flota...</div>
          ) : (
            <table className="w-full text-left text-sm text-on-surface border border-outline-variant rounded-lg overflow-hidden">
              <thead className="bg-surface-container text-xs uppercase text-on-surface-variant font-bold border-b border-outline-variant">
                <tr>
                  <th className="px-4 py-3">Vehículo</th>
                  <th className="px-4 py-3">Datos Importantes</th>
                  <th className="px-4 py-3 text-center">Estatus</th>
                  <th className="px-4 py-3 w-1/3">Operador Asignado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {vehiculos.length === 0 ? (
                  <tr><td colSpan="4" className="px-4 py-6 text-center text-on-surface-variant">No hay vehículos registrados.</td></tr>
                ) : (
                  vehiculos.map((v) => {
                    const isAssigned = !!v.operador_asignado;
                    return (
                      <tr key={v.placa} className="hover:bg-surface-container-low transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-mono text-primary font-bold">{v.placa}</div>
                          <div className="font-medium text-xs">{v.marca} {v.modelo} <span className="text-outline">({v.anio})</span></div>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <div className="text-on-surface-variant font-semibold">{v.modalidad_nombre}</div>
                          <div className="text-outline">Capacidad: {v.capacidad} pax</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${isAssigned ? 'bg-primary/20 text-primary' : 'bg-error/20 text-error'}`}>
                            {isAssigned ? 'Activo (Operativo)' : 'Inactivo (En Base)'}
                          </span>
                        </td>
                        <td className="px-4 py-3 relative">
                          <select 
                            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-1.5 px-3 text-sm outline-none focus:border-primary disabled:opacity-50"
                            value={v.operador_asignado?.cedula || ""}
                            disabled={savingId === v.placa || !canUpdate}
                            onChange={(e) => handleAssignOperator(v.placa, e.target.value)}

                          >
                            <option value="">-- Sin Asignar --</option>
                            {operadores.map(op => (
                              <option key={op.cedula} value={op.cedula}>
                                {op.nombres} {op.apellidos}
                              </option>
                            ))}
                          </select>
                          {savingId === v.placa && (
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-[16px] animate-spin text-primary">sync</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      );
    }

    // Generic Catalog Content
    return (
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="text-center py-10 text-on-surface-variant animate-pulse">Cargando diccionario...</div>
        ) : (
          <table className="w-full text-left text-sm text-on-surface border border-outline-variant rounded-lg overflow-hidden">
            <thead className="bg-surface-container text-xs uppercase text-on-surface-variant font-bold border-b border-outline-variant">
              <tr>
                <th className="px-4 py-3 w-16">ID</th>
                 <th className="px-4 py-3">Nombre / Valor</th>
                <th className="px-4 py-3 w-1/3">Información Extra</th>
                {(canUpdate || canDelete) && <th className="px-4 py-3 w-24 text-center">Acciones</th>}
              </tr>

            </thead>
            <tbody className="divide-y divide-outline-variant">
              {catalogData.length === 0 ? (
                <tr><td colSpan="4" className="px-4 py-6 text-center text-on-surface-variant">No hay registros en este diccionario.</td></tr>
              ) : (
                catalogData.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3 font-mono text-outline font-bold">{item.id}</td>
                    <td className="px-4 py-3 font-medium text-on-surface">
                      {item.nombre || item.razon_social || 'N/A'}
                      {item.color_hex && (
                        <span className="inline-block w-3 h-3 rounded-full ml-2 align-middle border border-outline-variant" style={{ backgroundColor: item.color_hex }}></span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant">
                      {item.modalidad_nombre && <div>Padre: <span className="font-semibold text-primary">{item.modalidad_nombre}</span></div>}
                      {item.eje_nombre && <div>Eje: <span className="font-semibold text-primary">{item.eje_nombre}</span></div>}
                    </td>
                     {(canUpdate || canDelete) && (
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {canUpdate && (
                            <button onClick={() => openModal('edit', item)} className="text-on-surface-variant hover:text-primary transition-colors" title="Editar">
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                          )}
                          {canDelete && (
                            <button onClick={() => handleDeleteCatalog(item)} className="text-on-surface-variant hover:text-error transition-colors" title="Eliminar">
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    )}

                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] font-public-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Gestión Operativa</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">Asignación de flota y administración de parámetros.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Sidebar */}
        <div className="w-full lg:w-1/3 flex flex-col bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl overflow-hidden shrink-0 lg:shrink">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low shrink-0 flex items-center justify-between">
            <h3 className="font-bold text-on-surface text-sm uppercase tracking-wide flex items-center">
              <span className="material-symbols-outlined mr-2 text-primary text-[18px]">database</span>
              Categorías
            </h3>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-4">
             <div>
                <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 ml-2">Operaciones</h4>
                <div 
                  onClick={() => setActiveCatalog('flota')}
                  className={`p-3 rounded-lg cursor-pointer transition-all flex items-center justify-between ${activeCatalog === 'flota' ? 'bg-primary-fixed text-on-primary-fixed' : 'hover:bg-surface-container text-on-surface'}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">{FLOTA_ASIGNACION.icon}</span>
                    <span className="font-semibold text-sm">{FLOTA_ASIGNACION.name}</span>
                  </div>
                  {activeCatalog === 'flota' && !loading && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/40 text-on-primary-fixed font-bold">
                      {vehiculos.length}
                    </span>
                  )}
                </div>
             </div>

             <div>
                <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 ml-2">Diccionarios del Sistema</h4>
                <div className="space-y-1">
                  {SYSTEM_CATALOGS.map((cat) => (
                    <div 
                      key={cat.id} 
                      onClick={() => setActiveCatalog(cat.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-all flex items-center justify-between ${activeCatalog === cat.id ? 'bg-primary-fixed text-on-primary-fixed' : 'hover:bg-surface-container text-on-surface'}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                        <span className="font-semibold text-sm">{cat.name}</span>
                      </div>
                      {activeCatalog === cat.id && !loading && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/40 text-on-primary-fixed font-bold">
                          {catalogData.length}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>

        {/* Content */}
        <div className="w-full lg:w-2/3 bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
            <h3 className="font-bold text-on-surface text-sm uppercase tracking-wide flex items-center">
              <span className="material-symbols-outlined mr-2 text-secondary text-[18px]">sell</span>
              {activeCatalog === 'flota' ? FLOTA_ASIGNACION.name : SYSTEM_CATALOGS.find(c => c.id === activeCatalog)?.name}
            </h3>
             {activeCatalog !== 'flota' && canCreate && (
              <button onClick={() => openModal('add')} className="bg-primary hover:bg-primary-container text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center shadow-sm">
                <span className="material-symbols-outlined mr-1 text-[18px]">add</span> Nuevo Valor
              </button>
            )}

          </div>
          
          {renderContent()}
        </div>
      </div>

      {/* Dynamic Modal for Catalog items */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h3 className="font-bold text-lg text-on-surface">
                {modalMode === 'add' ? 'Agregar Nuevo Registro' : 'Editar Registro'}
              </h3>
              <button onClick={closeModal} className="text-on-surface-variant hover:text-error transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveCatalog} className="p-4 flex flex-col gap-4">
              
              {/* If catalog has a parent (e.g. SubModalidad needs Modalidad) */}
              {SYSTEM_CATALOGS.find(c => c.id === activeCatalog)?.parentField && (
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-1">
                    {SYSTEM_CATALOGS.find(c => c.id === activeCatalog).parentLabel} *
                  </label>
                  <select 
                    required
                    className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container-lowest focus:border-primary outline-none"
                    value={formData[SYSTEM_CATALOGS.find(c => c.id === activeCatalog).parentField] || ""}
                    onChange={(e) => setFormData({ ...formData, [SYSTEM_CATALOGS.find(c => c.id === activeCatalog).parentField]: e.target.value })}
                  >
                    <option value="">-- Seleccionar --</option>
                    {parentOptions.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.nombre}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Standard Nombre field */}
              <div>
                <label className="block text-sm font-bold text-on-surface mb-1">Nombre *</label>
                <input 
                  type="text" 
                  required
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container-lowest focus:border-primary outline-none"
                  value={formData.nombre || ''}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej. Urbano, Interurbano..."
                />
              </div>

              {/* Extra field specifically for Ejes (color_hex) */}
              {SYSTEM_CATALOGS.find(c => c.id === activeCatalog)?.hasColor && (
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-1">Color Identificador (HEX)</label>
                  <div className="flex gap-2">
                    <input 
                      type="color" 
                      className="w-10 h-10 border-0 rounded cursor-pointer"
                      value={formData.color_hex || '#000000'}
                      onChange={(e) => setFormData({ ...formData, color_hex: e.target.value })}
                    />
                    <input 
                      type="text" 
                      className="flex-1 border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container-lowest focus:border-primary outline-none font-mono"
                      value={formData.color_hex || '#000000'}
                      onChange={(e) => setFormData({ ...formData, color_hex: e.target.value })}
                      placeholder="#000000"
                    />
                  </div>
                </div>
              )}

              <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-primary-container rounded-lg shadow transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

