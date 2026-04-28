import React, { useState } from 'react';
import { Modal } from '../components/common/Modal';

const DUMMY_ORGS = [
  { id: '1', rif: 'J-31234567-8', name: 'Asociación Civil Los Samanes', type: 'Asociación Civil', municipality: 'Girardot', status: 'Operativa' },
  { id: '2', rif: 'J-40112233-0', name: 'Línea Turmero - Maracay', type: 'Línea Unificada', municipality: 'Mariño', status: 'Operativa' },
  { id: '3', rif: 'J-29887766-5', name: 'Unión Cooperativa Palo Negro', type: 'Cooperativa', municipality: 'Libertador', status: 'Revisión' },
  { id: '4', rif: 'J-50001111-2', name: 'Transporte Público San Mateo', type: 'Empresa Privada', municipality: 'Bolívar', status: 'Suspendida' },
  { id: '5', rif: 'J-31555666-9', name: 'Unión de Conductores El Limón', type: 'Sindicato', municipality: 'MBI', status: 'Operativa' },
];

export default function Organizaciones() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 font-public-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Catastro de Organizaciones</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">Gestión de asociaciones civiles, cooperativas y empresas de transporte</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-container text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm"
        >
          <span className="material-symbols-outlined mr-2 text-[18px]">add</span>
          Registrar Organización
        </button>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-outline-variant bg-surface-container-low flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex flex-1 w-full gap-4 max-w-xl">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
              <input 
                type="text" 
                placeholder="Buscar por RIF o Razón Social..." 
                className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2 pl-9 pr-4 text-sm outline-none transition-all"
              />
            </div>
            <select className="hidden md:block bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-2 text-sm outline-none transition-all cursor-pointer">
              <option value="">Tipo de Entidad</option>
              <option>Asociación Civil</option>
              <option>Cooperativa</option>
              <option>Comunidad</option>
            </select>
          </div>
          <button className="w-full sm:w-auto bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined mr-2 text-[18px] text-on-surface-variant">filter_list</span>
            Más Filtros
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-on-surface">
            <thead className="bg-surface-container text-xs uppercase text-on-surface-variant font-bold">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">RIF</th>
                <th className="px-6 py-4">Razón Social</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Municipio Principal</th>
                <th className="px-6 py-4">Estado Legal</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {DUMMY_ORGS.map((row) => (
                <tr key={row.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4 font-mono font-medium whitespace-nowrap">{row.rif}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                       <span className="material-symbols-outlined mr-2 text-primary-fixed-variant text-[18px]">corporate_fare</span>
                       <span className="font-bold">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-surface-container-high border border-outline-variant text-xs">
                      {row.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">{row.municipality}</td>
                  <td className="px-6 py-4">
                    <OrgStatusBadge status={row.status} />
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
          <span>Mostrando 1 a 5 de 42 organizaciones</span>
          <div className="flex gap-1">
             <button className="px-3 py-1 border border-outline-variant rounded bg-surface-container-lowest text-on-surface disabled:opacity-50" disabled>Ant</button>
             <button className="px-3 py-1 border border-primary bg-primary text-white rounded">1</button>
             <button className="px-3 py-1 border border-outline-variant rounded bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors">2</button>
             <button className="px-3 py-1 border border-outline-variant rounded bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors">3</button>
             <button className="px-3 py-1 border border-outline-variant rounded bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors">Sig</button>
          </div>
        </div>
      </div>

      <CreateOrgModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

function OrgStatusBadge({ status }) {
  let styles = "";
  if (status === 'Operativa') {
    styles = "text-tertiary-container";
  } else if (status === 'Revisión') {
    styles = "text-[#93000a]"; 
  } else if (status === 'Suspendida') {
    styles = "text-error";
  }

  return (
    <span className={`inline-flex items-center font-bold ${styles}`}>
      <span className={`w-2 h-2 rounded-full mr-2 ${status === 'Operativa' ? 'bg-tertiary-container' : status === 'Revisión' ? 'bg-[#93000a]' : 'bg-error'}`}></span>
      {status}
    </span>
  )
}

function CreateOrgModal({ isOpen, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Organización"
      subtitle="Complete los datos para dar de alta a una nueva entidad de transporte"
      icon="corporate_fare"
      maxWidthClass="max-w-3xl"
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
            Guardar Organización
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Col - Identity */}
        <div className="md:col-span-7 space-y-5">
           <div className="flex items-center gap-2 border-b border-outline-variant pb-2">
             <span className="material-symbols-outlined text-primary text-[18px]">shield</span>
             <h3 className="text-sm font-bold text-primary uppercase tracking-wide">Identificación Legal</h3>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-sm font-medium text-on-surface">Número de RIF <span className="text-error">*</span></label>
                <div className="flex">
                   <select className="bg-surface-container-lowest border border-r-0 border-outline-variant rounded-l-lg px-2 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary z-10 w-16 appearance-none cursor-pointer">
                     <option>J</option>
                     <option>G</option>
                     <option>V</option>
                   </select>
                   <input type="text" className="w-full bg-surface-container-lowest border border-outline-variant rounded-r-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary z-0" placeholder="12345678-9" />
                </div>
              </div>
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-sm font-medium text-on-surface">Siglas / Acrónimo</label>
                <input type="text" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Ej. ASO SAMANES" />
              </div>
              <div className="space-y-1.5 col-span-2">
                <label className="text-sm font-medium text-on-surface">Razón Social <span className="text-error">*</span></label>
                <input type="text" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Nombre completo legal" />
              </div>
              <div className="space-y-1.5 col-span-2">
                <label className="text-sm font-medium text-on-surface">Tipo de Organización <span className="text-error">*</span></label>
                <select className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer">
                  <option value="">Seleccione tipo...</option>
                  <option>Asociación Civil</option>
                  <option>Cooperativa</option>
                  <option>Comunidad / Consejo Comunal</option>
                  <option>Empresa Privada</option>
                  <option>Sindicato</option>
                </select>
              </div>
           </div>
        </div>

        {/* Right Col - Location */}
        <div className="md:col-span-5 space-y-5">
           <div className="flex items-center gap-2 border-b border-outline-variant pb-2">
             <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
             <h3 className="text-sm font-bold text-primary uppercase tracking-wide">Dirección Principal</h3>
           </div>

           <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-on-surface">Municipio <span className="text-error">*</span></label>
                <select className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer">
                  <option>Girardot</option>
                  <option>Mario Briceño Iragorry</option>
                  <option>Santiago Mariño</option>
                  <option>Sucre</option>
                  <option>Linares Alcántara</option>
                  <option>Libertador</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-on-surface">Parroquia</label>
                <select className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer">
                  <option>Seleccionar parroquia...</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-on-surface">Dirección Sede Administrativa</label>
                <textarea 
                  rows={3} 
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                  placeholder="Calle, Avenida, Edificio..."
                ></textarea>
              </div>
           </div>
        </div>
      </div>
    </Modal>
  );
}
