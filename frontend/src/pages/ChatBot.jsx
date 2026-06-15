import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function ChatBot() {
  const [mensajes, setMensajes] = useState([
    { de: 'bot', texto: '🤖 ¡Hola! Soy el asistente virtual del Departamento de Sistemas.\n\nDescribe tu problema y te ayudaré a clasificarlo.\n\nEjemplos:\n• "no enciende mi pc"\n• "no imprime"\n• "no hay internet"' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const finalRef = useRef(null);

  useEffect(() => {
    finalRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const enviar = async () => {
    if (!input.trim() || loading) return;
    
    const textoUsuario = input;
    setMensajes(prev => [...prev, { de: 'user', texto: textoUsuario }]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/sugerir', { texto: textoUsuario });
      const ia = res.data;
      
      let respuesta = `🔍 *Categoría detectada:* ${ia.categoria}\n`;
      respuesta += `📊 *Confianza:* ${ia.confianza}%\n`;
      respuesta += `💡 *Diagnóstico probable:* ${ia.diagnostico_probable || 'Revisar equipo'}\n`;
      respuesta += `⏱️ *Tiempo estimado:* ${ia.tiempo_estimado_minutos || 'N/D'} min\n\n`;
      respuesta += `👨‍🔧 Un técnico del departamento de sistemas atenderá tu caso.\n`;
      respuesta += `📱 También puedes crear un ticket en la app.`;

      setMensajes(prev => [...prev, { de: 'bot', texto: respuesta }]);
    } catch {
      setMensajes(prev => [...prev, { de: 'bot', texto: '❌ Lo siento, no pude procesar tu mensaje. Intenta describir tu problema de otra forma.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 text-white p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl">🤖</div>
          <div>
            <h3 className="font-bold">Soporte Técnico</h3>
            <p className="text-xs text-green-100">Departamento de Sistemas</p>
          </div>
        </div>
        
        {/* Chat */}
        <div className="h-96 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {mensajes.map((msg, i) => (
            <div key={i} className={`flex ${msg.de === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs p-3 rounded-2xl text-sm whitespace-pre-line ${
                msg.de === 'user' 
                  ? 'bg-green-500 text-white rounded-br-none shadow' 
                  : 'bg-white text-gray-800 rounded-bl-none shadow border'
              }`}>
                {msg.texto}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white p-3 rounded-2xl shadow">
                <span className="animate-pulse">🧠 Analizando...</span>
              </div>
            </div>
          )}
          <div ref={finalRef} />
        </div>

        {/* Input */}
        <div className="p-3 flex gap-2 border-t bg-white">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && enviar()}
            placeholder="Describe tu problema..."
            className="flex-1 p-3 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button 
            onClick={enviar} 
            disabled={loading}
            className="bg-green-600 text-white px-5 rounded-full font-bold hover:bg-green-700 disabled:opacity-50 text-lg"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
}