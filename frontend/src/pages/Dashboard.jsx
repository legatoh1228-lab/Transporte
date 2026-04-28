import React from 'react';

const Dashboard = () => {
  return (
    <div className="space-y-8 font-public-sans">
      {/* Page Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-display-lg text-display-lg text-primary mb-2">Vista General de la Plataforma</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Panel de control centralizado para la red de transporte de Aragua.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="bg-surface-container-lowest border border-outline-variant text-primary font-label-bold text-label-bold px-4 py-2.5 rounded flex items-center gap-2 hover:bg-surface-container-low transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">add_business</span>
            Nueva Org.
          </button>
          <button className="bg-primary text-on-primary font-label-bold text-label-bold px-4 py-2.5 rounded flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">directions_bus</span>
            Registrar Vehículo
          </button>
        </div>
      </div>

      {/* Bento Grid: Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col hover:bg-surface-container-low/50 transition-colors shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-on-surface-variant">
            <span className="material-symbols-outlined text-secondary bg-secondary-fixed p-2 rounded-lg" style={{ fontVariationSettings: "'FILL' 1" }}>corporate_fare</span>
            <h3 className="font-title-sm text-title-sm">Organizaciones</h3>
          </div>
          <div className="mt-auto">
            <div className="font-display-lg text-display-lg text-primary text-[36px]">142</div>
            <div className="flex items-center gap-1 mt-1 text-tertiary font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              <span>+3 esta semana</span>
            </div>
          </div>
        </div>
        {/* Card 2 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col hover:bg-surface-container-low/50 transition-colors shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-on-surface-variant">
            <span className="material-symbols-outlined text-secondary bg-secondary-fixed p-2 rounded-lg" style={{ fontVariationSettings: "'FILL' 1" }}>directions_bus</span>
            <h3 className="font-title-sm text-title-sm">Vehículos Registrados</h3>
          </div>
          <div className="mt-auto">
            <div className="font-display-lg text-display-lg text-primary text-[36px]">3,450</div>
            <div className="flex items-center gap-1 mt-1 text-tertiary font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              <span>+24 este mes</span>
            </div>
          </div>
        </div>
        {/* Card 3 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col hover:bg-surface-container-low/50 transition-colors shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-on-surface-variant">
            <span className="material-symbols-outlined text-secondary bg-secondary-fixed p-2 rounded-lg" style={{ fontVariationSettings: "'FILL' 1" }}>person_pin</span>
            <h3 className="font-title-sm text-title-sm">Operadores Activos</h3>
          </div>
          <div className="mt-auto">
            <div className="font-display-lg text-display-lg text-primary text-[36px]">2,891</div>
            <div className="flex items-center gap-1 mt-1 text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px]">sync</span>
              <span>Verificaciones pendientes: 12</span>
            </div>
          </div>
        </div>
        {/* Card 4 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col hover:bg-surface-container-low/50 transition-colors relative overflow-hidden shadow-sm">
          <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
            <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>alt_route</span>
          </div>
          <div className="flex items-center gap-3 mb-4 text-on-surface-variant relative z-10">
            <span className="material-symbols-outlined text-secondary bg-secondary-fixed p-2 rounded-lg" style={{ fontVariationSettings: "'FILL' 1" }}>alt_route</span>
            <h3 className="font-title-sm text-title-sm">Rutas Activas</h3>
          </div>
          <div className="mt-auto relative z-10">
            <div className="font-display-lg text-display-lg text-primary text-[36px]">85</div>
            <div className="flex items-center gap-1 mt-1 text-on-surface-variant font-label-sm text-label-sm">
              <span>Cubriendo 18 municipios</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid: Secondary Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline-md text-headline-md text-primary">Distribución de Flota por Modalidad</h3>
            <button className="text-secondary hover:text-primary transition-colors">
              <span className="material-symbols-outlined">more_horiz</span>
            </button>
          </div>
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div className="space-y-4">
              {/* Bar 1 */}
              <div>
                <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant mb-1">
                  <span>Autobús Urbano</span>
                  <span className="font-bold text-primary">60%</span>
                </div>
                <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              {/* Bar 2 */}
              <div>
                <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant mb-1">
                  <span>Taxi (Tráfico/Libre)</span>
                  <span className="font-bold text-primary">25%</span>
                </div>
                <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
              {/* Bar 3 */}
              <div>
                <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant mb-1">
                  <span>Mototaxi</span>
                  <span className="font-bold text-primary">10%</span>
                </div>
                <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary-fixed-dim rounded-full" style={{ width: '10%' }}></div>
                </div>
              </div>
              {/* Bar 4 */}
              <div>
                <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant mb-1">
                  <span>Carga / Transporte pesado</span>
                  <span className="font-bold text-primary">5%</span>
                </div>
                <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-primary-fixed-dim rounded-full" style={{ width: '5%' }}></div>
                </div>
              </div>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-outline-variant/30">
              <div className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
                <div className="w-3 h-3 rounded-full bg-primary"></div> Total: 2,070 Unidades
              </div>
              <div className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
                <div className="w-3 h-3 rounded-full bg-secondary"></div> Total: 862 Unidades
              </div>
            </div>
          </div>
        </div>

        {/* Action Required / Alerts Column */}
        <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              <h3 className="font-headline-md text-headline-md text-primary">Acciones Requeridas</h3>
            </div>
            <span className="bg-error-container text-on-error-container font-label-bold text-label-bold px-2 py-0.5 rounded-full text-[10px]">3 Nuevas</span>
          </div>
          <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
            {/* Alert Item 1 */}
            <div className="p-4 bg-error-container/10 border border-error-container/30 rounded-lg flex items-start gap-3">
              <span className="material-symbols-outlined text-error mt-0.5">assignment_late</span>
              <div>
                <h4 className="font-title-sm text-title-sm text-on-error-container text-[14px]">Seguros por Vencer</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 text-[13px]">Coop. La Pastora (5 unidades) vence en 48 horas.</p>
                <button className="mt-2 text-primary font-label-bold text-label-bold text-[11px] uppercase tracking-wider hover:underline">Revisar Detalles</button>
              </div>
            </div>
            {/* Alert Item 2 */}
            <div className="p-4 bg-surface-container border border-outline-variant/50 rounded-lg flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary mt-0.5">badge</span>
              <div>
                <h4 className="font-title-sm text-title-sm text-primary text-[14px]">Licencias Vencidas</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 text-[13px]">12 operadores en Maracay tienen licencias de conducir vencidas.</p>
                <button className="mt-2 text-primary font-label-bold text-label-bold text-[11px] uppercase tracking-wider hover:underline">Ver Operadores</button>
              </div>
            </div>
            {/* Alert Item 3 */}
            <div className="p-4 bg-surface-container border border-outline-variant/50 rounded-lg flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary mt-0.5">gavel</span>
              <div>
                <h4 className="font-title-sm text-title-sm text-primary text-[14px]">Pendiente Aprobación de Org.</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 text-[13px]">"Transporte Unido C.A." envió documentos de registro.</p>
                <button className="mt-2 text-primary font-label-bold text-label-bold text-[11px] uppercase tracking-wider hover:underline">Procesar Solicitud</button>
              </div>
            </div>
          </div>
          <button className="w-full mt-4 py-2 text-center text-secondary font-label-bold text-label-bold border border-outline-variant rounded hover:bg-surface-container-low transition-colors">
            Ver Todas las Alertas
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
