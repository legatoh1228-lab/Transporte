import React, { useState } from 'react';
import { Search, Filter, UserPlus, Edit2, ShieldAlert } from 'lucide-react';
import { Modal } from '../components/Modal';

const DUMMY_USERS = [
  { id: '1', initials: 'CM', name: 'Carlos Mendoza', email: 'cmendoza@transporte.aragua.gob.ve', role: 'Super Admin', status: 'Activo', lastAccess: 'Hoy, 08:30 AM' },
  { id: '2', initials: 'AR', name: 'Ana Rodríguez', email: 'arodriguez@transporte.aragua.gob.ve', role: 'Consultor', status: 'Activo', lastAccess: 'Ayer, 16:45 PM' },
  { id: '3', initials: 'LV', name: 'Luis Vargas', email: 'lvargas@transporte.aragua.gob.ve', role: 'Operador', status: 'Inactivo', lastAccess: '12/10/2023' },
  { id: '4', initials: 'MP', name: 'María Pérez', email: 'mperez@transporte.aragua.gob.ve', role: 'Consultor', status: 'Activo', lastAccess: 'Hoy, 09:15 AM' },
];

export function UsuariosView() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface mb-1">Administración de Usuarios</h1>
          <p className="text-sm text-on-surface-variant font-medium">Gestione las cuentas y roles de los funcionarios del sistema.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-container text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm"
        >
          <UserPlus size={18} className="mr-2" />
          Crear Nuevo Usuario
        </button>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-outline-variant bg-surface-container-low flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o correo..." 
              className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2 pl-9 pr-4 text-sm outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select className="bg-surface-container-lowest w-full sm:w-auto border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-2 text-sm outline-none transition-all cursor-pointer">
              <option value="">Todos los Roles</option>
              <option>Super Admin</option>
              <option>Consultor</option>
              <option>Operador</option>
            </select>
            <button className="bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:bg-surface-variant px-3 py-2 rounded-lg transition-colors flex items-center justify-center">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-on-surface">
            <thead className="bg-surface-container text-xs uppercase text-on-surface-variant font-bold">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Usuario</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Último Acceso</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {DUMMY_USERS.map((row) => (
                <tr key={row.id} className="hover:bg-surface-container-low transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-fixed-dim text-on-primary-fixed-variant flex items-center justify-center font-bold text-xs shrink-0">
                        {row.initials}
                      </div>
                      <div>
                        <div className="font-bold text-on-surface">{row.name}</div>
                        <div className="text-xs text-on-surface-variant">{row.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <RoleBadge role={row.role} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">
                    {row.lastAccess}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-on-surface-variant hover:text-primary p-1 rounded-full hover:bg-surface-container-high transition-colors opacity-0 group-hover:opacity-100" title="Editar">
                      <Edit2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Dummy */}
        <div className="p-4 border-t border-outline-variant flex items-center justify-between text-sm text-on-surface-variant bg-surface-container-lowest">
          <span>Mostrando 1 - 4 de 24 usuarios</span>
          <div className="flex gap-1">
             <button className="px-3 py-1 border border-outline-variant rounded bg-surface-container-lowest text-on-surface disabled:opacity-50" disabled>Ant</button>
             <button className="px-3 py-1 border border-primary bg-primary text-white rounded">1</button>
             <button className="px-3 py-1 border border-outline-variant rounded bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors">2</button>
             <button className="px-3 py-1 border border-outline-variant rounded bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors">3</button>
             <button className="px-3 py-1 border border-outline-variant rounded bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors">Sig</button>
          </div>
        </div>
      </div>

      <CreateUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  let styles = "";
  if (role === 'Super Admin') {
    styles = "bg-primary-fixed text-on-primary-fixed";
  } else if (role === 'Consultor') {
    styles = "bg-secondary-fixed text-on-secondary-fixed";
  } else if (role === 'Operador') {
    styles = "bg-surface-variant text-on-surface-variant border border-outline-variant";
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${styles}`}>
      {role}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  let styles = "";
  if (status === 'Activo') {
    styles = "bg-tertiary-fixed text-on-tertiary-fixed font-bold";
  } else {
    styles = "bg-error-container text-on-error-container font-bold";
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs ${styles}`}>
      {status}
    </span>
  )
}

function CreateUserModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Crear Nuevo Usuario"
      subtitle="Ingrese los datos para registrar un nuevo funcionario en el sistema"
      icon={UserPlus}
      maxWidthClass="max-w-2xl"
      actions={
        <>
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 border border-outline text-on-surface font-medium rounded-lg hover:bg-surface-container transition-colors"
          >
            Cancelar
          </button>
          <button 
            className="w-full sm:w-auto bg-primary hover:bg-primary-container text-white px-5 py-2.5 font-medium rounded-lg transition-colors shadow-sm"
          >
            Guardar Usuario
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-bold text-on-surface">Nombre Completo <span className="text-error">*</span></label>
          <input type="text" className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2 text-sm outline-none transition-all" placeholder="Ej. Juan Pérez" />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-bold text-on-surface">Correo Electrónico <span className="text-error">*</span></label>
          <input type="email" className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2 text-sm outline-none transition-all" placeholder="usuario@transporte.aragua.gob.ve" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-on-surface">Rol del Sistema <span className="text-error">*</span></label>
          <select className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2 text-sm outline-none transition-all appearance-none cursor-pointer">
            <option value="">Seleccione rol...</option>
            <option>Super Admin</option>
            <option>Consultor</option>
            <option>Operador</option>
            <option>Auditor</option>
          </select>
        </div>
        
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-on-surface">Estado Inicial <span className="text-error">*</span></label>
          <select className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2 text-sm outline-none transition-all appearance-none cursor-pointer">
            <option>Activo</option>
            <option>Inactivo</option>
            <option>Bloqueado</option>
          </select>
        </div>
        
        <div className="md:col-span-2 mt-2 bg-primary-fixed/30 border border-primary-fixed text-on-surface-variant p-4 rounded-lg flex gap-3 text-sm">
           <ShieldAlert className="text-primary mt-0.5 shrink-0" size={18} />
           <p>
             Una contraseña temporal será generada y enviada al correo electrónico proporcionado. El usuario deberá cambiarla en su primer inicio de sesión.
           </p>
        </div>
      </div>
    </Modal>
  );
}
