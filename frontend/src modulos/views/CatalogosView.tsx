import React, { useState } from 'react';
import { Database, Plus, Tags, MoreVertical } from 'lucide-react';

const DUMMY_CATALOGS = [
  { id: '1', name: 'Tipos de Vehículos', count: 12 },
  { id: '2', name: 'Grados de Licencia', count: 5 },
  { id: '3', name: 'Tipos de Organización', count: 6 },
  { id: '4', name: 'Estados de Trámite', count: 8 },
];

export function CatalogosView() {
  const [activeCatalog, setActiveCatalog] = useState('1');

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Gestión de Catálogos</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">Diccionarios de datos estructurados para el sistema.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Sidebar */}
        <div className="w-full lg:w-1/3 flex flex-col bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl overflow-hidden shrink-0 lg:shrink">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low shrink-0 flex items-center justify-between">
            <h3 className="font-bold text-on-surface text-sm uppercase tracking-wide flex items-center">
              <Database size={16} className="mr-2 text-primary" />
              Listas de Valores
            </h3>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
             {DUMMY_CATALOGS.map((cat) => (
                <div 
                  key={cat.id} 
                  onClick={() => setActiveCatalog(cat.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all flex items-center justify-between ${activeCatalog === cat.id ? 'bg-primary-fixed text-on-primary-fixed' : 'hover:bg-surface-container text-on-surface'}`}
                >
                  <span className="font-semibold text-sm">{cat.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${activeCatalog === cat.id ? 'bg-white/40' : 'bg-surface-container-high'}`}>{cat.count} items</span>
                </div>
             ))}
          </div>
        </div>

        {/* Content */}
        <div className="w-full lg:w-2/3 bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
            <h3 className="font-bold text-on-surface text-sm uppercase tracking-wide flex items-center">
              <Tags size={16} className="mr-2 text-secondary" />
              Valores del Catálogo Seleccionado
            </h3>
            <button className="bg-primary hover:bg-primary-container text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center shadow-sm">
              <Plus size={16} className="mr-1" /> Nuevo Valor
            </button>
          </div>
          
          <div className="flex-1 overflow-auto p-4">
            <table className="w-full text-left text-sm text-on-surface border border-outline-variant rounded-lg overflow-hidden">
              <thead className="bg-surface-container text-xs uppercase text-on-surface-variant font-bold border-b border-outline-variant">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3 w-full">Valor (Descripción)</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3 font-mono text-outline font-bold">0{i}</td>
                    <td className="px-4 py-3 font-medium">Valor de Ejemplo {i}</td>
                    <td className="px-4 py-3">
                      <span className="bg-tertiary-container/30 text-tertiary-container px-2 py-0.5 rounded text-xs font-bold">Activo</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button className="text-on-surface-variant hover:text-primary"><MoreVertical size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
