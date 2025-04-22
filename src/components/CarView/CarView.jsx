import { useState, useEffect, useRef } from "react";
import { Volume2, AlertTriangle, Ear, Settings, X } from "lucide-react";
import { useLocation } from "@/context/LocationContext";
import { useDetection } from "@/context/DetectionContext";
import WarningAlert from "@/components/shared/WarningAlert";

// Tipos de sonidos críticos que podemos detectar
const CRITICAL_SOUNDS = {
  Bocina: {
    name: "Bocina de Vehículo",
    description: "Advertencia de vehículo cercano",
    action: "Verifique su entorno y ajuste su conducción",
    decibels: "100-110 dB",
    icon: "🚗",
  },
  Sirena: {
    name: "Sirena de Emergencia",
    description: "Vehículo de emergencia acercándose",
    action: "Reduzca la velocidad y muévase hacia un lado si es posible",
    decibels: "110-120 dB",
    icon: "🚨",
  }
};

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
  // Estados
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoMode, setAutoMode] = useState(true);
  const [volume, setVolume] = useState(0);
  const [soundDirection, setSoundDirection] = useState("LEFT");
  const [showSettings, setShowSettings] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("Sirena");
  const [detectionStatus, setDetectionStatus] = useState("Monitoreando sonidos");

  // Referencias
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const streamRef = useRef(null);
  const animationIdRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioDataRef = useRef([]);
  const checkVolumeIntervalRef = useRef(null);
  const alertTimerRef = useRef(null);

  // Contexto
  const { location } = useLocation();
  const { addDetection } = useDetection();

  // Constantes
  const UMBRAL = 40;
  const DURACION_GRABACION = 2000;
  const DURACION_ALERTA = 5000;
  const API_URL = import.meta.env.VITE_API_URL;

  // Cambiar la dirección periódicamente para demostrar funcionalidad
  useEffect(() => {
    const directions = ["LEFT", "RIGHT", "FRONT", "REAR"];
    let index = 0;

    const interval = setInterval(() => {
      index = (index + 1) % directions.length;
      setSoundDirection(directions[index]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (location?.latitude && location?.longitude) {
      //console.log("Ubicación recibida en CarView:", location);
    }
  });

  // Inicializar audio
  useEffect(() => {
    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        });
        streamRef.current = stream;

        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;

        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);

        sourceRef.current =
          audioContextRef.current.createMediaStreamSource(stream);
        sourceRef.current.connect(analyserRef.current);

        // Comenzar a analizar el audio
        updateSoundIntensity();
      } catch (err) {
        console.error("Error al inicializar el audio:", err);
      }
    };

    initAudio();

    return () => {
      stopAllProcesses();
      if (audioContextRef.current) audioContextRef.current.close();
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  // Iniciar detección automática
  const startAutoDetection = () => {
    setDetectionStatus("Monitoreando sonidos");
    if (checkVolumeIntervalRef.current) {
      clearInterval(checkVolumeIntervalRef.current);
    }
    checkVolumeIntervalRef.current = setInterval(() => {
      if (isRecording || isProcessing) return;
      checkVolumeAndRecord();
    }, 50);
  };

  // Detener detección automática
  const stopAutoDetection = () => {
    setDetectionStatus("Esperando");
    if (checkVolumeIntervalRef.current) {
      clearInterval(checkVolumeIntervalRef.current);
      checkVolumeIntervalRef.current = null;
    }
  };

  // Comprobar volumen y grabar si es necesario
  const checkVolumeAndRecord = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    const avgVolume =
      Array.from(dataArray).reduce((sum, val) => sum + val, 0) /
      dataArray.length;
    setVolume(avgVolume);

    // Solo grabar si supera el umbral y no está ya grabando o procesando
    if (avgVolume > UMBRAL && !isRecording && !isProcessing) {
      startRecording();
    }
  };

  // Actualizar la intensidad del sonido
  const updateSoundIntensity = () => {
    if (!analyserRef.current || !dataArrayRef.current) {
      animationIdRef.current = requestAnimationFrame(updateSoundIntensity);
      return;
    }

    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    const avgVolume =
      dataArrayRef.current.reduce((sum, val) => sum + val, 0) /
      dataArrayRef.current.length;
    setVolume(avgVolume);

    animationIdRef.current = requestAnimationFrame(updateSoundIntensity);
  };

  // Iniciar grabación
  const startRecording = async () => {
    if (isRecording || isProcessing || !streamRef.current) return;

    try {
      if (checkVolumeIntervalRef.current) {
        clearInterval(checkVolumeIntervalRef.current);
        checkVolumeIntervalRef.current = null;
      }

      const mediaRecorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = mediaRecorder;
      audioDataRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioDataRef.current.push(e.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDetectionStatus("Grabando audio");

      // Grabar durante 4 segundos
      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
        }
        setTimeout(() => {
          processAudioData();
        }, 300);
      }, DURACION_GRABACION);
    } catch (error) {
      console.error("Error al iniciar grabación:", error);
      setIsRecording(false);
      if (autoMode) {
        startAutoDetection();
      }
    }
  };

  // Procesar los datos de audio grabados
  const processAudioData = async () => {
    setIsRecording(false);
    setIsProcessing(true);
    setDetectionStatus("Procesando audio");

    try {
      if (audioDataRef.current.length === 0) {
        setIsProcessing(false);
        if (autoMode) {
          startAutoDetection();
        }
        return;
      }

      // Verificar que tenemos la ubicación antes de continuar
      if (!location?.latitude || !location?.longitude) {
        console.warn("No se pudo obtener la ubicación, reintentando...");
        setIsProcessing(false);
        if (autoMode) {
          startAutoDetection();
        }
        return;
      }

      const audioBlob = new Blob(audioDataRef.current, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("audio", audioBlob, "evento.wav");
      formData.append("latitude", location.latitude.toString());
      formData.append("longitude", location.longitude.toString());

      const response = await fetch(
        `${API_URL}/models_ai/detection-critical-sound/`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();
      console.log("data", data);
      // Solo mostrar alerta si la detección no es null
      if (data && data.predicted_label && data.predicted_label !== "null") {
        showWarningAlert(data);
      }
    } catch (error) {
      console.error("Error al procesar audio:", error);
    } finally {
      audioDataRef.current = [];
      setIsProcessing(false);
      setDetectionStatus("Monitoreando sonidos");
      if (autoMode) {
        startAutoDetection();
      }
    }
  };

  // Mostrar alerta de advertencia
  const showWarningAlert = (data) => {
    if (!data || data.predicted_label === "null") return;

    // Usar directamente el valor del servidor
    const alertType = data.predicted_label;
    let direction = "LEFT";

    // Mejorar la lógica de detección de dirección
    const label = data.predicted_label.toLowerCase();
    if (label.includes("right")) {
      direction = "RIGHT";
    } else if (label.includes("left")) {
      direction = "LEFT";
    } else if (label.includes("front")) {
      direction = "FRONT";
    } else if (label.includes("rear") || label.includes("back")) {
      direction = "REAR";
    }

    setAlertType(alertType);
    setSoundDirection(direction);
    setShowAlert(true);

    if (alertTimerRef.current) {
      clearTimeout(alertTimerRef.current);
    }

    alertTimerRef.current = setTimeout(() => {
      setShowAlert(false);
    }, DURACION_ALERTA);
  };

  // Detener todos los procesos activos
  const stopAllProcesses = () => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }
    if (checkVolumeIntervalRef.current) {
      clearInterval(checkVolumeIntervalRef.current);
      checkVolumeIntervalRef.current = null;
    }
    if (alertTimerRef.current) {
      clearTimeout(alertTimerRef.current);
      alertTimerRef.current = null;
    }
  };

  // Manejar cambios en autoMode
  useEffect(() => {
    if (autoMode) {
      startAutoDetection();
    } else {
      stopAutoDetection();
    }
  }, [autoMode]);

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
                volume > UMBRAL ? "bg-red-500" : "bg-blue-500"
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
