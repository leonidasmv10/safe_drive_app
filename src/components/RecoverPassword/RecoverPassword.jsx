import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "@/App.css";

export default function RecoverPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRecoverPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:8000/user/recover-password/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setMessage(
          result.message || "Se ha enviado un enlace a tu correo electrónico"
        );
      } else {
        setError(result.error || "Hubo un problema al procesar tu solicitud");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50 w-full">
      <div className="w-full max-w-md px-6 flex flex-col items-center z-10 relative pt-12 pb-4">
        {/* Logo y título */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">SafeDrive</h1>
          <h2 className="text-xl font-medium text-purple-600 mt-2">
            Recuperar Contraseña
          </h2>
        </div>

        {/* Mensaje de éxito */}
        {message && (
          <div className="w-full bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-full mb-4 text-center">
            {message}
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-full mb-4 text-center">
            {error}
          </div>
        )}

        {/* Texto explicativo */}
        <p className="text-gray-600 text-center mb-6">
          Ingresa tu correo electrónico y te enviaremos un enlace para
          restablecer tu contraseña.
        </p>

        {/* Formulario */}
        <form onSubmit={handleRecoverPassword} className="w-full space-y-4">
          {/* Campo de correo/email */}
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <div className="w-6 h-6 rounded-full bg-purple-300 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-purple-700"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
            </div>
            <input
              type="email"
              placeholder="tu@email.com"
              className="w-full py-3 pl-12 pr-3 rounded-full bg-white border border-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs text-gray-500">
              <span className="absolute -top-2 left-12 bg-white px-1">
                Email
              </span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col gap-3 mt-6">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-purple-400 hover:bg-purple-500 text-white font-medium rounded-full flex items-center justify-center transition duration-200"
              disabled={loading}
            >
              <span>{loading ? "ENVIANDO..." : "ENVIAR ENLACE"}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
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

      {/* Animación creativa del fondo - Mapa de ruta con coches */}
      <div className="fixed bottom-0 left-0 right-0 h-1/3 overflow-hidden bg-gradient-to-t from-purple-100 to-transparent z-0">
        <svg
          viewBox="0 0 400 200"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          {/* Fondo de gradiente */}
          <defs>
            <linearGradient
              id="roadGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="rgba(168, 85, 247, 0.1)" />
              <stop offset="100%" stopColor="rgba(139, 92, 246, 0.3)" />
            </linearGradient>

            {/* Patrón de mapa de ciudad */}
            <pattern
              id="cityGrid"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="rgba(168, 85, 247, 0.15)"
                strokeWidth="0.5"
              />
            </pattern>

            {/* Coche animado */}
            <symbol id="car" viewBox="0 0 24 12">
              <rect
                x="2"
                y="3"
                width="20"
                height="7"
                rx="1"
                fill="rgba(168, 85, 247, 0.8)"
              />
              <rect
                x="4"
                y="0"
                width="16"
                height="4"
                rx="1"
                fill="rgba(168, 85, 247, 0.9)"
              />
              <circle cx="6" cy="10" r="2" fill="rgba(139, 92, 246, 1)" />
              <circle cx="18" cy="10" r="2" fill="rgba(139, 92, 246, 1)" />
              <rect
                x="16"
                y="1"
                width="3"
                height="2"
                rx="1"
                fill="rgba(255, 255, 255, 0.5)"
              />
              <rect
                x="5"
                y="1"
                width="3"
                height="2"
                rx="1"
                fill="rgba(255, 255, 255, 0.5)"
              />
            </symbol>
          </defs>

          {/* Fondo con mapa de ciudad */}
          <rect width="100%" height="100%" fill="url(#cityGrid)" />

          {/* Calles principales */}
          <path
            d="M0,100 Q100,110 200,90 T400,100"
            stroke="rgba(168, 85, 247, 0.4)"
            strokeWidth="5"
            fill="none"
          />
          <path
            d="M0,50 Q80,40 200,70 T400,50"
            stroke="rgba(168, 85, 247, 0.3)"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M0,150 Q120,170 250,140 T400,160"
            stroke="rgba(168, 85, 247, 0.5)"
            strokeWidth="4"
            fill="none"
          />

          {/* Calles verticales */}
          <path
            d="M80,0 Q70,100 80,200"
            stroke="rgba(168, 85, 247, 0.3)"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M200,0 Q220,100 200,200"
            stroke="rgba(168, 85, 247, 0.4)"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M320,0 Q300,100 320,200"
            stroke="rgba(168, 85, 247, 0.3)"
            strokeWidth="2"
            fill="none"
          />

          {/* Puntos de destino pulsantes */}
          <circle cx="200" cy="90" r="4" fill="rgba(139, 92, 246, 0.8)">
            <animate
              attributeName="r"
              values="4;8;4"
              dur="3s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="1;0.5;1"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="80" cy="50" r="3" fill="rgba(139, 92, 246, 0.7)">
            <animate
              attributeName="r"
              values="3;6;3"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="1;0.5;1"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="320" cy="150" r="3" fill="rgba(139, 92, 246, 0.7)">
            <animate
              attributeName="r"
              values="3;6;3"
              dur="4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="1;0.5;1"
              dur="4s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Coches animados en movimiento */}
          <use href="#car" x="0" y="95" width="20" height="10">
            <animateMotion
              path="M0,0 Q100,10 200,-10 T400,0"
              dur="8s"
              repeatCount="indefinite"
            />
          </use>
          <use href="#car" x="0" y="145" width="16" height="8">
            <animateMotion
              path="M400,0 Q250,20 120,-30 T0,10"
              dur="12s"
              repeatCount="indefinite"
            />
          </use>
          <use href="#car" x="0" y="45" width="14" height="7">
            <animateMotion
              path="M0,0 Q80,-10 200,20 T400,0"
              dur="10s"
              repeatCount="indefinite"
            />
          </use>

          {/* Rutas dinámicas */}
          <path
            d="M80,50 Q140,70 200,90"
            stroke="rgba(216, 180, 254, 0.9)"
            strokeWidth="1.5"
            strokeDasharray="5,3"
            fill="none"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="8;0"
              dur="3s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M200,90 Q260,120 320,150"
            stroke="rgba(216, 180, 254, 0.9)"
            strokeWidth="1.5"
            strokeDasharray="5,3"
            fill="none"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="8;0"
              dur="3s"
              repeatCount="indefinite"
            />
          </path>

          {/* Efecto de radar en destino principal */}
          <circle
            cx="200"
            cy="90"
            r="0"
            fill="none"
            stroke="rgba(139, 92, 246, 0.6)"
            strokeWidth="1"
          >
            <animate
              attributeName="r"
              values="0;50"
              dur="3s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </div>
    </div>
  );
}
