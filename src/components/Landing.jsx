import { ChevronRight, MessageSquare, X, Send, Menu, Home, Info, Phone, MapPin } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function SafeDriveFinalLanding() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: "👋 Hello! I'm SafeDrive's virtual assistant. How can I help you today?",
      sender: "bot"
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [isNavOpen, setIsNavOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };
  
  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      content: newMessage,
      sender: "user"
    };
    
    setMessages([...messages, userMessage]);
    setNewMessage('');

    // Simulate bot response after a short delay
    setTimeout(() => {
      const botResponses = [
        "I can help you learn more about SafeDrive's features!",
        "SafeDrive uses AI to monitor your driving patterns and alert you to potential hazards.",
        "Our app works on both iOS and Android devices.",
        "You can try SafeDrive free for 30 days!",
        "SafeDrive can detect when you're getting drowsy and suggest taking a break."
      ];
      
      const botMessage = {
        id: messages.length + 2,
        content: botResponses[Math.floor(Math.random() * botResponses.length)],
        sender: "bot"
      };
      
      setMessages(prevMessages => [...prevMessages, botMessage]);
    }, 1000);
  };

  // Auto-scroll to bottom of chat when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-purple-100 flex flex-col">
      {/* Navigation */}
      <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <span className="text-2xl font-bold text-purple-600">SafeDrive</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#home" className="flex items-center text-gray-700 hover:text-purple-600 transition">
                <Home size={18} className="mr-1" /> Home
              </a>
              <a href="#about" className="flex items-center text-gray-700 hover:text-purple-600 transition">
                <Info size={18} className="mr-1" /> About Us
              </a>
              <a href="#features" className="flex items-center text-gray-700 hover:text-purple-600 transition">
                <MapPin size={18} className="mr-1" /> Features
              </a>
              <a href="#contact" className="flex items-center text-gray-700 hover:text-purple-600 transition">
                <Phone size={18} className="mr-1" /> Contact
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
        <div className={`md:hidden ${isNavOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-md">
            <a 
              href="#home" 
              className="flex items-center text-gray-700 hover:text-purple-600 transition block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsNavOpen(false)}
            >
              <Home size={18} className="mr-2" /> Home
            </a>
            <a 
              href="#about" 
              className="flex items-center text-gray-700 hover:text-purple-600 transition block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsNavOpen(false)}
            >
              <Info size={18} className="mr-2" /> About Us
            </a>
            <a 
              href="#features" 
              className="flex items-center text-gray-700 hover:text-purple-600 transition block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsNavOpen(false)}
            >
              <MapPin size={18} className="mr-2" /> Features
            </a>
            <a 
              href="#contact" 
              className="flex items-center text-gray-700 hover:text-purple-600 transition block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsNavOpen(false)}
            >
              <Phone size={18} className="mr-2" /> Contact
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
                <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4 relative">SafeDrive</h1>
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold text-purple-600 mb-4">Drive Aware. Stay Safe.</h2>
              <p className="text-lg text-gray-600 mb-8 max-w-lg">
                Intelligent driving assistant that enhances your awareness of the surroundings.
              </p>
              <button className="bg-purple-500 text-white px-8 py-3 rounded-full font-medium hover:bg-purple-600 transition flex items-center justify-center shadow-lg hover:shadow-xl">
                Discover SafeDrive <ChevronRight className="ml-2" size={20} />
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
                      <img src="/api/placeholder/300/500" alt="Add your app screenshot here" className="w-full h-auto" />
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
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute w-full h-full text-purple-100 fill-current">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V56.44Z"></path>
        </svg>
      </div>
      
      {/* About Us Section with 4 Cards */}
      <section id="about" className="py-16 bg-purple-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">About Us</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're dedicated to making your driving experience safer with cutting-edge technology.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
              <div className="h-2 bg-gradient-to-r from-purple-400 to-purple-600"></div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Our Mission</h3>
                <p className="text-gray-600">
                  To create a safer driving environment through innovative technology and intelligent systems.
                </p>
              </div>
            </div>
            
            {/* Card 2 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
              <div className="h-2 bg-gradient-to-r from-purple-400 to-purple-600"></div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Our Team</h3>
                <p className="text-gray-600">
                  A passionate group of engineers and designers committed to road safety innovation.
                </p>
              </div>
            </div>
            
            {/* Card 3 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
              <div className="h-2 bg-gradient-to-r from-purple-400 to-purple-600"></div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Technology</h3>
                <p className="text-gray-600">
                  Using AI and machine learning to predict and prevent potential driving hazards.
                </p>
              </div>
            </div>
            
            {/* Card 4 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
              <div className="h-2 bg-gradient-to-r from-purple-400 to-purple-600"></div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Our Impact</h3>
                <p className="text-gray-600">
                  Helping thousands of drivers stay alert and safe on the roads every day.
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Key Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover the technology that makes SafeDrive the leading driving safety solution.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-purple-50 rounded-lg p-6 text-center hover:bg-purple-100 transition-colors duration-300">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Hazard Detection</h3>
              <p className="text-gray-600">
                Advanced sensors scan surroundings to identify potential dangers before they become threats.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-purple-50 rounded-lg p-6 text-center hover:bg-purple-100 transition-colors duration-300">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Real-time Alerts</h3>
              <p className="text-gray-600">
                Immediate notifications keep you informed of changing road conditions and potential risks.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-purple-50 rounded-lg p-6 text-center hover:bg-purple-100 transition-colors duration-300">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Driving Analytics</h3>
              <p className="text-gray-600">
                Comprehensive reports on your driving habits help you become a safer, more aware driver.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact Section */}
      <section id="contact" className="py-16 bg-purple-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Contact Us</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have questions about SafeDrive? We're here to help you.
            </p>
          </div>
          
          <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <form className="p-8">
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Your Name"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Message</label>
                <textarea 
                  id="message" 
                  rows="4" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-purple-500 text-white py-3 rounded-lg font-medium hover:bg-purple-600 transition shadow-md hover:shadow-lg"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">SafeDrive</h3>
              <p className="text-gray-400">Drive Aware. Stay Safe.</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#home" className="text-gray-400 hover:text-white transition">Home</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-white transition">About Us</a></li>
                <li><a href="#features" className="text-gray-400 hover:text-white transition">Features</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Cookies</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">&copy; {new Date().getFullYear()} SafeDrive. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Chat button */}
      <button 
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-50 transition-all duration-300 ${
          isChatOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-500 hover:bg-purple-600'
        }`}
      >
        {isChatOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <MessageSquare size={24} className="text-white" />
        )}
      </button>

      {/* Chat window */}
      <div className={`fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-lg shadow-xl overflow-hidden z-40 transition-all duration-300 transform ${
        isChatOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
      }`}>
        {/* Chat header */}
        <div className="bg-purple-500 text-white p-4 flex items-center">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
            <MessageSquare size={20} className="text-purple-500" />
          </div>
          <div>
            <h3 className="font-bold">SafeDrive Assistant</h3>
            <p className="text-xs text-purple-100">Online | Typically replies instantly</p>
          </div>
        </div>
        
        {/* Chat messages */}
        <div className="h-80 overflow-y-auto p-4 bg-gray-50">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-3/4 rounded-lg p-3 ${
                message.sender === 'user' 
                  ? 'bg-purple-500 text-white rounded-tr-none' 
                  : 'bg-white shadow-md rounded-tl-none'
              }`}>
                {message.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Chat input */}
        <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button 
            type="submit"
            className="ml-2 bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-purple-600 transition"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}