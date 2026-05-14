import React, { useState, useEffect } from 'react';
import { Modal } from '../components/common/Modal';
import api from '../services/api';
import { usePermissions } from '../hooks/usePermissions';
import { usePagination } from '../hooks/usePagination';
import { PaginationControls } from '../components/common/PaginationControls';

export default function Usuarios() {
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission('Usuarios', 'Crear');
  const canUpdate = hasPermission('Usuarios', 'Actualizar');
  const canDelete = hasPermission('Usuarios', 'Eliminar');

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // Para editar
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    rol: '',
    org: '',
    password: '',
    is_active: true
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes, orgsRes] = await Promise.all([
        api.get('users/users/'),
        api.get('catalogs/roles/'),
        api.get('organizations/organizations/')
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
      setOrganizations(orgsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (user = null) => {
    if (user) {
      setCurrentUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        rol: user.rol || '',
        org: user.org || '',
        password: '', // No mostrar password
        is_active: user.is_active
      });
    } else {
      setCurrentUser(null);
      setFormData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        rol: '',
        org: '',
        password: '',
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.username || (!currentUser && !formData.password) || !formData.rol) {
      alert("Por favor complete los campos obligatorios (*)");
      return;
    }

    try {
      const payload = {
        ...formData,
        rol: formData.rol || null,
        org: formData.org || null,
        // Si estamos editando y el password está vacío, lo quitamos del payload
        ...(currentUser && !formData.password ? { password: undefined } : {})
      };

      if (currentUser) {
        // Edit
        await api.put(`users/users/${currentUser.id}/`, payload);
      } else {
        // Create
        await api.post('users/users/', payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving user:", error.response?.data || error);
      const msg = error.response?.data ? JSON.stringify(error.response.data) : "Error desconocido";
      alert(`Error al guardar usuario: ${msg}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Está seguro de eliminar este usuario?")) {
      try {
        await api.delete(`users/users/${id}/`);
        fetchData();
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const filteredUsers = users.filter(u => 
    (u.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.username || '').toLowerCase().includes(searchTerm.toLowerCase())
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
  } = usePagination(filteredUsers, { itemsPerPage: 10, enableSearch: false, enableFilter: false });

  return (
    <div className="flex flex-col gap-6 font-public-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface mb-1">Administración de Usuarios</h1>
          <p className="text-sm text-on-surface-variant font-medium">Gestione las cuentas y roles de los funcionarios del sistema.</p>
        </div>
        {canCreate && (
          <button 
            onClick={() => handleOpenModal()}
            className="bg-primary hover:bg-primary-container text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm"
          >
            <span className="material-symbols-outlined mr-2 text-[18px]">person_add</span>
            Crear Nuevo Usuario
          </button>
        )}

      </div>

      <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-outline-variant bg-surface-container-low flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
            <input 
              type="text" 
              placeholder="Buscar por nombre o correo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary rounded-lg py-2 pl-9 pr-4 text-sm outline-none transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center text-on-surface-variant">Cargando usuarios...</div>
          ) : (
            <table className="w-full text-left text-sm text-on-surface">
              <thead className="bg-surface-container text-xs uppercase text-on-surface-variant font-bold">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Usuario</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4">Organización</th>
                   <th className="px-6 py-4">Estado</th>
                  {(canUpdate || canDelete) && <th className="px-6 py-4 text-right">Acciones</th>}
                </tr>

              </thead>
              <tbody className="divide-y divide-outline-variant">
                {paginatedData.map((row) => (
                  <tr key={row.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-fixed-dim text-on-primary-fixed-variant flex items-center justify-center font-bold text-xs shrink-0">
                          {row.username.substring(0,2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-on-surface">{row.first_name} {row.last_name}</div>
                          <div className="text-xs text-on-surface-variant">{row.email}</div>
                          <div className="text-[10px] text-outline">@{row.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <RoleBadge role={row.rol_nombre || 'Sin Rol'} />
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      {row.org_nombre || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={row.is_active ? 'Activo' : 'Inactivo'} />
                    </td>
                    {(canUpdate || canDelete) && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {canUpdate && (
                            <button 
                              onClick={() => handleOpenModal(row)}
                              className="text-on-surface-variant hover:text-primary p-1 rounded-full hover:bg-surface-container-high transition-colors" title="Editar"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                          )}
                          {canDelete && (
                            <button 
                              onClick={() => handleDelete(row.id)}
                              className="text-on-surface-variant hover:text-error p-1 rounded-full hover:bg-surface-container-high transition-colors" title="Eliminar"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    )}

                  </tr>
                ))}
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
            totalItems={users.length}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            onPageChange={goToPage}
            onNextPage={nextPage}
            onPrevPage={prevPage}
          />
        </div>
      </div>

      {/* Modal CRUD */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentUser ? "Editar Usuario" : "Crear Nuevo Usuario"}
        subtitle="Complete los datos del funcionario para el acceso al sistema"
        icon={currentUser ? "edit_square" : "person_add"}
        maxWidthClass="max-w-2xl"
        actions={
          <>
            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 border border-outline text-on-surface font-medium rounded-lg hover:bg-surface-container transition-colors">Cancelar</button>
            <button onClick={handleSave} className="bg-primary hover:bg-primary-container text-white px-5 py-2.5 font-medium rounded-lg transition-colors shadow-sm">Guardar Cambios</button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5 col-span-2">
            <label className="text-sm font-bold text-on-surface">Nombre de Usuario <span className="text-error">*</span></label>
            <input 
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none" placeholder="ej: jpererz" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-on-surface">Nombre</label>
            <input 
              value={formData.first_name}
              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none" placeholder="Juan" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-on-surface">Apellido</label>
            <input 
              value={formData.last_name}
              onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none" placeholder="Pérez" 
            />
          </div>
          <div className="space-y-1.5 col-span-2">
            <label className="text-sm font-bold text-on-surface">Correo Electrónico</label>
            <input 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none" placeholder="correo@ejemplo.com" 
            />
          </div>
          <div className="space-y-1.5 col-span-2">
            <label className="text-sm font-bold text-on-surface">
              {currentUser ? "Nueva Contraseña" : "Contraseña"} 
              {!currentUser && <span className="text-error"> *</span>}
              {currentUser && <span className="text-xs font-normal text-on-surface-variant ml-2">(Deje en blanco para mantener la actual)</span>}
            </label>
            <input 
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none" placeholder="••••••••" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-on-surface">Rol <span className="text-error">*</span></label>
            <select 
              value={formData.rol}
              onChange={(e) => setFormData({...formData, rol: e.target.value})}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none"
            >
              <option value="">Seleccione...</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-on-surface">Organización</label>
            <select 
              value={formData.org}
              onChange={(e) => setFormData({...formData, org: e.target.value})}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none"
            >
              <option value="">Ninguna (Ente Central)</option>
              {organizations.map(o => <option key={o.rif} value={o.rif}>{o.razon_social}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input 
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              id="is_active"
            />
            <label htmlFor="is_active" className="text-sm font-bold text-on-surface">Usuario Activo</label>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function RoleBadge({ role }) {
  let styles = "bg-surface-variant text-on-surface-variant border border-outline-variant";
  if (role.toLowerCase().includes('admin')) styles = "bg-primary-fixed text-on-primary-fixed";
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${styles}`}>{role}</span>;
}

function StatusBadge({ status }) {
  const active = status === 'Activo';
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${active ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-error-container text-on-error-container'}`}>
      {status}
    </span>
  );
}
