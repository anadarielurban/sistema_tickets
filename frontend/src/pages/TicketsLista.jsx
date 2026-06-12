import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function TicketsLista() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarTickets = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/tickets');
      setTickets(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarTickets(); }, []);

  const tomarTicket = async (id) => {
    await axios.post(`http://localhost:8000/api/tickets/${id}/tomar`);
    cargarTickets();
  };

  const estados = {
    pendiente: '🟡 Pendiente',
    en_proceso: '🔵 En proceso',
    resuelto: '🟢 Resuelto',
    cancelado: '🔴 Cancelado',
  };

  if (loading) return <div className="text-center p-8 text-lg">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">📋 Tickets</h2>
          {user?.rol === 'auxiliar' && (
            <Link to="/crear" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700">
              ➕ Crear para otro
            </Link>
          )}
        </div>

        {tickets.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No hay tickets</p>
        ) : (
          <div className="space-y-3">
            {tickets.map(ticket => (
              <div key={ticket.id} className="bg-white rounded-xl shadow p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-gray-500">{ticket.folio}</span>
                    <h3 className="font-bold">{ticket.titulo}</h3>
                    <p className="text-sm text-gray-600">{ticket.solicitante?.nombre} {ticket.solicitante?.apellido_paterno} - {ticket.dependencia?.nombre}</p>
                    <p className="text-sm text-gray-500">{ticket.ubicacion}</p>
                    {ticket.diagnostico && <p className="text-sm text-green-600 mt-1">✅ {ticket.solucion}</p>}
                  </div>
                  <span className="text-sm">{estados[ticket.estado]}</span>
                </div>
                
                <div className="flex gap-2 mt-3">
                  {ticket.estado === 'pendiente' && user?.rol === 'auxiliar' && (
                    <button onClick={() => tomarTicket(ticket.id)} className="flex-1 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600">
                      ✋ Tomar
                    </button>
                  )}
                  {ticket.estado === 'en_proceso' && ticket.auxiliar_id === user?.id && (
                    <Link to={`/diagnostico/${ticket.id}`} className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 text-center">
                      🔍 Diagnosticar
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}