import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext(null);

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [isHighAccuracy, setIsHighAccuracy] = useState(false);

  const getLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      // Configuración optimizada para móviles
      const options = {
        enableHighAccuracy: true, // Forzar alta precisión (GPS)
        timeout: 30000, // 30 segundos para dar tiempo al GPS
        maximumAge: 0, // No usar caché
      };

      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          //console.log('Precisión de la ubicación:', accuracy, 'metros');
          
          // En móviles, esperamos una precisión mucho mejor
          const isAccurate = accuracy < 100; // Consideramos precisa menos de 100m
          
          setLocation({ latitude, longitude });
          setAccuracy(accuracy);
          setIsHighAccuracy(isAccurate);
          setError(null);
          setLoading(false);
        },
        (err) => {
          let errorMessage = 'Error al obtener la ubicación. ';
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage += 'Por favor, activa el GPS y permite el acceso a la ubicación en la configuración del dispositivo.';
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage += 'El GPS no está disponible. Asegúrate de que está activado y tienes señal.';
              break;
            case err.TIMEOUT:
              errorMessage += 'El GPS está tardando demasiado. Intenta salir al exterior o reiniciar el GPS.';
              break;
            default:
              errorMessage += 'Error desconocido.';
          }
          setError(errorMessage);
          setLoading(false);
          console.error('Error al obtener la ubicación:', err);
        },
        options
      );
      setWatchId(id);
    } else {
      setError('Tu dispositivo no soporta geolocalización');
      setLoading(false);
    }
  };

  useEffect(() => {
    getLocation();
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const value = {
    location,
    loading,
    error,
    accuracy,
    isHighAccuracy,
    refreshLocation: getLocation,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}; 