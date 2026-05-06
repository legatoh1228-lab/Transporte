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
  const navigate = useNavigate();

  useEffect(() => {
    // Cargar fondo personalizado si existe en localStorage
    const savedBg = localStorage.getItem('login_background_url');
    if (savedBg) {
      setBgImage(savedBg);
    }
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
    <main 
      className="flex w-full min-h-screen font-public-sans relative overflow-hidden items-center justify-center bg-[#0f172a]"
    >
      {/* Background Image with optimized rendering */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000"
        style={{
          backgroundImage: `url(${bgImage})`,
          filter: 'brightness(0.6) contrast(1.1)'
        }}
      ></div>

      {/* Modern Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#0f172a]/90 via-transparent to-primary/20 z-1"></div>

      <section className="relative z-10 w-full max-w-[440px] px-6">
        
        <header className="flex flex-col items-center mb-8 text-center animate-in fade-in slide-in-from-top-8 duration-1000">
          <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center mb-4 shadow-2xl backdrop-blur-xl border border-white/10 p-4 transform hover:rotate-3 transition-transform cursor-default">
            <img src={logoBlanco} alt="Logo Gobernación" className="w-full h-full object-contain filter drop-shadow-md" />
          </div>
          <h1 className="text-white text-xl font-black uppercase tracking-[0.2em] drop-shadow-lg">
            Gestión de Transporte
          </h1>
          <div className="w-12 h-1 bg-sky-400 mt-2 rounded-full shadow-[0_0_15px_rgba(56,189,248,0.5)]"></div>
        </header>

        {/* Login Card with enhanced Glassmorphism */}
        <div className="bg-[#1e293b]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-700">
          <div className="mb-8">
            <h2 className="text-white text-2xl font-bold mb-2">Bienvenido</h2>
            <p className="text-slate-400 text-sm font-medium">Panel de administración centralizada</p>
          </div>
          
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-200 p-4 rounded-xl flex items-center gap-3 animate-shake">
                <span className="material-symbols-outlined text-[20px]">warning</span>
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Fields container */}
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-slate-300 text-xs font-bold uppercase tracking-wider ml-1" htmlFor="username">Usuario</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-4 flex items-center text-slate-500 group-focus-within:text-sky-400 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                  </span>
                  <input 
                    className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-white/5 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/10 transition-all" 
                    id="username" 
                    placeholder="Ingrese su usuario" 
                    required 
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-slate-300 text-xs font-bold uppercase tracking-wider ml-1" htmlFor="password">Contraseña</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-4 flex items-center text-slate-500 group-focus-within:text-sky-400 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                  </span>
                  <input 
                    className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-white/5 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/10 transition-all" 
                    id="password" 
                    placeholder="••••••••" 
                    required 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button 
              className={`w-full py-4 rounded-xl font-bold text-white transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 ${
                loading 
                ? 'bg-slate-700 cursor-not-allowed' 
                : 'bg-sky-600 hover:bg-sky-500 shadow-[0_10px_20px_rgba(2,132,199,0.3)] hover:shadow-[0_10px_25px_rgba(2,132,199,0.5)]'
              }`} 
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>ACCEDER AL SISTEMA</span>
                  <span className="material-symbols-outlined text-[18px]">login</span>
                </>
              )}
            </button>
          </form>
        </div>

        <footer className="mt-10 text-center">
          <p className="text-slate-500 text-xs font-medium">
            © 2026 Secretaría de Transporte • Gobierno Digital
          </p>
        </footer>
      </section>
    </main>
  );
};

export default Login;
