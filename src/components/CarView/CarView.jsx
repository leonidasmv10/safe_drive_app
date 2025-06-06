import { useState } from "react";
import { Volume2, Settings, X, Camera, Power } from "lucide-react";
import { useAudio } from "@/context/AudioContext";
import { useVision } from "@/context/VisionContext";
import Webcam from "react-webcam";
import WarningAlert from "@/components/shared/WarningAlert";
const CarDirectionIndicator = ({ direction }) => {
  return (
    <div className="relative w-96 h-96 mx-auto">
      {/* Pulsating border/gradient around car when alert is active */}
      {direction && (
        <div className="absolute inset-0 rounded-full animate-pulse">
          {/* This creates a glowing border effect around the car */}
          <div className="absolute inset-0 rounded-full border-8  shadow-red-xl/30 animate-pulse"></div>

          {/* Directional gradient overlays */}
          <div
          // className={`absolute inset-0 ${
          //   direction === "LEFT"
          //     ? "bg-gradient-to-r from-red-500/50 to-transparent"
          //     : direction === "RIGHT"
          //     ? "bg-gradient-to-l from-red-500/50 to-transparent"
          //     : direction === "FRONT"
          //     ? "bg-gradient-to-b from-red-500/50 to-transparent"
          //     : direction === "REAR"
          //     ? "bg-gradient-to-t from-red-500/50 to-transparent"
          //     : ""
          // } rounded-full`}
          ></div>
        </div>
      )}

      {/* Indicadores de texto */}
      <div
        className={`absolute left-0 top-1/2 -translate-y-1/2 translate-x-5 px-2 py-1 ${
          direction === "LEFT" ? "text-red-600 font-bold" : "text-gray-400"
        }`}
      ></div>
      <div
        className={`absolute right-0 top-1/2 -translate-y-1/2 -translate-x-5 px-2 py-1 ${
          direction === "RIGHT" ? "text-red-600 font-bold" : "text-gray-400"
        }`}
      ></div>
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full px-2 py-1 ${
          direction === "FRONT" ? "text-red-600 font-bold" : "text-gray-400"
        }`}
      >
        FRONTAL
      </div>
      <div
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full px-2 py-1 ${
          direction === "REAR" ? "text-red-600 font-bold" : "text-gray-400"
        }`}
      >
        TRASERA
      </div>
      <img
        src="car.png"
        className="w-52 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      />
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
    showAlert: showAudioAlert,
    setShowAlert: setShowAudioAlert,
    alertType: audioAlertType,
    detectionStatus: audioDetectionStatus,
  } = useAudio();

  const {
    isDetecting,
    detectionStatus,
    showCamera,
    showAlert: showVisionAlert,
    alertType: visionAlertType,
    webcamRef,
    toggleCamera,
    toggleDetection,
  } = useVision();

  // Estilos para los estados de detección de visión
  const getVisionStatusColor = () => {
    switch (detectionStatus.status) {
      case "alert":
        return "bg-red-600";
      case "safe":
        return "bg-green-500";
      case "processing":
        return "bg-yellow-400";
      case "error":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  // Función para manejar la activación/desactivación de la visión
  const handleVisionToggle = () => {
    if (isDetecting) {
      // Si estamos desactivando, detenemos la cámara y la detección
      if (webcamRef.current) {
        const stream = webcamRef.current.video.srcObject;
        if (stream) {
          const tracks = stream.getTracks();
          tracks.forEach((track) => track.stop());
        }
      }
      toggleDetection();
      toggleCamera();
    } else {
      // Si estamos activando, encendemos la cámara y la detección
      toggleCamera();
      toggleDetection();
    }
  };

  return (
    <div className="flex flex-col h-screen relative overflow-hidden bg-gray-100">
      {/* Barra superior de estado */}
      <div className="bg-white shadow-sm p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isRecording
                    ? "bg-red-500 animate-pulse"
                    : isProcessing
                    ? "bg-yellow-500 animate-pulse"
                    : autoMode
                    ? "bg-green-500"
                    : "bg-gray-400"
                }`}
              ></div>
              <span className="text-sm font-medium text-gray-600">
                {audioDetectionStatus}
              </span>
            </div>
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isDetecting ? "bg-green-500" : "bg-gray-400"
                }`}
              ></div>
              <span className="text-sm font-medium text-gray-600">
                {isDetecting ? "Monitoreando entorno" : "Visión inactiva"}
              </span>
            </div>
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="flex items-center space-x-1">
              <Volume2 className="text-gray-400" size={16} />
              <span className="text-sm font-medium text-gray-600">
                {Math.round(volume)} dB
              </span>
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
        <div className="absolute top-4 left-0 right-0 z-50">
          {showAudioAlert && (
            <WarningAlert
              type={audioAlertType.toUpperCase()}
              direction={soundDirection}
              onClose={() => setShowAudioAlert(false)}
            />
          )}
          {showVisionAlert && isDetecting && (
            <WarningAlert
              type={visionAlertType.toUpperCase()}
              onClose={() => {}}
            />
          )}
        </div>

        {/* Indicador de dirección del coche */}
        <div className="flex-1 flex items-center justify-center w-full">
          <CarDirectionIndicator
            direction={showAudioAlert ? soundDirection : null}
          />
        </div>

        {/* Cámara flotante */}
        {isDetecting && (
          <div className="fixed top-20 right-4 z-40">
            <div className="relative group">
              <div className="w-32 h-24 rounded-lg overflow-hidden shadow-lg bg-black">
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  width="100%"
                  height="100%"
                  className="object-cover"
                  videoConstraints={{
                    width: 640,
                    height: 480,
                    facingMode: "environment",
                  }}
                />
                {/* Indicador de estado en esquina */}
                <div
                  className={`absolute top-2 right-2 h-2 w-2 rounded-full ${getVisionStatusColor()} ${
                    detectionStatus.status === "processing"
                      ? "animate-pulse"
                      : ""
                  }`}
                ></div>

                {/* Botón superpuesto que aparece al hacer hover */}
                <button
                  onClick={handleVisionToggle}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                           p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600 
                           transition-all duration-200 opacity-0 group-hover:opacity-100
                           shadow-lg backdrop-blur-sm"
                  title="Desactivar Visión"
                >
                  <Power className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Panel de configuración */}
      {showSettings && (
        <div className="absolute inset-0 bg-white z-50 p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Configuración
            </h2>
            <button
              onClick={() => setShowSettings(false)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Configuración de Audio */}
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

            {/* Configuración de Visión */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-800">
                  Detección de Visión
                </h3>
                <p className="text-sm text-gray-500">
                  Activa o desactiva la cámara y detección de objetos
                </p>
              </div>
              <button
                onClick={handleVisionToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isDetecting ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDetecting ? "translate-x-6" : "translate-x-1"
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
