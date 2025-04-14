import { useState, useEffect, useRef } from "react";

export default function Test() {
  const [isRecording, setIsRecording] = useState(false);
  const [autoMode, setAutoMode] = useState(false);

  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const streamRef = useRef(null);
  const animationIdRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const recordingRef = useRef(false);
  const chunksRef = useRef([]);
  const silencioTimerRef = useRef(null);

  const UMBRAL = 100; // Umbral de volumen
  const TIEMPO_SILENCIO = 2000; // Tiempo para detener la grabación si hay silencio

  useEffect(() => {
    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
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

          // Aquí puedes enviar el audio a tu backend para análisis
          console.log(
            "Audio grabado y listo para enviar",
            formData.get("audio")
          );

          // Ejemplo de envío al backend (comentado)
          /*
          fetch("http://127.0.0.1:8000/models_ai/detection-critical-sound/", {
            method: "POST",
            body: formData,
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
            .then((res) => res.json())
            .then((data) => console.log("Respuesta del backend:", data))
            .catch((err) => console.error("Error al enviar audio:", err));
          */
        };

        draw();
      } catch (err) {
        console.error("Error al inicializar el audio:", err);
      }
    };

    initAudio();

    return () => {
      cancelAnimationFrame(animationIdRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      if (silencioTimerRef.current) clearTimeout(silencioTimerRef.current);
      stopRecording();

      // Detener y liberar la transmisión de audio
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const drawFrame = () => {
      animationIdRef.current = requestAnimationFrame(drawFrame);

      if (!analyserRef.current || !dataArrayRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      const avgVolume =
        dataArrayRef.current.reduce((sum, val) => sum + val, 0) /
        dataArrayRef.current.length;

      // Modo automático - grabación basada en detección de sonido
      if (autoMode) {
        if (avgVolume > UMBRAL) {
          if (!recordingRef.current) {
            console.log("🎤 Iniciando grabación automática...");
            startRecording();
          }

          if (silencioTimerRef.current) {
            clearTimeout(silencioTimerRef.current);
            silencioTimerRef.current = null;
          }
        } else {
          if (recordingRef.current && !silencioTimerRef.current) {
            silencioTimerRef.current = setTimeout(() => {
              console.log("🛑 Silencio detectado. Deteniendo grabación...");
              stopRecording();
            }, TIEMPO_SILENCIO);
          }
        }
      }

      // Dibujar visualización de audio
      ctx.fillStyle = "#111827"; // Fondo oscuro
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / dataArrayRef.current.length) * 2.5;
      let x = 0;

      for (let i = 0; i < dataArrayRef.current.length; i++) {
        const barHeight = dataArrayRef.current[i];

        // Gradiente de color basado en la intensidad del audio
        const hue = 270 - barHeight / 2; // Tonos morados a azules
        ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;

        // Dibujar barras con bordes redondeados
        const height = barHeight / 1.8;
        const y = canvas.height - height;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + barWidth - 1, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + 1);
        ctx.lineTo(x + barWidth, y + height - 1);
        ctx.quadraticCurveTo(
          x + barWidth,
          y + height,
          x + barWidth - 1,
          y + height
        );
        ctx.lineTo(x + 1, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - 1);
        ctx.lineTo(x, y + 1);
        ctx.quadraticCurveTo(x, y, x + 1, y);
        ctx.fill();

        x += barWidth + 1;
      }
    };

    drawFrame();
  };

  const startRecording = () => {
    if (!recordingRef.current && mediaRecorderRef.current) {
      mediaRecorderRef.current.start();
      recordingRef.current = true;
      setIsRecording(true);
      console.log("🎤 Grabación iniciada manualmente");
    }
  };

  const stopRecording = () => {
    if (recordingRef.current && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      recordingRef.current = false;
      setIsRecording(false);
      console.log("🛑 Grabación detenida manualmente");
    }
  };

  const toggleAutoMode = () => {
    const newAutoMode = !autoMode;
    setAutoMode(newAutoMode);

    // Si estamos desactivando el modo automático y hay una grabación en curso, detenerla
    if (!newAutoMode && recordingRef.current) {
      stopRecording();
    }

    console.log(`Modo automático ${newAutoMode ? "activado" : "desactivado"}`);
  };

  return (
    <div className="flex flex-col gap-6 p-4 max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-xl font-bold mb-1 text-gray-800">Test de Audio</h1>
        <p className="text-gray-600 mb-4">
          Esta herramienta permite grabar y visualizar audio en tiempo real
        </p>

        {/* Visualizador de audio */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">
            Visualización de audio en tiempo real
          </h2>
          <canvas
            ref={canvasRef}
            width={600}
            height={200}
            className="w-full rounded-lg shadow-sm"
          />
        </div>

        {/* Controles de grabación */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`px-5 py-2.5 rounded-full font-medium flex items-center shadow-sm ${
              isRecording
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-purple-600 hover:bg-purple-700 text-white"
            } transition-colors`}
          >
            {isRecording ? (
              <>
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <rect x="6" y="6" width="12" height="12" />
                </svg>
                Detener Grabación
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <circle cx="12" cy="12" r="6" />
                </svg>
                Iniciar Grabación
              </>
            )}
          </button>

          <button
            onClick={toggleAutoMode}
            className={`px-5 py-2.5 rounded-full font-medium flex items-center shadow-sm ${
              autoMode
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            } transition-colors`}
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 8v8m-4-4h8" />
              <circle cx="12" cy="12" r="10" />
            </svg>
            {autoMode ? "Desactivar Modo Auto" : "Activar Modo Auto"}
          </button>
        </div>
      </div>

      {/* Estado */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="font-semibold mb-2 text-gray-700">Estado</h2>
        <div className="flex gap-4">
          <div className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full mr-2 ${
                isRecording ? "bg-red-500 animate-pulse" : "bg-gray-300"
              }`}
            ></div>
            <span className="text-sm text-gray-600">
              Grabación: {isRecording ? "Activa" : "Inactiva"}
            </span>
          </div>
          <div className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full mr-2 ${
                autoMode ? "bg-blue-500 animate-pulse" : "bg-gray-300"
              }`}
            ></div>
            <span className="text-sm text-gray-600">
              Modo automático: {autoMode ? "Activo" : "Inactivo"}
            </span>
          </div>
        </div>
      </div>

      {/* Información de umbral para modo automático */}
      {autoMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-500 mt-0.5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm text-blue-800">
                El modo automático está activado. La grabación comenzará
                automáticamente cuando se detecte un sonido por encima del
                umbral y se detendrá después de {TIEMPO_SILENCIO / 1000}{" "}
                segundos de silencio.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
