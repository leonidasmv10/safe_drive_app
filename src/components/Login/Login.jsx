import React, { useState, useEffect } from 'react';
import { SmileIcon, KeyIcon } from '@/components/Icons/Icons';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/car-view');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    if (id === 'username') setUsername(value);
    else if (id === 'password') setPassword(value);
  };

  const userSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/user/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (response.ok && result.access) {
        // Guardar el token en localStorage
        localStorage.setItem('token', result.access);
        localStorage.setItem('refresh_token', result.refresh);

        alert('Inicio de sesión exitoso');
        navigate('/map');
      } else {
        setError(result.detail || 'Usuario o contraseña incorrectos');
      }
    } catch (err) {
      setError('Hubo un error al conectar con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Iniciar sesión</h2>
      <form onSubmit={userSubmit} className="grid gap-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="floating-input col-span-4">
            <div className="icon-wrapper">
              <SmileIcon />
            </div>
            <div className="input-wrapper">
              <label>Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={handleInputChange}
                required
                className="input"
              />
            </div>
          </div>

          <div className="floating-input col-span-3">
            <div className="icon-wrapper">
              <KeyIcon />
            </div>
            <div className="input-wrapper">
              <label>Contraseña</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={handleInputChange}
                required
                className="input"
              />
            </div>
          </div>

          <button
            className="floating-input col-span-1 bg-purple-200 hover:bg-purple-200  text-bg-purple-600 font-bold py-2 px-4 rounded"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Log in'}
          </button>

        </div>
      </form>

      {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}

      <button className='mr-2' onClick={() => navigate('/register')}>¿No tienes cuenta? Regístrate</button>
      <button onClick={() => navigate('/recover-password')} style={{ marginTop: '10px' }}>
        ¿Olvidaste tu contraseña?
      </button>
    </div>
  );
}
