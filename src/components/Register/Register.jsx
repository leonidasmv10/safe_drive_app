import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import "@/App.css";

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
  <h2 className="text-xl font-bold mb-4">Registro</h2>
  <form onSubmit={userSubmit} className="grid grid-cols-4 gap-4">
    {/* Usuario */}
    <label className="col-span-2 self-center">Usuario</label>
    <input
      className="input-background col-span-2"
      type="text"
      id="username"
      value={username}
      onChange={userData}
      required
    />

    {/* Email */}
    <label className="col-span-2 self-center">Email</label>
    <input
      className="input-background col-span-2"
      type="email"
      id="email"
      value={email}
      onChange={userData}
      required
    />

    {/* Contraseña */}
    <label className="col-span-2 self-center">Contraseña</label>
    <input
      className="input-background col-span-2"
      type="password"
      id="password"
      value={password}
      onChange={userData}
      required
    />

    {/* Nombre Completo */}
    <label className="col-span-2 self-center">Nombre Completo</label>
    <input
      className="input-background col-span-2"
      type="text"
      id="fullName"
      value={fullName}
      onChange={userData}
      required
    />

    {/* Teléfono */}
    <label className="col-span-2 self-center">Número de Teléfono</label>
    <input
      className="input-background col-span-2"
      type="text"
      id="phoneNumber"
      value={phoneNumber}
      onChange={userData}
      required
    />

    {/* Tipo de alerta */}
    <label className="col-span-2 self-center">Alerta</label>
    <select
      className="input-background col-span-2"
      id="preferredAlertType"
      value={preferredAlertType}
      onChange={userData}
    >
      <option value="visual">Visual</option>
      <option value="audio">Audio</option>
    </select>

    {/* Vehículo */}
    <label className="col-span-2 self-center">Vehículo</label>
    <select
      className="input-background col-span-2"
      id="vehicleType"
      value={vehicleType}
      onChange={userData}
    >
      <option value="car">Coche</option>
      <option value="motorcycle">Moto</option>
      <option value="van">Furgoneta</option>
      <option value="truck">Camión</option>
    </select>

    {/* Suscripción */}
    <label className="col-span-2 self-center">Suscripción</label>
    <select
      className="input-background col-span-2"
      id="subscription"
      value={subscription}
      onChange={userData}
    >
      <option value="free">Gratis</option>
      <option value="premium">Premium</option>
    </select>

    {/* Botón de envío */}
    <div className="col-span-4 flex justify-end">
    <button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
    </div>
  </form>

  {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
</div>
  );
}
