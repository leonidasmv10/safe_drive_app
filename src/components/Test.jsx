import { useState, useEffect, useRef } from "react";
import { DetectionResults } from "@/components/DetectionResults";

// Procesador de AudioWorklet para análisis fuera del hilo principal
const audioWorkletCode = `
  class AudioDetectorProcessor extends AudioWorkletProcessor {
    constructor() {
      super();
      this._frameCounter = 0;
      this._frameInterval = 24; // Aproximadamente 500ms con un buffer de 128 a 48kHz
      this._lastFrameTime = currentTime;
      
      this.port.onmessage = (event) => {
        if (event.data.type === 'config') {
          // Convertir tiempo en ms a número de frames
          this._frameInterval = Math.round((event.data.frameTime / 1000) * sampleRate / 128);
        }
      };
    }

    process(inputs, outputs, parameters) {
      const input = inputs[0];
      if (!input || !input.length) return true;
      
      const channelData = input[0];
      if (!channelData) return true;
      
      // Incrementar contador de frames
      this._frameCounter++;
      
      // Calcular volumen RMS (root mean square)
      let sumSquares = 0;
      for (let i = 0; i < channelData.length; i++) {
        sumSquares += channelData[i] * channelData[i];
      }
      const rms = Math.sqrt(sumSquares / channelData.length);
      const volumen = rms * 1000; // Escalar para comparar con umbral
      
      // Enviar cada frame directamente al backend - clave para detección tiempo real
      if (this._frameCounter >= this._frameInterval) {
        // Tiempo transcurrido desde el último frame
        const frameTime = currentTime - this._lastFrameTime;
        this._lastFrameTime = currentTime;
        
        // Enviar frame de audio crudo para análisis inmediato
        this.port.postMessage({
          type: 'audioFrame',
          audioData: new Float32Array(channelData),
          volumen,
          timestamp: currentTime,
          frameTime: frameTime
        });
        
        // Resetear contador
        this._frameCounter = 0;
      }
      
      // Siempre enviar métricas para visualización cada ~50ms
      if (currentTime % 0.05 < 128/sampleRate) {
        this.port.postMessage({
          type: 'metricas',
          volumen,
          timestamp: currentTime
        });
      }
      
      return true; // Seguir procesando
    }
  }
  
  registerProcessor('audio-detector-processor', AudioDetectorProcessor);`;

export default function AudioDetector() {
  const [isActive, setIsActive] = useState(true);
  const [frameTime, setFrameTime] = useState(500); // 500ms por defecto entre frames
  const [volumenActual, setVolumenActual] = useState(0);
  const [conexionWS, setConexionWS] = useState(false);
  const [audioData, setAudioData] = useState([]);
  const [lastDetection, setLastDetection] = useState(null);
  const [detectionCount, setDetectionCount] = useState(0);
  const [processingTime, setProcessingTime] = useState(0);
  const [wsStatus, setWsStatus] = useState("desconectado");
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [audioContextState, setAudioContextState] = useState("suspended");

  const [allMessages, setAllMessages] = useState([]);
  const [debugVisible, setDebugVisible] = useState(false);

  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioWorkletNodeRef = useRef(null);
  const streamRef = useRef(null);
  const sourceRef = useRef(null);
  const animationIdRef = useRef(null);
  const webSocketRef = useRef(null);
  const frameCountRef = useRef(0);
  const messageQueueRef = useRef([]);
  const analyserRef = useRef(null);
  const gainNodeRef = useRef(null);

  // CORRECCIÓN CLAVE: No inicializar automáticamente el audio
  // Esperar a que el usuario haga clic en el botón de activación

  // Inicializar el audio solo después de la interacción del usuario
  const initializeAudio = async () => {
    try {
      console.log("Iniciando sistema de audio por interacción del usuario");

      // Crear o reanudar el contexto de audio
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)({
          sampleRate: 48000,
          latencyHint: "interactive",
        });
      } else if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }

      // Actualizar estado del AudioContext
      setAudioContextState(audioContextRef.current.state);
      console.log("Estado del AudioContext:", audioContextRef.current.state);

      // Solo continuar si el contexto está realmente ejecutándose
      if (audioContextRef.current.state !== "running") {
        console.warn(
          "AudioContext no pudo iniciarse. Estado:",
          audioContextRef.current.state
        );
        return false;
      }

      // Solicitar acceso al micrófono
      console.log("Solicitando acceso al micrófono...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      console.log("Micrófono conectado:", stream.getAudioTracks()[0].label);
      streamRef.current = stream;

      // Crear nodo de entrada de audio
      sourceRef.current =
        audioContextRef.current.createMediaStreamSource(stream);

      // Crear nodo analizador para visualización
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      // Cargar el AudioWorklet
      const workletBlob = new Blob([audioWorkletCode], {
        type: "application/javascript",
      });
      const workletURL = URL.createObjectURL(workletBlob);

      await audioContextRef.current.audioWorklet.addModule(workletURL);
      console.log("AudioWorklet cargado correctamente");

      // Crear nodo AudioWorklet
      audioWorkletNodeRef.current = new AudioWorkletNode(
        audioContextRef.current,
        "audio-detector-processor",
        {
          outputChannelCount: [1],
          processorOptions: {
            frameTime: frameTime,
          },
        }
      );

      // Crear nodo de ganancia para monitoreo opcional
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = 0; // Inicialmente silenciado

      // Configurar manejador de mensajes
      audioWorkletNodeRef.current.port.onmessage = handleAudioProcessorMessage;

      // Configurar el procesador
      audioWorkletNodeRef.current.port.postMessage({
        type: "config",
        frameTime: frameTime,
      });

      // CORRECCIÓN CLAVE: Conectar los nodos DESPUÉS de que el contexto esté activo
      sourceRef.current.connect(analyserRef.current);
      sourceRef.current.connect(audioWorkletNodeRef.current);
      audioWorkletNodeRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(audioContextRef.current.destination);

      // Iniciar visualización
      startVisualization();

      // Iniciar WebSocket
      initWebSocket();

      console.log("Sistema de audio inicializado correctamente");
      setAudioInitialized(true);
      URL.revokeObjectURL(workletURL);

      startStreaming();

      return true;
    } catch (error) {
      console.error("Error al inicializar audio:", error);
      return false;
    }
  };

  // Iniciar visualización
  const startVisualization = () => {
    if (!analyserRef.current || !canvasRef.current) return;

    const draw = () => {
      if (!analyserRef.current || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Obtener datos de frecuencia para visualización
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      // Limpiar canvas
      ctx.fillStyle = "#111827";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calcular volumen promedio para la visualización
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avgVolume = sum / dataArray.length;

      // Actualizar datos de audio para la visualización
      setAudioData((prev) => {
        const newData = [...prev, avgVolume];
        if (newData.length > 100) newData.shift();
        return newData;
      });

      // Dibujar barras de volumen
      if (audioData.length > 0) {
        const barWidth = canvas.width / 100;
        const maxValue = Math.max(200, ...audioData);

        for (let i = 0; i < audioData.length; i++) {
          const height = (audioData[i] / maxValue) * canvas.height;
          const x = i * barWidth;
          const y = canvas.height - height;

          const hue = Math.max(0, 270 - height / 2);
          ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;

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
          ctx.quadraticCurveTo(x, y, x, y + height - 1);
          ctx.lineTo(x, y + 1);
          ctx.quadraticCurveTo(x, y, x + 1, y);
          ctx.fill();
        }

        // Añadir línea de tiempo real si está activo
        if (isActive) {
          ctx.beginPath();
          ctx.moveTo(canvas.width - 20, 0);
          ctx.lineTo(canvas.width - 20, canvas.height);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
          ctx.stroke();

          const pulseSize = 5 + 2 * Math.sin(Date.now() / 200);
          ctx.beginPath();
          ctx.arc(canvas.width - 20, 10, pulseSize, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255, 0, 0, 0.8)";
          ctx.fill();
        }
      }

      animationIdRef.current = requestAnimationFrame(draw);
    };

    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }

    draw();
  };

  // Limpiar recursos al desmontar
  useEffect(() => {
    return () => {
      // Limpiar recursos
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
      }

      if (
        webSocketRef.current &&
        webSocketRef.current.readyState === WebSocket.OPEN
      ) {
        webSocketRef.current.close();
      }
    };
  }, []);

  // Actualizar configuración cuando cambia el tiempo de frame
  useEffect(() => {
    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.port.postMessage({
        type: "config",
        frameTime: frameTime,
      });
    }
  }, [frameTime]);

  // Verificar periódicamente el estado del AudioContext
  useEffect(() => {
    const checkAudioContextState = () => {
      if (audioContextRef.current) {
        setAudioContextState(audioContextRef.current.state);
      }
    };

    const intervalId = setInterval(checkAudioContextState, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const initWebSocket = () => {
    // Usar URL segura en producción
    const wsUrl =
      process.env.NODE_ENV === "production"
        ? `wss://${window.location.host}/ws/audio/`
        : "ws://127.0.0.1:8000/ws/audio/";

    const token = localStorage.getItem("token");

    setWsStatus("conectando");

    // Cerrar cualquier conexión existente
    if (
      webSocketRef.current &&
      webSocketRef.current.readyState === WebSocket.OPEN
    ) {
      webSocketRef.current.close();
    }

    // Crear nueva conexión con protocolo binario para mejor rendimiento
    try {
      webSocketRef.current = new WebSocket(`${wsUrl}?token=${token}`);
      webSocketRef.current.binaryType = "arraybuffer"; // Importante para enviar audio crudo
    } catch (error) {
      console.error("Error al crear WebSocket:", error);
      setWsStatus("error");
      return;
    }

    webSocketRef.current.onopen = () => {
      console.log("WebSocket conectado");
      setConexionWS(true);
      setWsStatus("conectado");

      // Procesar cola de mensajes pendientes
      setTimeout(() => {
        if (
          webSocketRef.current &&
          webSocketRef.current.readyState === WebSocket.OPEN
        ) {
          // Enviar mensaje de configuración al servidor
          try {
            webSocketRef.current.send(
              JSON.stringify({
                type: "config",
                frameTime: frameTime,
                sampleRate: audioContextRef.current
                  ? audioContextRef.current.sampleRate
                  : 48000,
              })
            );
            console.log("Configuración enviada al servidor");

            // Procesar cualquier mensaje en cola
            while (messageQueueRef.current.length > 0) {
              const message = messageQueueRef.current.shift();
              sendWebSocketMessage(message);
            }
          } catch (error) {
            console.error("Error al enviar configuración:", error);
            setWsStatus("error");
          }
        } else {
          console.warn(
            "WebSocket no está listo para enviar la configuración inicial"
          );
          setWsStatus("error");
        }
      }, 300); // Un pequeño retraso para asegurar que la conexión esté completamente establecida
    };

    webSocketRef.current.onclose = (event) => {
      console.log("WebSocket desconectado", event.code, event.reason);
      setConexionWS(false);
      setWsStatus("desconectado");

      // Reintentar conexión después de un tiempo, con backoff exponencial
      if (isActive) {
        const timeout = Math.min(
          5000 * Math.pow(2, frameCountRef.current % 5),
          30000
        );
        console.log(`Reintentando conexión en ${timeout}ms`);
        setTimeout(initWebSocket, timeout);
        frameCountRef.current++;
      }
    };

    webSocketRef.current.onmessage = (event) => {
      try {
        // Procesamiento normal de mensajes...
        const data = JSON.parse(event.data);

        // Guardar todos los mensajes para depuración
        setAllMessages((prev) => [
          { timestamp: new Date().toISOString(), data },
          ...prev.slice(0, 19),
        ]);

        console.log("Mensaje WebSocket recibido:", data);

        if (data.type === "detection_result") {
          console.log("🎉 RESULTADO DE DETECCIÓN:", data);
          // Procesar la detección...
          setLastDetection(data);
        }
      } catch (error) {
        console.error("Error al procesar mensaje:", error);
      }
    };

    webSocketRef.current.onerror = (error) => {
      console.error("Error en WebSocket:", error);
      setConexionWS(false);
      setWsStatus("error");
    };
  };

  // Función segura para enviar mensajes por WebSocket
  const sendWebSocketMessage = (message) => {
    if (!webSocketRef.current) {
      console.warn("WebSocket no inicializado");
      messageQueueRef.current.push(message);
      return false;
    }

    if (webSocketRef.current.readyState === WebSocket.CONNECTING) {
      console.log("WebSocket conectándose, añadiendo mensaje a la cola");
      messageQueueRef.current.push(message);
      return false;
    }

    if (webSocketRef.current.readyState === WebSocket.OPEN) {
      try {
        if (typeof message === "string") {
          webSocketRef.current.send(message);
        } else {
          webSocketRef.current.send(JSON.stringify(message));
        }
        return true;
      } catch (error) {
        console.error("Error al enviar mensaje WebSocket:", error);
        return false;
      }
    } else {
      console.warn(
        `WebSocket no está listo para enviar mensajes (estado: ${webSocketRef.current.readyState})`
      );

      // Si está cerrado o cerrándose, reiniciar conexión
      if (webSocketRef.current.readyState >= WebSocket.CLOSING) {
        console.log("Intentando reconectar WebSocket...");
        messageQueueRef.current.push(message);
        initWebSocket();
      }
      return false;
    }
  };

  const handleAudioProcessorMessage = (event) => {
    const { data } = event;

    switch (data.type) {
      case "metricas":
        const volumen = Math.round(data.volumen);
        // console.log("Volumen detectado (AudioWorklet):", volumen);
        setVolumenActual(volumen);
        break;

      // En tu método handleAudioProcessorMessage
      case "audioFrame":
        // console.log("👂 FRAME DE AUDIO RECIBIDO del AudioWorklet", {
        //   volumen: data.volumen,
        //   frameTime: data.frameTime,
        //   dataLength: data.audioData?.length || 0,
        // });

        // console.log("Frame recibido, isActive:", isActive);

        if (isActive) {
          try {
            // Añadir log para confirmar que estos mensajes se reciben
            // console.log(`Recibido audioFrame con volumen: ${data.volumen}`);

            // Obtener audio
            const audioData = data.audioData;

            // Validar que hay datos de audio
            if (!audioData || audioData.length === 0) {
              console.error("Error: Frame de audio vacío");
              return;
            }

            // PASO 1: Enviar metadatos
            const metadataMessage = {
              type: "audio_frame",
              timestamp: Date.now(),
              frame_id: frameCountRef.current++,
              volume: data.volumen,
              frame_duration: data.frameTime,
              sample_rate: audioContextRef.current.sampleRate,
              latitude: 0,
              longitude: 0,
              is_final_frame: false,
            };

            // Log antes de enviar
            // console.log("Enviando metadatos de frame:", metadataMessage);

            const metadataSent = sendWebSocketMessage(metadataMessage);

            // PASO 2: Solo si los metadatos se enviaron exitosamente
            if (metadataSent) {
              // console.log(
              //   "Metadatos enviados correctamente, enviando audio..."
              // );

              // Convertir Float32Array a Int16Array
              const int16Data = new Int16Array(audioData.length);
              for (let i = 0; i < audioData.length; i++) {
                int16Data[i] = Math.max(
                  -32768,
                  Math.min(32767, Math.round(audioData[i] * 32767))
                );
              }

              // Log del tamaño del buffer
              // console.log(
              //   `Enviando buffer de audio: ${int16Data.buffer.byteLength} bytes`
              // );

              // Enviar el buffer
              if (
                webSocketRef.current &&
                webSocketRef.current.readyState === WebSocket.OPEN
              ) {
                webSocketRef.current.send(int16Data.buffer);
                // console.log("Buffer de audio enviado");
              } else {
                console.error("WebSocket no disponible para enviar audio");
              }
            }
          } catch (error) {
            console.error("Error al procesar frame de audio:", error);
          }
        } else {
          console.log("No se envía frame porque isActive es false");
        }
        break;

      default:
        break;
    }
  };

  const toggleActive = () => {
    // No permitir activar si el audio no está inicializado
    if (!audioInitialized) {
      console.warn("No se puede iniciar la transmisión: Audio no inicializado");
      return;
    }

    setIsActive(!isActive);

    if (isActive) {
      startStreaming();
    } else {
      stopStreaming();
    }
  };

  // Función para activar el monitoreo de audio (para depuración)
  const toggleAudioMonitor = () => {
    if (!gainNodeRef.current) return;

    gainNodeRef.current.gain.value =
      gainNodeRef.current.gain.value > 0 ? 0 : 0.1;
    console.log(
      "Monitor de audio:",
      gainNodeRef.current.gain.value > 0 ? "Activado" : "Desactivado"
    );
  };

  const startStreaming = () => {
    // Asegurarse de que el sistema de audio está inicializado
    if (
      !audioContextRef.current ||
      audioContextRef.current.state !== "running"
    ) {
      console.warn(
        "No se puede iniciar streaming: AudioContext no está activo"
      );
      return;
    }

    // Reiniciar contador de frames
    frameCountRef.current = 0;

    // Incrementar contador de detecciones
    setDetectionCount((prev) => prev + 1);

    // Asegurarse de que la conexión WebSocket está activa
    if (
      !webSocketRef.current ||
      webSocketRef.current.readyState !== WebSocket.OPEN
    ) {
      // Si no hay conexión, iniciarla y poner mensaje en cola
      console.log("Iniciando nueva conexión WebSocket para streaming");

      messageQueueRef.current.push({
        type: "start_streaming",
        session_id:
          Date.now().toString(36) + Math.random().toString(36).substring(2),
        timestamp: Date.now(),
        sample_rate: audioContextRef.current.sampleRate,
        frame_time: frameTime,
      });
      initWebSocket();
    } else {
      // La conexión ya existe, enviar mensaje directamente
      console.log("Conexión WebSocket existente, iniciando streaming");

      sendWebSocketMessage({
        type: "start_streaming",
        session_id:
          Date.now().toString(36) + Math.random().toString(36).substring(2),
        timestamp: Date.now(),
        sample_rate: audioContextRef.current.sampleRate,
        frame_time: frameTime,
      });
    }
  };

  const stopStreaming = () => {
    // Enviar señal de finalización al servidor si el WebSocket está conectado
    if (
      webSocketRef.current &&
      webSocketRef.current.readyState === WebSocket.OPEN
    ) {
      sendWebSocketMessage({
        type: "end_streaming",
        timestamp: Date.now(),
        frames_sent: frameCountRef.current,
      });
    }
  };

  // Función para ajustar el tiempo entre frames
  const handleFrameTimeChange = (newFrameTime) => {
    setFrameTime(newFrameTime);
  };

  return (
    <div className="flex flex-col gap-6 p-4 max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-xl font-bold mb-1 text-gray-800">
          Detector de Sonidos Críticos
        </h1>
        <p className="text-gray-600 mb-4">
          Sistema de detección y análisis de audio en tiempo real frame por
          frame
        </p>

        {/* CORRECCIÓN CLAVE: Mostrar botón de activación solo si el audio no está inicializado */}
        {!audioInitialized && (
          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800 font-medium">
              El sistema de audio necesita ser activado. Por razones de
              seguridad, los navegadores requieren una interacción del usuario.
            </p>
            <button
              onClick={initializeAudio}
              className="mt-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md shadow-sm"
            >
              Activar Audio
            </button>
          </div>
        )}

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

        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={toggleActive}
            className={`px-5 py-2.5 rounded-full font-medium flex items-center shadow-sm ${
              isActive
                ? "bg-red-500 hover:bg-red-600"
                : "bg-purple-600 hover:bg-purple-700"
            } text-white transition-colors`}
            disabled={!audioInitialized || audioContextState !== "running"}
          >
            {isActive ? "Detener Transmisión" : "Iniciar Transmisión"}
          </button>

          {wsStatus === "error" && (
            <button
              onClick={initWebSocket}
              className="px-5 py-2.5 rounded-full font-medium flex items-center shadow-sm bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            >
              Reconectar WebSocket
            </button>
          )}

          {audioInitialized && (
            <button
              onClick={toggleAudioMonitor}
              className="px-5 py-2.5 rounded-full font-medium flex items-center shadow-sm bg-gray-500 hover:bg-gray-600 text-white transition-colors"
            >
              Monitor de Audio
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-2 text-gray-700">Configuración</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Tiempo entre frames: {frameTime}ms
                </label>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="100"
                  value={frameTime}
                  onChange={(e) =>
                    handleFrameTimeChange(parseInt(e.target.value))
                  }
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Valores más bajos = detección más rápida pero más uso de
                  recursos
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-2 text-gray-700">
              Estado del sistema
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Audio inicializado:
                </span>
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full mr-2 ${
                      audioInitialized ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {audioInitialized ? "Sí" : "No"}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">AudioContext:</span>
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full mr-2 ${
                      audioContextState === "running"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {audioContextState}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Volumen actual:</span>
                <span className="text-sm font-medium text-gray-600">
                  {volumenActual}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">WebSocket:</span>
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full mr-2 ${
                      wsStatus === "conectado"
                        ? "bg-green-500"
                        : wsStatus === "conectando"
                        ? "bg-yellow-500 animate-pulse"
                        : "bg-red-500"
                    }`}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {wsStatus === "conectado"
                      ? "Conectado"
                      : wsStatus === "conectando"
                      ? "Conectando..."
                      : wsStatus === "error"
                      ? "Error"
                      : "Desconectado"}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Transmisión:</span>
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full mr-2 ${
                      isActive ? "bg-red-500 animate-pulse" : "bg-gray-300"
                    }`}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {isActive ? "Activa" : "Inactiva"}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Frames enviados:</span>
                <span className="text-sm text-gray-600">
                  {frameCountRef.current}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Tiempo de procesamiento:
                </span>
                <span className="text-sm text-gray-600">
                  {processingTime}ms
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Micrófono:</span>
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full mr-2 ${
                      volumenActual > 5
                        ? "bg-green-500 animate-pulse"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {volumenActual > 5 ? "Activo" : "Silencio"}
                  </span>
                </div>
              </div>
              {lastDetection && (
                <DetectionResults lastDetection={lastDetection} />
              )}
              <button
                onClick={() => setDebugVisible(!debugVisible)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
              >
                {debugVisible ? "Ocultar depurador" : "Mostrar depurador"}
              </button>

              <button
                onClick={() => {
                  // Simular una detección
                  const fakeDetection = {
                    type: "detection_result",
                    result: "siren",
                    score: 0.85,
                    is_critical: true,
                    timestamp: new Date().toISOString(),
                    processing_time: 120,
                    frame_id: 123,
                    all_results: [
                      { label: "siren", score: 0.85 },
                      { label: "ambulance", score: 0.35 },
                      { label: "police", score: 0.15 },
                    ],
                  };
                  setLastDetection(fakeDetection);
                  console.log("Simulando detección:", fakeDetection);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
              >
                Simular Detección
              </button>
              {debugVisible && (
                <div className="mt-4 bg-gray-800 text-gray-200 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">
                    Depurador WebSocket
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {allMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className="border border-gray-700 rounded p-2 text-xs"
                      >
                        <div className="font-mono text-gray-400 mb-1">
                          {msg.timestamp}
                        </div>
                        <pre className="whitespace-pre-wrap overflow-x-auto">
                          {JSON.stringify(msg.data, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isActive && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">
              Transmisión en tiempo real activa.
            </span>{" "}
            Los frames de audio se están enviando cada {frameTime}ms para
            detección de sonidos críticos. La detección ocurre en el servidor en
            tiempo real.
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">
          Sobre el detector de sonidos críticos
        </h2>
        <div className="space-y-2 text-gray-600 text-sm">
          <p>
            Este sistema utiliza un enfoque optimizado para la detección de
            sonidos críticos:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <span className="font-medium">Procesamiento frame por frame</span>
              : Divide el audio en fragmentos pequeños (frames) que se envían
              cada {frameTime}ms.
            </li>
            <li>
              <span className="font-medium">AudioWorklet</span>: Procesa el
              audio en un hilo separado para no bloquear la interfaz de usuario.
            </li>
            <li>
              <span className="font-medium">WebSockets</span>: Mantiene una
              conexión persistente para enviar datos de audio al servidor sin
              latencia.
            </li>
            <li>
              <span className="font-medium">Int16 optimizado</span>: Reduce el
              volumen de datos enviados sin comprometer la calidad para
              detección.
            </li>
            <li>
              <span className="font-medium">Modelo en servidor</span>: El
              procesamiento pesado se realiza en el servidor mientras el cliente
              se mantiene ligero.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
