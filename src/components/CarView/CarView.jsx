import { useState, useEffect } from "react";
import { Car, Navigation, Settings } from "lucide-react";
import { Warning } from "postcss";
import WarningAlert from "../shared/WarningAlert";

export default function CarView() {
  const [alertVisible, setAlertVisible] = useState(true);
  const [pulseVisible, setPulseVisible] = useState(true);

  // Simular el efecto pulsante del círculo rojo
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseVisible((prev) => !prev);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray relative overflow-hidden">
      {/* Contenido principal */}

      {/* Alerta de policía */}
      {alertVisible && <WarningAlert></WarningAlert>}

      {/* Mapa con coche */}
      <div className="flex-1 relative flex justify-center items-center">
        {/* Círculo rojo pulsante */}
        <div
          className={`absolute left-1/3 transform -translate-x-1/2 ${
            pulseVisible ? "opacity-60" : "opacity-20"
          } transition-opacity duration-500`}
        >
          <div className="w-16 h-16 bg-red-500 rounded-full filter blur-md"></div>
        </div>

        {/* Imagen del coche */}
        <div className="w-32 h-64 bg-gray-100 relative">
          {/* Silueta de un coche */}
          <div
            className="absolute inset-0 bg-white border-2 border-gray-200 rounded-lg shadow-lg"
            style={{
              clipPath:
                "polygon(15% 20%, 85% 20%, 95% 40%, 95% 85%, 5% 85%, 5% 40%)",
            }}
          >
            {/* Parabrisas */}
            <div className="absolute left-1/4 right-1/4 top-1/3 bottom-1/2 bg-gray-800 rounded-sm"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
