import { createContext, useContext, useState, useRef, useEffect } from "react";
import { useLocation } from "./LocationContext";
import { useDetection } from "./DetectionContext";

const AudioContext = createContext();

const UMBRAL = 40;
const DURACION_GRABACION = 2000;
const DURACION_ALERTA = 5000;
const API_URL = import.meta.env.VITE_API_URL;

export function AudioProvider({ children }) {
  // Estados
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoMode, setAutoMode] = useState(true);
  const [volume, setVolume] = useState(0);
  const [soundDirection, setSoundDirection] = useState("LEFT");
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("Sirena");
  const [detectionStatus, setDetectionStatus] = useState("Monitoreando sonidos");
  const [isDetecting, setIsDetecting] = useState(true);

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

  // Contextos
  const { location } = useLocation();
  const { addDetection } = useDetection();

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

        sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
        sourceRef.current.connect(analyserRef.current);

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

  // Actualizar intensidad del sonido
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

  // Comprobar volumen y grabar si es necesario
  const checkVolumeAndRecord = () => {
    if (!analyserRef.current || !isDetecting || !autoMode) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    const avgVolume =
      Array.from(dataArray).reduce((sum, val) => sum + val, 0) / dataArray.length;
    setVolume(avgVolume);

    if (avgVolume > UMBRAL && !isRecording && !isProcessing) {
      startRecording();
    }
  };

  // Iniciar grabación
  const startRecording = async () => {
    if (isRecording || isProcessing || !streamRef.current || !isDetecting) return;

    try {
      setIsDetecting(false); // Detener nuevas detecciones
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
      setIsDetecting(true);
    }
  };

  // Procesar audio
  const processAudioData = async () => {
    if (!isDetecting) return; // Si ya estamos procesando, no hacer nada
    
    setIsRecording(false);
    setIsProcessing(true);
    setDetectionStatus("Procesando audio");
    setIsDetecting(false); // Bloquear nuevas detecciones inmediatamente

    try {
      if (audioDataRef.current.length === 0) {
        setIsProcessing(false);
        setIsDetecting(true);
        return;
      }

      const hasValidLocation = location?.latitude !== null && 
                             location?.latitude !== undefined && 
                             location?.longitude !== null && 
                             location?.longitude !== undefined &&
                             !(location.latitude === 0 && location.longitude === 0);

      if (!hasValidLocation) {
        console.log("Sin ubicación disponible, esperando GPS...");
        setIsProcessing(false);
        setIsDetecting(true);
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
      
      if (data?.predicted_label === "Sirena" || data?.predicted_label === "Bocina") {
        console.log(`Detección confirmada: ${data.predicted_label} - Bloqueando nuevas detecciones por ${DURACION_ALERTA}ms`);
        
        // Limpiar cualquier timer pendiente
        if (alertTimerRef.current) {
          clearTimeout(alertTimerRef.current);
          alertTimerRef.current = null;
        }

        setAlertType(data.predicted_label);
        setSoundDirection("LEFT");
        setShowAlert(true);
        setDetectionStatus("Alerta activa");

        // Agregar al mapa solo una vez
        addDetection({
          position: [location.latitude, location.longitude],
          type: "critical",
          description: data.predicted_label
        });

        // Mantener la detección bloqueada durante DURACION_ALERTA
        alertTimerRef.current = setTimeout(() => {
          console.log("Reactivando detección después del período de alerta");
          setShowAlert(false);
          setDetectionStatus("Monitoreando sonidos");
          setIsDetecting(true);
        }, DURACION_ALERTA);
      } else {
        // Si no es una detección crítica, reactivar inmediatamente
        setDetectionStatus("Monitoreando sonidos");
        setIsDetecting(true);
      }
    } catch (error) {
      console.error("Error al procesar audio:", error);
      setDetectionStatus("Error al procesar audio");
      // Reactivar después de un error
      setTimeout(() => {
        setDetectionStatus("Monitoreando sonidos");
        setIsDetecting(true);
      }, 3000);
    } finally {
      audioDataRef.current = [];
      setIsProcessing(false);
    }
  };

  // Iniciar detección automática
  const startAutoDetection = () => {
    if (!autoMode || !isDetecting) return;
    
    if (checkVolumeIntervalRef.current) {
      clearInterval(checkVolumeIntervalRef.current);
      checkVolumeIntervalRef.current = null;
    }
    
    checkVolumeIntervalRef.current = setInterval(checkVolumeAndRecord, 500); // Aumentado a 500ms
  };

  // Detener detección automática
  const stopAutoDetection = () => {
    if (checkVolumeIntervalRef.current) {
      clearInterval(checkVolumeIntervalRef.current);
      checkVolumeIntervalRef.current = null;
    }
  };

  // Detener todos los procesos
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

  // Efecto para manejar el modo automático
  useEffect(() => {
    if (autoMode && isDetecting) {
      startAutoDetection();
    } else {
      stopAutoDetection();
    }
  }, [autoMode, isDetecting]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      stopAllProcesses();
      if (alertTimerRef.current) {
        clearTimeout(alertTimerRef.current);
      }
    };
  }, []);

  const value = {
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
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio debe usarse dentro de un AudioProvider");
  }
  return context;
} 