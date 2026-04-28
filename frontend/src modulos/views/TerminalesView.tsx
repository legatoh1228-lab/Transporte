import React, { useState } from 'react';
import { Search, Filter, Plus, Building, MapPin, Settings2 } from 'lucide-react';
import { Modal } from '../components/Modal';

const DUMMY_TERMINALES = [
  { id: '1', name: 'Terminal Central de Maracay', municipality: 'Girardot', type: 'Principal', stations: 45, status: 'Activo' },
  { id: '2', name: 'Terminal de Turmero', municipality: 'Mariño', type: 'Secundario', stations: 12, status: 'Activo' },
  { id: '3', name: 'Terminal de La Victoria', municipality: 'Ribas', type: 'Secundario', stations: 20, status: 'Mantenimiento' },
];

export function TerminalesView() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Registro de Terminales de Transporte</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">Gestión y control de la infraestructura de terminales de pasajeros.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-container text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm"
        >
          <Plus size={18} className="mr-2" />
          Registrar Terminal
        </button>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-outline-variant bg-surface-container-low flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o municipio..." 
              className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2 pl-9 pr-4 text-sm outline-none transition-all"
            />
          </div>
          <button className="w-full sm:w-auto bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center">
            <Filter size={16} className="mr-2 text-on-surface-variant" />
            Filtros
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-on-surface">
            <thead className="bg-surface-container text-xs uppercase text-on-surface-variant font-bold">
              <tr>
                <th className="px-6 py-4">Nombre del Terminal</th>
                <th className="px-6 py-4">Municipio</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Andenes</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {DUMMY_TERMINALES.map((row) => (
                <tr key={row.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4 font-bold flex items-center gap-3">
                    <Building className="text-secondary" size={18} />
                    {row.name}
                  </td>
                  <td className="px-6 py-4">{row.municipality}</td>
                  <td className="px-6 py-4">{row.type}</td>
                  <td className="px-6 py-4">{row.stations}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${row.status === 'Activo' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-error-container text-on-error-container'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-secondary hover:text-primary p-1 rounded hover:bg-surface-container-high transition-colors" title="Configurar">
                      <Settings2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Nuevo Terminal"
        subtitle="Infraestructura de Transporte"
        icon={Building}
        maxWidthClass="max-w-xl"
        actions={
          <>
            <button 
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 border border-outline text-on-surface font-medium rounded-lg hover:bg-surface-container transition-colors"
            >
              Cancelar
            </button>
            <button className="bg-primary hover:bg-primary-container text-white px-5 py-2.5 font-medium rounded-lg transition-colors">
              Guardar Terminal
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-on-surface">Nombre del Terminal <span className="text-error">*</span></label>
            <input type="text" className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2 text-sm outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-on-surface">Municipio <span className="text-error">*</span></label>
            <select className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2 text-sm outline-none cursor-pointer">
              <option>Girardot</option>
              <option>Mariño</option>
              <option>Ribas</option>
              <option>Sucre</option>
            </select>
          </div>
          <div className="flex gap-4">
            <div className="space-y-1.5 flex-1">
              <label className="text-sm font-bold text-on-surface">Tipo de Terminal</label>
              <select className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2 text-sm outline-none cursor-pointer">
                <option>Principal</option>
                <option>Secundario</option>
                <option>Parada de Transferencia</option>
              </select>
            </div>
            <div className="space-y-1.5 flex-1">
              <label className="text-sm font-bold text-on-surface">Cantidad de Andenes</label>
              <input type="number" className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2 text-sm outline-none" defaultValue={0} />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
