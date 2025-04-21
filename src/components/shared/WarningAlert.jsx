import { useState, useEffect } from "react";
import { Car, AlertTriangle } from "lucide-react";

const WarningAlert = ({ direction = "LEFT", type = "police", onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isPulsing, setIsPulsing] = useState(true);

  // Efecto de pulsación
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setIsPulsing((prev) => !prev);
    }, 800);

    return () => clearInterval(pulseInterval);
  }, []);

  // Iconos según el tipo de alerta
  const alertIcons = {
    police: <Car className="text-red-600" size={20} />,
    ambulance: <AlertTriangle className="text-red-600" size={20} />,
  };

  // Textos según el tipo de alerta
  const alertTexts = {
    police: "BOCINA",
    ambulance: "SIRENA",
  };

  if (!isVisible) return null;

  return (
    <div className="bg-red-50 rounded-xl p-3 mb-4 flex items-center shadow-md animate-fadeIn relative">
      {/* Icono con fondo */}
      <div
        className={`bg-red-100 p-2 rounded-lg mr-3 ${
          isPulsing ? "animate-pulse" : ""
        }`}
      >
        {alertIcons[type] || alertIcons.police}
      </div>

      {/* Textos de alerta */}
      <div className="flex-1">
        <p className="text-red-600 font-bold text-sm">WARNING!</p>
        <p className="text-gray-800 text-sm font-medium">
          {alertTexts[type] || alertTexts.police} in your{" "}
          <span className="font-bold">{direction}</span>
        </p>
      </div>

      {/* Botón de cerrar (opcional) */}
      {onClose && (
        <button
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
          className="ml-2 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-red-100 transition-colors"
          aria-label="Cerrar alerta"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
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
  );
};

export default WarningAlert;
