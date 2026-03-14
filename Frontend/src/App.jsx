import { useState, useEffect } from 'react';
import { authService } from './services/authService';
import { validateToken } from './config/api';
import { AuthProvider } from './context/AuthContext';
import { TareaProvider } from './context/TareaContext';
import Login from './components/Login';
import Register from './components/Register';
import SeccionList from './components/SeccionList';
import TareaList from './components/TareaList';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [seccionSeleccionada, setSeccionSeleccionada] = useState(null);
  const [loginPrefill, setLoginPrefill] = useState({ correo: '', password: '' });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    const checkAuth = async () => {
      const token = authService.getToken();
      if (token) {
        const isValid = await validateToken();
        if (isValid) {
          setIsAuthenticated(true);
          // Si estamos autenticados pero en login/register, vamos a secciones
          if (currentPage === 'login' || currentPage === 'register') {
            setCurrentPage('secciones');
          }
        } else {
          handleLogout();
        }
      } else {
        setIsAuthenticated(false);
        setCurrentPage(path === '/register' ? 'register' : 'login');
      }
      setIsValidating(false);
    };

    // Escuchar cambios en localStorage (por si el usuario borra el token manualmente)
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        handleLogout();
      }
    };

    checkAuth();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Proteger rutas: Si no está autenticado y no está en login/reg, forzar login
  useEffect(() => {
    if (!isValidating && !isAuthenticated && currentPage !== 'login' && currentPage !== 'register') {
      setCurrentPage('login');
    }
  }, [isAuthenticated, currentPage, isValidating]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentPage('secciones');
  };

  const handleRegisterSuccess = (correo, password) => {
    setLoginPrefill({ correo, password });
    setCurrentPage('login');
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setSeccionSeleccionada(null);
    setCurrentPage('login');
  };

  const handleSelectSeccion = (seccion) => {
    setSeccionSeleccionada(seccion);
    setCurrentPage('tareas');
  };

  const handleGoHome = () => {
    setSeccionSeleccionada(null);
    setCurrentPage('secciones');
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <div className="text-lg text-slate-600 font-medium">Validando sesión...</div>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <TareaProvider>
        {/* Páginas sin sidebar (auth) */}
        {!isAuthenticated && (
          <>
            {currentPage === 'login' && (
              <Login
                prefillCorreo={loginPrefill.correo}
                prefillPassword={loginPrefill.password}
                onLoginSuccess={handleLoginSuccess}
                onGoToRegister={() => setCurrentPage('register')}
              />
            )}
            {currentPage === 'register' && (
              <Register
                onRegisterSuccess={handleRegisterSuccess}
                onGoToLogin={() => setCurrentPage('login')}
              />
            )}
          </>
        )}

        {/* Layout con Sidebar (autenticado) */}
        {isAuthenticated && (
          <div className="flex min-h-screen bg-slate-50">
            <Sidebar
              onSelectSeccion={handleSelectSeccion}
              currentSeccionId={seccionSeleccionada?.id}
              onGoHome={handleGoHome}
              onLogout={handleLogout}
              onCollapsedChange={setSidebarCollapsed}
            />

            {/* Contenido principal — ajustamos el margen según el estado del sidebar */}
            <div className={`flex-1 min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
              {currentPage === 'secciones' && (
                <SeccionList onSelectSeccion={handleSelectSeccion} />
              )}
              {currentPage === 'tareas' && seccionSeleccionada && (
                <TareaList
                  seccion={seccionSeleccionada}
                  onBack={handleGoHome}
                />
              )}
            </div>
          </div>
        )}
      </TareaProvider>
    </AuthProvider>
  );
}

export default App;
