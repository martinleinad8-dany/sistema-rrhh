import React, { useState } from 'react';

function Login() {
  const [credentials, setCredentials] = useState({
    correo: '',
    password: '',
  });

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos enviados:', credentials);
    // Aquí conectaremos con el backend más adelante
    alert(`Intentando iniciar sesión con: ${credentials.correo}`);
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Iniciar Sesión</h2>
        
        <div style={styles.inputGroup}>
          <label htmlFor="correo" style={styles.label}>Correo Electrónico:</label>
          <input
            type="email"
            id="correo"
            name="correo"
            value={credentials.correo}
            onChange={handleChange}
            placeholder="usuario@empresa.com"
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label htmlFor="password" style={styles.label}>Contraseña:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            style={styles.input}
          />
        </div>

        <button type="submit" style={styles.button}>
          Ingresar
        </button>
      </form>
    </div>
  );
}

// Estilos básicos en JS para que se vea ordenado
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    fontFamily: 'Arial, sans-serif',
  },
  form: {
    backgroundColor: '#ffffff',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '380px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#333',
  },
  inputGroup: {
    marginBottom: '15px',
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '5px',
    fontSize: '14px',
    color: '#555',
  },
  input: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '14px',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '10px',
  },
};

export default Login;