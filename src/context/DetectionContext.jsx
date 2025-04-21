import React, { createContext, useContext, useState, useEffect } from 'react';

const DetectionContext = createContext(null);

// Clave para localStorage
const STORAGE_KEY = 'sound_detections';

export const DetectionProvider = ({ children }) => {
  // Cargar detecciones desde localStorage al iniciar
  const [detections, setDetections] = useState(() => {
    const savedDetections = localStorage.getItem(STORAGE_KEY);
    return savedDetections ? JSON.parse(savedDetections) : [];
  });

  // Guardar detecciones en localStorage cada vez que cambien
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(detections));
  }, [detections]);

  const addDetection = (detection) => {
    const newDetection = {
      id: Date.now(), // Usamos timestamp como ID único
      position: detection.position,
      type: detection.type,
      timestamp: Date.now(),
      description: detection.description,
      expiresAt: Date.now() + 60 * 1000 // 1 minuto en milisegundos
    };
    
    setDetections(prev => [...prev, newDetection]);
  };

  const removeDetection = (id) => {
    setDetections(prev => prev.filter(detection => detection.id !== id));
  };

  // Limpiar detecciones expiradas
  useEffect(() => {
    const checkExpiredDetections = () => {
      const now = Date.now();
      setDetections(prev => 
        prev.filter(detection => detection.expiresAt > now)
      );
    };

    // Verificar cada minuto
    const interval = setInterval(checkExpiredDetections, 60000);
    
    // Verificar inmediatamente al cargar
    checkExpiredDetections();

    return () => clearInterval(interval);
  }, []);

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

export const useDetection = () => {
  const context = useContext(DetectionContext);
  if (!context) {
    throw new Error('useDetection must be used within a DetectionProvider');
  }
  return context;
}; 