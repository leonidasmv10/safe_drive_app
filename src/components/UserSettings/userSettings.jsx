import React from 'react';
import { redirect, useNavigate } from 'react-router-dom';
import "@/components/UserSettings/userSettings.css";

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
        navigate('/edit-profile');
    };

    const handleChangePassword = async () => {
        navigate('/change-password');
    };

    const handleDeleteAccount = async () => {
        // Preguntar al usuario si realmente desea eliminar la cuenta
        if (!window.confirm('¿Estás seguro de que deseas eliminar tu cuenta?')) return;

        // Obtener el token del localStorage (o de donde lo tengas almacenado)
        const token = localStorage.getItem('token');

        if (!token) {
            alert('No estás autenticado. Por favor, inicia sesión de nuevo.');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/user/delete/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',  // O los encabezados que necesites
                },
            });

            // Verificar si la respuesta fue exitosa
            if (!res.ok) {
                const errorData = await res.json(); // Asegurarte de obtener el mensaje de error
                alert(`Error: ${errorData.message || 'Hubo un problema al eliminar la cuenta.'}`);
                return;
            }

            // Si la respuesta es exitosa
            localStorage.removeItem('token');
            alert('Cuenta eliminada');

            // Redirigir a la página de inicio de sesión o inicio
            const navigate = useNavigate(); // Usar useNavigate para manejar la redirección
            navigate('/');
        } catch (error) {
            console.error('Error eliminando cuenta:', error);
            alert('Hubo un error al intentar eliminar la cuenta. Inténtalo nuevamente más tarde.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="items-center justify-center">
                <h1 className='mb-4'>Configuración de usuario</h1>
                <div className="button-column">
                    <button onClick={handleLogout}>Logout</button>
                    <button onClick={handleEditProfile}>Editar perfil</button>
                    <button onClick={handleChangePassword}>Cambiar contraseña</button>
                    <button onClick={handleDeleteAccount}>Eliminar cuenta</button>
                </div>
            </div>
        </div>
    );
}