import React, { useState } from 'react';

export default function Login({ onNavigateToRegister, onNavigateToRecover}) {
  // Estado para los campos del formulario
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Para mostrar mensajes de error
  const [loading, setLoading] = useState(false); // Para manejar el estado de carga

  // Función para manejar el cambio en los campos de input
  const userData = (e) => {
    const { id, value } = e.target;
    if (id === 'username') {
      setUsername(value);
    } else if (id === 'password') {
      setPassword(value);
    }
  };

  // Función para manejar el submit del formulario
  const userSubmit = async (e) => {
    e.preventDefault(); // Evitar que se recargue la página

    setLoading(true); // Activar el estado de carga

    // Crear el objeto con los datos del formulario
    const userData = { username, password };
    console.log(userData);

    try {
      // Enviar la petición POST al servidor
      const response = await fetch('http://localhost:8000/user/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json(); // Parsear la respuesta del servidor

      if (response.ok) {
        // Si la respuesta es exitosa, proceder a lo que quieras (redirección, etc.)
        alert('Inicio de sesión exitoso');
      } else {
        // Si no es exitosa, mostrar un mensaje de error
        setError(result.message || 'Usuario o contraseña incorrectos');
      }
    } catch (error) {
      // Manejar cualquier error de la petición
      setError('Hubo un error al conectar con el servidor');
    } finally {
      setLoading(false); // Desactivar el estado de carga
    }
  };

  return (
    <div>
      <h2>Iniciar sesión</h2>
      <form onSubmit={userSubmit}>
        <div>
          <label>Usuario</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={userData}
            required
          />
        </div>
        <div>
          <label>Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={userData}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Cargando...' : 'Entrar'}
        </button>
      </form>

      {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}

      {/* Botón para ir al registro */}
      <button onClick={onNavigateToRegister}>¿No tienes cuenta? Regístrate</button>
      
       {/* Botón para ir a la recuperación de contraseña */}
       <button onClick={onNavigateToRecover} style={{ marginTop: '10px' }}>
        ¿Olvidaste tu contraseña?
      </button>
    </div>
  );
}
