import { useState, useEffect, useRef } from "react";

export default function AudioDetectorFixedV2() {
  // Estados
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [volume, setVolume] = useState(0);
  const [logs, setLogs] = useState([]);
  const [lastResponse, setLastResponse] = useState(null);
  const [detectionStatus, setDetectionStatus] = useState("Esperando");

  // Referencias
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const timerRef = useRef(null);
  const checkVolumeIntervalRef = useRef(null);
  const audioDataRef = useRef([]);

  // Constantes
  const UMBRAL = 50;
  const DURACION_GRABACION = 4000; // 2 segundos

  // Log con timestamp
  const addLog = (message) => {
    console.log(message);
    setLogs((prev) => [
      `${new Date().toLocaleTimeString()}: ${message}`,
      ...prev.slice(0, 19),
    ]);
  };

  // Inicializar componentes de audio al montar
  useEffect(() => {
    async function setupAudio() {
      try {
        addLog("🎤 Inicializando sistema de audio...");

        // Solicitar acceso al micrófono
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        });
        streamRef.current = stream;
        addLog("✅ Micrófono conectado");

        // Crear contexto de audio
        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();

        // Asegurarse de que esté activo
        if (audioContextRef.current.state === "suspended") {
          await audioContextRef.current.resume();
        }

        // Configurar analizador de audio
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;

        // Conectar fuente al analizador
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);

        // Iniciar visualización
        startVisualization();
        addLog("✅ Sistema inicializado correctamente");
      } catch (error) {
        addLog(`❌ Error en inicialización: ${error.message}`);
      }
    }

    setupAudio();

    // Limpieza al desmontar
    return () => {
      stopAllProcesses();

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
      }

      addLog("🧹 Recursos liberados");
    };
  }, []);

  // Manejar cambios en autoMode
  useEffect(() => {
    if (autoMode) {
      startAutoDetection();
    } else {
      stopAutoDetection();
    }
  }, [autoMode]);

  // Detener todos los procesos activos
  const stopAllProcesses = () => {
    // Cancelar animación
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Cancelar temporizadores e intervalos
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (checkVolumeIntervalRef.current) {
      clearInterval(checkVolumeIntervalRef.current);
      checkVolumeIntervalRef.current = null;
    }
  };

  // Iniciar detección automática
  const startAutoDetection = () => {
    addLog("🔍 Iniciando detección automática");
    setDetectionStatus("Monitoreando audio");

    // Detener intervalo anterior si existe
    if (checkVolumeIntervalRef.current) {
      clearInterval(checkVolumeIntervalRef.current);
    }

    // Crear nuevo intervalo para comprobar volumen
    checkVolumeIntervalRef.current = setInterval(() => {
      // No verificar si estamos grabando o procesando
      if (isRecording || isProcessing) return;

      checkVolumeAndRecord();
    }, 100);
  };

  // Detener detección automática
  const stopAutoDetection = () => {
    addLog("🛑 Detección automática desactivada");
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

    if (avgVolume > UMBRAL) {
      addLog(`🔊 Volumen detectado: ${Math.round(avgVolume)} > ${UMBRAL}`);
      startRecording();
    }
  };

  // Visualización de audio
  const startVisualization = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyserRef.current.getByteFrequencyData(dataArray);

      // Actualizar volumen en el estado
      const avgVolume =
        Array.from(dataArray).reduce((sum, val) => sum + val, 0) /
        dataArray.length;
      setVolume(Math.round(avgVolume));

      // Dibujar visualización
      ctx.fillStyle = "#111827";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i];
        ctx.fillStyle =
          barHeight > UMBRAL ? "rgb(239, 68, 68)" : "rgb(59, 130, 246)";
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }

      // Línea de umbral
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - UMBRAL);
      ctx.lineTo(canvas.width, canvas.height - UMBRAL);
      ctx.strokeStyle = "yellow";
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    draw();
  };

  // Iniciar grabación
  const startRecording = async () => {
    if (isRecording || isProcessing) {
      addLog("⚠️ No se puede iniciar grabación: sistema ocupado");
      return;
    }

    if (!streamRef.current) {
      addLog("❌ No hay acceso al micrófono");
      return;
    }

    try {
      // Detener la detección automática temporalmente
      if (checkVolumeIntervalRef.current) {
        clearInterval(checkVolumeIntervalRef.current);
        checkVolumeIntervalRef.current = null;
      }

      // Limpiar temporizador anterior si existe
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Crear un nuevo MediaRecorder cada vez (evita problemas de estado)
      const mediaRecorder = new MediaRecorder(streamRef.current);
      audioDataRef.current = []; // Limpiar datos anteriores

      // Configurar handlers
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioDataRef.current.push(e.data);
        }
      };

      // No usamos el evento onstop aquí para evitar problemas de sincronización

      // Iniciar grabación
      mediaRecorder.start();
      setIsRecording(true);
      setDetectionStatus("Grabando audio");
      addLog("🎤 Grabación iniciada (2 segundos)");

      // Programar detención después de 2 segundos
      timerRef.current = setTimeout(() => {
        addLog("⏱️ Temporizador completado");

        try {
          // Detener grabación
          if (mediaRecorder.state === "recording") {
            mediaRecorder.stop();
            addLog("🛑 Grabación detenida");
          }

          // Procesar los datos de audio después de un breve retraso
          // para asegurar que todos los datos estén disponibles
          setTimeout(() => {
            processAudioData();
          }, 300);
        } catch (error) {
          addLog(`❌ Error al detener grabación: ${error.message}`);
          setIsRecording(false);

          // Reiniciar detección automática si está activada
          if (autoMode) {
            startAutoDetection();
          }
        }
      }, DURACION_GRABACION);
    } catch (error) {
      addLog(`❌ Error al iniciar grabación: ${error.message}`);
      setIsRecording(false);

      // Reiniciar detección automática si está activada
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
        addLog("⚠️ No hay datos de audio para procesar");
        setIsProcessing(false);

        // Reiniciar detección automática si está activada
        if (autoMode) {
          startAutoDetection();
        }
        return;
      }

      const audioBlob = new Blob(audioDataRef.current, { type: "audio/webm" });
      addLog(`🎵 Audio capturado: ${Math.round(audioBlob.size / 1024)} KB`);

      // Preparar datos para envío
      const formData = new FormData();
      formData.append("audio", audioBlob, "evento.wav");

      addLog("🌐 Enviando audio al servidor...");

      // Enviar al servidor
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/models_ai/detection-critical-sound/",
          {
            method: "POST",
            body: formData,
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = await response.json();
        addLog(`✅ Respuesta recibida: ${JSON.stringify(data)}`);
        setLastResponse(data);
      } catch (error) {
        addLog(`❌ Error de comunicación: ${error.message}`);
      }
    } catch (error) {
      addLog(`❌ Error al procesar audio: ${error.message}`);
    } finally {
      // Limpiar datos de audio
      audioDataRef.current = [];

      // Restaurar estado
      setIsProcessing(false);
      setDetectionStatus("Esperando");

      // Reiniciar detección automática si está activada
      if (autoMode) {
        startAutoDetection();
      }
    }
  };

  // Detener grabación manualmente
  const stopRecording = () => {
    if (!isRecording) return;

    // Cancelar temporizador
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    addLog("⏹️ Grabación detenida manualmente");
    processAudioData();
  };

  // Forzar activación del contexto de audio
  const forceActivateAudio = async () => {
    if (!audioContextRef.current) {
      addLog("❌ Contexto de audio no disponible");
      return;
    }

    try {
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
        addLog(
          `✅ Contexto de audio activado: ${audioContextRef.current.state}`
        );
      } else {
        addLog(
          `ℹ️ El contexto ya está activo: ${audioContextRef.current.state}`
        );
      }
    } catch (error) {
      addLog(`❌ Error al activar audio: ${error.message}`);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h1 className="text-xl font-bold mb-2">
          Detector de Sonidos Críticos v2
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          Versión reimplementada con creación dinámica de MediaRecorder
        </p>

        <div className="mb-4">
          <canvas
            ref={canvasRef}
            width={500}
            height={150}
            className="w-full bg-gray-900 rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Umbral: {UMBRAL} | Duración grabación: {DURACION_GRABACION / 1000}s
          </p>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setAutoMode(!autoMode)}
            disabled={isRecording || isProcessing}
            className={`flex-1 py-2 px-4 rounded-lg font-medium ${
              autoMode
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            } ${
              isRecording || isProcessing ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Modo Auto: {autoMode ? "ON" : "OFF"}
          </button>

          <button
            onClick={forceActivateAudio}
            className="flex-1 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
          >
            Activar Audio
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-100 p-3 rounded-lg">
            <h2 className="font-medium mb-2 text-sm">Estado</h2>

            <div className="flex items-center mb-2">
              <div
                className={`w-3 h-3 rounded-full mr-2 ${
                  isRecording
                    ? "bg-red-500 animate-pulse"
                    : isProcessing
                    ? "bg-yellow-500 animate-pulse"
                    : autoMode
                    ? "bg-green-500"
                    : "bg-gray-400"
                }`}
              ></div>
              <span className="text-sm">{detectionStatus}</span>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Volumen:</span>
                <span
                  className={volume > UMBRAL ? "text-red-500 font-medium" : ""}
                >
                  {volume}
                </span>
              </div>

              <div className="w-full bg-gray-300 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    volume > UMBRAL ? "bg-red-500" : "bg-blue-500"
                  }`}
                  style={{ width: `${Math.min(100, (volume / 150) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-medium text-sm">Acciones</h2>
            </div>

            <button
              onClick={startRecording}
              disabled={isRecording || isProcessing}
              className={`w-full py-2 mb-2 text-white rounded-lg text-sm font-medium ${
                isRecording || isProcessing
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-purple-500 hover:bg-purple-600"
              }`}
            >
              Grabar 2s Manualmente
            </button>

            <button
              onClick={stopRecording}
              disabled={!isRecording}
              className={`w-full py-2 text-white rounded-lg text-sm font-medium ${
                !isRecording
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              Detener Grabación
            </button>
          </div>
        </div>

        {/* Resultados */}
        {lastResponse && (
          <div
            className={`mt-4 p-3 rounded-lg ${
              lastResponse.is_critical
                ? "bg-red-50 border border-red-200"
                : "bg-blue-50 border border-blue-200"
            }`}
          >
            <h3 className="text-sm font-medium mb-1">Última detección:</h3>
            <div className="text-sm">
              <div className="flex justify-between">
                <span>Resultado:</span>
                <span className="font-medium">
                  {lastResponse.result || "Sin resultado"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Confianza:</span>
                <span className="font-medium">
                  {Math.round((lastResponse.score || 0) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Crítico:</span>
                <span
                  className={`font-medium ${
                    lastResponse.is_critical ? "text-red-600" : "text-blue-600"
                  }`}
                >
                  {lastResponse.is_critical ? "Sí" : "No"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Log */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="font-medium mb-2">Registro de Actividad</h2>
        <div className="bg-gray-900 rounded-lg p-3 max-h-36 overflow-y-auto text-xs font-mono text-white">
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))
          ) : (
            <div className="text-gray-500">Esperando actividad...</div>
          )}
        </div>
      </div>
    </div>
  );
}
