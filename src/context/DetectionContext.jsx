import React, { createContext, useContext, useState, useEffect } from 'react';

const DetectionContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL;
const STORAGE_KEY = 'detections';  // Clave para guardar las detecciones en localStorage

export const DetectionProvider = ({ children }) => {
  const [detections, setDetections] = useState(() => {
    // Cargar las detecciones desde localStorage si existen y no han expirado
    const savedDetections = localStorage.getItem(STORAGE_KEY);
    if (savedDetections) {
      const parsedDetections = JSON.parse(savedDetections);
      const now = Date.now();
      // Filtrar las detecciones expiradas antes de cargarlas
      const validDetections = parsedDetections.filter(detection => detection.expiresAt > now);
      
      // Si hay detecciones válidas en localStorage, simplemente devuelve esas detecciones
      if (validDetections.length > 0) {
        return validDetections;
      }
    }
    return []; // Si no hay datos válidos en localStorage, retorna un array vacío
  });

  // UseEffect para obtener las detecciones desde la base de datos solo si localStorage no tiene datos válidos
  useEffect(() => {
    const fetchDetections = async () => {
      // Verifica si ya tenemos datos válidos en el estado
      if (detections.length > 0) {
        return; // Si ya hay datos, no ejecutamos la solicitud a la API
      }

      try {
        const response = await fetch(`${API_URL}/detection/audio_list/`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();

          const transformed = data
            .filter(item => item.latitude !== undefined && item.longitude !== undefined) // Filtrar inválidos
            .map(item => ({
              ...item,
              position: [item.latitude, item.longitude],
              id: item.id || Date.now() + Math.random(),
              timestamp: item.timestamp || Date.now(),
              expiresAt: Date.now() + 60 * 1000 // 1 minuto de duración
            }));

          // Actualiza el estado con las detecciones transformadas
          setDetections(transformed); 

          // Guardar las detecciones en localStorage
          localStorage.setItem(STORAGE_KEY, JSON.stringify(transformed));

        } else {
          console.error('Error al obtener las detecciones:', await response.text());
        }
      } catch (error) {
        console.error('Error al hacer el fetch:', error);
      }
    };

    fetchDetections(); // Llama a la función para obtener las detecciones solo si no hay datos en localStorage
  }, [detections.length]);  // Solo ejecuta el efecto si detections está vacío

  // Función para agregar una nueva detección
  const addDetection = (detection) => {
    const now = Date.now();

    // Verificar si ya existe una detección similar en los últimos 5 segundos
    const recentSimilarDetection = detections.find(d => {
      const timeDiff = now - d.timestamp;
      const isSameType = d.description === detection.description;
      const isNearby = Math.abs(d.position[0] - detection.position[0]) < 0.0001 &&
        Math.abs(d.position[1] - detection.position[1]) < 0.0001;

      return timeDiff < 5000 && isSameType && isNearby;
    });

    if (recentSimilarDetection) {
      console.log('Detección similar encontrada, ignorando nueva detección');
      return;
    }

    const newDetection = {
      id: now,
      position: detection.position,
      type: detection.type,
      timestamp: now,
      description: detection.description,
      expiresAt: now + 60 * 1000 // 1 minuto en milisegundos
    };

    setDetections(prev => {
      const updatedDetections = [...prev, newDetection];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDetections)); // Guardar en localStorage
      return updatedDetections;
    });
  };

  // Función para eliminar una detección
  const removeDetection = (id) => {
    setDetections(prev => {
      const updatedDetections = prev.filter(detection => detection.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDetections)); // Guardar en localStorage
      return updatedDetections;
    });
  };

  // Limpiar detecciones expiradas
  useEffect(() => {
    const checkExpiredDetections = () => {
      const now = Date.now();
      setDetections(prev => {
        const updatedDetections = prev.filter(detection => detection.expiresAt > now);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDetections)); // Guardar en localStorage
        return updatedDetections;
      });
    };

    // Verificar cada minuto
    const interval = setInterval(checkExpiredDetections, 60000);

    // Verificar inmediatamente al cargar
    checkExpiredDetections();

    return () => clearInterval(interval);
  }, []);  // Este efecto se ejecuta una vez al montar el componente

  // Proveer el contexto a los componentes hijos
  const value = {
    detections,
    addDetection,
    removeDetection
  };

  return (
    <DetectionContext.Provider value={value}>
      {children}
    </DetectionContext.Provider>
  );
};

// Hook para acceder al contexto
export const useDetection = () => {
  const context = useContext(DetectionContext);
  if (!context) {
    throw new Error('useDetection must be used within a DetectionProvider');
  }
  return context;
};
