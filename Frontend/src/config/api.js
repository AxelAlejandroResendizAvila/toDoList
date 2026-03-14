// Configuración central de la API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

export default API_URL;

// Función para hacer requests con token JWT
export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Manejar respuestas no exitosas
  if (!response.ok) {
    let errorMessage = `Error ${response.status}: ${response.statusText}`;
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || JSON.stringify(errorData);
      } catch (e) {
        console.error('Error parsing JSON response:', e);
      }
    } else {
      try {
        errorMessage = await response.text();
      } catch (e) {
        console.error('Error parsing text response:', e);
      }
    }
    
    // Si el token es inválido/expirado (401 o 403) Y ya tenemos un token guardado,
    // significa que la sesión expiró → limpiar y redirigir al login.
    // Si NO hay token, es un intento de login fallido → solo lanzar el error.
    const existingToken = localStorage.getItem('token');
    if ((response.status === 401 || response.status === 403) && existingToken) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
};

// Validar token con el backend
export const validateToken = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;

    // Intentar obtener datos del usuario actual
    const response = await fetch(`${API_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return true;
    } else if (response.status === 401 || response.status === 403) {
      // Token inválido o expirado
      localStorage.removeItem('token');
      return false;
    }
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }

  return false;
};
