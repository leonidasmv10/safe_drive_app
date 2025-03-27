import React, { useState } from 'react';

export default function Recuperar() {
  // Estado para el campo del email
  const [email, setEmail] = useState('');
  const [error, setError] = useState(''); // Para mostrar mensajes de error
  const [loading, setLoading] = useState(false); // Para manejar el estado de carga

  // Función para manejar el cambio en el campo de email
  const userData = (e) => {
    const { value } = e.target;
    setEmail(value);
  };

  // Función para manejar el envío del formulario
  const passwordRecover = async (e) => {
    console.log(email);
    e.preventDefault(); // Evitar que se recargue la página

    setLoading(true); // Activar el estado de carga

    // Crear el objeto con los datos del formulario
    const userDataObj = { email };

    try {
      // Enviar la petición POST al servidor
      const response = await fetch('http://localhost:8000/api/recuperar_contraseña/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userDataObj),
      });

      const result = await response.json(); // Parsear la respuesta del servidor

      if (response.ok) {
        // Si la respuesta es exitosa, proceder a lo que quieras
        alert('Te hemos enviado un correo para recuperar tu contraseña');
      } else {
        // Si no es exitosa, mostrar un mensaje de error
        setError(result.message || 'Hubo un error al recuperar la contraseña');
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
      <h2>Recuperar Contraseña</h2>
      <form onSubmit={passwordRecover}>
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

        <button type="submit" disabled={loading}>
          {loading ? 'Recuperando...' : 'Recuperar Contraseña'}
        </button>
      </form>

      {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
    </div>
  );
}