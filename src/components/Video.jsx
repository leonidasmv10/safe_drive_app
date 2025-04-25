import React, { useRef, useEffect } from "react";
import Webcam from "react-webcam";

const API_URL = import.meta.env.VITE_API_URL;

const RealTimeDetection = () => {
  const webcamRef = useRef(null);

  const sendFrame = async () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();

    const res = await fetch(`${API_URL}/models_ai/detection-vision/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },

      body: JSON.stringify({ image: imageSrc }),
    });

    const data = await res.json();
    if (data.alert && data.detections[0].label != "person") {
      console.log(data.detections[0].label);
      console.log("🚨 ALERTA DETECTADA:", data.detections);
    } else {
      console.log("✅ Sin detección relevante");
    }
  };

  useEffect(() => {
    const interval = setInterval(sendFrame, 2000); // cada 2 segundos
    return () => clearInterval(interval);
  }, []);

  return <Webcam ref={webcamRef} screenshotFormat="image/jpeg" width={640} />;
};

export default RealTimeDetection;
