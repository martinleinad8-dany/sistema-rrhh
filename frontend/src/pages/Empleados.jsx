import { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import './Empleados.css';

const Empleados = () => {
  const [empleados, setEmpleados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para el Modal (Crear / Editar)
  const [mostrarModal, setMostrarModal] = useState(false);
  const [empleadoEditando, setEmpleadoEditando] = useState(null); // null = Crear, Objeto = Editar
  const [guardando, setGuardando] = useState(false);
  const [modalError, setModalError] = useState('');
  const [formData, setFormData] = useState({
    rut_dni: '',
    nombres: '',
    apellidos: '',
    email: '',
    departamento: 'TI',
    puesto: ''
  });

  // 1. Cargar empleados desde MySQL
  useEffect(() => {
    obtenerEmpleados();
  }, []);

  const obtenerEmpleados = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/empleados');
      
      if (response && response.ok) {
        const data = await response.json();
        setEmpleados(data);
        setError('');
      } else {
        setError('No se pudieron cargar los empleados desde la base de datos.');
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Abrir Modal para Crear
  const abrirModalCrear = () => {
    setEmpleadoEditando(null);
    setFormData({
      rut_dni: '',
      nombres: '',
      apellidos: '',
      email: '',
      departamento: 'TI',
      puesto: ''
    });
    setModalError('');
    setMostrarModal(true);
  };

  // Abrir Modal para Editar
  const abrirModalEditar = (emp) => {
    setEmpleadoEditando(emp);
    
    // Separar nombre completo si viene concatenado de la BD
    const partesNombre = (emp.nombre || '').split(' ');
    const nombres = partesNombre[0] || '';
    const apellidos = partesNombre.slice(1).join(' ') || '';

    setFormData({
      rut_dni: emp.rut_dni || '',
      nombres: nombres,
      apellidos: apellidos,
      email: emp.email || '',
      departamento: emp.departamento || 'TI',
      puesto: emp.puesto || ''
    });
    setModalError('');
    setMostrarModal(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 2. Enviar datos (POST para crear, PUT para actualizar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.nombres || !formData.apellidos || !formData.email || !formData.puesto) {
      setModalError('Por favor completa todos los campos requeridos.');
      return;
    }

    const esEdicion = Boolean(empleadoEditando);
    const endpoint = esEdicion ? `/empleados/${empleadoEditando.id}` : '/empleados';
    const metodo = esEdicion ? 'PUT' : 'POST';

    try {
      setGuardando(true);
      const response = await apiFetch(endpoint, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response && response.ok) {
        setMostrarModal(false);
        obtenerEmpleados(); // Recargar lista de la base de datos
      } else {
        const data = await response.json();
        setModalError(data.mensaje || 'Error al procesar la solicitud.');
      }
    } catch (err) {
      setModalError('Error al conectar con el servidor.');
    } finally {
      setGuardando(false);
    }
  };

  // 3. Cambiar estado (Activar / Desactivar)
  const toggleEstado = async (emp) => {
    const estaActivo = emp.activo === 1 || emp.activo === true || emp.estado === 'Activo';
    const nuevoEstado = estaActivo ? 'Inactivo' : 'Activo';

    try {
      const response = await apiFetch(`/empleados/${emp.id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (response && response.ok) {
        setEmpleados((prev) =>
          prev.map((item) =>
            item.id === emp.id
              ? { ...item, activo: !estaActivo, estado: nuevoEstado }
              : item
          )
        );
      } else {
        const data = await response.json();
        alert(data.mensaje || 'Error al cambiar el estado del empleado.');
      }
    } catch (err) {
      alert('Error de conexión al intentar cambiar el estado.');
    }
  };

  // 4. Filtrar empleados
  const empleadosFiltrados = empleados.filter((emp) =>
    emp.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    emp.puesto?.toLowerCase().includes(busqueda.toLowerCase()) ||
    emp.departamento?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="empleados-container">
      {/* Cabecera del módulo */}
      <div className="modulo-header">
        <div>
          <h2>Gestión de Empleados</h2>
          <p>Administra la información de tu personal</p>
        </div>
        <button className="btn-primario" onClick={abrirModalCrear}>
          + Nuevo Empleado
        </button>
      </div>

      {/* Barra de Búsqueda */}
      <div className="tabla-toolbar">
        <input
          type="text"
          placeholder="Buscar por nombre, puesto o departamento..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="input-busqueda"
        />
      </div>

      {/* Mensaje de Error */}
      {error && <div className="mensaje-error">{error}</div>}

      {/* Tabla de Empleados */}
      <div className="tabla-card">
        {loading ? (
          <div className="cargando">Cargando empleados...</div>
        ) : (
          <table className="tabla-custom">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Puesto</th>
                <th>Departamento</th>
                <th>Correo</th>
                <th>Estatus</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleadosFiltrados.length > 0 ? (
                empleadosFiltrados.map((emp) => {
                  const esActivo = emp.activo === 1 || emp.activo === true || emp.estado === 'Activo';
                  return (
                    <tr key={emp.id}>
                      <td className="font-bold">{emp.nombre}</td>
                      <td>{emp.puesto}</td>
                      <td>{emp.departamento}</td>
                      <td>{emp.email}</td>
                      <td>
                        <span className={`badge ${esActivo ? 'activo' : 'inactivo'}`}>
                          {esActivo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="acciones">
                        <button 
                          className="btn-accion btn-editar"
                          onClick={() => abrirModalEditar(emp)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn-accion btn-estado"
                          onClick={() => toggleEstado(emp)}
                        >
                          {esActivo ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="sin-datos">
                    No se encontraron empleados registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* --- MODAL (CREAR / EDITAR) --- */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <div className="modal-header">
              <h3>{empleadoEditando ? 'Editar Empleado' : 'Registrar Nuevo Empleado'}</h3>
              <button className="btn-cerrar" onClick={() => setMostrarModal(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {modalError && <div className="mensaje-error">{modalError}</div>}

              <div className="form-row">
                <div className="form-group">
                  <label>Nombres *</label>
                  <input
                    type="text"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleChange}
                    required
                    placeholder="Ej. Ana"
                  />
                </div>
                <div className="form-group">
                  <label>Apellidos *</label>
                  <input
                    type="text"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleChange}
                    required
                    placeholder="Ej. García"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>RUT / DNI</label>
                  <input
                    type="text"
                    name="rut_dni"
                    value={formData.rut_dni}
                    onChange={handleChange}
                    placeholder="12345678-9"
                  />
                </div>
                <div className="form-group">
                  <label>Correo Electrónico *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="ana@empresa.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Departamento</label>
                  <select
                    name="departamento"
                    value={formData.departamento}
                    onChange={handleChange}
                  >
                    <option value="Administración">Administración</option>
                    <option value="Recursos Humanos">Recursos Humanos</option>
                    <option value="TI">TI</option>
                    <option value="Finanzas">Finanzas</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Cargo / Puesto *</label>
                  <input
                    type="text"
                    name="puesto"
                    value={formData.puesto}
                    onChange={handleChange}
                    required
                    placeholder="Ej. Desarrolladora"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secundario"
                  onClick={() => setMostrarModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primario" disabled={guardando}>
                  {guardando ? 'Guardando...' : empleadoEditando ? 'Actualizar Empleado' : 'Guardar Empleado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Empleados;