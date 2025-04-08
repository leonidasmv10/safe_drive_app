import { useState, useEffect, useRef } from "react";
import { Car, Navigation, Settings } from "lucide-react";
import { Warning } from "postcss";
import WarningAlert from "../shared/WarningAlert";

export default function CarView() {
  const [alertVisible, setAlertVisible] = useState(true);
  const [pulseVisible, setPulseVisible] = useState(true);

  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const animationIdRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const recordingRef = useRef(false);
  const chunksRef = useRef([]);
  const silencioTimerRef = useRef(null);

  const UMBRAL = 100; // Umbral de volumen
  const TIEMPO_SILENCIO = 2000; // Tiempo para detener la grabación si hay silencio

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseVisible((prev) => !prev);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const initAudio = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);

      // Configurar MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/wav" });
        chunksRef.current = [];

        const formData = new FormData();
        formData.append("audio", blob, "evento.wav");

        fetch("http://127.0.0.1:8000/models_ai/detection-critical-sound/", {
          method: "POST",
          body: formData,
        })
          .then((res) => res.json())
          .then((data) => console.log("Respuesta del backend:", data))
          .catch((err) => console.error("Error al enviar audio:", err));
      };

      draw();
    };

    initAudio();

    return () => {
      cancelAnimationFrame(animationIdRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const drawFrame = () => {
      animationIdRef.current = requestAnimationFrame(drawFrame);

      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      const avgVolume =
        dataArrayRef.current.reduce((sum, val) => sum + val, 0) /
        dataArrayRef.current.length;

      if (avgVolume > UMBRAL) {
        if (!recordingRef.current) {
          console.log("🎤 Iniciando grabación...");
          mediaRecorderRef.current.start();
          recordingRef.current = true;
        }

        if (silencioTimerRef.current) {
          clearTimeout(silencioTimerRef.current);
          silencioTimerRef.current = null;
        }
      } else {
        if (recordingRef.current && !silencioTimerRef.current) {
          silencioTimerRef.current = setTimeout(() => {
            console.log("🛑 Silencio detectado. Deteniendo grabación...");
            mediaRecorderRef.current.stop();
            recordingRef.current = false;
          }, TIEMPO_SILENCIO);
        }
      }

      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / dataArrayRef.current.length) * 2.5;
      let x = 0;

      for (let i = 0; i < dataArrayRef.current.length; i++) {
        const barHeight = dataArrayRef.current[i];
        ctx.fillStyle = `rgb(${barHeight + 100}, 50, 200)`;
        ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
        x += barWidth + 1;
      }
    };

    drawFrame();
  };

  return (
    <div className="flex flex-col h-screen bg-gray relative overflow-hidden">
      <div>
        <h2 className="text-xl font-bold">
          Visualización de audio en tiempo real
        </h2>
        <canvas
          ref={canvasRef}
          width={300}
          height={150}
          style={{ border: "1px solid #ccc", marginTop: "10px" }}
        />
      </div>

      {alertVisible && <WarningAlert></WarningAlert>}

      <div className="flex-1 relative flex justify-center items-center">
        <div
          className={`absolute left-1/3 transform -translate-x-1/2 ${
            pulseVisible ? "opacity-60" : "opacity-20"
          } transition-opacity duration-500`}
        >
          <div className="w-16 h-16 bg-red-500 rounded-full filter blur-md"></div>
        </div>

        <div className="w-32 h-64 bg-gray-100 relative">
          <div
            className="absolute inset-0 bg-white border-2 border-gray-200 rounded-lg shadow-lg"
            style={{
              clipPath:
                "polygon(15% 20%, 85% 20%, 95% 40%, 95% 85%, 5% 85%, 5% 40%)",
            }}
          >
            <div className="absolute left-1/4 right-1/4 top-1/3 bottom-1/2 bg-gray-800 rounded-sm"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
