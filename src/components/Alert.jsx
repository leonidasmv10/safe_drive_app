import { useState, useEffect } from "react";
import { Car, Navigation, Settings } from "lucide-react";

export default function PoliceCarAlert() {
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
    <div className="flex flex-col h-screen bg-gray-100 relative overflow-hidden">
      {/* Simulación de la barra de estado */}
      {/* <div className="bg-black text-white p-2 flex justify-between items-center">
        <span className="text-xs">9:41</span>
        <div className="w-12 h-4 bg-black rounded-full"></div>
        <div className="flex items-center gap-1 text-xs">
          <span className="font-bold">●●●</span>
          <span>📶</span>
          <span>🔋</span>
        </div>
      </div> */}

      {/* Contenido principal */}
      <div>
        {/* Alerta de policía */}
        {alertVisible && (
          <div className="bg-red-50 rounded-xl p-3 mb-6 flex items-center shadow-md">
            <div className="bg-red-100 p-2 rounded-lg mr-3">
              <Car className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-red-600 font-bold text-sm">WARNING!</p>
              <p className="text-gray-800 text-sm">POLICE CAR in your LEFT</p>
            </div>
          </div>
        )}

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
    </div>
  );
}
