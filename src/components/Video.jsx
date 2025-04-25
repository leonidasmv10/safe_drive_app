import React from "react";
import Webcam from "react-webcam";
import { useVision } from "../context/VisionContext";
import WarningAlert from "./shared/WarningAlert";

const RealTimeDetection = () => {
  const {
    isDetecting,
    detectionStatus,
    lastDetection,
    detectionCount,
    showCamera,
    showAlert,
    alertType,
    webcamRef,
    toggleCamera,
    toggleDetection,
  } = useVision();

  // Estilos para los estados de detección
  const getStatusColor = () => {
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

  const getStatusText = () => {
    switch (detectionStatus.status) {
      case "alert":
        return `¡Alerta! ${detectionStatus.label || "Objeto"} detectado`;
      case "safe":
        return "Sin detecciones relevantes";
      case "processing":
        return "Procesando...";
      case "error":
        return "Error de detección";
      default:
        return "Esperando...";
    }
  };

  return (
    <>
      {/* Alerta de advertencia */}
      {showAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <WarningAlert
            message={`¡Alerta! Se ha detectado: ${alertType}`}
            type={alertType.toUpperCase()}
          />
        </div>
      )}

      <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg shadow-md">
        <div className="w-full max-w-xl">
          {/* Cabecera con controles */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Detección en Tiempo Real
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={toggleCamera}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                {showCamera ? "Ocultar Cámara" : "Mostrar Cámara"}
              </button>
              <button
                onClick={toggleDetection}
                className={`px-3 py-1 text-white rounded transition ${
                  isDetecting
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {isDetecting ? "Detener" : "Iniciar"}
              </button>
            </div>
          </div>

          {/* Cámara */}
          <div className="relative rounded-lg overflow-hidden bg-black">
            {showCamera ? (
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width="100%"
                height="auto"
                className="rounded-lg"
              />
            ) : (
              <div className="aspect-video bg-gray-800 flex items-center justify-center text-white">
                <div className="text-center">
                  <div className="text-2xl mb-2">Cámara oculta</div>
                  <div className="text-sm text-gray-300">
                    La detección sigue {isDetecting ? "activa" : "inactiva"}
                  </div>
                </div>
              </div>
            )}

            {/* Indicador de estado en esquina */}
            <div
              className={`absolute top-2 right-2 h-4 w-4 rounded-full ${getStatusColor()} ${
                detectionStatus.status === "processing" ? "animate-pulse" : ""
              }`}
            ></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RealTimeDetection;
