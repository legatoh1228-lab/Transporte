import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Configuracion() {
  const navigate = useNavigate();
  
  const cards = [
    {
      id: 'permisos',
      title: 'Gestión de Permisos',
      description: 'Configuración de Matriz de Control de Acceso Basado en Roles (RBAC).',
      icon: 'verified_user',
      color: 'text-primary',
      bg: 'bg-primary/10',
      path: '/permisos'
    },
    {
      id: 'catalogos',
      title: 'Catálogos de Sistema',
      description: 'Diccionarios de datos estructurados para el sistema (listas de valores, parámetros).',
      icon: 'inventory_2',
      color: 'text-tertiary',
      bg: 'bg-tertiary/10',
      path: '/catalogos'
    },
    {
      id: 'auditoria',
      title: 'Auditoría de Seguridad',
      description: 'Registro de actividad y trazas del sistema (Syslog) para control de seguridad.',
      icon: 'history_edu',
      color: 'text-error',
      bg: 'bg-error/10',
      path: '/auditoria'
    }
  ];

  return (
    <div className="flex flex-col gap-6 font-public-sans">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Configuración y Seguridad</h1>
        <p className="text-sm text-on-surface-variant font-medium mt-1">Configura las opciones globales de acceso y gestión del sistema de transporte.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          return (
            <div 
              key={card.id}
              onClick={() => navigate(card.path)}
              className="bg-surface-container-lowest border border-outline-variant shadow-sm hover:shadow-md rounded-xl p-6 transition-all cursor-pointer group hover:border-primary/30"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.bg} ${card.color}`}>
                  <span className="material-symbols-outlined text-[24px]">
                    {card.icon}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-outline group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                   <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2 tracking-tight group-hover:text-primary transition-colors">{card.title}</h3>
              <p className="text-sm text-on-surface-variant">{card.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
