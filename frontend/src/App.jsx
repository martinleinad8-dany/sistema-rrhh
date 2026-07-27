import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

// Vistas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Empleados from './pages/Empleados';
import Contratos from './pages/Contratos';
import Nomina from './pages/Nomina';
import Asistencia from './pages/Asistencia';
import Desempeno from './pages/Desempeno';

function App() {
  return (
    <Routes>
      {/* Ruta para el Login sin Layout */}
      <Route path="/login" element={<Login />} />

      {/* Rutas protegidas dentro del Layout general */}
      <Route
        path="/*"
        element={
          <Layout>
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="empleados" element={<Empleados />} />
              <Route path="contratos" element={<Contratos />} />
              <Route path="nomina" element={<Nomina />} />
              <Route path="asistencia" element={<Asistencia />} />
              <Route path="desempeno" element={<Desempeno />} />
              {/* Redirección por defecto al Dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
}

export default App;