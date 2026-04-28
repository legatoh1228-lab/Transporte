import React from 'react';

const ROLES = ['Super Admin', 'Consultor', 'Operador', 'Auditor'];
const PERMISSIONS = [
  { module: 'Organizaciones', actions: ['Crear', 'Leer', 'Actualizar', 'Eliminar'] },
  { module: 'Terminales', actions: ['Crear', 'Leer', 'Actualizar', 'Eliminar'] },
  { module: 'Rutas', actions: ['Crear', 'Leer', 'Actualizar', 'Eliminar'] },
  { module: 'Usuarios', actions: ['Crear', 'Leer', 'Actualizar', 'Eliminar'] },
  { module: 'Configuraciones', actions: ['Crear', 'Leer', 'Actualizar', 'Eliminar'] },
];

export default function Permisos() {
  return (
    <div className="flex flex-col gap-6 font-public-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Gestión de Permisos</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">Configuración de Matriz de Control de Acceso Basado en Roles (RBAC).</p>
        </div>
        <button className="bg-primary hover:bg-primary-container text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm">
          <span className="material-symbols-outlined mr-2 text-[18px]">key</span>
          Crear Nuevo Rol
        </button>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-on-surface">
            <thead className="bg-surface-container text-xs uppercase text-on-surface-variant font-bold border-b border-outline-variant">
              <tr>
                <th className="px-6 py-4 w-1/4">Módulo / Acción</th>
                {ROLES.map(role => (
                  <th key={role} className="px-4 py-4 text-center border-l border-outline-variant">
                    <div className="flex flex-col items-center gap-2">
                       <span className={`material-symbols-outlined text-[18px] ${role === 'Super Admin' ? 'text-primary' : 'text-outline'}`}>
                         shield
                       </span>
                       {role}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {PERMISSIONS.map((group) => (
                <React.Fragment key={group.module}>
                  <tr className="bg-surface-container-low">
                    <td colSpan={ROLES.length + 1} className="px-6 py-2 font-bold text-primary text-xs uppercase tracking-wider">
                      {group.module}
                    </td>
                  </tr>
                  {group.actions.map(action => (
                    <tr key={`${group.module}-${action}`} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="px-6 py-3 pl-10 font-medium text-on-surface-variant border-r border-outline-variant">
                        {action}
                      </td>
                      {ROLES.map(role => {
                        // Dummy logic for checkboxes
                        const isGranted = role === 'Super Admin' || (action === 'Leer' && role !== 'Auditor') || (role === 'Auditor' && action === 'Leer');
                        return (
                          <td key={`${group.module}-${action}-${role}`} className="px-4 py-3 text-center border-r border-outline-variant">
                            <label className="inline-flex cursor-pointer">
                              <input type="checkbox" className="hidden" checked={isGranted} readOnly />
                              <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${isGranted ? 'bg-primary text-white' : 'bg-surface-container-high text-transparent hover:bg-outline-variant'}`}>
                                {isGranted && <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'wght' 700" }}>check</span>}
                              </div>
                            </label>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
