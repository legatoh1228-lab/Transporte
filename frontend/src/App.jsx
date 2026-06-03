import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { useRef, useState } from 'react';

function App() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Inicializar tema
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Configurar reproducción de audio al interactuar (política de navegadores)
    const handleInteraction = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => console.log("Audio autoplay bloqueado:", err));
      }
    };

    document.addEventListener('click', handleInteraction, { once: true });
    
    return () => {
      document.removeEventListener('click', handleInteraction);
    };
  }, [isPlaying]);

  return (
    <BrowserRouter>
      {/* Reproductor de música de fondo (oculto) */}
      <audio 
        ref={audioRef} 
        src="/background-music.mp3" 
        loop 
        preload="auto"
      />
      {/* Aquí puedes envolver la app con Context Providers (e.g., AuthProvider, ThemeProvider) */}
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App

