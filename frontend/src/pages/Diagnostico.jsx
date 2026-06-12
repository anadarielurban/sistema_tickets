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

  const handleSubmit = async (e) => {
    e.preventDefault();
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

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">🔍 Diagnosticar Ticket</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">¿Qué encontraste?</label>
            <select value={form.problema_encontrado} onChange={(e) => setForm({...form, problema_encontrado: e.target.value})} required className="w-full p-3 border rounded-lg">
              <option value="">Selecciona...</option>
              <option value="No enciende">No enciende</option>
              <option value="Cable desconectado">Cable desconectado</option>
              <option value="Está lenta">Está lenta</option>
              <option value="Sin papel">Sin papel</option>
              <option value="Sin tóner">Sin tóner</option>
              <option value="No hay internet">No hay internet</option>
              <option value="Programa no abre">Programa no abre</option>
              <option value="Windows no inicia">Windows no inicia</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Diagnóstico</label>
            <textarea value={form.diagnostico} onChange={(e) => setForm({...form, diagnostico: e.target.value})} required rows={3} className="w-full p-3 border rounded-lg" placeholder="Describe el diagnóstico..." />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Solución</label>
            <textarea value={form.solucion} onChange={(e) => setForm({...form, solucion: e.target.value})} required rows={3} className="w-full p-3 border rounded-lg" placeholder="¿Cómo lo resolviste?" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Causa</label>
            <select value={form.causa} onChange={(e) => setForm({...form, causa: e.target.value})} className="w-full p-3 border rounded-lg">
              <option value="error_usuario">❌ Error del usuario</option>
              <option value="error_sistemas">⚠️ Error de sistemas</option>
              <option value="falla_hardware">🔧 Falla de hardware</option>
              <option value="falla_software">💿 Falla de software</option>
              <option value="configuracion">⚙️ Configuración</option>
              <option value="otro">❓ Otro</option>
            </select>
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.equipo_en_sistemas} onChange={(e) => setForm({...form, equipo_en_sistemas: e.target.checked})} className="w-5 h-5" />
            <span className="text-sm">¿Equipo se queda en sistemas?</span>
          </label>

          <button type="submit" disabled={loading} className="w-full py-4 bg-green-600 text-white text-lg font-bold rounded-xl hover:bg-green-700 disabled:opacity-50">
            {loading ? 'Guardando...' : '💾 Guardar Diagnóstico'}
          </button>
        </form>
      </div>
    </div>
  );
}