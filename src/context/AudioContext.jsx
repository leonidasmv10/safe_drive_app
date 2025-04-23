import { createContext, useContext, useState, useRef, useEffect } from "react";
import { useLocation } from "./LocationContext";
import { useDetection } from "./DetectionContext";
import RecordRTC from "recordrtc";

const AudioContext = createContext();

const UMBRAL = 40;
const DURACION_GRABACION = 2000;
const DURACION_ALERTA = 5000;
const API_URL = import.meta.env.VITE_API_URL;

export function AudioProvider({ children }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoMode, setAutoMode] = useState(true);
  const [volume, setVolume] = useState(0);
  const [soundDirection, setSoundDirection] = useState("LEFT");
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("Sirena");
  const [detectionStatus, setDetectionStatus] = useState("Monitoreando sonidos");
  const [isDetecting, setIsDetecting] = useState(true);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const streamRef = useRef(null);
  const animationIdRef = useRef(null);
  const checkVolumeIntervalRef = useRef(null);
  const alertTimerRef = useRef(null);
  const recorderRef = useRef(null);

  const { location } = useLocation();
  const { addDetection } = useDetection();

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

        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
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

  const updateSoundIntensity = () => {
    if (!analyserRef.current || !dataArrayRef.current) {
      animationIdRef.current = requestAnimationFrame(updateSoundIntensity);
      return;
    }

    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    const avgVolume = dataArrayRef.current.reduce((sum, val) => sum + val, 0) / dataArrayRef.current.length;
    setVolume(avgVolume);

    animationIdRef.current = requestAnimationFrame(updateSoundIntensity);
  };

  const checkVolumeAndRecord = () => {
    if (!analyserRef.current || !isDetecting || !autoMode) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    const avgVolume = Array.from(dataArray).reduce((sum, val) => sum + val, 0) / dataArray.length;
    setVolume(avgVolume);

    if (avgVolume > UMBRAL && !isRecording && !isProcessing) {
      startRecording();
    }
  };

  const startRecording = async () => {
    if (isRecording || isProcessing || !streamRef.current || !isDetecting) return;

    try {
      setIsDetecting(false);
      setIsRecording(true);
      setDetectionStatus("Grabando audio");

      const recorder = new RecordRTC(streamRef.current, {
        type: "audio",
        mimeType: "audio/wav",
        recorderType: RecordRTC.StereoAudioRecorder,
        desiredSampRate: 16000,
      });

      recorder.startRecording();
      recorderRef.current = recorder;

      setTimeout(() => {
        recorder.stopRecording(async () => {
          await processAudioData();
        });
      }, DURACION_GRABACION);
    } catch (error) {
      console.error("Error al iniciar grabación:", error);
      setIsRecording(false);
      setIsDetecting(true);
    }
  };

  const processAudioData = async () => {
    setIsRecording(false);
    setIsProcessing(true);
    setDetectionStatus("Procesando audio");

    try {
      const blob = recorderRef.current?.getBlob();

      if (!blob) {
        console.error("No hay blob de audio disponible.");
        setIsProcessing(false);
        setIsDetecting(true);
        return;
      }

      const hasValidLocation =
        location?.latitude &&
        location?.longitude &&
        !(location.latitude === 0 && location.longitude === 0);

      if (!hasValidLocation) {
        console.log("Sin ubicación disponible, esperando GPS...");
        setIsProcessing(false);
        setIsDetecting(true);
        return;
      }

      const formData = new FormData();
      formData.append("audio", blob, "evento.wav");
      formData.append("latitude", location.latitude.toString());
      formData.append("longitude", location.longitude.toString());

      const response = await fetch(`${API_URL}/models_ai/detection-critical-sound/`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      console.log("DATA:", data);

      if (data?.predicted_label === "Sirena" || data?.predicted_label === "Bocina") {
        setAlertType(data.predicted_label);
        setSoundDirection("LEFT");
        setShowAlert(true);
        setDetectionStatus("Alerta activa");

        addDetection({
          position: [location.latitude, location.longitude],
          type: data.predicted_label == "Sirena" ? "critical" : "warning",
          description: data.predicted_label,
        });

        if (alertTimerRef.current) clearTimeout(alertTimerRef.current);

        alertTimerRef.current = setTimeout(() => {
          setShowAlert(false);
          setDetectionStatus("Monitoreando sonidos");
          setIsDetecting(true);
        }, DURACION_ALERTA);
      } else {
        setDetectionStatus("Monitoreando sonidos");
        setIsDetecting(true);
      }
    } catch (error) {
      console.error("Error al procesar audio:", error);
      setDetectionStatus("Error al procesar audio");
      setTimeout(() => {
        setDetectionStatus("Monitoreando sonidos");
        setIsDetecting(true);
      }, 3000);
    } finally {
      recorderRef.current = null;
      setIsProcessing(false);
    }
  };

  const startAutoDetection = () => {
    if (!autoMode || !isDetecting) return;

    if (checkVolumeIntervalRef.current) {
      clearInterval(checkVolumeIntervalRef.current);
      checkVolumeIntervalRef.current = null;
    }

    checkVolumeIntervalRef.current = setInterval(checkVolumeAndRecord, 500);
  };

  const stopAutoDetection = () => {
    if (checkVolumeIntervalRef.current) {
      clearInterval(checkVolumeIntervalRef.current);
      checkVolumeIntervalRef.current = null;
    }
  };

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

  useEffect(() => {
    if (autoMode && isDetecting) {
      startAutoDetection();
    } else {
      stopAutoDetection();
    }
  }, [autoMode, isDetecting]);

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
    detectionStatus,
  };

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio debe usarse dentro de un AudioProvider");
  }
  return context;
}
