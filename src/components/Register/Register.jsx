import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "@/App.css";
import { API_URL } from '@/api/config';
export default function Register() {
  const navigate = useNavigate();
  // Estados para los campos del formulario
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [preferredAlertType, setPreferredAlertType] = useState("visual");
  const [vehicleType, setVehicleType] = useState("car");
  const [subscription, setSubscription] = useState("free");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Manejar los cambios en los campos del formulario
  const userData = (e) => {
    const { id, value } = e.target;

    if (id === "username") {
      setUsername(value);
    } else if (id === "email") {
      setEmail(value);
    } else if (id === "password") {
      setPassword(value);
    } else if (id === "fullName") {
      setFullName(value);
    } else if (id === "phoneNumber") {
      setPhoneNumber(value);
    } else if (id === "preferredAlertType") {
      setPreferredAlertType(value);
    } else if (id === "vehicleType") {
      setVehicleType(value);
    } else if (id === "subscription") {
      setSubscription(value);
    }
  };

  // Manejar el envío del formulario
  const userSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Crear el objeto con los datos del formulario
    const userDataObj = {
      username,
      email,
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
      const response = await fetch(`${API_URL}/user/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userDataObj),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Registro exitoso");
        navigate("/");
      } else {
        setError(result.message || "Hubo un error en el registro");
      }
    } catch (error) {
      setError("Hubo un error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50 w-full pb-12">
      <div className="w-full max-w-md px-6 flex flex-col items-center z-10 relative pt-8">
        {/* Logo y título */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800">SafeDrive</h1>
          <h2 className="text-xl font-medium text-purple-600 mt-2">
            Crear Cuenta
          </h2>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-full mb-4 text-center">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={userSubmit} className="w-full space-y-4">
          {/* Sección de datos de cuenta */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-purple-100 mb-4">
            <h3 className="text-lg font-medium text-purple-800 mb-3">
              Datos de cuenta
            </h3>

            {/* Username */}
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <div className="w-6 h-6 rounded-full bg-purple-300 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-purple-700"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <input
                type="text"
                id="username"
                placeholder="Nombre de usuario"
                className="w-full py-3 pl-12 pr-3 rounded-full bg-white border border-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-300"
                value={username}
                onChange={userData}
                required
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs text-gray-500">
                <span className="absolute -top-2 left-12 bg-white px-1">
                  Usuario
                </span>
              </div>
            </div>

            {/* Email */}
            <div className="relative mb-4">
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
                id="email"
                placeholder="tu@email.com"
                className="w-full py-3 pl-12 pr-3 rounded-full bg-white border border-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-300"
                value={email}
                onChange={userData}
                required
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs text-gray-500">
                <span className="absolute -top-2 left-12 bg-white px-1">
                  Email
                </span>
              </div>
            </div>

            {/* Password */}
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <div className="w-6 h-6 rounded-full bg-purple-300 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-purple-700"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <input
                type="password"
                id="password"
                placeholder="••••••••••"
                className="w-full py-3 pl-12 pr-3 rounded-full bg-white border border-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-300"
                value={password}
                onChange={userData}
                required
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs text-gray-500">
                <span className="absolute -top-2 left-12 bg-white px-1">
                  Contraseña
                </span>
              </div>
            </div>
          </div>

          {/* Sección de datos personales */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-purple-100 mb-4">
            <h3 className="text-lg font-medium text-purple-800 mb-3">
              Datos personales
            </h3>

            {/* Nombre completo */}
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <div className="w-6 h-6 rounded-full bg-purple-300 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-purple-700"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
              </div>
              <input
                type="text"
                id="fullName"
                placeholder="Nombre y apellidos"
                className="w-full py-3 pl-12 pr-3 rounded-full bg-white border border-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-300"
                value={fullName}
                onChange={userData}
                required
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs text-gray-500">
                <span className="absolute -top-2 left-12 bg-white px-1">
                  Nombre
                </span>
              </div>
            </div>

            {/* Teléfono */}
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <div className="w-6 h-6 rounded-full bg-purple-300 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-purple-700"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
              </div>
              <input
                type="text"
                id="phoneNumber"
                placeholder="123456789"
                className="w-full py-3 pl-12 pr-3 rounded-full bg-white border border-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-300"
                value={phoneNumber}
                onChange={userData}
                required
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs text-gray-500">
                <span className="absolute -top-2 left-12 bg-white px-1">
                  Teléfono
                </span>
              </div>
            </div>
          </div>

          {/* Sección de preferencias */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-purple-100 mb-4">
            <h3 className="text-lg font-medium text-purple-800 mb-3">
              Preferencias
            </h3>

            {/* Tipo de alerta */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de alerta
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="alertType"
                    id="preferredAlertType"
                    value="visual"
                    checked={preferredAlertType === "visual"}
                    onChange={userData}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-gray-700">Visual</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="alertType"
                    id="preferredAlertType"
                    value="audio"
                    checked={preferredAlertType === "audio"}
                    onChange={userData}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-gray-700">Audio</span>
                </label>
              </div>
            </div>

            {/* Tipo de vehículo */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de vehículo
              </label>
              <select
                id="vehicleType"
                value={vehicleType}
                onChange={userData}
                className="w-full py-2 px-3 rounded-lg bg-white border border-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                <option value="car">Coche</option>
                <option value="motorcycle">Moto</option>
                <option value="van">Furgoneta</option>
                <option value="truck">Camión</option>
              </select>
            </div>

            {/* Tipo de suscripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de suscripción
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label
                  className={`border ${
                    subscription === "free"
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200"
                  } rounded-lg p-3 text-center cursor-pointer transition`}
                >
                  <input
                    type="radio"
                    name="subscription"
                    id="subscription"
                    value="free"
                    checked={subscription === "free"}
                    onChange={userData}
                    className="sr-only"
                  />
                  <span className="flex flex-col items-center">
                    <span className="text-lg font-medium text-gray-900">
                      Gratis
                    </span>
                    <span className="text-sm text-gray-500">
                      Funciones básicas
                    </span>
                  </span>
                </label>
                <label
                  className={`border ${
                    subscription === "premium"
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200"
                  } rounded-lg p-3 text-center cursor-pointer transition`}
                >
                  <input
                    type="radio"
                    name="subscription"
                    id="subscription"
                    value="premium"
                    checked={subscription === "premium"}
                    onChange={userData}
                    className="sr-only"
                  />
                  <span className="flex flex-col items-center">
                    <span className="text-lg font-medium text-gray-900">
                      Premium
                    </span>
                    <span className="text-sm text-gray-500">
                      Todas las funciones
                    </span>
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col gap-3 mt-6">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-purple-400 hover:bg-purple-500 text-white font-medium rounded-full flex items-center justify-center transition duration-200"
              disabled={loading}
            >
              <span>{loading ? "PROCESANDO..." : "CREAR CUENTA"}</span>
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
