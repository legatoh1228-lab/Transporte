import React from 'react';

const DUMMY_ROUTES = [
  { id: '1', name: 'Ruta 14 - Terminal / Castaño', type: 'Urbana', distance: '12.5 km', activeUnits: 15 },
  { id: '2', name: 'Ruta 08 - Terminal / Limón', type: 'Urbana', distance: '14.2 km', activeUnits: 22 },
  { id: '3', name: 'Ruta Turmero - Maracay', type: 'Interurbana', distance: '18.0 km', activeUnits: 34 },
  { id: '4', name: 'Ruta Palo Negro - Cagua', type: 'Interurbana', distance: '8.5 km', activeUnits: 12 },
];

export default function Rutas() {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] font-public-sans">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Gestión de Rutas</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">Configuración y rastreo de líneas de servicio</p>
        </div>
        <div className="flex gap-2">
           <button className="bg-surface-container border border-outline-variant text-on-surface px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-surface-container-high">
             Exportar KML
           </button>
           <button className="bg-primary hover:bg-primary-container text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm">
             <span className="material-symbols-outlined mr-2 text-[18px]">map</span>
             Configurar Nueva Ruta
           </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Left List */}
        <div className="w-full lg:w-1/3 flex flex-col bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl overflow-hidden shrink-0 lg:shrink">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low shrink-0 flex items-center justify-between">
            <h3 className="font-bold text-on-surface text-sm uppercase tracking-wide">Rutas Activas</h3>
            <span className="bg-tertiary-container/20 text-tertiary-container text-xs font-bold px-2 py-1 rounded-md">83 Totales</span>
          </div>
          
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
             {DUMMY_ROUTES.map((route, idx) => (
                <div 
                  key={route.id} 
                  className={`p-4 rounded-lg cursor-pointer transition-all border ${idx === 0 ? 'bg-primary-fixed border-primary-fixed-dim/50' : 'bg-surface hover:bg-surface-container border-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                     <h4 className={`font-bold ${idx === 0 ? 'text-on-primary-fixed' : 'text-on-surface'}`}>{route.name}</h4>
                     <button className="text-on-surface-variant hover:text-on-surface p-1">
                       <span className="material-symbols-outlined text-[16px]">more_vert</span>
                     </button>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                     <span className={`px-2 py-0.5 rounded border font-semibold ${idx === 0 ? 'bg-white/40 border-primary-fixed-variant text-on-primary-fixed-variant' : 'bg-surface-container border-outline-variant text-on-surface-variant'}`}>
                       {route.type}
                     </span>
                     <span className="flex items-center text-on-surface-variant">
                       <span className="material-symbols-outlined mr-1 text-[14px]">route</span> {route.distance}
                     </span>
                     <span className="flex items-center text-on-surface-variant">
                       <span className="material-symbols-outlined mr-1 text-[14px]">navigation</span> {route.activeUnits} Unidades
                     </span>
                  </div>
                </div>
             ))}
          </div>
        </div>

        {/* Right Map Placeholder */}
        <div className="w-full lg:w-2/3 bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl overflow-hidden relative min-h-[400px]">
           {/* Map Controls */}
           <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
             <button className="w-10 h-10 bg-surface-container-lowest border border-outline-variant shadow-lg rounded-lg flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors" title="Capas">
               <span className="material-symbols-outlined text-[20px]">layers</span>
             </button>
             <button className="w-10 h-10 bg-surface-container-lowest border border-outline-variant shadow-lg rounded-lg flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors" title="Configurar Vista">
               <span className="material-symbols-outlined text-[20px]">settings</span>
             </button>
             <button className="w-10 h-10 bg-surface-container-lowest border border-outline-variant shadow-lg rounded-lg flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors" title="Pantalla Completa">
               <span className="material-symbols-outlined text-[20px]">fullscreen</span>
             </button>
           </div>
           
           {/* Map Legend Overlay */}
           <div className="absolute bottom-4 left-4 z-10 bg-surface-container-lowest/90 backdrop-blur border border-outline-variant shadow-lg rounded-lg p-4">
             <h4 className="text-xs font-bold text-on-surface uppercase mb-3">Detalles del Trazado</h4>
             <div className="space-y-2">
               <div className="flex items-center gap-2 text-sm text-on-surface-variant font-medium">
                 <span className="w-3 h-3 rounded-full bg-primary border-2 border-white shadow-sm"></span> Inicio (Terminal Central)
               </div>
               <div className="flex items-center gap-2 text-sm text-on-surface-variant font-medium">
                 <span className="w-3 h-3 rounded-full bg-error border-2 border-white shadow-sm"></span> Destino (Castaño)
               </div>
               <div className="flex items-center gap-2 text-sm text-on-surface-variant font-medium">
                 <span className="w-8 h-1 bg-secondary rounded-full"></span> Ruta Principal
               </div>
               <div className="flex items-center gap-2 text-sm text-on-surface-variant font-medium">
                 <span className="w-2 h-2 rounded-full bg-white border border-outline shadow-sm"></span> Paradas (18)
               </div>
             </div>
           </div>

           {/* Conceptual Map Background */}
           <div className="absolute inset-0 bg-[#e8eae6] overflow-hidden">
             {/* Mock map features */}
             <svg className="w-full h-full opacity-60" preserveAspectRatio="none">
               {/* Roads */}
               <path d="M-100,50 Q400,200 800,100 T1200,400" fill="none" stroke="#ffffff" strokeWidth="8" />
               <path d="M-100,60 Q400,210 800,110 T1200,410" fill="none" stroke="#d4d4d4" strokeWidth="6" />
               
               <path d="M200,0 L300,800" fill="none" stroke="#ffffff" strokeWidth="12" />
               <path d="M200,0 L300,800" fill="none" stroke="#e0e0e0" strokeWidth="10" />

               {/* The active route line (Ruta 14) */}
               <path d="M300,300 C400,300 450,150 600,150 S750,300 800,250" fill="none" stroke="#032448" strokeWidth="5" strokeLinecap="round" />
               {/* Outline for the route */}
               <path d="M300,300 C400,300 450,150 600,150 S750,300 800,250" fill="none" stroke="#aec8f4" strokeWidth="2" strokeDasharray="5,5" />
               
               {/* Paradas (Points) */}
               <circle cx="300" cy="300" r="8" fill="#032448" className="animate-pulse" />
               <circle cx="300" cy="300" r="4" fill="#ffffff" />
               
               <circle cx="420" cy="235" r="4" fill="#ffffff" stroke="#032448" strokeWidth="2" />
               <circle cx="500" cy="150" r="4" fill="#ffffff" stroke="#032448" strokeWidth="2" />
               <circle cx="650" cy="205" r="4" fill="#ffffff" stroke="#032448" strokeWidth="2" />
               <circle cx="730" cy="285" r="4" fill="#ffffff" stroke="#032448" strokeWidth="2" />

               <circle cx="800" cy="250" r="8" fill="#ba1a1a" />
               <circle cx="800" cy="250" r="4" fill="#ffffff" />
             </svg>
             <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/50 to-transparent pointer-events-none"></div>
           </div>
        </div>
      </div>
    </div>
  );
}
