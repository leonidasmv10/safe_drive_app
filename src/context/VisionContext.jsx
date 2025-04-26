import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { useLocation } from "./LocationContext";
import { useDetection } from "./DetectionContext";

const VisionContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL;
const DURACION_ALERTA = 5000; // 5 segundos

export const VisionProvider = ({ children }) => {
  const [isDetecting, setIsDetecting] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState({
    status: "waiting",
    label: null,
  });
  const [lastDetection, setLastDetection] = useState(null);
  const [detectionCount, setDetectionCount] = useState(0);
  const [showCamera, setShowCamera] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState(null);

  const webcamRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const alertTimerRef = useRef(null);

  const { location } = useLocation();
  const { addDetection } = useDetection();

  const sendFrame = async () => {
    if (!webcamRef.current || !isDetecting) return;

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      setDetectionStatus({ status: "processing", label: null });

      const res = await fetch(`${API_URL}/models_ai/detection-vision/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ image: imageSrc }),
      });

      const data = await res.json();
      // console.log(data);

      if (data.alert && data.detections[0].label !== "person") {
        let label = data.detections[0].label;
        switch (label) {
          case "person-on-scooter-side-view":
            setAlertType("Persona en patinete");
            break;
          default:
            break;
        }

        setDetectionStatus({
          status: "alert",
          label: label,
        });
        setLastDetection(data.detections);
        setDetectionCount((prev) => prev + 1);
        setShowAlert(true);

        // Clear any existing alert timer
        if (alertTimerRef.current) {
          clearTimeout(alertTimerRef.current);
        }

        // Set new alert timer
        alertTimerRef.current = setTimeout(() => {
          setShowAlert(false);
          setDetectionStatus({ status: "safe", label: null });
        }, DURACION_ALERTA);
      } else {
        setDetectionStatus({ status: "safe", label: null });
      }
    } catch (error) {
      console.error("Error en la detección:", error);
      setDetectionStatus({ status: "error", label: null });
    }
  };

  const startDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    detectionIntervalRef.current = setInterval(sendFrame, 2000); // cada 2 segundos
  };

  const stopDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  };

  useEffect(() => {
    if (isDetecting) {
      startDetection();
    } else {
      stopDetection();
    }

    return () => {
      stopDetection();
      if (alertTimerRef.current) {
        clearTimeout(alertTimerRef.current);
      }
    };
  }, [isDetecting]);

  const toggleCamera = () => {
    setShowCamera((prev) => !prev);
  };

  const toggleDetection = () => {
    setIsDetecting((prev) => !prev);
  };

  const value = {
    isDetecting,
    isProcessing,
    detectionStatus,
    lastDetection,
    detectionCount,
    showCamera,
    showAlert,
    alertType,
    webcamRef,
    toggleCamera,
    toggleDetection,
  };

  return (
    <VisionContext.Provider value={value}>{children}</VisionContext.Provider>
  );
};

export const useVision = () => {
  const context = useContext(VisionContext);
  if (!context) {
    throw new Error("useVision debe usarse dentro de un VisionProvider");
  }
  return context;
};
