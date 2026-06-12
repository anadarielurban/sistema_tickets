import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Diagnostico() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    problema_encontrado: '',
    diagnostico: '',
    solucion: '',
    causa: 'error_usuario',
    equipo_en_sistemas: false,
  });
  const [loading, setLoading] = useState(false);
  const [iaLoading, setIaLoading] = useState(false);
  const [iaSugerencia, setIaSugerencia] = useState(null);

  const consultarIA = async () => {
    const textoParaIA = form.problema_encontrado || form.diagnostico;
    if (!textoParaIA || textoParaIA.length < 3) {
      toast.error('Describe un poco más el problema para consultar la IA');
      return;
    }
    
    setIaLoading(true);
    setIaSugerencia(null);
    
    try {
      const res = await axios.post('http://localhost:5000/sugerir', {
        texto: textoParaIA,
      });
      setIaSugerencia(res.data);
      toast.success(`🧠 IA sugiere: ${res.data.categoria} (${res.data.confianza}%)`);
    } catch (err) {
      toast.error('IA no disponible. Diagnostica manualmente.');
      console.error(err);
    } finally {
      setIaLoading(false);
    }
  };

  const usarSugerencia = () => {
    if (iaSugerencia) {
      setForm({
        ...form,
        diagnostico: iaSugerencia.diagnostico,
        solucion: iaSugerencia.solucion,
      });
      toast.success('✅ Sugerencia de IA aplicada. Puedes modificarla.');
      setIaSugerencia(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.diagnostico || !form.solucion) {
      toast.error('Llena el diagnóstico y la solución');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`http://localhost:8000/api/tickets/${id}/diagnosticar`, form);
      toast.success('✅ Ticket resuelto');
      navigate('/tickets');
    } catch (err) {
      toast.error('Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const problemasComunes = [
    'No enciende',
    'No enciende, pantalla negra',
    'No enciende, hace beeps',
    'Está muy lenta',
    'Se apaga sola',
    'Se reinicia sola',
    'Pantalla azul',
    'No da video',
    'Hace ruido extraño',
    'Se calienta mucho',
    'No tiene sonido',
    'Teclado no funciona',
    'Mouse no funciona',
    'USB no funciona',
    'No hay internet',
    'Internet muy lento',
    'WiFi no conecta',
    'No imprime',
    'Impresora atascada',
    'Imprime borroso/manchado',
    'No tiene tóner/tinta',
    'Word no abre',
    'Excel no abre',
    'Outlook no funciona',
    'No envia/recibe correos',
    'Windows no inicia',
    'Windows pide activación',
    'Programa no instala',
    'Otro',
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">🔍 Diagnosticar Ticket</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Qué encontraste */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              👀 ¿Qué encontraste?
            </label>
            <select
              value={form.problema_encontrado}
              onChange={(e) => setForm({...form, problema_encontrado: e.target.value})}
              required
              className="w-full p-3 border rounded-lg text-base"
            >
              <option value="">Selecciona el problema...</option>
              {problemasComunes.map((p, i) => (
                <option key={i} value={p}>{p}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              También puedes escribir manualmente en el diagnóstico
            </p>
          </div>

          {/* 2. Diagnóstico */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              🔍 Tu diagnóstico
            </label>
            <textarea
              value={form.diagnostico}
              onChange={(e) => setForm({...form, diagnostico: e.target.value})}
              required
              rows={3}
              className="w-full p-3 border rounded-lg"
              placeholder="Describe lo que diagnosticaste..."
            />
          </div>

          {/* 3. Solución */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              ✅ Solución aplicada
            </label>
            <textarea
              value={form.solucion}
              onChange={(e) => setForm({...form, solucion: e.target.value})}
              required
              rows={3}
              className="w-full p-3 border rounded-lg"
              placeholder="¿Cómo lo resolviste?"
            />
          </div>

          {/* BOTÓN IA */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-purple-900">🧠 Asistente IA</span>
              <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">GRATIS - LOCAL</span>
            </div>
            
            <button
              type="button"
              onClick={consultarIA}
              disabled={iaLoading}
              className="w-full py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 transition-all"
            >
              {iaLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">🧠</span> Analizando...
                </span>
              ) : (
                '🧠 Sugerir diagnóstico con IA'
              )}
            </button>

            {iaSugerencia && (
              <div className="mt-3 bg-white rounded-lg p-3 border border-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-purple-800">
                    🤖 Sugerencia ({iaSugerencia.confianza}% confianza)
                  </p>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                    {iaSugerencia.categoria}
                  </span>
                </div>
                
                <div className="text-sm">
                  <p><strong>🔍 Diagnóstico:</strong> {iaSugerencia.diagnostico}</p>
                  <p><strong>✅ Solución:</strong> {iaSugerencia.solucion}</p>
                  <p><strong>⏱️ Tiempo estimado:</strong> {iaSugerencia.tiempo_estimado_minutos} min</p>
                </div>

                {iaSugerencia.casos_similares?.length > 0 && (
                  <div className="text-xs text-gray-500">
                    <p className="font-medium">📚 Casos similares encontrados:</p>
                    {iaSugerencia.casos_similares.map((c, i) => (
                      <p key={i} className="ml-2">• "{c.texto}" ({c.similitud}%)</p>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={usarSugerencia}
                  className="w-full py-2 bg-green-500 text-white text-sm rounded-lg font-bold hover:bg-green-600"
                >
                  ✅ Usar esta sugerencia
                </button>
                <button
                  type="button"
                  onClick={() => setIaSugerencia(null)}
                  className="w-full py-1 text-xs text-gray-500 hover:text-gray-700"
                >
                  Ignorar sugerencia
                </button>
              </div>
            )}
          </div>

          {/* 4. Causa */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              🎯 Causa raíz
            </label>
            <select
              value={form.causa}
              onChange={(e) => setForm({...form, causa: e.target.value})}
              className="w-full p-3 border rounded-lg"
            >
              <option value="error_usuario">❌ Error del usuario</option>
              <option value="error_sistemas">⚠️ Error de sistemas</option>
              <option value="falla_hardware">🔧 Falla de hardware</option>
              <option value="falla_software">💿 Falla de software</option>
              <option value="configuracion">⚙️ Configuración</option>
              <option value="otro">❓ Otro</option>
            </select>
          </div>

          {/* 5. Equipo en sistemas */}
          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={form.equipo_en_sistemas}
              onChange={(e) => setForm({...form, equipo_en_sistemas: e.target.checked})}
              className="w-5 h-5 rounded"
            />
            <span className="text-sm font-medium">
              🔧 ¿El equipo se queda en el departamento de Sistemas?
            </span>
          </label>

          {/* Botón guardar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-green-600 text-white text-lg font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 shadow-lg"
          >
            {loading ? '⏳ Guardando...' : '💾 Guardar Diagnóstico Final'}
          </button>
        </form>
      </div>
    </div>
  );
}