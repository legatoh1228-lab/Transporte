import React, { useState } from 'react';
import { Modal } from '../components/common/Modal';

const DUMMY_DATA = [
  { id: '1', cedula: 'V-15.678.901', name: 'Carlos Mendoza', org: 'Línea Turmero - Maracay', license: 'Quinta (5ta)', expire: '12/05/2025', status: 'Activo' },
  { id: '2', cedula: 'V-18.345.678', name: 'José Rodríguez', org: 'Asoc. Civil Los Samanes', license: 'Quinta (5ta)', expire: '30/11/2024', status: 'Por Vencer' },
  { id: '3', cedula: 'V-12.456.789', name: 'Luis Pérez', org: 'Unión Palo Negro', license: 'Cuarta (4ta)', expire: '15/08/2023', status: 'Vencida' },
  { id: '4', cedula: 'V-22.123.456', name: 'Miguel Ángel Silva', org: 'Línea Turmero - Maracay', license: 'Quinta (5ta)', expire: '20/01/2026', status: 'Activo' },
];

export default function Operadores() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 font-public-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Registro de Operadores</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">Administración y control del personal de transporte</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-container text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm"
        >
          <span className="material-symbols-outlined mr-2 text-[18px]">add</span>
          Registrar Operador
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Total Operadores" value="1,245" icon="group" trend="+12" />
        <MetricCard title="Licencias Activas" value="1,080" icon="check_circle" color="text-tertiary-container" />
        <MetricCard title="Próximas a Vencer" value="124" icon="schedule" color="text-secondary-container" />
        <MetricCard title="Licencias Vencidas" value="41" icon="warning" color="text-error" />
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-outline-variant bg-surface-container-low flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
            <input 
              type="text" 
              placeholder="Buscar por cédula o nombre..." 
              className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2 pl-9 pr-4 text-sm outline-none transition-all"
            />
          </div>
          <button className="w-full sm:w-auto bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined mr-2 text-[18px] text-on-surface-variant">filter_list</span>
            Filtros
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-on-surface">
            <thead className="bg-surface-container text-xs uppercase text-on-surface-variant font-bold">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Cédula</th>
                <th className="px-6 py-4">Operador</th>
                <th className="px-6 py-4">Organización a la que Pertenece</th>
                <th className="px-6 py-4">Grado de Licencia</th>
                <th className="px-6 py-4 whitespace-nowrap">Vencimiento</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {DUMMY_DATA.map((row) => (
                <tr key={row.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4 font-medium whitespace-nowrap">{row.cedula}</td>
                  <td className="px-6 py-4 font-bold">{row.name}</td>
                  <td className="px-6 py-4">{row.org}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border border-outline-variant bg-surface-container text-on-surface">
                      {row.license}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.expire}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                       <button className="text-secondary hover:text-secondary-container p-1 rounded hover:bg-secondary-container/10 transition-colors" title="Ver detalles">
                         <span className="material-symbols-outlined text-[20px]">visibility</span>
                       </button>
                       <button className="text-secondary hover:text-secondary-container p-1 rounded hover:bg-secondary-container/10 transition-colors" title="Editar">
                         <span className="material-symbols-outlined text-[20px]">edit</span>
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Dummy */}
        <div className="p-4 border-t border-outline-variant flex items-center justify-between text-sm text-on-surface-variant bg-surface-container-low">
          <span>Mostrando 1 a 4 de 1,245 operadores</span>
          <div className="flex gap-1">
             <button className="px-3 py-1 border border-outline-variant rounded bg-surface-container-lowest text-on-surface disabled:opacity-50" disabled>Ant</button>
             <button className="px-3 py-1 border border-primary bg-primary text-white rounded">1</button>
             <button className="px-3 py-1 border border-outline-variant rounded bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors">2</button>
             <button className="px-3 py-1 border border-outline-variant rounded bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors">Sig</button>
          </div>
        </div>
      </div>

      <OperatorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

function MetricCard({ title, value, icon, color = "text-primary", trend }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm flex items-start gap-4">
      <div className={`p-3 rounded-lg bg-surface-container ${color}`}>
        <span className="material-symbols-outlined text-[24px]">{icon}</span>
      </div>
      <div>
        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">{title}</p>
        <div className="flex items-end gap-2">
          <h4 className="text-2xl font-bold text-on-surface leading-none">{value}</h4>
          {trend && <span className="text-sm font-bold text-tertiary-container">{trend}</span>}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  let styles = "bg-surface-container text-on-surface border-outline-variant";
  if (status === 'Activo') {
    styles = "bg-tertiary-container/10 text-tertiary-container border-tertiary-container/20";
  } else if (status === 'Por Vencer') {
    styles = "bg-[#ffb4ab]/20 text-[#93000a] border-[#ffb4ab]/30"; 
  } else if (status === 'Vencida') {
    styles = "bg-error-container text-on-error-container border-error/20";
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border uppercase tracking-wider ${styles}`}>
      {status}
    </span>
  )
}

function OperatorModal({ isOpen, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Nuevo Operador"
      subtitle="Ingrese los datos personales y de certificación del operador"
      icon="badge"
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
            Guardar Operador
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <h3 className="col-span-full text-sm font-bold text-primary uppercase tracking-wide border-b border-outline-variant pb-2 mb-1">
          Datos Personales
        </h3>
        
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-on-surface">Cédula de Identidad <span className="text-error">*</span></label>
          <input type="text" className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2 text-sm outline-none transition-all" placeholder="V-12345678" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-on-surface">Nombres y Apellidos <span className="text-error">*</span></label>
          <input type="text" className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2 text-sm outline-none transition-all" placeholder="Ej. Juan Pérez" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-on-surface">Teléfono de Contacto</label>
          <input type="text" className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2 text-sm outline-none transition-all" placeholder="0414-0000000" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-on-surface">Dirección Residencial</label>
          <input type="text" className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2 text-sm outline-none transition-all" placeholder="Dirección completa" />
        </div>

        <h3 className="col-span-full text-sm font-bold text-primary uppercase tracking-wide border-b border-outline-variant pb-2 mb-1 mt-4">
          Datos de Certificación
        </h3>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-on-surface">Organización Asignada <span className="text-error">*</span></label>
          <select className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2 text-sm outline-none transition-all appearance-none cursor-pointer">
            <option value="">Seleccione una organización...</option>
            <option>Línea Turmero - Maracay</option>
            <option>Asociación Civil Los Samanes</option>
            <option>Unión Palo Negro</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-on-surface">Grado de Licencia <span className="text-error">*</span></label>
          <select className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2 text-sm outline-none transition-all appearance-none cursor-pointer">
            <option value="">Seleccione grado...</option>
            <option>Tercera (3ra)</option>
            <option>Cuarta (4ta)</option>
            <option>Quinta (5ta)</option>
            <option>Sexta (6ta) (Título Mínimo)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-on-surface">Fecha de Vencimiento de Licencia <span className="text-error">*</span></label>
          <input type="date" className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2 text-sm outline-none transition-all" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-on-surface">Certificado Médico Nro.</label>
          <input type="text" className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2 text-sm outline-none transition-all" placeholder="Ej. 123456" />
        </div>
      </div>
    </Modal>
  );
}
