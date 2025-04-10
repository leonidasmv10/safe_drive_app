import React ,{ useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import "@/App.css";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { uidb64, token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage('Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/user/reset-password/${uidb64}/${token}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('Contraseña cambiada exitosamente');
      } else {
        setMessage(data.error || 'Error al cambiar la contraseña');
      }
    } catch (error) {
      setMessage('Error de conexión con el servidor');
    }
  };

  return (
    <div>
      <h2>Restablecer Contraseña</h2>
      <form onSubmit={handleSubmit}>
        <input className="input-background"
          type="password"
          placeholder="Nueva Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input className="input-background"
          type="password"
          placeholder="Confirmar Contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button type="submit">Cambiar Contraseña</button>
      </form>
      <button onClick={() => navigate("/")}>Volver al Login</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ResetPasswordPage;
