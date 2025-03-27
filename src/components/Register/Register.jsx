import React, { useState } from 'react';

export default function Register() {
  // Estados para los campos del formulario
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Para mostrar mensajes de error
  const [loading, setLoading] = useState(false); // Para manejar el estado de carga

  // Manejar los cambios en los campos del formulario
  const userData = (e) => {
    const { id, value } = e.target;
    if (id === 'name') {
      setName(value);
    } else if (id === 'email') {
      setEmail(value);
    } else if (id === 'password') {
      setPassword(value);
    }
  };

  // Manejar el envío del formulario
  const userSubmit = async (e) => {
    e.preventDefault(); // Evitar que se recargue la página

    setLoading(true); // Activar el estado de carga

    // Crear el objeto con los datos del formulario
    const userDataObj = { name, email, password };

    try {
      // Enviar la petición POST al servidor
      const response = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userDataObj),
      });

      const result = await response.json(); // Parsear la respuesta del servidor

      if (response.ok) {
        // Si la respuesta es exitosa, proceder a lo que quieras (redirección, etc.)
        alert('Registro exitoso');
      } else {
        // Si no es exitosa, mostrar un mensaje de error
        setError(result.message || 'Hubo un error en el registro');
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
      <h2>Registro</h2>
      <form onSubmit={userSubmit}>
        <div>
          <label htmlFor="name">Nombre</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={userData}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Correo electrónico</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={userData}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={userData}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>

      {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
    </div>
  );
}
