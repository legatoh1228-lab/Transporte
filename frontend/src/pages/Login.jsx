import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import logoBlanco from '../assets/images/logo gob blanco.jpg';

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
    <main className="flex w-full min-h-screen font-public-sans bg-surface">
      {/* Login Section - Now full width and centered */}
      <section className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative">
        
        <header className="flex flex-col items-center mb-6 text-center w-full max-w-[400px] animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="w-22 h-22 bg-white rounded-xl flex items-center justify-center mb-3 shadow-sm overflow-hidden">
            <img src={logoBlanco} alt="Logo Gobernación" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-primary font-title-sm text-title-sm uppercase tracking-[0.1em] font-bold">Secretaría de Transporte</h1>

        </header>

        {/* Login Card Container - More compact */}
        <div className="w-full max-w-[400px] bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xl shadow-primary/5 relative z-10 animate-in fade-in zoom-in-95 duration-500">
          <div className="mb-6 border-b border-outline-variant pb-4">
            <h3 className="text-on-surface font-headline-small text-headline-small mb-1">Iniciar Sesión</h3>
            <p className="text-on-surface-variant font-body-sm text-body-sm">Ingrese sus credenciales para acceder.</p>
          </div>
          
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-error/10 border border-error/20 text-error p-3 rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span className="font-body-sm text-body-sm">{error}</span>
              </div>
            )}

            {/* Username Field */}
            <div className="flex flex-col gap-1">
              <label className="text-on-surface font-label-bold text-label-bold" htmlFor="username">Usuario</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-outline group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[18px]">badge</span>
                </span>
                <input 
                  autoComplete="username" 
                  className="w-full pl-10 pr-3 py-2 bg-surface border border-outline-variant rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                  id="username" 
                  name="username" 
                  placeholder="Usuario" 
                  required 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1">
              <label className="text-on-surface font-label-bold text-label-bold" htmlFor="password">Contraseña</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-outline group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                </span>
                <input 
                  autoComplete="current-password" 
                  className="w-full pl-10 pr-10 py-2 bg-surface border border-outline-variant rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
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
              className={`w-full mt-2 ${loading ? 'bg-primary/70' : 'bg-primary'} text-on-primary font-label-bold text-label-bold py-2.5 px-4 rounded-lg hover:bg-on-primary-fixed-variant transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/50`} 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Validando...' : 'Ingresar'}
              {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>
          </form>
        </div>
      </section>
    </main>

  );
};

export default Login;
