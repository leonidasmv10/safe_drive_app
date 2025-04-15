import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

export default function Map({setLocation} ) {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const updatePosition = () => {
      console.log("Actualizando posición...");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude])
          setLocation({ latitude, longitude });
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
  }, [setLocation]);

  if (error) {
    return <div className="text-red-500 font-bold p-4">{error}</div>;
  }

  if (!position) {
    return <div className="p-4 font-semibold">Cargando mapa...</div>;
  }

  return (
    <div className="relative w-full h-screen">
      {/* Panel de advertencia */}
     
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
