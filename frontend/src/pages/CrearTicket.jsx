import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function CrearTicket() {
  const { user } = useAuth();
  const [dependencias, setDependencias] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [form, setForm] = useState({
    dependencia_id: '',
    persona_id: '',
    tipo: '',
    titulo: '',
    descripcion: '',
    ubicacion: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:8000/api/dependencias').then(res => setDependencias(res.data));
  }, []);

  const cargarPersonas = async (id) => {
    const res = await axios.get(`http://localhost:8000/api/dependencias/${id}/personas`);
    setPersonas(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/api/tickets', {
        solicitante_id: form.persona_id || user.id,
        dependencia_id: form.dependencia_id || user.dependencia_id,
        tipo: form.tipo,
        titulo: form.titulo,
        descripcion: form.descripcion,
        ubicacion: form.ubicacion,
      });
      toast.success(`Ticket creado: ${res.data.ticket.folio}`);
      setForm({ dependencia_id: '', persona_id: '', tipo: '', titulo: '', descripcion: '', ubicacion: '' });
    } catch (err) {
      toast.error('Error al crear ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6">🖥️ Reportar Problema</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">¿Quién eres?</label>
            <select
              value={form.dependencia_id}
              onChange={(e) => { setForm({...form, dependencia_id: e.target.value}); cargarPersonas(e.target.value); }}
              required
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Selecciona departamento</option>
              {dependencias.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
          </div>

          {personas.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Persona</label>
              <select
                value={form.persona_id}
                onChange={(e) => setForm({...form, persona_id: e.target.value})}
                required
                className="w-full p-3 border rounded-lg"
              >
                <option value="">Selecciona persona</option>
                {personas.map(p => <option key={p.id} value={p.id}>{p.nombre_completo}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">¿Qué falla?</label>
            <select value={form.tipo} onChange={(e) => setForm({...form, tipo: e.target.value})} required className="w-full p-3 border rounded-lg">
              <option value="">Selecciona tipo</option>
              <option value="computadora">🖥️ Computadora</option>
              <option value="impresora">🖨️ Impresora</option>
              <option value="red">🌐 Internet/Red</option>
              <option value="otro">❓ Otra cosa</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input type="text" value={form.titulo} onChange={(e) => setForm({...form, titulo: e.target.value})} required className="w-full p-3 border rounded-lg" placeholder="Ej: PC no enciende" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
            <textarea value={form.descripcion} onChange={(e) => setForm({...form, descripcion: e.target.value})} rows={3} className="w-full p-3 border rounded-lg" placeholder="Describe el problema..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
            <input type="text" value={form.ubicacion} onChange={(e) => setForm({...form, ubicacion: e.target.value})} className="w-full p-3 border rounded-lg" placeholder="Ej: Oficina 203" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 text-white text-xl font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Enviando...' : '📤 Enviar Reporte'}
          </button>
        </form>
      </div>
    </div>
  );
}