import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "@/App.css";

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
  <h2 className="text-xl font-bold mb-4">Recuperar Contraseña</h2>

  <form onSubmit={handleRecoverPassword} className="space-y-4">
    {/* Email */}
    <div className=" items-center gap-2">
      <label className="mr-3">Email</label>
      <input
        className="input-background "
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
    </div>

    {/* Botones */}
    <div className="grid grid-cols-1">
      <div className="flex justify-end gap-4">
        <button
          type="submit"
        >
          Enviar enlace
        </button>
        <button
          type="button"
          onClick={() => navigate("/")}         
        >
          Volver al Login
        </button>
      </div>
    </div>
  </form>

  {message && <p className="mt-4 text-green-600">{message}</p>}
</div>
  );
}
