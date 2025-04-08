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

  // Simular el efecto pulsante del círculo rojo
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseVisible((prev) => !prev);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const initAudio = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      sourceRef.current =
        audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);

      draw(); // empieza la animación
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
          width={500}
          height={200}
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
