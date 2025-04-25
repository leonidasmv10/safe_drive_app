import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "@/components/UserSettings/userSettings.css";

export default function DailySummary() {
  const navigate = useNavigate();

  // Mock data - In a real app, this would come from an API
  const [dailySummary] = useState({
    date: "24 de abril de 2025",
    criticalSounds: {
      sirens: [
        { time: "17:10", location: "zona urbana" },
        { time: "19:35", location: "zona urbana" },
      ],
      horns: 3,
      hornLocations: "intersecciones de alto tráfico",
    },
    nearbyVehicles: {
      scooters: 4,
      scootersLocation: "carriles compartidos",
      bicycles: 1,
      bicyclesLocation: "cruce peatonal",
      motorcycles: 1,
      motorcyclesLocation: "estacionada irregularmente",
    },
    highActivityZones: [
      {
        name: "Calle Mayor",
        description: "Alta detección de sonidos y vehículos",
      },
      {
        name: "Plaza del Sol",
        description: "Punto de concentración de patinetes",
      },
    ],
    recommendation:
      "Evita la Calle Mayor a partir de las 17:00 si buscas una conducción más tranquila. Puedes considerar rutas con menor historial sonoro.",
  });

  return (
    <div className="pb-20 pt-6 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-md mx-auto">
        <header className="mb-6">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate("/settings")}
              className="mr-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Resumen diario</h1>
          </div>
          <p className="text-gray-600">
            Vista general de actividad - {dailySummary.date}
          </p>
        </header>

        <div className="space-y-6">
          {/* Critical Sounds Section */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <svg
                className="w-5 h-5 text-purple-600 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                  clipRule="evenodd"
                />
              </svg>
              Sonidos críticos detectados
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-red-100 p-2 rounded-full mr-3">
                    <svg
                      className="w-4 h-4 text-red-600"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                      <path d="M10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">
                      {dailySummary.criticalSounds.sirens.length} sirenas
                    </div>
                    <div className="text-sm text-gray-500">
                      {dailySummary.criticalSounds.sirens[0].location}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {dailySummary.criticalSounds.sirens
                    .map((s) => s.time)
                    .join(" y ")}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-red-100 p-2 rounded-full mr-3">
                    <svg
                      className="w-4 h-4 text-red-600"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">
                      {dailySummary.criticalSounds.horns} bocinas
                    </div>
                    <div className="text-sm text-gray-500">
                      {dailySummary.criticalSounds.hornLocations}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nearby Vehicles Section */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <svg
                className="w-5 h-5 text-purple-600 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h-3v9a1 1 0 001 1h.05a2.5 2.5 0 014.9 0H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
              </svg>
              Vehículos cercanos detectados
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-2 rounded-full mr-3">
                    <svg
                      className="w-4 h-4 text-purple-600"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">
                      {dailySummary.nearbyVehicles.scooters} patinetes
                    </div>
                    <div className="text-sm text-gray-500">
                      {dailySummary.nearbyVehicles.scootersLocation}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-2 rounded-full mr-3">
                    <svg
                      className="w-4 h-4 text-purple-600"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">
                      {dailySummary.nearbyVehicles.bicycles} bicicleta
                    </div>
                    <div className="text-sm text-gray-500">
                      {dailySummary.nearbyVehicles.bicyclesLocation}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-2 rounded-full mr-3">
                    <svg
                      className="w-4 h-4 text-purple-600"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">
                      {dailySummary.nearbyVehicles.motorcycles} moto
                    </div>
                    <div className="text-sm text-gray-500">
                      {dailySummary.nearbyVehicles.motorcyclesLocation}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* High Activity Zones Section */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <svg
                className="w-5 h-5 text-purple-600 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              Zonas de mayor actividad
            </h2>

            <div className="space-y-4">
              {dailySummary.highActivityZones.map((zone, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">{zone.name}</div>
                  <div className="text-sm text-gray-500">
                    {zone.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendation Section */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <svg
                className="w-5 h-5 text-purple-600 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
              </svg>
              Recomendación IA
            </h2>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-gray-700">{dailySummary.recommendation}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
