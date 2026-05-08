import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { usePermissions } from '../hooks/usePermissions';

export default function VisualSettings() {
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission('Configuración', 'Actualizar');

  const [settings, setSettings] = useState({
    nombre_sistema: '',
    logo: null,
    login_bg: null,
    primary_color: '#032448',
    secondary_color: '#f5f5f5'
  });

  const [previews, setPreviews] = useState({
    logo: null,
    login_bg: null
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const logoInputRef = useRef();
  const bgInputRef = useRef();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('catalogs/configuracion-visual/');
      setSettings(response.data);
      setPreviews({
        logo: response.data.logo,
        login_bg: response.data.login_bg
      });
    } catch (error) {
      console.error("Error fetching visual settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setSettings(prev => ({ ...prev, [field]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!canUpdate) return;
    setSaving(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('nombre_sistema', settings.nombre_sistema);
    formData.append('primary_color', settings.primary_color);
    formData.append('secondary_color', settings.secondary_color);

    // Only append files if they are File objects (not URL strings)
    if (settings.logo instanceof File) {
      formData.append('logo', settings.logo);
    }
    if (settings.login_bg instanceof File) {
      formData.append('login_bg', settings.login_bg);
    }

    try {
      // Use the actual ID if available, otherwise default to 1 for singleton
      const id = settings.id || 1;
      await api.patch(`catalogs/configuracion-visual/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage({ type: 'success', text: 'Configuración guardada exitosamente.' });
      setTimeout(() => fetchSettings(), 500); // Small delay to allow DB processing
    } catch (error) {
      console.error("Error saving settings:", error);
      const errorMsg = error.response?.data?.detail || 'Error al guardar la configuración. Verifique que haya ejecutado las migraciones.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-primary animate-pulse">Cargando configuración...</div>;

  return (
    <div className="flex flex-col gap-10 font-public-sans max-w-5xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight">Identidad Visual</h1>
          <p className="text-on-surface-variant font-medium">Personalice el logo, fondo y marca del sistema de transporte.</p>
        </div>
        {canUpdate && (
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-on-primary px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-primary/20 hover:shadow-primary/40 flex items-center gap-3 disabled:opacity-50 active:scale-95"
          >
            <span className="material-symbols-outlined">{saving ? 'sync' : 'save'}</span>
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        )}
      </header>

      {message && (
        <div className={`p-4 rounded-2xl font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'}`}>
          <span className="material-symbols-outlined">{message.type === 'success' ? 'check_circle' : 'error'}</span>
          {message.text}
        </div>
      )}

      {/* Branding Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-surface-container-lowest border border-outline-variant/60 rounded-[32px] p-8 flex flex-col gap-8 shadow-sm">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                 <span className="material-symbols-outlined text-primary">branding_watermark</span>
              </div>
              <h3 className="text-xl font-black text-on-surface">Nombre y Logo</h3>
           </div>

           <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest pl-1">Nombre del Sistema</label>
              <input 
                type="text" 
                value={settings.nombre_sistema}
                onChange={(e) => setSettings({...settings, nombre_sistema: e.target.value})}
                className="bg-surface-container border border-outline-variant/50 rounded-2xl px-5 py-4 text-on-surface font-bold focus:outline-none focus:border-primary transition-all"
                placeholder="Ej: Transporte Aragua Digital"
              />
           </div>

           <div className="flex flex-col gap-4">
              <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest pl-1">Logo Institucional</label>
              <div className="flex flex-col sm:flex-row items-center gap-8 bg-surface-container/30 p-6 rounded-3xl border-2 border-dashed border-outline-variant">
                 <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center p-4 shadow-inner overflow-hidden border border-outline-variant/20">
                    {previews.logo ? (
                      <img src={previews.logo} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <span className="material-symbols-outlined text-[48px] text-outline-variant">image</span>
                    )}
                 </div>
                 <div className="flex-1 flex flex-col gap-3">
                    <p className="text-sm text-on-surface-variant font-medium">Suba el logo oficial para el encabezado y reportes. (PNG recomendado)</p>
                    <button 
                      onClick={() => logoInputRef.current.click()}
                      className="bg-surface-container-highest text-on-surface font-black text-sm px-5 py-2.5 rounded-xl hover:bg-outline-variant transition-colors self-start"
                    >
                      Seleccionar Archivo
                    </button>
                    <input type="file" ref={logoInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'logo')} accept="image/*" />
                 </div>
              </div>
           </div>
        </section>

        {/* Login Background Section */}
        <section className="bg-surface-container-lowest border border-outline-variant/60 rounded-[32px] p-8 flex flex-col gap-8 shadow-sm">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                 <span className="material-symbols-outlined text-secondary">wallpaper</span>
              </div>
              <h3 className="text-xl font-black text-on-surface">Fondo de Inicio</h3>
           </div>

           <div className="flex flex-col gap-4">
              <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest pl-1">Imagen de Fondo (Login)</label>
              <div className="relative group">
                <div 
                  className="w-full h-56 rounded-3xl bg-slate-200 overflow-hidden border border-outline-variant shadow-inner"
                  style={{
                    backgroundImage: previews.login_bg ? `url(${previews.login_bg})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {!previews.login_bg && (
                    <div className="flex flex-col items-center justify-center h-full text-outline-variant">
                      <span className="material-symbols-outlined text-[64px]">landscape</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <button 
                       onClick={() => bgInputRef.current.click()}
                       className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-6 py-3 rounded-2xl font-black hover:bg-white/40 transition-all"
                     >
                        Cambiar Imagen
                     </button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-on-surface-variant font-medium pl-1">
                 Se recomienda una imagen en alta resolución (1920x1080) y tonos oscuros para mayor contraste.
              </p>
              <input type="file" ref={bgInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'login_bg')} accept="image/*" />
           </div>
        </section>
      </div>

      <footer className="bg-primary/5 border border-primary/20 p-8 rounded-[32px] flex items-center gap-6">
         <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary">lightbulb</span>
         </div>
         <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
            <span className="text-primary font-black block mb-1">Nota del Sistema</span>
            Los cambios en la identidad visual se aplican globalmente para todos los usuarios. El logo aparecerá en la barra superior y en el inicio de sesión.
         </p>
      </footer>
    </div>
  );
}
