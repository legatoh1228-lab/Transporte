import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      {/* Aquí puedes envolver la app con Context Providers (e.g., AuthProvider, ThemeProvider) */}
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
