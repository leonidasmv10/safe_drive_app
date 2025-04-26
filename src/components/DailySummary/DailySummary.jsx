import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MessageSquare, Send, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import "@/components/UserSettings/userSettings.css";
const API_URL = import.meta.env.VITE_API_URL;

export default function DailySummary() {
  const navigate = useNavigate();
  const [dailySummary, setDailySummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiRecommendation, setAiRecommendation] = useState(
    "Generando recomendación..."
  );
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const messagesEndRef = useRef(null);

  // Gemini AI setup
  const genAI = useRef(null);
  const modelRef = useRef(null);

  useEffect(() => {
    const initGemini = async () => {
      genAI.current = new GoogleGenerativeAI(
        import.meta.env.VITE_GOOGLE_API_KEY
      );
      modelRef.current = genAI.current.getGenerativeModel({
        model: "gemini-2.0-flash",
      });
    };
    initGemini();
  }, []);

  const generateRecommendation = async (summaryData) => {
    try {
      const prompt = `Eres un asistente de SafeDrive, una app de seguridad para conductores con discapacidad auditiva. 
Analiza los siguientes datos del resumen diario y genera una recomendación útil y concisa:

Fecha: ${summaryData.date}
Sonidos críticos:
- Sirenas: ${summaryData.criticalSounds.sirens.length} detecciones
- Bocinas: ${summaryData.criticalSounds.horns.length} detecciones
Zonas de alta actividad: ${summaryData.highActivityZones.length} zonas identificadas

Genera una recomendación práctica y útil para el conductor con discapacidad auditiva basada en estos datos. 
La recomendación debe ser breve, clara y enfocada en la seguridad, teniendo en cuenta que el conductor no puede escuchar estos sonidos críticos.`;

      const result = await modelRef.current.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const response = await result.response.text();
      setAiRecommendation(response);
    } catch (error) {
      console.error("Error generando recomendación con Gemini:", error);
      setAiRecommendation(
        "No se pudo generar una recomendación en este momento."
      );
    }
  };

  // Initialize chat with AI recommendation when dailySummary is loaded
  useEffect(() => {
    if (dailySummary && aiRecommendation) {
      setChatMessages([
        {
          id: 1,
          content: aiRecommendation,
          sender: "bot"
        }
      ]);
    }
  }, [dailySummary, aiRecommendation]);

  const handleChatMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoadingChat) return;

    const userMessage = {
      id: Date.now(),
      content: newMessage,
      sender: "user",
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsLoadingChat(true);

    try {
      const systemPrompt = `Eres un asistente de SafeDrive especializado en seguridad vial para conductores con discapacidad auditiva. 
Solo responde preguntas relacionadas con:
- El resumen diario de conducción
- Recomendaciones de seguridad vial para conductores con discapacidad auditiva
- Análisis de zonas de riesgo y sonidos críticos
- Interpretación de datos de detección de sonidos
- Detección y análisis de vehículos cercanos (patinetes, etc.)

Si la pregunta no está relacionada con estos temas, responde amablemente que solo puedes hablar sobre seguridad vial y el resumen diario para conductores con discapacidad auditiva.

Usa formato Markdown para mejorar la legibilidad:
- Usa **negrita** para enfatizar puntos importantes
- Usa *cursiva* para detalles adicionales
- Usa listas con - o 1. para pasos o características
- Usa \`código\` para términos técnicos
- Usa > para citas o consejos importantes

Datos detallados del resumen:
Fecha: ${dailySummary.date}

Sonidos críticos detectados:
- Sirenas (${dailySummary.criticalSounds.sirens.length}):
${dailySummary.criticalSounds.sirens.map(siren => `  - ${siren.location} (${siren.time})`).join('\n')}
- Bocinas (${dailySummary.criticalSounds.horns.length}):
${dailySummary.criticalSounds.horns.map(horn => `  - ${horn.location} (${horn.time})`).join('\n')}

Vehículos detectados:
- Patinetes: ${dailySummary.nearbyVehicles.scooters}
${dailySummary.nearbyVehicles.scooters > 0 ? `  - Ubicación: ${dailySummary.nearbyVehicles.scootersLocation}\n  - Hora: ${dailySummary.nearbyVehicles.scootersTime}` : ''}

Zonas de alta actividad (${dailySummary.highActivityZones.length}):
${dailySummary.highActivityZones.map(zone => `- ${zone.name}\n  ${zone.description}`).join('\n')}

Pregunta del usuario: ${newMessage}`;

      const result = await modelRef.current.generateContent({
        contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
      });

      const response = await result.response.text();

      const botMessage = {
        id: Date.now() + 1,
        content: response,
        sender: "bot",
      };

      setChatMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error en el chat:", error);
      const errorMessage = {
        id: Date.now() + 1,
        content: "Lo siento, hubo un error al procesar tu pregunta. Por favor, inténtalo de nuevo.",
        sender: "bot",
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  useEffect(() => {
    const fetchDailySummary = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/detection/daily_summary/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();

        // Transform the API data into the format expected by the component
        const transformedData = {
          date: new Date(data.date).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          criticalSounds: {
            sirens:
              data.sounds
                .find((s) => s.label === "Sirena")
                ?.locations.map((loc) => ({
                  time: loc.time,
                  location: loc.address,
                })) || [],
            horns:
              data.sounds
                .find((s) => s.label === "Bocina")
                ?.locations.map((loc) => ({
                  time: loc.time,
                  location: loc.address,
                })) || [],
          },
          nearbyVehicles: {
            scooters: data.vehicles.find(v => v.label === "person-on-scooter-side-view")?.count || 0,
            scootersLocation: data.critical_areas[0]?.address || "",
            scootersTime: data.vehicles.find(v => v.label === "person-on-scooter-side-view")?.times?.[0]?.time || "",
          },
          highActivityZones: data.critical_areas.map((area) => ({
            name: area.address,
            description: `Detecciones: ${
              area.detection_count
            } - Sonidos: ${area.sound_types.join(", ")}`,
          })),
          recommendation:
            data.critical_areas.length > 0
              ? `Se recomienda evitar la zona de ${data.critical_areas[0].address} debido a la alta concentración de sonidos críticos.`
              : "No se detectaron zonas críticas en el día de hoy.",
        };

        setDailySummary(transformedData);
        generateRecommendation(transformedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDailySummary();
  }, []);

  if (loading) {
    return (
      <div className="pb-20 pt-6 px-4 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
          </div>
          <p className="text-gray-600">Cargando resumen diario...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pb-20 pt-6 px-4 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!dailySummary) {
    return null;
  }

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

            <div className="space-y-6">
              {dailySummary.criticalSounds.sirens.length > 0 && (
                <div className="space-y-3">
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
                    <div className="font-medium text-lg">
                      {dailySummary.criticalSounds.sirens.length} sirenas
                    </div>
                  </div>
                  <div className="pl-11 space-y-2">
                    {dailySummary.criticalSounds.sirens.map((siren, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600">
                          {siren.location}
                        </div>
                        <div className="text-sm font-medium text-gray-800 mt-1">
                          Hora: {siren.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dailySummary.criticalSounds.horns.length > 0 && (
                <div className="space-y-3">
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
                    <div className="font-medium text-lg">
                      {dailySummary.criticalSounds.horns.length} bocinas
                    </div>
                  </div>
                  <div className="pl-11 space-y-2">
                    {dailySummary.criticalSounds.horns.map((horn, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600">
                          {horn.location}
                        </div>
                        <div className="text-sm font-medium text-gray-800 mt-1">
                          Hora: {horn.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

            {dailySummary.nearbyVehicles.scooters > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-yellow-100 p-2 rounded-full mr-3">
                    <svg
                      className="w-4 h-4 text-yellow-600"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h-3v9a1 1 0 001 1h.05a2.5 2.5 0 014.9 0H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
                    </svg>
                  </div>
                  <div className="font-medium text-lg">
                    {dailySummary.nearbyVehicles.scooters} patinete(s) detectado(s)
                  </div>
                </div>
                {dailySummary.nearbyVehicles.scootersLocation && (
                  <div className="pl-11 space-y-2">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600">
                        {dailySummary.nearbyVehicles.scootersLocation}
                      </div>
                      {dailySummary.nearbyVehicles.scootersTime && (
                        <div className="text-sm font-medium text-gray-800 mt-1">
                          Hora: {dailySummary.nearbyVehicles.scootersTime}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-600 text-center py-4">
                No se detectaron vehículos críticos en el día de hoy
              </div>
            )}
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
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-800 mb-2">
                    {zone.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {zone.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendation Section */}
          {!isChatOpen && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-800 flex items-center">
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
                <button
                  onClick={() => setIsChatOpen(!isChatOpen)}
                  className={`p-2 rounded-full transition-colors ${
                    isChatOpen
                      ? "bg-red-100 text-red-600"
                      : "bg-purple-100 text-purple-600"
                  }`}
                >
                  {isChatOpen ? <X size={20} /> : <MessageSquare size={20} />}
                </button>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-gray-700 leading-relaxed mb-4">
                  <ReactMarkdown>{aiRecommendation}</ReactMarkdown>
                </p>
              </div>
            </div>
          )}

          {/* Chat Interface */}
          {isChatOpen && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-800 flex items-center">
                  <svg
                    className="w-5 h-5 text-purple-600 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                  </svg>
                  Chat de Seguridad Vial
                </h2>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="h-96 overflow-y-auto mb-4 space-y-4 px-2">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-4 ${
                        message.sender === "user"
                          ? "bg-purple-500 text-white rounded-tr-none"
                          : "bg-gray-50 shadow-sm rounded-tl-none"
                      }`}
                    >
                      {message.sender === "bot" ? (
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      ) : (
                        message.content
                      )}
                    </div>
                  </div>
                ))}
                {isLoadingChat && (
                  <div className="flex justify-start">
                    <div className="bg-gray-50 shadow-sm rounded-lg rounded-tl-none p-4 flex space-x-2">
                      <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-purple-700 rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <form
                onSubmit={handleChatMessage}
                className="flex gap-2 px-2"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Pregunta sobre el resumen..."
                  className="flex-1 bg-gray-50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isLoadingChat}
                />
                <button
                  type="submit"
                  disabled={isLoadingChat}
                  className="bg-purple-500 text-white p-3 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
