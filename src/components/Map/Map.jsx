import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from "react-leaflet";
import { Icon } from "leaflet";
import { useLocation } from "../../context/LocationContext";
import { useDetection } from "../../context/DetectionContext";
import { useAudio } from "@/context/AudioContext";
import WarningAlert from "@/components/shared/WarningAlert";
import "leaflet/dist/leaflet.css";

const { BaseLayer, Overlay } = LayersControl;

// Memoizar el icono para evitar recreaciones
const markerIcon = new Icon({
  iconUrl: import.meta.env.VITE_LEAFLET_MARKER_URL,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Memoizar los iconos de detección
const getMarkerIcon = (type) => {
  const iconUrl = type === 'critical' 
    ? 'https://cdn-icons-png.flaticon.com/512/103/103228.png'
    : type === 'warning'
    ? 'https://cdn-icons-png.flaticon.com/512/103/103228.png'
    : 'https://cdn-icons-png.flaticon.com/512/103/103228.png';

  return new Icon({
    iconUrl,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const criticalIcon = getMarkerIcon('critical');
const warningIcon = getMarkerIcon('warning');
const defaultIcon = getMarkerIcon('default');

function RecenterMap({ position, accuracy }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      let zoomLevel = 18;
      if (accuracy) {
        if (accuracy < 10) zoomLevel = 19;
        else if (accuracy < 20) zoomLevel = 18;
        else if (accuracy < 50) zoomLevel = 17;
        else if (accuracy < 100) zoomLevel = 16;
        else zoomLevel = 15;
      }

      map.setView(position, zoomLevel, {
        animate: true,
        duration: 1
      });
    }
  }, [position, accuracy, map]);

  return null;
}

function SignalQualityIndicator({ accuracy }) {
  if (!accuracy) return null;

  const getSignalQuality = () => {
    if (accuracy < 10) return { level: 4, color: "bg-green-500", text: "GPS Excelente" };
    if (accuracy < 20) return { level: 4, color: "bg-green-400", text: "GPS Bueno" };
    if (accuracy < 50) return { level: 3, color: "bg-yellow-500", text: "GPS Regular" };
    if (accuracy < 100) return { level: 2, color: "bg-orange-500", text: "GPS Débil" };
    return { level: 1, color: "bg-red-500", text: "Sin GPS" };
  };

  const quality = getSignalQuality();

  return (
    <div className="absolute bottom-4 right-4 bg-white p-2 rounded-lg shadow-lg z-10">
      <div className="flex items-center">
        <div className="mr-2">
          <div className="flex space-x-1">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`w-1 h-4 rounded-full ${
                  i < quality.level ? quality.color : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
        <span className="text-sm font-medium">{quality.text}</span>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Precisión: {Math.round(accuracy)}m
      </p>
    </div>
  );
}

function DetectionMarker({ detection, onRemove }) {
  const [timeLeft, setTimeLeft] = useState(300);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsExpired(true);
          onRemove(detection.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [detection.id, onRemove]);

  if (isExpired) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <Marker
      position={detection.position}
      icon={detection.type === 'critical' ? criticalIcon : warningIcon}
    >
      <Popup>
        <div>
          <p className="font-semibold">
            {detection.type === 'critical' ? '⚠️ Sonido Crítico' : '⚠️ Advertencia'}
          </p>
          <p className="text-sm text-gray-600">{detection.description}</p>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${
                  timeLeft > 150 ? 'bg-green-500' : 
                  timeLeft > 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${(timeLeft / 300) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Desaparece en: {minutes}:{seconds.toString().padStart(2, '0')}
            </p>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export default function Map() {
  const { location, loading, error, accuracy } = useLocation();
  const { detections, removeDetection } = useDetection();
  const { showAlert, alertType, soundDirection, setShowAlert } = useAudio();
  const [mapReady, setMapReady] = useState(false);

  // Verificar cuando la ubicación está lista
  useEffect(() => {
    if (location?.latitude && location?.longitude) {
      setMapReady(true);
    }
  }, [location]);

  // Memoizar la posición para evitar re-renders innecesarios
  const position = useMemo(() => {
    return location?.latitude && location?.longitude
      ? [location.latitude, location.longitude]
      : [0, 0];
  }, [location?.latitude, location?.longitude]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-4">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-600 font-semibold">{error}</p>
          <div className="mt-4 space-y-2">
            <button 
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
            >
              Reintentar
            </button>
            <p className="text-sm text-gray-600">
              Si el problema persiste:
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside">
              <li>Abre la configuración del dispositivo</li>
              <li>Activa el GPS</li>
              <li>Permite el acceso a la ubicación</li>
              <li>Sal al exterior si estás en un edificio</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (!mapReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Obteniendo ubicación GPS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen">
      <div className="absolute top-0 left-0 right-0 bottom-0 z-0">
        <MapContainer
          center={position}
          zoom={18}
          style={{ height: "100vh", width: "100%" }}
          zoomControl={true}
          scrollWheelZoom={true}
          dragging={true}
          doubleClickZoom={true}
          attributionControl={false}
        >
          <LayersControl position="topright">
            <BaseLayer checked name="Mapa">
              <TileLayer
                attribution='&copy; <a href="https://osm.org/">OpenStreetMap</a>'
                url={import.meta.env.VITE_OPENSTREETMAP_URL}
                maxZoom={19}
                minZoom={3}
              />
            </BaseLayer>
            <BaseLayer name="Satélite">
              <TileLayer
                attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxZoom={19}
                minZoom={3}
              />
            </BaseLayer>
            <Overlay checked name="Detecciones de sonido">
              {detections.map((detection) => (
                <DetectionMarker
                  key={detection.id}
                  detection={detection}
                  onRemove={removeDetection}
                />
              ))}
            </Overlay>
          </LayersControl>
          
          <Marker position={position} icon={markerIcon}>
            <Popup>
              <div>
                <p className="font-semibold">¡Estás aquí!</p>
                {accuracy && (
                  <p className={`text-sm ${accuracy > 100 ? 'text-red-600' : 'text-gray-600'}`}>
                    Precisión GPS: {Math.round(accuracy)} metros
                    {accuracy > 100 && (
                      <span className="block text-xs mt-1">
                        (La precisión es baja. Intenta salir al exterior o reiniciar el GPS)
                      </span>
                    )}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
          <RecenterMap position={position} accuracy={accuracy} />
        </MapContainer>
      </div>
      <SignalQualityIndicator accuracy={accuracy} />
      {showAlert && (
        <div className="absolute top-4 left-0 right-0 z-[1000]">
          <WarningAlert
            type={alertType === "Sirena" ? "ambulance" : "police"}
            direction={soundDirection}
            onClose={() => setShowAlert(false)}
          />
        </div>
      )}
    </div>
  );
}
