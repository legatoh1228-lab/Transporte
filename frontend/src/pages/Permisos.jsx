import React, { useState, useEffect } from 'react';
import api from '../services/api';

const MODULES = ['Organizaciones', 'Vehículos', 'Operadores', 'Rutas', 'Permisos', 'Usuarios', 'Configuración', 'Dashboard'];
const ACTIONS = ['Leer', 'Crear', 'Actualizar', 'Eliminar'];

export default function Permisos() {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchRoles = async () => {
    try {
      const response = await api.get('catalogs/roles/');
      const editableRoles = response.data.filter(r => r.nombre !== 'SUPERADMIN');
      setRoles(editableRoles);
      if (editableRoles.length > 0) {
        setSelectedRole(editableRoles[0]);
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  };

  const fetchPermissions = async (roleId) => {
    try {
      setLoading(true);
      const response = await api.get(`catalogs/permisos-rol/?rol=${roleId}`);
      setPermissions(response.data);
    } catch (err) {
      console.error("Error fetching permissions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      fetchPermissions(selectedRole.id);
    }
  }, [selectedRole]);

  const togglePermission = (module, action) => {
    if (isSuper) return;
    
    setPermissions(prev => {
      const existingIdx = prev.findIndex(p => p.modulo === module && p.accion === action);
      if (existingIdx > -1) {
        const newPerms = [...prev];
        newPerms[existingIdx] = { ...newPerms[existingIdx], permitido: !newPerms[existingIdx].permitido, isDirty: true };
        return newPerms;
      } else {
        return [...prev, { rol: selectedRole.id, modulo: module, accion: action, permitido: true, isDirty: true }];
      }
    });
  };

  const handleSaveAll = async () => {
    const dirtyPerms = permissions.filter(p => p.isDirty);
    if (dirtyPerms.length === 0) return;

    setSaving(true);
    try {
      await Promise.all(dirtyPerms.map(p => {
        if (p.id) {
          return api.put(`catalogs/permisos-rol/${p.id}/`, p);
        } else {
          return api.post('catalogs/permisos-rol/', p);
        }
      }));
      fetchPermissions(selectedRole.id);
    } catch (err) {
      console.error("Error saving permissions:", err);
      alert("Error al guardar algunos permisos.");
    } finally {
      setSaving(false);
    }
  };

  const isGranted = (module, action) => {
    if (selectedRole?.nombre === 'SUPERADMIN') return true; // Always true for Superadmin
    return permissions.find(p => p.modulo === module && p.accion === action)?.permitido || false;
  };

  const isSuper = selectedRole?.nombre === 'SUPERADMIN';
  const hasDirty = permissions.some(p => p.isDirty);

  return (
    <div className="flex flex-col gap-6 font-public-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Matriz de Permisos</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">Configure el acceso granular por módulo y acción para cada rol del sistema.</p>
        </div>
        <div className="flex items-center gap-3">
          {hasDirty && !isSuper && (
            <button 
              onClick={handleSaveAll}
              disabled={saving}
              className="bg-primary text-on-primary px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 animate-in fade-in slide-in-from-right-4"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          )}
          {isSuper && (
            <div className="bg-primary-fixed text-on-primary-fixed px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-primary/20">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span className="text-xs font-bold uppercase tracking-wider">Rol Protegido</span>
            </div>
          )}
        </div>
      </div>

      {/* Role Selection Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 border-b border-outline-variant">
        {roles.map(role => (
          <button
            key={role.id}
            onClick={() => setSelectedRole(role)}
            className={`px-6 py-2 rounded-t-lg text-sm font-bold transition-all whitespace-nowrap ${selectedRole?.id === role.id ? 'bg-primary text-white shadow-md' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'}`}
          >
            {role.nombre}
          </button>
        ))}
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl overflow-hidden relative">
        {saving && (
          <div className="absolute inset-0 bg-surface/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div className="bg-surface-container-high px-4 py-2 rounded-full shadow-lg border border-outline-variant flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-bold text-on-surface">Guardando cambios...</span>
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-on-surface">
            <thead className="bg-surface-container-high text-[11px] uppercase text-on-surface-variant font-bold tracking-wider border-b border-outline-variant">
              <tr>
                <th className="px-6 py-4 w-[250px]">Módulo del Sistema</th>
                {ACTIONS.map(action => (
                  <th key={action} className="px-4 py-4 text-center border-l border-outline-variant/30">
                    {action}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {loading && !isSuper ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-on-surface-variant animate-pulse font-medium">Cargando matriz de acceso...</td>
                </tr>
              ) : (
                MODULES.map((module) => (
                  <tr key={module} className={`hover:bg-surface-container-low/40 transition-colors group ${isSuper ? 'bg-surface-container/10' : ''}`}>
                    <td className="px-6 py-4 border-r border-outline-variant/30">
                      <div className="flex items-center gap-3">
                        <span className={`material-symbols-outlined text-[20px] ${isSuper ? 'text-primary' : 'text-primary/70'}`}>
                          {module === 'Organizaciones' ? 'business' : 
                           module === 'Vehículos' ? 'directions_bus' : 
                           module === 'Operadores' ? 'person' : 
                           module === 'Rutas' ? 'alt_route' : 
                           module === 'Permisos' ? 'key' : 
                           module === 'Usuarios' ? 'manage_accounts' : 
                           module === 'Configuración' ? 'settings' : 'dashboard'}
                        </span>
                        <span className="font-bold text-on-surface group-hover:text-primary transition-colors">{module}</span>
                      </div>
                    </td>
                    {ACTIONS.map(action => {
                      const permObj = permissions.find(p => p.modulo === module && p.accion === action);
                      const granted = permObj?.permitido || false;
                      const isDirty = permObj?.isDirty || false;
                      return (
                        <td key={`${module}-${action}`} className="px-4 py-4 text-center border-r border-outline-variant/30 last:border-r-0 relative">
                          <button
                            onClick={() => togglePermission(module, action)}
                            disabled={isSuper}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-sm mx-auto ${granted ? 'bg-primary text-on-primary ring-2 ring-primary/20' : 'bg-surface-container-high text-transparent hover:bg-surface-variant ring-1 ring-outline-variant/50'} ${isSuper ? 'opacity-90 cursor-default' : 'active:scale-90'}`}
                          >
                            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'wght' 700" }}>
                              {granted ? 'check' : 'close'}
                            </span>
                          </button>
                          {isDirty && (
                            <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]"></div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className={`border rounded-xl p-4 flex gap-3 items-start transition-colors ${isSuper ? 'bg-primary-fixed-dim/20 border-primary/30' : 'bg-primary-container/20 border-primary/20'}`}>
        <span className="material-symbols-outlined text-primary text-[20px]">{isSuper ? 'shield_with_heart' : 'info'}</span>
        <div>
          <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{isSuper ? 'Control de Superusuario' : 'Nota de Seguridad'}</p>
          <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
            {isSuper 
              ? `El rol de SUPERADMIN posee acceso total a todos los módulos por diseño de seguridad del núcleo. Estos permisos no son modificables.`
              : `Los cambios en esta matriz se aplican en tiempo real. Los usuarios con el rol ${selectedRole?.nombre} verán actualizados sus accesos al recargar el sistema.`
            }
          </p>
        </div>
      </div>
    </div>
  );
}
