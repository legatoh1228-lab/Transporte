import React from 'react';

const RouteMap = () => {
  return (
    <div className="-m-container-margin md:-m-8 flex h-[calc(100vh-64px)] overflow-hidden font-public-sans bg-surface-container">
      {/* Left Side Panel: Route Explorer & Filters */}
      <aside className="w-[380px] bg-surface-container-lowest border-r border-outline-variant flex flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.03)] shrink-0">
        {/* Panel Header */}
        <div className="p-6 border-b border-outline-variant shrink-0 bg-surface-container-lowest">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-title-sm text-title-sm text-on-surface">Explorador de Rutas</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Gestión de trayectos geoespaciales</p>
            </div>
            <button aria-label="Add New Route" className="bg-primary hover:bg-primary-fixed-variant text-on-primary rounded flex items-center justify-center p-2 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[20px]">add</span>
            </button>
          </div>
          {/* Filter Area */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="col-span-2 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
              <input className="w-full bg-surface-container-low border border-outline-variant rounded py-2 pl-9 pr-3 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="Buscar por ID o nombre..." type="text"/>
            </div>
            <div className="bg-surface-container-low rounded p-3 border border-outline-variant/50 relative cursor-pointer hover:bg-surface-container transition-colors group">
              <label className="font-label-bold text-label-bold text-on-surface-variant uppercase mb-1 block">Tipo</label>
              <div className="flex items-center justify-between">
                <span className="font-body-sm text-body-sm text-on-surface font-medium">Todos</span>
                <span className="material-symbols-outlined text-[16px] text-outline group-hover:text-on-surface">arrow_drop_down</span>
              </div>
            </div>
            <div className="bg-surface-container-low rounded p-3 border border-outline-variant/50 relative cursor-pointer hover:bg-surface-container transition-colors group">
              <label className="font-label-bold text-label-bold text-on-surface-variant uppercase mb-1 block">Municipio</label>
              <div className="flex items-center justify-between">
                <span className="font-body-sm text-body-sm text-on-surface font-medium">Girardot</span>
                <span className="material-symbols-outlined text-[16px] text-outline group-hover:text-on-surface">arrow_drop_down</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-label-sm text-label-sm flex items-center gap-1 cursor-pointer">
              Urbano <span className="material-symbols-outlined text-[14px]">close</span>
            </span>
            <span className="px-3 py-1 bg-surface-variant text-on-surface-variant rounded-full font-label-sm text-label-sm hover:bg-surface-container-high cursor-pointer transition-colors">
              Suburbano
            </span>
          </div>
        </div>

        {/* Route List */}
        <div className="flex-1 overflow-y-auto bg-surface p-4 flex flex-col gap-3">
          {/* Route Card 1 */}
          <div className="bg-surface-container-lowest rounded-lg border border-primary p-4 shadow-[0_2px_8px_rgba(3,36,72,0.08)] cursor-pointer relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim shrink-0"></span>
                <span className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">RT-042</span>
              </div>
              <span className="bg-primary-container text-on-primary-container px-2 py-0.5 rounded font-label-sm text-label-sm">Urbano</span>
            </div>
            <h3 className="font-title-sm text-title-sm text-on-surface mb-1">Terminal - Las Delicias</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mb-3">
              <span className="material-symbols-outlined text-[14px]">route</span> 14.2 km • 24 paradas
            </p>
            <div className="flex justify-between items-center border-t border-outline-variant/30 pt-3 mt-1">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-surface-container-high border-2 border-surface-container-lowest flex items-center justify-center text-[10px] font-bold text-on-surface">3</div>
                <div className="w-6 h-6 rounded-full bg-surface-container-high border-2 border-surface-container-lowest flex items-center justify-center"><span className="material-symbols-outlined text-[12px] text-on-surface">directions_bus</span></div>
              </div>
              <span className="text-primary font-label-sm text-label-sm hover:underline flex items-center">Detalles <span className="material-symbols-outlined text-[14px] ml-1">chevron_right</span></span>
            </div>
          </div>
          {/* Route Card 2 */}
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-4 hover:border-outline hover:shadow-sm cursor-pointer transition-all">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim shrink-0"></span>
                <span className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">RT-018</span>
              </div>
              <span className="bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded font-label-sm text-label-sm">Suburbano</span>
            </div>
            <h3 className="font-title-sm text-title-sm text-on-surface mb-1">Maracay - Turmero</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mb-3">
              <span className="material-symbols-outlined text-[14px]">route</span> 22.5 km • 18 paradas
            </p>
          </div>
        </div>
      </aside>

      {/* Map Canvas Area */}
      <section className="flex-1 relative bg-surface-dim overflow-hidden flex items-center justify-center">
        {/* Simulated Map Background */}
        <div className="absolute inset-0 z-0 bg-[#e0e4e8]">
          <img 
            alt="Map Background" 
            className="w-full h-full object-cover opacity-40 mix-blend-multiply filter contrast-125 grayscale-[20%]" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDX1cViiHIoNgAVKVza7jGXDqe8eZN2S4N413B594_dwd2AmfwwT3TItdr-1DwBl94KugeDFGLRHcsTsuWB-id_8oFDnqB5VKJ4BtdeYB4oYVtGYIQ5MYVRYxGVlvot2wj2-6Pup71YDe0UPaoH-RtxMLcPKyJJCpTMofsTDggkXnLuONvudaXpAdZ2bW2jCqS7ZOqmqSjE4_bb6eukKlRW87QIwUBPlrUmqM0G-61OdiIVc7IouLr47_EEMvucenZScvpTxQTeHUc" 
          />
        </div>
        
        {/* SVG Routes Layer */}
        <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none" viewBox="0 0 1000 800" preserveAspectRatio="none">
          <path className="opacity-50" d="M 200 600 Q 300 550, 400 650 T 600 500" fill="none" stroke="#74777f" strokeDasharray="8 8" strokeWidth="4"></path>
          <path d="M 800 200 L 700 350 L 550 400 L 450 300" fill="none" stroke="#2f628d" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5"></path>
          <path className="drop-shadow-[0_2px_4px_rgba(3,36,72,0.3)]" d="M 300 250 L 450 300 L 500 450 Q 550 500, 650 480 L 750 600" fill="none" stroke="#032448" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8"></path>
          <path d="M 300 250 L 450 300 L 500 450 Q 550 500, 650 480 L 750 600" fill="none" stroke="#aec8f4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path>
        </svg>

        {/* Map Markers Layer */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          <div className="absolute top-[250px] left-[300px] -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group">
            <div className="w-6 h-6 rounded-full bg-white border-4 border-primary shadow-md flex items-center justify-center relative z-10 transition-transform group-hover:scale-110">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-surface-container-lowest/90 backdrop-blur px-2 py-0.5 rounded shadow-sm border border-outline-variant font-label-bold text-label-bold text-on-surface whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Terminal</div>
          </div>

          <div className="absolute top-[450px] left-[500px] -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer z-30">
            <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping scale-150"></div>
            <div className="w-7 h-7 rounded-full bg-primary border-2 border-white shadow-lg flex items-center justify-center relative z-10">
              <span className="material-symbols-outlined text-[14px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>directions_bus</span>
            </div>
            
            {/* Detail Popup */}
            <div className="absolute top-0 left-full ml-4 -translate-y-1/2 w-[280px] bg-surface-container-lowest rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-outline-variant p-4 flex flex-col pointer-events-auto">
              <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-surface-container-lowest border-l border-b border-outline-variant rotate-45"></div>
              <div className="flex justify-between items-start mb-2 relative z-10">
                <span className="bg-surface-container text-on-surface-variant px-2 py-0.5 rounded font-label-bold text-label-bold text-[10px] uppercase tracking-wider">Parada #04</span>
                <button className="text-outline hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
              <h4 className="font-title-sm text-title-sm text-on-surface leading-tight mb-1 relative z-10">Av. Las Delicias x C. El Milagro</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-4 relative z-10">Zona: Norte Comercial</p>
              <div className="grid grid-cols-2 gap-2 mb-4 relative z-10">
                <div className="bg-surface-container-low p-2 rounded border border-outline-variant/30 flex flex-col">
                  <span className="font-label-sm text-label-sm text-outline mb-0.5">Volumen Est.</span>
                  <span className="font-body-md text-body-md text-on-surface font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-tertiary-fixed-dim">arrow_upward</span> Alto
                  </span>
                </div>
                <div className="bg-surface-container-low p-2 rounded border border-outline-variant/30 flex flex-col">
                  <span className="font-label-sm text-label-sm text-outline mb-0.5">Tiempo Esp.</span>
                  <span className="font-body-md text-body-md text-on-surface font-medium">~8 mins</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Map Controls */}
        <div className="absolute right-6 bottom-6 z-30 flex flex-col gap-4 pointer-events-auto">
          <button className="w-12 h-12 bg-surface-container-lowest rounded-full shadow-lg border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">layers</span>
          </button>
          <div className="bg-surface-container-lowest rounded-lg shadow-lg border border-outline-variant flex flex-col overflow-hidden">
            <button className="w-10 h-10 flex items-center justify-center text-on-surface hover:bg-surface-container-low transition-colors border-b border-outline-variant">
              <span className="material-symbols-outlined">add</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center text-on-surface hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined">remove</span>
            </button>
          </div>
        </div>

        {/* Top Status Badge */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="bg-surface-container-highest/80 backdrop-blur border border-outline-variant px-4 py-2 rounded-full shadow-sm flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary-fixed-dim relative">
              <span className="absolute inset-0 rounded-full bg-tertiary-fixed-dim animate-ping opacity-75"></span>
            </span>
            <span className="font-label-bold text-label-bold text-on-surface uppercase tracking-wider">Tracking en Vivo: 142 Vehículos</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RouteMap;
