import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

export default function Map() {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const updatePosition = () => {
      console.log("Actualizando posición...");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          console.log(latitude, longitude);
        },
        (err) => {
          setError("No se pudo obtener la ubicación. Asegúrate de permitir el acceso.");
          console.error("Error al obtener la ubicación:", err);
        }
      );
    };

    updatePosition();
    const interval = setInterval(updatePosition, 5000);

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return <div className="text-red-500 font-bold p-4">{error}</div>;
  }

  if (!position) {
    return <div className="p-4 font-semibold">Cargando mapa...</div>;
  }

  return (
    <div className="relative w-full h-screen">
      {/* Panel de advertencia */}
      <div className="absolute top-2 left-2 right-2 z-10 bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex items-center p-3">
          <div className="bg-red-500 rounded-lg p-2 mr-3">
            <span className="text-white font-bold text-xs">★</span>
          </div>
          <p className="font-bold">
            POLICE CAR <span className="font-normal">in your</span>{" "}
            <span className="font-bold">LEFT</span>
          </p>
        </div>
        <div className="bg-red-500 p-1 px-3 flex items-center justify-start">
          <div className="text-white flex items-center">
            <span className="text-xs mr-1">▲</span>
            <span className="text-xs">WARNING</span>
          </div>
        </div>
      </div>
  
      {/* Mapa */}
      <div className="absolute top-0 left-0 right-0 bottom-0 z-0">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://osm.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={position}
            icon={L.icon({
              iconUrl:
                "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
            })}
          >
            <Popup>¡Estás aquí!</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
  
}
