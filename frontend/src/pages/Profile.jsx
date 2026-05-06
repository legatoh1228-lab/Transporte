import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { getMediaUrl } from '../utils/helpers';

const Profile = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  
  const [activities, setActivities] = useState([]);
  
  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordError, setPasswordError] = useState('');
  
  const [formData, setFormData] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    email: user.email || '',
    username: user.username || ''
  });
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    getMediaUrl(user.avatar) || `https://ui-avatars.com/api/?name=${user.username || 'Admin'}&background=1f3a5f&color=fff&size=128`
  );


  useEffect(() => {
    fetchActivities();
  }, [user.id]);

  const fetchActivities = async () => {
    if (!user.id) return;
    try {
      const response = await api.get(`users/users/${user.id}/activities/`);
      setActivities(response.data);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  const showToast = (message, isError = false) => {
    setToastMessage({ message, isError });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      username: user.username || ''
    });
    setAvatarPreview(getMediaUrl(user.avatar) || `https://ui-avatars.com/api/?name=${user.username || 'Admin'}&background=1f3a5f&color=fff&size=128`);
    setAvatarFile(null);
  };


  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const data = new FormData();
      data.append('first_name', formData.first_name);
      data.append('last_name', formData.last_name);
      data.append('email', formData.email);
      data.append('username', formData.username);
      if (avatarFile) {
        data.append('avatar', avatarFile);
      }

      const response = await api.patch(`users/users/${user.id}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const updatedUser = response.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setAvatarPreview(getMediaUrl(updatedUser.avatar) || `https://ui-avatars.com/api/?name=${updatedUser.username || 'Admin'}&background=1f3a5f&color=fff&size=128`);
      setIsEditing(false);
      
      // Update TopBar trigger event
      window.dispatchEvent(new Event('storage'));

      showToast('Perfil actualizado correctamente');
      fetchActivities(); // Refresh activities
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast('Error al actualizar el perfil', true);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('Las nuevas contraseñas no coinciden.');
      return;
    }
    if (passwordForm.new_password.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    try {
      await api.post(`users/users/${user.id}/change-password/`, {
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password
      });
      setShowPasswordModal(false);
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
      showToast('Contraseña actualizada correctamente');
      fetchActivities(); // Refresh activities
    } catch (error) {
      console.error("Error changing password:", error);
      setPasswordError(error.response?.data?.error || 'Error al cambiar la contraseña. Verifica tu clave actual.');
    }
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `Hace ${diffInSeconds} segundos`;
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
    return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-public-sans animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-20 right-6 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50 animate-in slide-in-from-right-8 ${toastMessage.isError ? 'bg-error text-white' : 'bg-primary text-white'}`}>
          <span className="material-symbols-outlined">
            {toastMessage.isError ? 'error' : 'check_circle'}
          </span>
          <span className="font-bold text-sm">{toastMessage.message}</span>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
          <div className="bg-surface-container-lowest rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">password</span>
              <h2 className="text-xl font-black text-on-surface">Cambiar Contraseña</h2>
            </div>
            
            {passwordError && (
              <div className="bg-error-container text-on-error-container p-3 rounded-lg text-sm mb-4 flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-outline uppercase ml-1">Contraseña Actual</label>
                <input 
                  type="password" required
                  value={passwordForm.old_password} onChange={(e) => setPasswordForm({...passwordForm, old_password: e.target.value})}
                  className="w-full text-sm font-bold text-on-surface border border-outline-variant rounded-lg px-4 py-2.5 bg-surface-container-low outline-none focus:border-primary focus:ring-1 focus:ring-primary mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-outline uppercase ml-1">Nueva Contraseña</label>
                <input 
                  type="password" required
                  value={passwordForm.new_password} onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                  className="w-full text-sm font-bold text-on-surface border border-outline-variant rounded-lg px-4 py-2.5 bg-surface-container-low outline-none focus:border-primary focus:ring-1 focus:ring-primary mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-outline uppercase ml-1">Confirmar Nueva Contraseña</label>
                <input 
                  type="password" required
                  value={passwordForm.confirm_password} onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                  className="w-full text-sm font-bold text-on-surface border border-outline-variant rounded-lg px-4 py-2.5 bg-surface-container-low outline-none focus:border-primary focus:ring-1 focus:ring-primary mt-1"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 px-4 py-2.5 border border-outline-variant text-on-surface rounded-xl font-bold text-sm hover:bg-surface-container transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors shadow-md">
                  Actualizar Clave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header Profile */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm relative">
        <div className="h-32 bg-primary/10 relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-tertiary-container/20"></div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-12">
            
            {/* Avatar Section */}
            <div className="flex items-end gap-6">
                <div className="w-28 h-28 rounded-2xl bg-white p-1.5 shadow-md border border-outline-variant relative group shrink-0">
                <img 
                    src={avatarPreview} 
                    alt="Avatar" 
                    className="w-full h-full rounded-xl object-cover"
                />
                {isEditing && (
                    <label className="absolute inset-1.5 bg-black/60 text-white flex flex-col items-center justify-center rounded-xl cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                    <span className="material-symbols-outlined text-[28px] mb-1">photo_camera</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Cambiar</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                    </label>
                )}
                </div>
                
                <div className="pb-2">
                    <h1 className="text-3xl font-black text-on-surface">{user.first_name} {user.last_name}</h1>
                    <p className="text-primary font-bold text-sm uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                        {user.rol_nombre || 'Funcionario del Sistema'}
                    </p>
                </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 pb-2">
              {isEditing ? (
                <>
                  <button onClick={handleCancelClick} disabled={isSaving} className="px-6 py-2.5 bg-surface-container border border-outline-variant text-on-surface rounded-xl font-bold text-sm hover:bg-surface-container-high transition-all shadow-sm disabled:opacity-50">
                    Cancelar
                  </button>
                  <button onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-md flex items-center gap-2 disabled:opacity-70">
                    {isSaving ? (
                        <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                    ) : (
                        <span className="material-symbols-outlined text-[18px]">save</span>
                    )}
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </>
              ) : (
                <button onClick={handleEditClick} className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-md flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">edit_square</span>
                  Editar Perfil
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Stats/Badges */}
        <div className="space-y-6">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm relative overflow-hidden">
            {isEditing && <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black text-outline uppercase tracking-widest">Información de Cuenta</h3>
                {isEditing && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase">Modo Edición</span>}
            </div>
            
            <div className="space-y-5">
              {/* Nombres (Only visible in edit mode here) */}
              {isEditing && (
                <div className="space-y-3 pb-3 border-b border-outline-variant/30">
                    <div>
                        <label className="text-[10px] font-bold text-outline uppercase ml-1">Nombres</label>
                        <input 
                            type="text" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                            className="w-full text-sm font-bold text-on-surface border border-outline-variant rounded-lg px-3 py-2 bg-surface-container-lowest outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all mt-1"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-outline uppercase ml-1">Apellidos</label>
                        <input 
                            type="text" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                            className="w-full text-sm font-bold text-on-surface border border-outline-variant rounded-lg px-3 py-2 bg-surface-container-lowest outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all mt-1"
                        />
                    </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary bg-primary/5 p-2.5 rounded-xl">alternate_email</span>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-outline uppercase">Nombre de Usuario</label>
                  {isEditing ? (
                    <input 
                        type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} 
                        className="w-full text-sm font-bold text-on-surface border border-outline-variant rounded-lg px-3 py-1.5 bg-surface-container-lowest outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all mt-0.5" 
                    />
                  ) : (
                    <p className="text-sm font-bold text-on-surface mt-0.5">@{user.username}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary bg-primary/5 p-2.5 rounded-xl">mail</span>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-outline uppercase">Correo Electrónico</label>
                  {isEditing ? (
                    <input 
                        type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} 
                        className="w-full text-sm font-bold text-on-surface border border-outline-variant rounded-lg px-3 py-1.5 bg-surface-container-lowest outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all mt-0.5" 
                    />
                  ) : (
                    <p className="text-sm font-bold text-on-surface mt-0.5">{user.email}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 opacity-70">
                <span className="material-symbols-outlined text-on-surface-variant bg-surface-container p-2.5 rounded-xl">corporate_fare</span>
                <div>
                  <label className="text-[10px] font-bold text-outline uppercase">Organización</label>
                  <p className="text-sm font-bold text-on-surface mt-0.5">{user.org_nombre || 'Sede Central (Aragua)'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-tertiary-container/10 border border-tertiary-container/20 rounded-2xl p-6 shadow-sm">
             <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-tertiary-container">shield_person</span>
                <h3 className="text-xs font-black text-tertiary-container uppercase tracking-widest">Nivel de Acceso</h3>
             </div>
             <p className="text-sm text-on-surface-variant leading-relaxed">
               Usted tiene permisos de <strong className="text-on-surface">{user.rol_nombre || 'Sistema'}</strong>. Puede gestionar registros de flota y supervisar organizaciones autorizadas en la plataforma.
             </p>
          </div>
        </div>

        {/* Right Column: Activity / Settings */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-sm">
            <h3 className="text-xl font-black text-primary mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined">lock</span>
              Seguridad de la Cuenta
            </h3>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-surface-container-low/50 rounded-xl border border-outline-variant/50 hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary shadow-sm shrink-0 border border-outline-variant/30">
                    <span className="material-symbols-outlined">password</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-on-surface">Contraseña de Acceso</h4>
                    <p className="text-xs text-on-surface-variant mt-0.5">Último cambio recientemente. Recomendamos actualizarla periódicamente.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPasswordModal(true)}
                  className="px-5 py-2.5 text-xs font-black text-primary bg-primary/5 hover:bg-primary/10 rounded-xl transition-colors uppercase tracking-widest border border-primary/20 shrink-0"
                >
                    Cambiar Clave
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-surface-container-low/50 rounded-xl border border-outline-variant/50 hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary shadow-sm shrink-0 border border-outline-variant/30">
                    <span className="material-symbols-outlined">phonelink_setup</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-on-surface">Autenticación de 2 Factores</h4>
                    <p className="text-xs text-on-surface-variant mt-0.5">Proteja su cuenta con un código adicional al iniciar sesión.</p>
                  </div>
                </div>
                <button className="px-5 py-2.5 text-xs font-black text-outline bg-surface-container hover:bg-surface-container-high rounded-xl transition-colors uppercase tracking-widest border border-outline-variant shrink-0">
                    Configurar
                </button>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">history</span>
                Actividad Reciente
              </h3>
              <button onClick={fetchActivities} className="text-on-surface-variant hover:text-primary transition-colors flex items-center" title="Actualizar">
                <span className="material-symbols-outlined text-[20px]">refresh</span>
              </button>
            </div>
            
            <div className="space-y-0">
              {activities.length > 0 ? activities.map((activity, index) => (
                <div key={activity.id} className={`flex gap-4 items-start relative ${index !== activities.length - 1 ? 'pb-5' : 'pt-2'}`}>
                  {/* Vertical Line Connector */}
                  {index !== activities.length - 1 && (
                    <div className="absolute left-[7px] top-6 bottom-0 w-px bg-outline-variant/30"></div>
                  )}
                  
                  {/* Dot */}
                  <div className={`w-4 h-4 rounded-full mt-1 shrink-0 relative z-10 ring-4 ring-white ${index === 0 ? 'bg-tertiary-container' : 'bg-outline-variant'}`}></div>
                  
                  {/* Content */}
                  <div>
                    <p className="text-sm font-bold text-on-surface">{activity.action}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span> 
                      {formatRelativeTime(activity.created_at)} 
                      {activity.ip_address && ` • IP: ${activity.ip_address}`}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6">
                  <span className="material-symbols-outlined text-outline-variant text-[48px] mb-2">pending_actions</span>
                  <p className="text-sm font-bold text-on-surface-variant">No hay actividad reciente registrada.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
