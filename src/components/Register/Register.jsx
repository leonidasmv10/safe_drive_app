import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  // Estados para los campos del formulario
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(''); // Estado para email
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [preferredAlertType, setPreferredAlertType] = useState('visual');
  const [vehicleType, setVehicleType] = useState('car');
  const [subscription, setSubscription] = useState('free');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Manejar los cambios en los campos del formulario
  const userData = (e) => {
    const { id, value } = e.target;

    if (id === 'username') {
      setUsername(value);
    } else if (id === 'email') {
      setEmail(value); // Actualiza el estado para el email
    } else if (id === 'password') {
      setPassword(value);
    } else if (id === 'fullName') {
      setFullName(value);
    } else if (id === 'phoneNumber') {
      setPhoneNumber(value);
    } else if (id === 'preferredAlertType') {
      setPreferredAlertType(value);
    } else if (id === 'vehicleType') {
      setVehicleType(value);
    } else if (id === 'subscription') {
      setSubscription(value);
    }
  };

  // Manejar el envío del formulario
  const userSubmit = async (e) => {
    e.preventDefault(); // Evitar que se recargue la página

    setLoading(true); // Activar el estado de carga

    // Crear el objeto con los datos del formulario
    const userDataObj = {
      username,
      email, // Incluimos el email en el objeto de datos
      password,
      profile: {
        full_name: fullName,
        phone_number: phoneNumber,
        preferred_alert_type: preferredAlertType,
        vehicle_type: vehicleType,
        suscription: subscription,
      },
    };
    console.log(userDataObj);

    try {
      // Enviar la petición POST al servidor
      const response = await fetch('http://localhost:8000/user/register/', {
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
        // Vaciar los campos del formulario
        navigate("/");
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
          <label>Usuario</label>
          <input type="text" id="username" value={username} onChange={userData} required />
        </div>
        <div>
          <label>Email</label> {/* Campo para el email */}
          <input type="email" id="email" value={email} onChange={userData} required />
        </div>
        <div>
          <label>Contraseña</label>
          <input type="password" id="password" value={password} onChange={userData} required />
        </div>
        <div>
          <label>Nombre Completo</label>
          <input type="text" id="fullName" value={fullName} onChange={userData} required />
        </div>
        <div>
          <label>Número de Teléfono</label>
          <input type="text" id="phoneNumber" value={phoneNumber} onChange={userData} required />
        </div>
        <div>
          <label>Alerta</label>
          <select id="preferredAlertType" value={preferredAlertType} onChange={userData}>
            <option value="visual">Visual</option>
            <option value="audio">Audio</option>
          </select>
        </div>
        <div>
          <label>Vehículo</label>
          <select id="vehicleType" value={vehicleType} onChange={userData}>
            <option value="car">Coche</option>
            <option value="motorcycle">Moto</option>
            <option value="van">Furgoneta</option>
            <option value="truck">Camión</option>
          </select>
        </div>
        <div>
          <label>Suscripción</label>
          <select id="subscription" value={subscription} onChange={userData}>
            <option value="free">Gratis</option>
            <option value="premium">Premium</option>
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>

      {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
    </div>
  );
}
