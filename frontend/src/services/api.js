// Helper centralizado para peticiones HTTP
export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  // Construimos las cabeceras base
  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // Solo agregamos 'Content-Type': 'application/json' si hay un body y NO es FormData
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

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

      // Redirigimos al Login solo si no estamos ya en /login (evita loops infinitos)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return null;
    }

    return response;
  } catch (error) {
    console.error('Error de conexión con el servidor:', error);
    throw error;
  }
};