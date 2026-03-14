import { createContext, useState, useCallback, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Registrar usuario
  const register = useCallback(async (nombre, correo, password, telefono = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.register(nombre, correo, password, telefono);
      console.log('Registro exitoso:', data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Login usuario
  const login = useCallback(async (correo, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(correo, password);
      // Tras guardar el token, obtener el perfil del usuario actual directamente
      const userProfile = await authService.getCurrentUser();
      setUser(userProfile);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout usuario
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  // Verificar si está autenticado al cargar
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    if (isAuthenticated && !user) {
      authService.getCurrentUser()
        .then(profile => setUser(profile))
        .catch(() => logout());
    }
  }, [isAuthenticated, logout, user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
