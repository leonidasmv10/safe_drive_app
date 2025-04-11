// Componente Padre
import React, { useState } from "react";
import Map from "@/components/Map/Map";
import CarView from "@/components/CarView/CarView";

export default function App() {
  const [location, setLocation] = useState({ latitude: null, longitude: null });

  return (
    <div>
      <Map setLocation={setLocation} />
      <CarView location={location} />
    </div>
  );
}
