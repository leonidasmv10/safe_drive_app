import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "@/App.css";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { uidb64, token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/user/reset-password/${uidb64}/${token}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setMessage("Contraseña cambiada exitosamente");
      } else {
        setError(data.error || "Error al cambiar la contraseña");
      }
    } catch (error) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50 w-full">
      <div className="w-full max-w-md px-6 flex flex-col items-center z-10 relative pt-12 pb-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">SafeDrive</h1>
          <h2 className="text-xl font-medium text-purple-600 mt-2">
            Restablecer Contraseña
          </h2>
        </div>

        {message && (
          <div className="w-full bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-full mb-4 text-center">
            {message}
          </div>
        )}

        {error && (
          <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-full mb-4 text-center">
            {error}
          </div>
        )}

        <p className="text-gray-600 text-center mb-6">
          Escribe tu nueva contraseña y confírmala para completar el cambio.
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <input
            type="password"
            placeholder="Nueva Contraseña"
            className="w-full py-3 px-4 rounded-full bg-white border border-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-300"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirmar Contraseña"
            className="w-full py-3 px-4 rounded-full bg-white border border-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-300"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <div className="flex flex-col gap-3 mt-6">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-purple-400 hover:bg-purple-500 text-white font-medium rounded-full flex items-center justify-center transition duration-200"
              disabled={loading}
            >
              <span>{loading ? "CAMBIANDO..." : "CAMBIAR CONTRASEÑA"}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full py-2.5 px-4 border border-purple-400 text-purple-600 font-medium rounded-full hover:bg-purple-50 transition duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-300 active:bg-purple-100"
            >
              VOLVER AL LOGIN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}