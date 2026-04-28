import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  children: React.ReactNode;
  actions: React.ReactNode;
  maxWidthClass?: string;
}

export function Modal({ isOpen, onClose, title, subtitle, icon: Icon, children, actions, maxWidthClass = 'max-w-3xl' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-inverse-surface/60 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className={`bg-surface w-full ${maxWidthClass} rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex flex-col max-h-[90vh] overflow-hidden border border-outline-variant transform transition-all`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container-lowest shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Icon size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-on-surface leading-tight">{title}</h2>
              {subtitle && <p className="text-[13px] text-on-surface-variant font-medium mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 overflow-y-auto bg-surface flex-1">
          {children}
        </div>
        
        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant bg-surface-container-low shrink-0">
          {actions}
        </div>
      </div>
    </div>
  );
}
