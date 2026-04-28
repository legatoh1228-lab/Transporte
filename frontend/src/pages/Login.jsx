import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      
      // Guardar información del usuario (y token si lo hubiera)
      localStorage.setItem('user', JSON.stringify(response.data.user));
      // Si el backend retornara un token, lo guardaríamos aquí:
      // localStorage.setItem('access_token', response.data.token);
      
      // Redirigir al dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Error de login:', err);
      setError(err.response?.data?.error || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex w-full min-h-screen font-public-sans">
      {/* Left Panel - Branding & Institutional Context (Hidden on Mobile) */}
      <section className="hidden lg:flex w-1/2 relative bg-primary flex-col justify-between p-12 overflow-hidden border-r border-outline-variant">
        {/* Background Image overlaying primary color for depth */}
        <div className="absolute inset-0 z-0">
          <img 
            className="w-full h-full object-cover opacity-15 mix-blend-luminosity" 
            alt="high angle view of complex multi-lane highway interchange" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCh7wQLh_hqoACo56yr0OOYZ46sgBd7qod8gs1jvKtDy1XXutUycA-uZH-Zpr3nMfVie5kO-l9dDNS24caRI78ZqmTwObD9228jK4pUSyfqQ8XgaFnAQ2M6v62XuQhxno20Owi_i5HPTwyvWxh4Az7KBgG29LdIA3qse0W5fCt0zRYlZG7NO-z_PlCG_JBP0ZgLZeS0Sq6AFUvlRbfF9KQq08lCGVq_t13qpRevZJAjVViraEEUZV2NHCaIxN60OHWmjZfjtxnZnMg" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 to-primary/95"></div>
        </div>
        
        {/* Header */}
        <header className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-surface-container-lowest rounded-lg flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
          </div>
          <div>
            <h1 className="text-on-primary font-title-sm text-title-sm uppercase tracking-wider">Gobernación del Estado Aragua</h1>
            <p className="text-primary-fixed-dim font-label-sm text-label-sm">Despacho de Infraestructura y Transporte</p>
          </div>
        </header>

        {/* Main Context */}
        <article className="relative z-10 max-w-lg mt-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface/10 border border-surface/20 rounded-full mb-6">
            <span className="material-symbols-outlined text-primary-fixed-dim text-[16px]">verified</span>
            <span className="text-primary-fixed-dim font-label-bold text-label-bold">SISTEMA OFICIAL</span>
          </div>
          <h2 className="text-on-primary font-display-lg text-display-lg mb-6">Plataforma de Gestión y Registro de Transporte</h2>
          <p className="text-primary-fixed-dim font-body-md text-body-md leading-relaxed">
            Sistema centralizado e interconectado para el control operativo, auditoría de rutas y administración integral de la flota de transporte público e institucional del estado. El acceso a este portal está estrictamente reservado para personal autorizado.
          </p>
        </article>

        {/* Footer Info */}
        <footer className="relative z-10 text-primary-fixed-dim font-label-sm text-label-sm flex items-center gap-2 mt-12 opacity-80">
          <span className="material-symbols-outlined text-[16px]">lock</span>
          Conexión segura 256-bit cifrada
        </footer>
      </section>

      {/* Right Panel - Login Form */}
      <section className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 bg-surface relative">
        {/* Mobile Header (Visible only on small screens) */}
        <header className="lg:hidden flex flex-col items-center mb-8 text-center w-full max-w-[400px]">
          <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center shadow-sm mb-4">
            <span className="material-symbols-outlined text-on-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
          </div>
          <h1 className="text-primary font-title-sm text-title-sm uppercase tracking-wider">Gobernación del Estado Aragua</h1>
          <h2 className="text-on-surface font-headline-md text-headline-md mt-2">Gestión de Transporte</h2>
        </header>

        {/* Login Card Container */}
        <div className="w-full max-w-[400px] bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm">
          <div className="mb-8 border-b border-outline-variant pb-6">
            <h3 className="text-on-surface font-headline-md text-headline-md mb-2">Iniciar Sesión</h3>
            <p className="text-on-surface-variant font-body-sm text-body-sm">Ingrese sus credenciales de operador o administrador para acceder al panel principal.</p>
          </div>
          
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-error/10 border border-error/20 text-error p-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <span className="material-symbols-outlined text-[20px]">error</span>
                <span className="font-body-sm text-body-sm">{error}</span>
              </div>
            )}

            {/* Username Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-on-surface font-label-bold text-label-bold" htmlFor="username">Usuario Institucional</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-outline group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">badge</span>
                </span>
                <input 
                  autoComplete="username" 
                  className="w-full pl-10 pr-3 py-2.5 bg-surface border border-outline-variant rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                  id="username" 
                  name="username" 
                  placeholder="Ej: admin" 
                  required 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-on-surface font-label-bold text-label-bold" htmlFor="password">Contraseña de Acceso</label>
                <a className="text-secondary font-label-bold text-label-bold hover:text-primary transition-colors hover:underline" href="#">¿Olvidó su clave?</a>
              </div>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-outline group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </span>
                <input 
                  autoComplete="current-password" 
                  className="w-full pl-10 pr-10 py-2.5 bg-surface border border-outline-variant rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  required 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              className={`w-full mt-4 ${loading ? 'bg-primary/70' : 'bg-primary'} text-on-primary font-label-bold text-label-bold py-3 px-4 rounded-lg hover:bg-on-primary-fixed-variant active:bg-on-primary-fixed transition-colors flex items-center justify-center gap-2 border border-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-surface`} 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Validando...' : 'Ingresar al Sistema'}
              {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>
          </form>
        </div>

        {/* Footer Help Link */}
        <div className="mt-8 text-center absolute bottom-8">
          <a className="text-outline hover:text-on-surface font-body-sm text-body-sm flex items-center justify-center gap-1.5 transition-colors" href="#">
            <span className="material-symbols-outlined text-[16px]">help</span>
            Soporte Técnico Institucional
          </a>
        </div>
      </section>
    </main>
  );
};

export default Login;
