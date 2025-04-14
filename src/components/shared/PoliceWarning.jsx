import { useState, useEffect } from "react";
import { AlertTriangle, Police, Ambulance, Camera } from "lucide-react";

const PoliceWarning = ({
  position = "LEFT",
  distance = "50m",
  type = "police",
  theme = "red",
  onDismiss,
}) => {
  const [isPulsing, setIsPulsing] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  // Temas de colores
  const themeColors = {
    red: {
      primary: "bg-red-500",
      secondary: "bg-red-600",
      text: "text-red-600",
      gradient: "from-red-500 to-red-600",
      hover: "hover:bg-red-600/30",
    },
    blue: {
      primary: "bg-blue-500",
      secondary: "bg-blue-600",
      text: "text-blue-600",
      gradient: "from-blue-500 to-blue-600",
      hover: "hover:bg-blue-600/30",
    },
    amber: {
      primary: "bg-amber-500",
      secondary: "bg-amber-600",
      text: "text-amber-600",
      gradient: "from-amber-500 to-amber-600",
      hover: "hover:bg-amber-600/30",
    },
    purple: {
      primary: "bg-purple-500",
      secondary: "bg-purple-600",
      text: "text-purple-600",
      gradient: "from-purple-500 to-purple-600",
      hover: "hover:bg-purple-600/30",
    },
  };

  // Tipos de alertas
  const alertTypes = {
    police: {
      icon: <Police className="text-white h-5 w-5" />,
      title: "POLICE CAR",
    },
    ambulance: {
      icon: <Ambulance className="text-white h-5 w-5" />,
      title: "AMBULANCE",
    },
    camera: {
      icon: <Camera className="text-white h-5 w-5" />,
      title: "SPEED CAMERA",
    },
  };

  // Obtener colores del tema
  const colors = themeColors[theme] || themeColors.red;
  // Obtener tipo de alerta
  const alertInfo = alertTypes[type] || alertTypes.police;

  // Efecto para la animación de pulso
  useEffect(() => {
    const interval = setInterval(() => {
      setIsPulsing((prev) => !prev);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  // Animación de desvanecimiento al cerrar
  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`absolute top-2 left-2 right-2 bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 border border-gray-100 ${
        isVisible ? "opacity-100" : "opacity-0 -translate-y-4"
      }`}
    >
      {/* Contenido principal de la alerta */}
      <div className="flex items-center p-4">
        {/* Ícono con animación de pulso */}
        <div
          className={`${
            isPulsing ? colors.primary : colors.secondary
          } rounded-full p-3 mr-4 transition-colors duration-300 flex items-center justify-center shadow-inner`}
        >
          {alertInfo.icon}
        </div>

        {/* Información de la alerta */}
        <div className="flex-1">
          <p className="font-bold text-gray-900 flex items-center flex-wrap text-base">
            <span className="mr-1">{alertInfo.title}</span>
            <span className="font-normal text-gray-600 text-sm mr-1">
              in your
            </span>
            <span className={`font-bold ${colors.text}`}>{position}</span>
          </p>

          {/* Información de distancia */}
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <span
              className={`inline-block w-2 h-2 rounded-full ${colors.primary} mr-2`}
            ></span>
            <span>Aproximadamente a {distance}</span>
          </div>
        </div>

        {/* Botón de cerrar (opcional) */}
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className={`ml-2 text-gray-400 hover:${colors.text} p-1.5 rounded-full hover:bg-gray-100 transition-colors`}
            aria-label="Cerrar alerta"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Barra de advertencia inferior */}
      <div
        className={`bg-gradient-to-r ${colors.gradient} p-2 px-4 flex items-center justify-between`}
      >
        <div className="text-white flex items-center">
          <AlertTriangle className="w-4 h-4 mr-2" strokeWidth={2.5} />
          <span className="text-sm font-bold tracking-wide">WARNING</span>
        </div>

        {/* Indicador de severidad */}
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-white rounded-full opacity-90"></div>
          <div className="w-2 h-2 bg-white rounded-full opacity-60"></div>
          <div className="w-2 h-2 bg-white rounded-full opacity-30"></div>
        </div>
      </div>
    </div>
  );
};

// Ejemplo de uso:
// <PoliceWarning
//   position="RIGHT"
//   distance="100m"
//   type="ambulance"
//   theme="blue"
//   onDismiss={() => console.log("Alerta cerrada")}
// />

export default PoliceWarning;
