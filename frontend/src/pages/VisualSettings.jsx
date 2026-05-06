import React, { useState, useEffect } from 'react';
import { uiSettings } from '../config/uiSettings';
import { usePermissions } from '../hooks/usePermissions';



export default function VisualSettings() {
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission('Configuración', 'Actualizar');

  const [loginBg, setLoginBg] = useState('');

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedBg = localStorage.getItem('login_background_url');
    setLoginBg(savedBg || '');
  }, []);

  const handleSave = () => {
    if (!canUpdate) return;
    localStorage.setItem('login_background_url', loginBg);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };


  const handleReset = () => {
    if (!canUpdate) return;
    localStorage.removeItem('login_background_url');
    setLoginBg('');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };


  return (
    <div className="flex flex-col gap-8 font-public-sans max-w-4xl mx-auto">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-on-surface">Configuración de Apariencia</h1>
        <p className="text-on-surface-variant">Personalice los elementos visuales de la interfaz del sistema.</p>
      </header>

      <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-outline-variant bg-surface-container-low">
          <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">wallpaper</span>
            Pantalla de Inicio de Sesión (Login)
          </h3>
        </div>
        
        <div className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-on-surface">URL de la Imagen de Fondo</label>
            <div className="flex gap-3">
              <input 
                type="text" 
                className="flex-1 bg-surface border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-all shadow-inner"
                placeholder="Ej: https://images.unsplash.com/photo..."
                value={loginBg}
                onChange={(e) => setLoginBg(e.target.value)}
              />
               {canUpdate && (
                <button 
                  onClick={handleSave}
                  className="bg-primary hover:bg-primary-container text-on-primary px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center gap-2 transform active:scale-95"
                >
                  <span className="material-symbols-outlined text-[20px]">save</span>
                  Guardar
                </button>
              )}

            </div>
            <p className="text-xs text-on-surface-variant mt-1 italic">
              * Ingrese el URL de una imagen en alta resolución (1920x1080 o superior recomendada).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider">Previsualización</h4>
              <div 
                className="w-full h-48 rounded-2xl bg-slate-200 border border-outline-variant overflow-hidden shadow-inner relative"
                style={{
                  backgroundImage: `url(${loginBg || uiSettings.loginBackground})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-24 h-16 bg-white/20 backdrop-blur-xl border border-white/20 rounded-lg shadow-xl"></div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant flex flex-col gap-4">
               <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                 <span className="material-symbols-outlined text-[20px]">info</span>
                 Opciones de Restauración
               </h4>
               <p className="text-sm text-on-surface-variant leading-relaxed">
                 Si desea volver a la imagen predeterminada (autopista.jpg), puede restablecer la configuración de fábrica.
               </p>
                {canUpdate && (
                  <button 
                    onClick={handleReset}
                    className="self-start text-error font-bold text-sm hover:underline flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                    Restablecer imagen por defecto
                  </button>
                )}

            </div>
          </div>
        </div>

        {saved && (
          <div className="bg-primary text-on-primary p-3 text-center text-sm font-bold animate-in fade-in slide-in-from-bottom-2">
            ¡Configuración guardada exitosamente! Los cambios se verán al cerrar sesión.
          </div>
        )}
      </section>

      <footer className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-4">
        <span className="material-symbols-outlined text-amber-600 mt-0.5">lightbulb</span>
        <div className="flex flex-col gap-1">
          <h5 className="text-sm font-bold text-amber-900">Consejo de Diseño</h5>
          <p className="text-sm text-amber-800">
            Use imágenes oscuras o con poco ruido visual para asegurar que el cuadro de inicio de sesión sea siempre legible.
          </p>
        </div>
      </footer>
    </div>
  );
}
