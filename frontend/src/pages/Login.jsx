import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import logoBlanco from '../assets/images/logo gob blanco.jpg';
import { uiSettings } from '../config/uiSettings';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bgImage, setBgImage] = useState(uiSettings.loginBackground);
  const [logo, setLogo] = useState(null);
  const [systemName, setSystemName] = useState('Transporte Aragua Digital');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVisualSettings = async () => {
      try {
        const response = await api.get('catalogs/configuracion-visual/');
        if (response.data.login_bg) {
          setBgImage(response.data.login_bg);
        }
        if (response.data.logo) {
          setLogo(response.data.logo);
        }
        if (response.data.nombre_sistema) {
          setSystemName(response.data.nombre_sistema);
        }
      } catch (err) {
        console.error('Error fetching visual settings:', err);
      }
    };
    fetchVisualSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('users/login/', {
        username: username,
        password: password
      });

      console.log('Login exitoso:', response.data);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      console.error('Error de login:', err);
      setError(err.response?.data?.error || 'Credenciales inválidas o error de servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex w-full min-h-screen font-public-sans relative overflow-hidden items-center justify-center bg-[#0a0f1a]">
      {/* Background Image with optimized rendering */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000 scale-105 animate-pulse-slow"
        style={{
          backgroundImage: `url(${bgImage})`,
          filter: 'brightness(0.4) contrast(1.2)'
        }}
      ></div>

      {/* Modern Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1a]/95 via-[#0a0f1a]/80 to-primary/40 z-1 mix-blend-multiply"></div>
      
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>

      <section className="relative z-10 w-full max-w-[480px] px-6 flex flex-col items-center">
        
        <header className="flex flex-col items-center mb-10 text-center animate-in fade-in slide-in-from-top-10 duration-1000 w-full">
          {/* Logo Container with Intense Glow and size increase */}
          <div className="relative mb-8 group cursor-default">
            <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-3xl flex items-center justify-center relative z-10 p-2 transform group-hover:scale-105 transition-transform duration-500">
              {logo ? (
                <img src={logo} alt="Logo Sistema" className="w-full h-full object-contain filter drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]" />
              ) : (
                <img src={logoBlanco} alt="Logo Gobernación" className="w-full h-full object-contain filter drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]" />
              )}
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-sky-300 drop-shadow-xl mb-3">
            {systemName}
          </h1>
          <p className="text-sky-200/70 text-sm md:text-base font-bold uppercase tracking-[0.3em]">
            Centro de Gestión Operativa
          </p>
        </header>

        {/* Login Card with enhanced Glassmorphism */}
        <div className="w-full bg-[#1e293b]/40 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 md:p-10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95 duration-700 relative overflow-hidden">
          {/* Subtle inner top highlight */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

          <div className="mb-10 text-center">
            <h2 className="text-white text-2xl font-bold tracking-tight">Bienvenido de nuevo</h2>
            <p className="text-slate-400 text-sm mt-1">Ingresa tus credenciales para acceder</p>
          </div>
          
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-error/20 border border-error/50 text-error-container p-4 rounded-2xl flex items-center justify-center gap-3 animate-shake shadow-lg shadow-error/10">
                <span className="material-symbols-outlined text-[24px]">error</span>
                <span className="text-sm font-bold tracking-wide">{error}</span>
              </div>
            )}

            {/* Fields container */}
            <div className="space-y-5">
              <div className="flex flex-col gap-2">
                <div className="relative group">
                  <span className="absolute inset-y-0 left-5 flex items-center text-slate-400 group-focus-within:text-sky-400 transition-colors z-10">
                    <span className="material-symbols-outlined text-[22px]">person</span>
                  </span>
                  <input 
                    className="w-full pl-14 pr-5 py-4 bg-[#0f172a]/60 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 focus:bg-[#0f172a]/90 transition-all font-medium text-base shadow-inner" 
                    id="username" 
                    placeholder="Usuario" 
                    required 
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="relative group">
                  <span className="absolute inset-y-0 left-5 flex items-center text-slate-400 group-focus-within:text-sky-400 transition-colors z-10">
                    <span className="material-symbols-outlined text-[22px]">lock</span>
                  </span>
                  <input 
                    className="w-full pl-14 pr-5 py-4 bg-[#0f172a]/60 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 focus:bg-[#0f172a]/90 transition-all font-medium text-base shadow-inner" 
                    id="password" 
                    placeholder="Contraseña" 
                    required 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button 
              className={`w-full py-4 mt-4 rounded-2xl font-black text-white uppercase tracking-widest text-sm transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden group ${
                loading 
                ? 'bg-slate-700 cursor-not-allowed' 
                : 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 shadow-[0_10px_30px_rgba(2,132,199,0.4)] hover:shadow-[0_15px_40px_rgba(2,132,199,0.6)]'
              }`} 
              type="submit"
              disabled={loading}
            >
              {!loading && (
                <div className="absolute inset-0 bg-white/20 w-0 group-hover:w-full transition-all duration-500 ease-out"></div>
              )}
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <div className="relative z-10 flex items-center gap-3">
                  <span>Acceder</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </div>
              )}
            </button>
          </form>
        </div>

        <footer className="mt-12 text-center relative z-10">
          <p className="text-slate-500/80 text-xs font-bold uppercase tracking-widest">
            © 2026 Secretaría de Transporte • Gobierno Digital
          </p>
        </footer>
      </section>
    </main>
  );
};

export default Login;
