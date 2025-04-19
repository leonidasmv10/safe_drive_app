import { useState, useEffect, useRef } from "react";

const SimpleAudioDetector = () => {
  // Estados básicos
  const [isActive, setIsActive] = useState(false);
  const [volume, setVolume] = useState(0);
  const [lastPrediction, setLastPrediction] = useState(null);
  const [log, setLog] = useState([]);

  // Referencias
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const wsRef = useRef(null);
  const intervalRef = useRef(null);
  const audioBufferRef = useRef([]);

  // Agregar mensaje al log
  const addLog = (message) => {
    // console.log(message);
    setLog((prev) => [
      `${new Date().toLocaleTimeString()}: ${message}`,
      ...prev.slice(0, 9),
    ]);
  };

  // Inicializar sistema de audio
  const initAudio = async () => {
    try {
      addLog("Iniciando sistema de audio...");

      // Crear contexto de audio
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();

      // Solicitar acceso al micrófono
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      streamRef.current = stream;
      addLog(`Micrófono conectado: ${stream.getAudioTracks()[0].label}`);

      // Crear nodos de audio
      sourceRef.current =
        audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;

      // Conectar nodos
      sourceRef.current.connect(analyserRef.current);

      // Iniciar medición de volumen
      measureVolume();

      return true;
    } catch (error) {
      addLog(`Error al inicializar audio: ${error.message}`);
      return false;
    }
  };

  // Medir volumen para visualización
  const measureVolume = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateVolume = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);

      // Calcular volumen promedio
      const average =
        dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      setVolume(Math.round(average));

      requestAnimationFrame(updateVolume);
    };

    updateVolume();
  };

  // Inicializar WebSocket
  const initWebSocket = () => {
    const token = localStorage.getItem("token");
    const wsUrl = "ws://127.0.0.1:8000/ws/audio/?token=" + token;

    addLog("Conectando WebSocket...");

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }

    wsRef.current = new WebSocket(wsUrl);
    wsRef.current.binaryType = "arraybuffer";

    wsRef.current.onopen = () => {
      addLog("WebSocket conectado");

      // Enviar configuración
      wsRef.current.send(
        JSON.stringify({
          type: "config",
          sampleRate: audioContextRef.current.sampleRate,
          frameTime: 2000,
        })
      );
    };

    wsRef.current.onmessage = (event) => {
      try {
        if (event.data instanceof ArrayBuffer) return;

        const data = JSON.parse(event.data);
        // addLog(`Mensaje recibido: ${data.type}`);
        // console.log(data.all_results);

        if (data.type === "detection_result") {
          addLog(`🎉 DETECCIÓN: ${JSON.stringify(data.all_results, null, 2)}`);

          setLastPrediction(data);
        }
      } catch (error) {
        addLog(`Error al procesar mensaje: ${error.message}`);
      }
    };

    wsRef.current.onclose = () => {
      addLog("WebSocket desconectado");
    };

    wsRef.current.onerror = () => {
      addLog("Error en WebSocket");
    };
  };

  // Iniciar captura de audio
  const startCapture = async () => {
    // Inicializar audio si es necesario
    if (!audioContextRef.current) {
      const success = await initAudio();
      if (!success) return;
    }

    // Reanudar contexto si está suspendido
    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }

    // Inicializar WebSocket
    initWebSocket();

    // Esperar a que WebSocket esté listo
    setTimeout(() => {
      // Iniciar streaming
      wsRef.current.send(
        JSON.stringify({
          type: "start_streaming",
          session_id: Date.now().toString(36),
          timestamp: Date.now(),
          sample_rate: audioContextRef.current.sampleRate,
        })
      );

      // Configurar intervalo para capturar y enviar audio cada 2 segundos
      intervalRef.current = setInterval(() => {
        captureAndSendAudio();
      }, 2000);

      setIsActive(true);
      addLog("Transmisión iniciada");
    }, 500);
  };

  // Detener captura de audio
  const stopCapture = () => {
    // Detener intervalo
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Enviar mensaje de fin de streaming
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "end_streaming",
          timestamp: Date.now(),
        })
      );
      addLog("Transmisión finalizada");
    }

    setIsActive(false);
  };

  // Capturar y enviar audio
  const captureAndSendAudio = () => {
    if (
      !analyserRef.current ||
      !wsRef.current ||
      wsRef.current.readyState !== WebSocket.OPEN
    ) {
      addLog("No se puede enviar audio: sistema no inicializado");
      return;
    }

    try {
      // Capturar datos de audio
      const bufferLength = analyserRef.current.fftSize;
      const audioData = new Float32Array(bufferLength);
      analyserRef.current.getFloatTimeDomainData(audioData);

      // Verificar si hay sonido (no solo silencio)
      const rms = Math.sqrt(
        audioData.reduce((sum, val) => sum + val * val, 0) / bufferLength
      );
      const volumen = rms * 1000;

      if (volumen < 1) {
        // addLog("Audio muy silencioso, no se envía");
        return;
      }

      // Enviar metadatos
      const frameId = Date.now();
      wsRef.current.send(
        JSON.stringify({
          type: "audio_frame",
          timestamp: Date.now(),
          frame_id: frameId,
          volume: volumen,
          sample_rate: audioContextRef.current.sampleRate,
          is_final_frame: false,
        })
      );

      // Convertir a Int16Array para envío más eficiente
      const int16Data = new Int16Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        int16Data[i] = Math.max(
          -32768,
          Math.min(32767, Math.round(audioData[i] * 32767))
        );
      }

      // Enviar datos de audio
      wsRef.current.send(int16Data.buffer);
      // addLog(
      //   `Audio enviado: ${
      //     int16Data.length
      //   } muestras, volumen: ${volumen.toFixed(2)}`
      // );
    } catch (error) {
      addLog(`Error al enviar audio: ${error.message}`);
    }
  };

  // Limpiar recursos al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
      }

      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
        <h1 className="text-xl font-bold mb-2">Detector de Audio Simple</h1>
        <p className="text-gray-600 mb-4">
          Envía muestras de audio cada 2 segundos
        </p>

        <div className="flex items-center mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${Math.min(100, volume)}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium">{volume}</span>
        </div>

        <button
          onClick={isActive ? stopCapture : startCapture}
          className={`w-full py-2 px-4 rounded-lg font-medium ${
            isActive
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          {isActive ? "Detener" : "Iniciar"}
        </button>
      </div>

      {lastPrediction && (
        <div
          className={`mb-4 p-4 rounded-lg shadow-sm border ${
            lastPrediction.is_critical
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          <div className="font-bold text-lg">
            {lastPrediction.result}
            <span className="ml-2 text-sm font-normal">
              {Math.round(lastPrediction.score * 100)}%
            </span>
          </div>
          <div className="text-sm opacity-75">
            {new Date(lastPrediction.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}

      <div className="bg-gray-100 rounded-lg p-4 max-h-40 overflow-y-auto text-sm">
        <h2 className="font-medium mb-2">Log de actividad</h2>
        <div className="space-y-1">
          {log.map((entry, index) => (
            <div key={index} className="text-xs">
              {entry}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimpleAudioDetector;
