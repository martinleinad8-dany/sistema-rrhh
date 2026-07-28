// Helper centralizado para peticiones HTTP
export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  // Headers por defecto
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`http://localhost:3000/api${endpoint}`, {
      ...options,
      headers,
    });

    // 🚨 Si el token expiró o la petición no está autorizada (401)
    if (response.status === 401) {
      console.warn('Sesión expirada. Redirigiendo al login...');
      
      // Limpiamos la sesión del usuario
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');

      // Redirigimos al Login
      window.location.href = '/login';
      return null;
    }

    return response;
  } catch (error) {
    console.error('Error de conexión con el servidor:', error);
    throw error;
  }
};