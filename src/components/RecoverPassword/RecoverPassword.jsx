import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RecoverPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleRecoverPassword = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:8000/user/recover-password/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();
    setMessage(result.message || result.error);
  };

  return (
    <div>
      <h2>Recuperar Contraseña</h2>
      <form onSubmit={handleRecoverPassword}>
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <button type="submit">Enviar enlace</button>
      </form>
      <button onClick={() => navigate("/")}>Volver al Login</button>
      {message && <p>{message}</p>}
    </div>
  );
}
