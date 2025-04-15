import { useState, useEffect, useRef } from "react";
import { Car, Volume2, AlertTriangle } from "lucide-react";

import WarningAlert from "../shared/WarningAlert";

// Componente de alerta ajustado al diseño de la imagen
// const WarningAlert = ({ direction = "LEFT" }) => {
//   return (
//     <div className="bg-red-50 rounded-full py-2 px-4 flex items-center shadow-md">
//       <Car className="text-red-600 mr-2" size={18} />
//       <div>
//         <span className="text-red-600 font-bold text-sm mr-1">WARNING!</span>
//         <span className="text-gray-800 text-sm">
//           POLICE CAR in your <span className="font-semibold">{direction}</span>
//         </span>
//       </div>
//     </div>
//   );
// };

// Tipos de sonidos críticos que podemos detectar
const criticalSounds = {
  police: {
    name: "Police Siren",
    description: "Emergency police vehicle approaching",
    action: "Slow down and move to the side if possible",
    decibels: "110-120 dB",
  },
  ambulance: {
    name: "Ambulance Siren",
    description: "Emergency medical vehicle approaching",
    action: "Give way immediately",
    decibels: "110-120 dB",
  },
  horn: {
    name: "Car Horn",
    description: "Warning from nearby vehicle",
    action: "Check surroundings and adjust driving",
    decibels: "100-110 dB",
  },
  collision: {
    name: "Collision Sound",
    description: "Possible accident nearby",
    action: "Proceed with caution",
    decibels: "120+ dB",
  },
};

export default function CarView({ location }) {
  const [alertVisible, setAlertVisible] = useState(true);
  const [soundIntensity, setSoundIntensity] = useState(0.7); // 0 a 1
  const [soundDirection, setSoundDirection] = useState("LEFT");
  const [showDetails, setShowDetails] = useState(false);
  const [detectedSound, setDetectedSound] = useState("police");

  // Referencias para audio
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const streamRef = useRef(null);
  const animationIdRef = useRef(null);

  // Cambiar la dirección periódicamente para demostrar funcionalidad
  useEffect(() => {
    const directions = ["LEFT", "RIGHT", "FRONT", "REAR"];
    let index = 0;

    const interval = setInterval(() => {
      index = (index + 1) % directions.length;
      setSoundDirection(directions[index]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (location?.latitude && location?.longitude) {
      console.log("Ubicación recibida en CarView:", location);
    }
  });

  // Inicializar audio
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

        // Comenzar a analizar el audio
        updateSoundIntensity();
      } catch (err) {
        console.error("Error al inicializar el audio:", err);
      }
    };

    initAudio();

    return () => {
      cancelAnimationFrame(animationIdRef.current);
      if (audioContextRef.current) audioContextRef.current.close();

      // Detener y liberar la transmisión de audio
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  // Actualizar la intensidad del sonido
  const updateSoundIntensity = () => {
    if (!analyserRef.current || !dataArrayRef.current) {
      animationIdRef.current = requestAnimationFrame(updateSoundIntensity);
      return;
    }

    analyserRef.current.getByteFrequencyData(dataArrayRef.current);

    // Calcular el volumen promedio
    const avgVolume =
      dataArrayRef.current.reduce((sum, val) => sum + val, 0) /
      dataArrayRef.current.length;

    // Normalizar entre 0 y 1, con un valor mínimo para que no desaparezca completamente
    const normalizedVolume = Math.max(0.3, Math.min(1, avgVolume / 200));
    setSoundIntensity(normalizedVolume);

    // Simulación: Cambiar el tipo de sonido detectado basado en patrones de frecuencia
    // En un sistema real, esto utilizaría algoritmos más sofisticados de análisis de audio
    if (avgVolume > 150) {
      // Sonido muy fuerte, probablemente una colisión
      setDetectedSound("collision");
    } else if (
      dataArrayRef.current[5] > 200 &&
      dataArrayRef.current[10] > 180
    ) {
      // Patrón particular para sirena de ambulancia (simulado)
      setDetectedSound("ambulance");
    } else if (
      dataArrayRef.current[15] > 180 &&
      dataArrayRef.current[20] < 100
    ) {
      // Patrón particular para bocina (simulado)
      setDetectedSound("horn");
    } else {
      // Patrón por defecto, sirena policial
      setDetectedSound("police");
    }

    animationIdRef.current = requestAnimationFrame(updateSoundIntensity);
  };

  // Calcular posición y tamaño del indicador de sonido según dirección e intensidad
  const getSoundIndicatorStyles = () => {
    const size = Math.max(20, Math.round(soundIntensity * 50));
    const blurSize = Math.max(5, Math.round(soundIntensity * 10));

    let styles = {
      width: `${size}px`,
      height: `${size}px`,
      filter: `blur(${blurSize}px)`,
      opacity: 0.7,
    };

    // Posicionar el indicador según la dirección del sonido
    switch (soundDirection) {
      case "LEFT":
        styles = {
          ...styles,
          left: "0",
          top: "40%",
          transform: "translateX(-30%)",
        };
        break;
      case "RIGHT":
        styles = {
          ...styles,
          right: "0",
          top: "40%",
          transform: "translateX(30%)",
        };
        break;
      case "FRONT":
        styles = {
          ...styles,
          top: "0",
          left: "50%",
          transform: "translateX(-50%) translateY(-30%)",
        };
        break;
      case "REAR":
        styles = {
          ...styles,
          bottom: "0",
          left: "50%",
          transform: "translateX(-50%) translateY(30%)",
        };
        break;
      default:
        styles = {
          ...styles,
          left: "0",
          top: "40%",
          transform: "translateX(-30%)",
        };
    }

    return styles;
  };

  return (
    <div className="flex flex-col h-screen relative overflow-hidden bg-gray-200">
    {/* Alerta */}
    <div className="px-4 pt-4">
      {alertVisible && <WarningAlert direction={soundDirection} />}
    </div>
  
    {/* Visualización del vehículo con alerta */}
    <div className="flex-1  flex justify-center items-center px-4">
      {/* Contenedor principal del vehículo sin borde */}
      <div className="w-full mb-6 max-w-[290px] rounded-lg relative overflow-hidden shadow-sm">
        {/* Alerta con pulso rojo - posición ajustada según dirección del sonido */}
        <div
          className="absolute bg-red-500 rounded-full transition-all duration-300"
          style={getSoundIndicatorStyles()}
        ></div>
  
        {/* Imagen del vehículo sin borde o contorno */}
        <img
          src="car.png"
          alt="Vista superior de un vehículo blanco"
          className="w-full object-contain"
        />
  
        {/* Botón de información */}
        <button
          onClick={() => setShowDetails(!showDetails)}
         className="absolute bottom-2 right-2 bg-gray-800 text-white text-sm font-medium py-1 px-3 rounded-full z-20"
        >
          {showDetails ? "Hide Info" : "Sound Info"}
        </button>
      </div>
    </div>
  
    {/* Panel de información - aparece cuando showDetails es true */}
    {showDetails && (
      <div className="absolute bottom-2 left-2 right-2 max-h-[40%] overflow-auto bg-white rounded-lg shadow-lg p-3 z-30 border border-gray-200">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-gray-800 flex items-center">
            <AlertTriangle className="text-red-500 mr-2" size={16} />
            Critical Sound Detected
          </h3>
          <button
            onClick={() => setShowDetails(false)}
            className="text-gray-500"
          >
            ✕
          </button>
        </div>
  
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500">Type</p>
            <p className="font-medium">{criticalSounds[detectedSound].name}</p>
          </div>
          <div>
            <p className="text-gray-500">Direction</p>
            <p className="font-medium">{soundDirection}</p>
          </div>
          <div>
            <p className="text-gray-500">Intensity</p>
            <div className="flex items-center">
              <Volume2 className="text-gray-600 mr-1" size={14} />
              <div className="h-2 bg-gray-200 rounded-full flex-1 overflow-hidden">
                <div
                  className="h-full bg-red-500 transition-all duration-300"
                  style={{ width: `${soundIntensity * 100}%` }}
                ></div>
              </div>
              <span className="ml-1 text-xs text-gray-600">
                {Math.round(soundIntensity * 100)}%
              </span>
            </div>
          </div>
          <div>
            <p className="text-gray-500">Est. Decibels</p>
            <p className="font-medium">{criticalSounds[detectedSound].decibels}</p>
          </div>
        </div>
  
        <div className="mt-3">
          <p className="text-gray-500 text-sm">Recommended Action</p>
          <p className="text-sm font-medium text-gray-800">
            {criticalSounds[detectedSound].action}
          </p>
        </div>
      </div>
    )}
  </div>
  );
}
