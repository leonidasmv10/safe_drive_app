import { useState } from "react";
import { Volume2, Settings, X } from "lucide-react";
import { useAudio } from "@/context/AudioContext";
import WarningAlert from "@/components/shared/WarningAlert";


// Componente del coche con indicadores de dirección
const CarDirectionIndicator = ({ direction }) => {
  return (
    <div className="relative w-64 h-64 mx-auto my-8">
      {/* Indicadores de dirección */}
      <div
        className={`absolute inset-0 ${
          direction === "LEFT"
            ? "bg-gradient-to-r from-red-500/50 to-transparent animate-pulse"
            : direction === "RIGHT"
            ? "bg-gradient-to-l from-red-500/50 to-transparent animate-pulse"
            : direction === "FRONT"
            ? "bg-gradient-to-b from-red-500/50 to-transparent animate-pulse"
            : direction === "REAR"
            ? "bg-gradient-to-t from-red-500/50 to-transparent animate-pulse"
            : ""
        } rounded-full`}
      ></div>

      {/* Coche central */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-32 h-16 bg-blue-600 rounded-lg transform -rotate-90">
          {/* Parabrisas */}
          <div className="absolute top-2 left-4 right-4 h-4 bg-blue-400 rounded"></div>
          {/* Ruedas */}
          <div className="absolute -left-1 top-2 w-2 h-6 bg-gray-800 rounded"></div>
          <div className="absolute -right-1 top-2 w-2 h-6 bg-gray-800 rounded"></div>
          <div className="absolute -left-1 bottom-2 w-2 h-6 bg-gray-800 rounded"></div>
          <div className="absolute -right-1 bottom-2 w-2 h-6 bg-gray-800 rounded"></div>
        </div>
      </div>

      {/* Indicadores de texto */}
      <div
        className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full px-2 py-1 ${
          direction === "LEFT" ? "text-red-600 font-bold" : "text-gray-400"
        }`}
      >
        LEFT
      </div>
      <div
        className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-full px-2 py-1 ${
          direction === "RIGHT" ? "text-red-600 font-bold" : "text-gray-400"
        }`}
      >
        RIGHT
      </div>
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full px-2 py-1 ${
          direction === "FRONT" ? "text-red-600 font-bold" : "text-gray-400"
        }`}
      >
        FRONT
      </div>
      <div
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full px-2 py-1 ${
          direction === "REAR" ? "text-red-600 font-bold" : "text-gray-400"
        }`}
      >
        REAR
      </div>
    </div>
  );
};

export default function CarView() {
  const [showSettings, setShowSettings] = useState(false);
  const {
    isRecording,
    isProcessing,
    autoMode,
    setAutoMode,
    volume,
    soundDirection,
    showAlert,
    setShowAlert,
    alertType,
    detectionStatus
  } = useAudio();

  return (
    <div className="flex flex-col h-screen relative overflow-hidden bg-gray-100">
      {/* Barra superior de estado */}
      <div className="bg-white shadow-sm p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                isRecording
                  ? "bg-red-500 animate-pulse"
                  : isProcessing
                  ? "bg-yellow-500 animate-pulse"
                  : autoMode
                  ? "bg-green-500"
                  : "bg-gray-400"
              }`}></div>
              <span className="text-sm font-medium text-gray-600">{detectionStatus}</span>
            </div>
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="flex items-center space-x-1">
              <Volume2 className="text-gray-400" size={16} />
              <span className="text-sm font-medium text-gray-600">{Math.round(volume)} dB</span>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Settings className="text-gray-600" size={20} />
          </button>
        </div>
      </div>

      {/* Panel principal */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
        {/* Alertas */}
        <div className="absolute top-4 left-0 right-0">
          {showAlert && (
            <WarningAlert
              type={alertType === "Sirena" ? "ambulance" : "police"}
              direction={soundDirection}
              onClose={() => setShowAlert(false)}
            />
          )}
        </div>

        {/* Indicador de dirección del coche */}
        <div className="flex-1 flex items-center justify-center w-full">
          <CarDirectionIndicator direction={showAlert ? soundDirection : null} />
        </div>

        {/* Barra de volumen */}
        <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                volume > 40 ? "bg-red-500" : "bg-blue-500"
              }`}
              style={{ width: `${Math.min(100, (volume / 150) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Panel de configuración */}
      {showSettings && (
        <div className="absolute inset-0 bg-white z-50 p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Configuración</h2>
            <button
              onClick={() => setShowSettings(false)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-800">Modo Automático</h3>
                <p className="text-sm text-gray-500">
                  Detecta sonidos críticos automáticamente
                </p>
              </div>
              <button
                onClick={() => setAutoMode(!autoMode)}
                disabled={isRecording || isProcessing}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoMode ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
