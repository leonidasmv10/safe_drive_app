export function DetectionResults({ lastDetection }) {
  if (!lastDetection) return null;

  // Determinar clase para color según el tipo de sonido
  const getColorClass = (label) => {
    const criticalSounds = ["ambulance", "police", "siren", "firetruck"];
    const warningSound = ["car_horn"];

    if (criticalSounds.includes(label))
      return "bg-red-100 border-red-500 text-red-800";
    if (warningSound.includes(label))
      return "bg-yellow-100 border-yellow-500 text-yellow-800";
    return "bg-blue-100 border-blue-500 text-blue-800";
  };

  // Icono según el tipo de sonido
  const getIcon = (label) => {
    switch (label) {
      case "ambulance":
        return "🚑";
      case "police":
        return "🚓";
      case "firetruck":
        return "🚒";
      case "siren":
        return "🔊";
      case "car_horn":
        return "📢";
      case "traffic":
        return "🚦";
      case "unknown":
        return "❓";
      default:
        return "🔊";
    }
  };

  // Formatear fecha y hora
  const formatDateTime = (isoString) => {
    try {
      return new Date(isoString).toLocaleTimeString();
    } catch (e) {
      return "Tiempo desconocido";
    }
  };

  return (
    <div className="mt-4 p-4 bg-white rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold mb-3 text-gray-700">
        Última detección
      </h3>

      <div
        className={`p-4 rounded-lg border ${getColorClass(
          lastDetection.result
        )}`}
      >
        <div className="flex items-center">
          <span className="text-3xl mr-3">{getIcon(lastDetection.result)}</span>
          <div>
            <h4 className="font-bold text-lg capitalize">
              {lastDetection.result}
            </h4>
            <div className="flex items-center mt-1">
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    lastDetection.is_critical ? "bg-red-500" : "bg-blue-500"
                  }`}
                  style={{
                    width: `${Math.min(100, lastDetection.score * 100)}%`,
                  }}
                ></div>
              </div>
              <span className="ml-2 text-sm font-medium">
                {(lastDetection.score * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Detectado: {formatDateTime(lastDetection.timestamp)}</span>
            <span>
              Tiempo de procesamiento:{" "}
              {lastDetection.processing_time?.toFixed(2) || "?"} ms
            </span>
          </div>
        </div>
      </div>

      {lastDetection.all_results && lastDetection.all_results.length > 1 && (
        <div className="mt-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Otras posibilidades:
          </h4>
          <div className="space-y-1">
            {lastDetection.all_results.slice(1, 4).map((result, idx) => (
              <div key={idx} className="flex items-center">
                <span className="text-sm mr-2">{getIcon(result.label)}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm capitalize">{result.label}</span>
                    <span className="text-xs text-gray-500">
                      {(result.score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-500"
                      style={{ width: `${Math.min(100, result.score * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
