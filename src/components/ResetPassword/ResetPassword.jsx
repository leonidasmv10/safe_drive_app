import { useState } from "react";
import { useParams } from "react-router-dom";

export default function ResetPassword() {
  const { uidb64, token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();

    const response = await fetch(`http://localhost:8000/user/reset-password/${uidb64}/${token}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ new_password: newPassword }),
    });

    const result = await response.json();
    setMessage(result.message || result.error);
  };

  return (
    <div>
      <h2>Restablecer Contraseña</h2>
      <form onSubmit={handleResetPassword}>
        <label>Nueva Contraseña</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        <button type="submit">Cambiar Contraseña</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}