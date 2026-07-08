import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTicketAlt, FaClock, FaCheckCircle, FaSpinner, FaTimesCircle,
  FaSearch, FaFilter, FaSync, FaHandPaper, FaTools, FaEye,
  FaUser, FaBuilding, FaMapMarkerAlt, FaCalendarAlt, FaPlus
} from 'react-icons/fa';

export default function TicketsLista() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    cargarTickets();
  }, []);

  const cargarTickets = async () => {
    setIsRefreshing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8000/api/tickets', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setTickets(res.data.data || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const tomarTicket = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:8000/api/tickets/${id}/tomar`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      cargarTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const c = {
    azul: '#2C5282', azulOscuro: '#1A365D', azulClaro: '#4299E1',
    verde: '#48BB78', naranja: '#ED8936', amarillo: '#ECC94B',
    rojo: '#E53E3E', gris: '#718096',
  };

  const estados = {
    pendiente: { label: 'Pendiente', icon: FaSpinner, color: c.naranja, bg: '#FFF7ED' },
    en_proceso: { label: 'En Proceso', icon: FaClock, color: c.amarillo, bg: '#FFFBEB' },
    resuelto: { label: 'Resuelto', icon: FaCheckCircle, color: c.verde, bg: '#F0FFF4' },
    cancelado: { label: 'Cancelado', icon: FaTimesCircle, color: c.rojo, bg: '#FFF5F5' },
  };

  const tiposIcono = {
    computadora: '🖥️',
    impresora: '🖨️',
    red: '🌐',
    otro: '❓',
  };

  // Filtrar tickets
  const ticketsFiltrados = tickets.filter(ticket => {
    const matchEstado = filtroEstado === 'todos' || ticket.estado === filtroEstado;
    const matchSearch = ticket.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        ticket.folio?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchEstado && matchSearch;
  });

  const filtrosEstado = [
    { value: 'todos', label: 'Todos', color: c.azul },
    { value: 'pendiente', label: 'Pendientes', color: c.naranja },
    { value: 'en_proceso', label: 'En Proceso', color: c.amarillo },
    { value: 'resuelto', label: 'Resueltos', color: c.verde },
    { value: 'cancelado', label: 'Cancelados', color: c.rojo },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="w-full h-10 bg-white"><img src="/cenefa.png" alt="" className="w-full h-full object-cover" /></div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex gap-2">
            {[c.azul, c.verde, c.naranja, c.amarillo].map((color, i) => (
              <motion.div key={i} className="w-3 h-3 rounded-full"
                style={{ background: color }}
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }} />
            ))}
          </div>
        </div>
        <div className="w-full h-10 bg-white"><img src="/cenefa.png" alt="" className="w-full h-full object-cover" style={{ transform: 'rotate(180deg)' }} /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      {/* CENEFA SUPERIOR */}
      <div className="w-full h-10 md:h-12 bg-white shadow-sm flex-shrink-0">
        <img src="/cenefa.png" alt="" className="w-full h-full object-cover" />
      </div>

      {/* BARRA DE COLORES */}
      <div className="w-full h-1 flex-shrink-0" style={{ background: `linear-gradient(90deg, ${c.azul}, ${c.verde}, ${c.naranja}, ${c.amarillo})` }} />

      {/* CONTENIDO */}
      <div className="flex-1 p-4 md:p-6 max-w-5xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}} className="space-y-6">
          
          {/* ENCABEZADO */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">📋 Tickets</h1>
              <p className="text-sm text-gray-500 mt-1">Gestión de tickets de soporte</p>
            </div>
            <div className="flex items-center gap-2">
              <motion.button whileTap={{ scale: 0.9 }} onClick={cargarTickets}
                className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-500">
                <FaSync className={isRefreshing ? 'animate-spin' : ''} />
              </motion.button>
              {user?.rol === 'auxiliar' && (
                <Link to="/crear">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${c.azul}, ${c.azulOscuro})` }}>
                    <FaPlus /> Nuevo Ticket
                  </motion.button>
                </Link>
              )}
            </div>
          </div>

          {/* BUSCADOR + FILTROS */}
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 space-y-3">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por título o folio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-gray-50"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {filtrosEstado.map((filtro) => (
                <motion.button
                  key={filtro.value}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setFiltroEstado(filtro.value)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all
                    ${filtroEstado === filtro.value 
                      ? 'text-white shadow-md' 
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  style={filtroEstado === filtro.value ? { background: filtro.color } : {}}
                >
                  {filtro.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* LISTA DE TICKETS */}
          {ticketsFiltrados.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <FaTicketAlt className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-bold text-gray-400">No se encontraron tickets</p>
              <p className="text-sm text-gray-400 mt-1">Intenta con otro filtro o crea uno nuevo</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {ticketsFiltrados.map((ticket, i) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
                >
                  <div className="p-4 md:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {ticket.folio}
                          </span>
                          <span className="text-lg">{tiposIcono[ticket.tipo] || '📌'}</span>
                          <span className="text-xs text-gray-400 capitalize">{ticket.tipo}</span>
                        </div>

                        <h3 className="text-base font-bold text-gray-800 mb-2">{ticket.titulo}</h3>

                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                          {ticket.solicitante && (
                            <span className="flex items-center gap-1">
                              <FaUser className="text-gray-400" />
                              {ticket.solicitante.nombre} {ticket.solicitante.apellido_paterno}
                            </span>
                          )}
                          {ticket.dependencia && (
                            <span className="flex items-center gap-1">
                              <FaBuilding className="text-gray-400" />
                              {ticket.dependencia.nombre}
                            </span>
                          )}
                          {ticket.ubicacion && (
                            <span className="flex items-center gap-1">
                              <FaMapMarkerAlt className="text-gray-400" />
                              {ticket.ubicacion}
                            </span>
                          )}
                        </div>

                        {ticket.solucion && (
                          <div className="mt-2 p-2 bg-green-50 rounded-lg text-xs text-green-700">
                            ✅ {ticket.solucion}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className="px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-sm"
                          style={{ background: estados[ticket.estado]?.color }}>
                          {estados[ticket.estado]?.label}
                        </span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <FaCalendarAlt /> {new Date(ticket.created_at).toLocaleDateString('es-MX')}
                        </span>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                      {ticket.estado === 'pendiente' && user?.rol === 'auxiliar' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => tomarTicket(ticket.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white text-sm font-bold rounded-xl hover:bg-green-600 transition-all"
                        >
                          <FaHandPaper /> Tomar Ticket
                        </motion.button>
                      )}
                      {ticket.estado === 'en_proceso' && ticket.auxiliar_id === user?.id && (
                        <Link to={`/diagnostico/${ticket.id}`} className="flex-1">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-xl"
                            style={{ background: `linear-gradient(135deg, ${c.azul}, ${c.azulOscuro})` }}
                          >
                            <FaTools /> Diagnosticar
                          </motion.button>
                        </Link>
                      )}
                      {/* ✅ CORREGIDO: Redirige a VerTicket */}
                      <Link to={`/ver-ticket/${ticket.id}`} className="flex items-center gap-1 px-3 py-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all">
                        <FaEye /> Ver detalle
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center text-xs text-gray-400">
            Mostrando {ticketsFiltrados.length} de {tickets.length} tickets
          </div>
        </motion.div>
      </div>

      <div className="w-full h-1 flex-shrink-0" style={{ background: `linear-gradient(90deg, ${c.amarillo}, ${c.naranja}, ${c.verde}, ${c.azul})` }} />
      <div className="w-full h-10 md:h-12 bg-white shadow-sm flex-shrink-0">
        <img src="/cenefa.png" alt="" className="w-full h-full object-cover" style={{ transform: 'rotate(180deg)' }} />
      </div>
    </div>
  );
}