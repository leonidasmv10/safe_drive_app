import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

export default function Map() {
  const [position, setPosition] = useState([51.505, -0.09]); // posición inicial (Londres)

  useEffect(() => {
    const updatePosition = () => {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
      });
    };

    updatePosition(); // al cargar
    const interval = setInterval(updatePosition, 5000); // actualiza cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div>
        <div className="absolute top-2 left-2 right-2 bg-white rounded-xl shadow-lg overflow-hidden">
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
      </div>
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: "400px", width: "100%" }}
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
    </>
  );
}
