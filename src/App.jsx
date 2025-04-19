import "./App.css";
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import RecoverPassword from "./components/RecoverPassword/RecoverPassword";
import ResetPassword from "./components/ResetPassword/ResetPassword";

import Map from "@/components/Map/Map";
import CarView from "@/components/CarView/CarView";
import UserSettings from "@/components/UserSettings/userSettings";
import EditProfile from "@/components/UserSettings/EditProfile/EditProfile";
import ChangePassword from "@/components/UserSettings/ChangePassword/ChangePassword";
import Layout from "./Layout";
import AudioDetector from "./components/Test";
import SimpleAudioDetector from "./components/TestAudio";
import Test from "./components/TestV";

function App() {
  const [location, setLocation] = useState({ latitude: null, longitude: null });

  // Función para obtener la ubicación usando Google Geolocation API
  const getLocationFromGoogle = async () => {
    const apiKey = "AIzaSyBMpT8paiE1OURi8MaANDjxcmVbVjpnpLI"; // Tu clave API de Google
    try {
      const response = await fetch(
        `https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`,
        {
          method: "POST",
        }
      );
      const data = await response.json();

      if (data.location) {
        const { lat, lng } = data.location;
        setLocation({ latitude: lat, longitude: lng });
      } else {
        console.warn("No se pudo obtener la ubicación:", data);
      }
    } catch (error) {
      console.error("Error al obtener la ubicación de Google API:", error);
    }
  };

  useEffect(() => {
    getLocationFromGoogle(); // primera llamada inmediata
    const interval = setInterval(getLocationFromGoogle, 5000); // actualizar cada 5 segundos
    return () => clearInterval(interval); // limpiar al desmontar
  }, []);

  return (
    <Router>
      <Routes>
        {/* Rutas sin Layout */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recover-password" element={<RecoverPassword />} />
        <Route
          path="/reset-password/:uidb64/:token"
          element={<ResetPassword />}
        />

        {/* Rutas con Layout */}
        <Route element={<Layout />}>
          <Route path="/map" element={<Map location={location} />} />
          <Route path="/test" element={<AudioDetector />} />
          <Route path="/test_audio" element={<SimpleAudioDetector />} />
          <Route path="/test_v" element={<Test />} />
          <Route path="/car-view" element={<CarView location={location} />} />
          <Route path="/settings" element={<UserSettings />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/change-password" element={<ChangePassword />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
