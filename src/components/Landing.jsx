import {
  ChevronRight,
  MessageSquare,
  X,
  Send,
  Menu,
  Home,
  Info,
  Phone,
  MapPin,
  Volume2,
  Eye,
  FileText,
  Bell,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";

export default function SafeDriveFinalLanding() {
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
  const [isNavOpen, setIsNavOpen] = useState(false);

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

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const generateGeminiResponse = async (userMessage) => {
    setIsLoading(true);
    try {
      const systemPrompt = `Eres el asistente virtual oficial de SafeDrive, una aplicación especializada para conductores con discapacidad auditiva que utiliza inteligencia artificial para mejorar su seguridad al volante.

TU FUNCIÓN: Proporcionar información precisa sobre SafeDrive, responder preguntas y ofrecer ayuda relacionada exclusivamente con el producto.

SOBRE SAFEDRIVE:
- Aplicación que detecta sonidos críticos (sirenas, claxons) y los convierte en alertas visuales/táctiles para conductores con discapacidad auditiva
- Incluye análisis visual del entorno a través de IA (escucha y mira por el conductor)
- Genera resúmenes diarios de conducción con recomendaciones personalizadas
- Presenta un mapa colaborativo donde los sonidos críticos detectados aparecen durante un minuto para alertar a otros conductores
- Desarrollado por un equipo de 4 programadores durante un bootcamp de Python e IA de la Fundación Esplai

AL RESPONDER:
- Sé conciso, amable y útil
- Usa **negrita** para destacar información importante
- Emplea *cursiva* para detalles secundarios
- Utiliza listas para explicar características o pasos
- Incluye emojis relevantes para hacer tus respuestas más accesibles
- Si te preguntan sobre características técnicas que no conoces, menciona que "esa información está en desarrollo"
- NUNCA inventes información que no esté aquí
- SIEMPRE enfoca tus respuestas en cómo SafeDrive ayuda a conductores con discapacidad auditiva

IMPORTANTE: Eres un chatbot específico de producto. NO ofrezcas servicios o información no relacionados con SafeDrive. Si te preguntan sobre temas completamente ajenos, redirige la conversación amablemente hacia SafeDrive.`;

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

  // Auto-scroll to bottom of chat when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-purple-100 flex flex-col">
      {/* Navigation */}
      <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <span className="text-2xl font-bold text-purple-600">
                SafeDrive
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a
                href="#home"
                className="flex items-center text-gray-700 hover:text-purple-600 transition"
              >
                <Home size={18} className="mr-1" /> Inicio
              </a>
              <a
                href="#about"
                className="flex items-center text-gray-700 hover:text-purple-600 transition"
              >
                <Info size={18} className="mr-1" /> Nosotros
              </a>
              <a
                href="#features"
                className="flex items-center text-gray-700 hover:text-purple-600 transition"
              >
                <MapPin size={18} className="mr-1" /> Características
              </a>
              <a
                href="#accesibility"
                className="flex items-center bg-purple-100 text-purple-700 hover:bg-purple-200 transition px-3 py-1 rounded-full"
              >
                <Volume2 size={18} className="mr-1" /> Accesibilidad
              </a>
            </nav>

            {/* Mobile Navigation Button */}
            <div className="flex md:hidden">
              <button
                onClick={toggleNav}
                className="text-gray-700 hover:text-purple-600 focus:outline-none"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden ${isNavOpen ? "block" : "hidden"}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-md">
            <a
              href="#home"
              className="flex items-center text-gray-700 hover:text-purple-600 transition block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsNavOpen(false)}
            >
              <Home size={18} className="mr-2" /> Inicio
            </a>
            <a
              href="#about"
              className="flex items-center text-gray-700 hover:text-purple-600 transition block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsNavOpen(false)}
            >
              <Info size={18} className="mr-2" /> Nosotros
            </a>
            <a
              href="#features"
              className="flex items-center text-gray-700 hover:text-purple-600 transition block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsNavOpen(false)}
            >
              <MapPin size={18} className="mr-2" /> Características
            </a>
            <a
              href="#accesibility"
              className="flex items-center bg-purple-100 text-purple-700 hover:bg-purple-200 transition block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsNavOpen(false)}
            >
              <Volume2 size={18} className="mr-2" /> Accesibilidad
            </a>
          </div>
        </div>
      </header>

      {/* Animación creativa - Mapa de ruta con coches (ahora en la parte superior) */}
      <div className="w-full h-64 overflow-hidden bg-gradient-to-b from-purple-100 to-transparent z-0">
        <svg
          viewBox="0 0 400 200"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          {/* Fondo de gradiente */}
          <defs>
            <linearGradient
              id="roadGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="rgba(168, 85, 247, 0.1)" />
              <stop offset="100%" stopColor="rgba(139, 92, 246, 0.3)" />
            </linearGradient>

            {/* Patrón de mapa de ciudad */}
            <pattern
              id="cityGrid"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="rgba(168, 85, 247, 0.15)"
                strokeWidth="0.5"
              />
            </pattern>

            {/* Coche animado */}
            <symbol id="car" viewBox="0 0 24 12">
              <rect
                x="2"
                y="3"
                width="20"
                height="7"
                rx="1"
                fill="rgba(168, 85, 247, 0.8)"
              />
              <rect
                x="4"
                y="0"
                width="16"
                height="4"
                rx="1"
                fill="rgba(168, 85, 247, 0.9)"
              />
              <circle cx="6" cy="10" r="2" fill="rgba(139, 92, 246, 1)" />
              <circle cx="18" cy="10" r="2" fill="rgba(139, 92, 246, 1)" />
              <rect
                x="16"
                y="1"
                width="3"
                height="2"
                rx="1"
                fill="rgba(255, 255, 255, 0.5)"
              />
              <rect
                x="5"
                y="1"
                width="3"
                height="2"
                rx="1"
                fill="rgba(255, 255, 255, 0.5)"
              />
            </symbol>
          </defs>

          {/* Fondo con mapa de ciudad */}
          <rect width="100%" height="100%" fill="url(#cityGrid)" />

          {/* Calles principales */}
          <path
            d="M0,100 Q100,110 200,90 T400,100"
            stroke="rgba(168, 85, 247, 0.4)"
            strokeWidth="5"
            fill="none"
          />
          <path
            d="M0,50 Q80,40 200,70 T400,50"
            stroke="rgba(168, 85, 247, 0.3)"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M0,150 Q120,170 250,140 T400,160"
            stroke="rgba(168, 85, 247, 0.5)"
            strokeWidth="4"
            fill="none"
          />

          {/* Calles verticales */}
          <path
            d="M80,0 Q70,100 80,200"
            stroke="rgba(168, 85, 247, 0.3)"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M200,0 Q220,100 200,200"
            stroke="rgba(168, 85, 247, 0.4)"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M320,0 Q300,100 320,200"
            stroke="rgba(168, 85, 247, 0.3)"
            strokeWidth="2"
            fill="none"
          />

          {/* Puntos de destino pulsantes */}
          <circle cx="200" cy="90" r="4" fill="rgba(139, 92, 246, 0.8)">
            <animate
              attributeName="r"
              values="4;8;4"
              dur="3s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="1;0.5;1"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="80" cy="50" r="3" fill="rgba(139, 92, 246, 0.7)">
            <animate
              attributeName="r"
              values="3;6;3"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="1;0.5;1"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="320" cy="150" r="3" fill="rgba(139, 92, 246, 0.7)">
            <animate
              attributeName="r"
              values="3;6;3"
              dur="4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="1;0.5;1"
              dur="4s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Coches animados en movimiento */}
          <use href="#car" x="0" y="95" width="20" height="10">
            <animateMotion
              path="M0,0 Q100,10 200,-10 T400,0"
              dur="8s"
              repeatCount="indefinite"
            />
          </use>
          <use href="#car" x="0" y="145" width="16" height="8">
            <animateMotion
              path="M400,0 Q250,20 120,-30 T0,10"
              dur="12s"
              repeatCount="indefinite"
            />
          </use>
          <use href="#car" x="0" y="45" width="14" height="7">
            <animateMotion
              path="M0,0 Q80,-10 200,20 T400,0"
              dur="10s"
              repeatCount="indefinite"
            />
          </use>

          {/* Rutas dinámicas */}
          <path
            d="M80,50 Q140,70 200,90"
            stroke="rgba(216, 180, 254, 0.9)"
            strokeWidth="1.5"
            strokeDasharray="5,3"
            fill="none"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="8;0"
              dur="3s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M200,90 Q260,120 320,150"
            stroke="rgba(216, 180, 254, 0.9)"
            strokeWidth="1.5"
            strokeDasharray="5,3"
            fill="none"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="8;0"
              dur="3s"
              repeatCount="indefinite"
            />
          </path>

          {/* Efecto de radar en destino principal */}
          <circle
            cx="200"
            cy="90"
            r="0"
            fill="none"
            stroke="rgba(139, 92, 246, 0.6)"
            strokeWidth="1"
          >
            <animate
              attributeName="r"
              values="0;50"
              dur="3s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </div>

      {/* Hero Section */}
      <section id="home" className="pt-8 md:pt-12 pb-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center">
            {/* Left Content - Title, Slogan, Description */}
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              <div className="relative">
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-200 rounded-full opacity-50 blur-xl"></div>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4 relative">
                  SafeDrive
                </h1>
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold text-purple-600 mb-4">
                Escuchamos y vemos por ti en la carretera
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-lg">
                Asistente de conducción inteligente para personas con
                discapacidad auditiva. Mejoramos tu seguridad con IA que detecta
                sonidos críticos y analiza el entorno visual.
              </p>
              <button
                className="bg-purple-500 text-white px-8 py-3 rounded-full font-medium hover:bg-purple-600 transition flex items-center justify-center shadow-lg hover:shadow-xl"
                onClick={() =>
                  (window.location.href = "https://safedrivev.netlify.app/")
                }
              >
                Descubre SafeDrive <ChevronRight className="ml-2" size={20} />
              </button>
            </div>

            {/* Right Content - Tilted Phone Mockup with empty IMG */}
            <div className="lg:w-1/2 flex justify-center">
              <div className="relative transform rotate-6 hover:rotate-0 transition-transform duration-300">
                {/* Phone frame */}
                <div className="w-64 h-128 bg-gray-800 rounded-3xl p-3 shadow-2xl">
                  {/* Screen border */}
                  <div className="w-full h-full bg-white rounded-2xl overflow-hidden relative">
                    {/* Status bar */}
                    <div className="h-6 w-full bg-gray-100 flex items-center justify-between px-4">
                      <span className="text-xs text-gray-600">15:40</span>
                      <div className="flex space-x-1">
                        <div className="w-4 h-3 bg-gray-400 rounded-sm"></div>
                        <div className="w-4 h-3 bg-gray-400 rounded-sm"></div>
                      </div>
                    </div>

                    {/* Empty IMG placeholder - you can add your own image here */}
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <img
                        src="run.png"
                        alt="SafeDrive App en funcionamiento"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                </div>

                {/* Reflection */}
                <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl pointer-events-none"></div>

                {/* Shadow under the phone */}
                <div className="absolute -bottom-6 -right-6 w-64 h-128 bg-black/10 rounded-3xl -z-10 blur-md"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wave divider */}
      <div className="relative h-24 md:h-32">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="absolute w-full h-full text-purple-100 fill-current"
        >
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V56.44Z"></path>
        </svg>
      </div>

      {/* About Us Section with 4 Cards */}
      <section id="about" className="py-16 bg-purple-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Sobre Nosotros
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Somos estudiantes de un bootcamp de la Fundación Esplai de Python
              e Inteligencia Artificial, y desarrollamos este proyecto como
              parte de nuestro trabajo final.
            </p>
            <div className="flex items-center justify-center mt-6 space-x-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
              </span>
              <p className="text-base text-purple-700 font-medium">
                Proyecto actualmente en desarrollo
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
              <div className="h-2 bg-gradient-to-r from-purple-400 to-purple-600"></div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Nuestra Misión
                </h3>
                <p className="text-gray-600">
                  Eliminar barreras en la conducción para personas con
                  discapacidad auditiva a través de tecnología de IA accesible e
                  innovadora.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
              <div className="h-2 bg-gradient-to-r from-purple-400 to-purple-600"></div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Nuestro Equipo
                </h3>
                <p className="text-gray-600">
                  Un grupo de 4 programadores apasionados por la accesibilidad y
                  la tecnología como herramienta de inclusión social.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
              <div className="h-2 bg-gradient-to-r from-purple-400 to-purple-600"></div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Tecnología
                </h3>
                <p className="text-gray-600">
                  Utilizamos IA avanzada para la detección de sonidos críticos y
                  análisis visual, mejorando la conciencia situacional durante
                  la conducción.
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
              <div className="h-2 bg-gradient-to-r from-purple-400 to-purple-600"></div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Nuestro Impacto
                </h3>
                <p className="text-gray-600">
                  Promovemos la inclusión y autonomía, facilitando que las
                  personas con discapacidad auditiva conduzcan con mayor
                  seguridad y confianza.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Características Principales
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Descubre cómo SafeDrive transforma la experiencia de conducción
              para personas con discapacidad auditiva mediante tecnología de IA
              avanzada.
            </p>
            <div className="mt-6 inline-block bg-purple-100 px-4 py-2 rounded-lg">
              <p className="text-sm text-purple-800 font-medium">
                Desarrollado con tecnologías de punta en IA y programación
                Python
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-purple-50 rounded-lg p-6 text-center hover:bg-purple-100 transition-colors duration-300">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Volume2 className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Detección de Sonidos Críticos
              </h3>
              <p className="text-gray-600">
                Identifica sirenas, claxons y otros sonidos importantes en la
                carretera, proporcionando alertas visuales o táctiles
                inmediatas.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-purple-50 rounded-lg p-6 text-center hover:bg-purple-100 transition-colors duration-300">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Análisis Visual del Entorno
              </h3>
              <p className="text-gray-600">
                Monitoriza la carretera y el tráfico, detectando situaciones de
                riesgo y complementando las capacidades del conductor.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-purple-50 rounded-lg p-6 text-center hover:bg-purple-100 transition-colors duration-300">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Mapa Colaborativo de Alertas
              </h3>
              <p className="text-gray-600">
                Comparte la ubicación de sirenas y claxons detectados con otros
                usuarios durante un minuto, creando un sistema de alerta
                comunitario.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {/* Feature 4 */}
            <div className="bg-purple-50 rounded-lg p-6 text-center hover:bg-purple-100 transition-colors duration-300">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Resúmenes Diarios de Conducción
              </h3>
              <p className="text-gray-600">
                Recibe análisis personalizados de tus rutas con recomendaciones
                de seguridad basadas en tu estilo de conducción y situaciones
                encontradas.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-purple-50 rounded-lg p-6 text-center hover:bg-purple-100 transition-colors duration-300">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Asistente Virtual Inteligente
              </h3>
              <p className="text-gray-600">
                Un asistente de IA que responde tus preguntas sobre seguridad
                vial, te proporciona consejos personalizados y aprende de tus
                hábitos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Accesibilidad */}
      <section id="accesibility" className="py-16 bg-purple-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Accesibilidad
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              SafeDrive está diseñado específicamente para usuarios con
              discapacidad auditiva, incorporando características que mejoran la
              seguridad y autonomía durante la conducción.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8">
                <h3 className="text-xl font-bold text-purple-600 mb-4">
                  Compromiso con la inclusión
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center mt-1">
                      <span className="text-purple-600 text-sm font-bold">
                        ✓
                      </span>
                    </div>
                    <p className="ml-3 text-gray-600">
                      Interfaz visual intuitiva con alertas claras y
                      contrastantes
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center mt-1">
                      <span className="text-purple-600 text-sm font-bold">
                        ✓
                      </span>
                    </div>
                    <p className="ml-3 text-gray-600">
                      Retroalimentación táctil para notificaciones de sonidos
                      críticos
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center mt-1">
                      <span className="text-purple-600 text-sm font-bold">
                        ✓
                      </span>
                    </div>
                    <p className="ml-3 text-gray-600">
                      Sistema de alertas comunitarias para aumentar la
                      conciencia situacional
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center mt-1">
                      <span className="text-purple-600 text-sm font-bold">
                        ✓
                      </span>
                    </div>
                    <p className="ml-3 text-gray-600">
                      Chatbot integrado con soporte para consultas y ayuda
                      inmediata
                    </p>
                  </li>
                </ul>
              </div>
              <div className="bg-purple-600 p-8 text-white flex items-center">
                <div>
                  <h3 className="text-xl font-bold mb-4">
                    Desarrollado con la comunidad
                  </h3>
                  <p className="mb-4">
                    Nuestro proyecto se basa en el análisis de las necesidades
                    de las personas con discapacidad auditiva, investigamos
                    soluciones accesibles y aplicamos tecnología de IA para
                    mejorar su experiencia de conducción.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">SafeDrive</h3>
              <p className="text-gray-400">
                Escuchamos y vemos por ti en la carretera.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#home"
                    className="text-gray-400 hover:text-white transition"
                  >
                    Inicio
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    className="text-gray-400 hover:text-white transition"
                  >
                    Nosotros
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="text-gray-400 hover:text-white transition"
                  >
                    Características
                  </a>
                </li>
                <li>
                  <a
                    href="#accesibility"
                    className="text-gray-400 hover:text-white transition"
                  >
                    Accesibilidad
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition"
                  >
                    Cookies
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Conecta</h4>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              &copy; {new Date().getFullYear()} SafeDrive. Todos los derechos
              reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Chat button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-50 transition-all duration-300 ${
          isChatOpen
            ? "bg-red-500 hover:bg-red-600"
            : "bg-purple-500 hover:bg-purple-600"
        }`}
      >
        {isChatOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <MessageSquare size={24} className="text-white" />
        )}
      </button>

      {/* Chat window */}
      <div
        className={`fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-lg shadow-xl overflow-hidden z-40 transition-all duration-300 transform ${
          isChatOpen
            ? "scale-100 opacity-100"
            : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        {/* Chat header */}
        <div className="bg-purple-500 text-white p-4 flex items-center">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
            <MessageSquare size={20} className="text-purple-500" />
          </div>
          <div>
            <h3 className="font-bold">Asistente SafeDrive</h3>
            <p className="text-xs text-purple-100">Chatbot</p>
          </div>
        </div>

        {/* Chat messages */}
        <div className="h-80 overflow-y-auto p-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-3/4 rounded-lg p-3 ${
                  message.sender === "user"
                    ? "bg-purple-500 text-white rounded-tr-none"
                    : "bg-white shadow-md rounded-tl-none"
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

        {/* Chat input */}
        <form
          onSubmit={handleSendMessage}
          className="border-t border-gray-200 p-4 flex"
        >
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
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-purple-500 text-white hover:bg-purple-600"
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
