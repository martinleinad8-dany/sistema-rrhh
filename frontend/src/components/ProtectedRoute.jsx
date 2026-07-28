import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Verificar si existe el token en el localStorage
  const token = localStorage.getItem('token');

  // Si no hay token, redirigir al Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si hay token, permitir el acceso a las rutas hijas
  return <Outlet />;
};

export default ProtectedRoute;