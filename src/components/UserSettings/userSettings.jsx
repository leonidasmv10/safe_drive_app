import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function UserSettings() {
  const navigate = useNavigate();
  const API_URL = 'http://localhost:8000'; // Cambia por la URL de tu backend
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`, // Usa "Bearer" si usas JWT
  };

  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_URL}/user/logout/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ refresh: localStorage.getItem('refresh_token') }),
      });
      console.log(token)
      if (res.ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        alert('Sesión cerrada');
        navigate("/");
      }
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
  };

  const handleEditProfile = async () => {
    const data = {
      first_name: 'NuevoNombre',
      last_name: 'NuevoApellido',
    };

    try {
      const res = await fetch(`${API_URL}/profile/`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });
      if (res.ok) {
        alert('Perfil actualizado');
      }
    } catch (error) {
      console.error('Error actualizando perfil:', error);
    }
  };

  const handleChangePassword = async () => {
    const data = {
      current_password: 'anterior123',
      new_password: 'nueva123',
    };

    try {
      const res = await fetch(`${API_URL}/change-password/`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });
      if (res.ok) {
        alert('Contraseña cambiada');
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Error al cambiar contraseña');
      }
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar tu cuenta?')) return;

    try {
      const res = await fetch(`${API_URL}/delete-account/`, {
        method: 'DELETE',
        headers,
      });
      if (res.ok) {
        localStorage.removeItem('token');
        alert('Cuenta eliminada');
        // Redirige a login o homepage
      }
    } catch (error) {
      console.error('Error eliminando cuenta:', error);
    }
  };

  return (
    <div>
      <h2>Configuración de Usuario</h2>
      <button onClick={handleLogout}>Logout</button>
      <button onClick={handleEditProfile}>Editar perfil</button>
      <button onClick={handleChangePassword}>Cambiar contraseña</button>
      <button onClick={handleDeleteAccount}>Eliminar cuenta</button>
    </div>
  );
}