import {
    MessageSquare,
    X,
    Send,
  } from "lucide-react";
  import { useState, useRef, useEffect } from "react";
  import { GoogleGenerativeAI } from "@google/generative-ai";
  
  export default function Chat() {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState([
      {
        id: 1,
        content:
          "👋 ¡Hola! Soy el asistente virtual de SafeDrive. ¿En qué puedo ayudarte hoy?",
        sender: "bot",
      },
    ]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
  
    const genAI = useRef(null);
    const modelRef = useRef(null);
  
    useEffect(() => {
      const initGemini = async () => {
        genAI.current = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);
        modelRef.current = genAI.current.getGenerativeModel({ model: "gemini-2.0-flash" });
      };
      initGemini();
    }, []);
  
    const toggleChat = () => setIsChatOpen(!isChatOpen);
  
    const generateGeminiResponse = async (userMessage) => {
      setIsLoading(true);
      try {
        const systemPrompt =
          "Eres un asistente de SafeDrive, una app de seguridad para conductores que usa IA. Responde preguntas sobre la app, seguridad vial y tecnología de conducción. Da respuestas breves y útiles.";
  
        const result = await modelRef.current.generateContent({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemPrompt}\n\n${userMessage}` }],
            },
          ],
        });
  
        const responseText = await result.response.text();
        return responseText;
      } catch (error) {
        console.error("Error generando respuesta con Gemini:", error);
        return "Lo siento, hubo un problema técnico. Intenta más tarde.";
      } finally {
        setIsLoading(false);
      }
    };
  
    const handleSendMessage = async (e) => {
      e.preventDefault();
      if (newMessage.trim() === "") return;
  
      const userMessage = {
        id: messages.length + 1,
        content: newMessage,
        sender: "user",
      };
  
      setMessages((prev) => [...prev, userMessage]);
      setNewMessage("");
  
      const response = await generateGeminiResponse(newMessage);
  
      const botMessage = {
        id: messages.length + 2,
        content: response,
        sender: "bot",
      };
  
      setMessages((prev) => [...prev, botMessage]);
    };
  
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
  
    return (
      <div>
        {/* Botón de chat */}
        <button
          onClick={toggleChat}
          className={`fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-50 transition-all duration-300 ${
            isChatOpen ? "bg-red-500" : "bg-purple-500"
          }`}
        >
          {isChatOpen ? <X size={24} className="text-white" /> : <MessageSquare size={24} className="text-white" />}
        </button>
  
        {/* Ventana de chat */}
        <div
          className={`fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-lg shadow-xl z-40 transition-all duration-300 transform ${
            isChatOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
          }`}
        >
          <div className="bg-purple-500 text-white p-4 flex items-center">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
              <MessageSquare size={20} className="text-purple-500" />
            </div>
            <div>
              <h3 className="font-bold">Asistente SafeDrive</h3>
              <p className="text-xs text-purple-100">IA de Google</p>
            </div>
          </div>
  
          <div className="h-80 overflow-y-auto p-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-3/4 rounded-lg p-3 ${
                    message.sender === "user"
                      ? "bg-purple-500 text-white rounded-tr-none"
                      : "bg-white shadow-md rounded-tl-none"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-white shadow-md rounded-lg rounded-tl-none p-3 flex space-x-2">
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
            <div ref={messagesEndRef} />
          </div>
  
          <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`ml-2 rounded-full w-10 h-10 flex items-center justify-center transition ${
                isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-purple-500 text-white hover:bg-purple-600"
              }`}
              disabled={isLoading}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    );
  }
  