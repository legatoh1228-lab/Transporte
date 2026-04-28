/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shell } from './components/Shell';
import { OperadoresView } from './views/OperadoresView';
import { OrganizacionesView } from './views/OrganizacionesView';
import { RutasView } from './views/RutasView';
import { UsuariosView } from './views/UsuariosView';
import { TerminalesView } from './views/TerminalesView';
import { CatalogosView } from './views/CatalogosView';
import { AuditoriaView } from './views/AuditoriaView';
import { PermisosView } from './views/PermisosView';
import { ConfiguracionView } from './views/ConfiguracionView';
import { LayoutDashboard } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('configuracion');

  const renderView = () => {
    switch (currentView) {
      case 'operadores':
        return <OperadoresView />;
      case 'organizaciones':
        return <OrganizacionesView />;
      case 'rutas':
        return <RutasView />;
      case 'usuarios':
        return <UsuariosView />;
      case 'terminales':
        return <TerminalesView />;
      case 'catalogos':
        return <CatalogosView />;
      case 'auditoria':
        return <AuditoriaView />;
      case 'permisos':
        return <PermisosView />;
      case 'configuracion':
        return <ConfiguracionView setCurrentView={setCurrentView} />;
      case 'dashboard':
      case 'vehiculos':
      case 'reportes':
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <div className="w-16 h-16 bg-surface-container rounded-2xl flex items-center justify-center text-primary-fixed-dim mb-4">
              <LayoutDashboard size={32} />
            </div>
            <h2 className="text-xl font-bold text-on-surface">Módulo en Desarrollo</h2>
            <p className="text-on-surface-variant max-w-sm mt-2">
              Esta sección del sistema está actualmente en construcción de acuerdo a los lineamientos de TransAragua.
            </p>
            <button 
              onClick={() => setCurrentView('usuarios')}
              className="mt-6 border border-outline-variant hover:bg-surface-container text-on-surface px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Volver a Usuarios
            </button>
          </div>
        );
    }
  };

  return (
    <div className="font-sans">
      <Shell currentView={currentView} setCurrentView={setCurrentView}>
        {renderView()}
      </Shell>
    </div>
  );
}
