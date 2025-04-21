import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext(null);
const LAST_LOCATION_KEY = 'lastKnownLocation';

// Función para determinar si una ubicación es válida
const isValidLocation = (loc) => {
  return loc?.latitude && loc?.longitude && 
         !(loc.latitude === 0 && loc.longitude === 0);
};

// Función para calcular si la ubicación ha cambiado significativamente (más de 10 metros)
const hasLocationChangedSignificantly = (oldLoc, newLoc) => {
  if (!oldLoc || !newLoc) return true;
  
  const R = 6371e3; // Radio de la tierra en metros
  const lat1 = oldLoc.latitude * Math.PI/180;
  const lat2 = newLoc.latitude * Math.PI/180;
  const deltaLat = (newLoc.latitude - oldLoc.latitude) * Math.PI/180;
  const deltaLon = (newLoc.longitude - oldLoc.longitude) * Math.PI/180;

  const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
           Math.cos(lat1) * Math.cos(lat2) *
           Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  return distance > 10; // Retorna true si la distancia es mayor a 10 metros
};

export const LocationProvider = ({ children }) => {
  // Inicializar con la última ubicación conocida del localStorage
  const [location, setLocation] = useState(() => {
    const savedLocation = localStorage.getItem(LAST_LOCATION_KEY);
    return savedLocation ? JSON.parse(savedLocation) : { latitude: null, longitude: null };
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [isHighAccuracy, setIsHighAccuracy] = useState(false);

  // Guardar la ubicación en localStorage solo cuando sea necesario
  useEffect(() => {
    if (!isValidLocation(location)) {
      // Si la ubicación actual no es válida, intentar usar la guardada
      const savedLocation = localStorage.getItem(LAST_LOCATION_KEY);
      if (savedLocation) {
        const parsed = JSON.parse(savedLocation);
        if (isValidLocation(parsed)) {
          setLocation(parsed);
        }
      }
    } else {
      // Si la ubicación es válida, verificar si ha cambiado significativamente
      const savedLocation = localStorage.getItem(LAST_LOCATION_KEY);
      const parsed = savedLocation ? JSON.parse(savedLocation) : null;
      
      if (!parsed || hasLocationChangedSignificantly(parsed, location)) {
        localStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(location));
        console.log('Ubicación actualizada en localStorage:', location);
      }
    }
  }, [location]);

  const getLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Tu dispositivo no soporta geolocalización');
      setLoading(false);
      return;
    }

    // Primero obtener una posición inicial
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const newLocation = { latitude, longitude };
        
        if (!isValidLocation(location) || hasLocationChangedSignificantly(location, newLocation)) {
          setLocation(newLocation);
          setAccuracy(accuracy);
          setIsHighAccuracy(accuracy < 100);
        }
        setLoading(false);
        startWatchingPosition();
      },
      (err) => {
        // Si hay error, intentar usar la última ubicación conocida
        const lastLocation = localStorage.getItem(LAST_LOCATION_KEY);
        if (lastLocation) {
          const parsed = JSON.parse(lastLocation);
          if (isValidLocation(parsed)) {
            setLocation(parsed);
            setLoading(false);
            console.log('Usando última ubicación conocida:', parsed);
          } else {
            handleLocationError(err);
          }
        } else {
          handleLocationError(err);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const startWatchingPosition = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const newLocation = { latitude, longitude };
        
        // Solo actualizar si la ubicación ha cambiado significativamente
        if (hasLocationChangedSignificantly(location, newLocation)) {
          console.log('Nueva ubicación:', { ...newLocation, accuracy: Math.round(accuracy) });
          setLocation(newLocation);
          setAccuracy(accuracy);
          setIsHighAccuracy(accuracy < 100);
          setError(null);
        }
        setLoading(false);
      },
      (err) => {
        // Si hay error en el watch, mantener la última ubicación conocida
        if (isValidLocation(location)) {
          console.log('Manteniendo ubicación actual');
        } else {
          const currentLocation = localStorage.getItem(LAST_LOCATION_KEY);
          if (currentLocation) {
            const parsed = JSON.parse(currentLocation);
            if (isValidLocation(parsed)) {
              console.log('Recuperando última ubicación conocida');
              setLocation(parsed);
            } else {
              handleLocationError(err);
            }
          } else {
            handleLocationError(err);
          }
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0
      }
    );
    
    setWatchId(id);
  };

  const handleLocationError = (err) => {
    let errorMessage = 'Error al obtener la ubicación. ';
    switch (err.code) {
      case err.PERMISSION_DENIED:
        errorMessage += 'Por favor, activa el GPS y permite el acceso a la ubicación.';
        break;
      case err.POSITION_UNAVAILABLE:
        errorMessage += 'El GPS no está disponible. Asegúrate de que está activado.';
        break;
      case err.TIMEOUT:
        errorMessage += 'Tiempo de espera agotado. Intenta salir al exterior.';
        break;
      default:
        errorMessage += 'Error desconocido.';
    }
    console.error('Error de geolocalización:', err);
    setError(errorMessage);
    setLoading(false);
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