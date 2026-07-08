import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  FaArrowLeft, FaUser, FaBuilding, FaCalendarAlt, FaClock,
  FaCheckCircle, FaSpinner, FaTimesCircle,
  FaExclamationTriangle, FaClipboardCheck, FaLightbulb,
  FaCamera, FaExpand, FaSearch
} from 'react-icons/fa';

export default function VerTicket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mostrarFotoGrande, setMostrarFotoGrande] = useState(false);
  const [errorFoto, setErrorFoto] = useState(false);

  useEffect(() => {
    if (id) cargarTicket();
  }, [id]);

  const cargarTicket = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:8000/api/tickets/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Ticket cargado:', res.data);
      console.log('Foto comprobacion:', res.data.foto_comprobacion);
      setTicket(res.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Función para obtener la URL correcta de la imagen
  const getImageUrl = (path) => {
    if (!path) return null;
    
    // Si ya es una URL completa
    if (path.startsWith('http')) return path;
    
    // Si empieza con storage/
    if (path.startsWith('storage/')) {
      return `http://localhost:8000/${path}`;
    }
    
    // Ruta normal
    return `http://localhost:8000/storage/${path}`;
  };

  const c = {
    azul: '#2C5282', azulOscuro: '#1A365D', azulClaro: '#4299E1',
    verde: '#48BB78', naranja: '#ED8936', amarillo: '#ECC94B',
    rojo: '#E53E3E', gris: '#718096',
  };

  const estados = {
    pendiente: { label: 'Pendiente', icon: FaSpinner, color: c.naranja },
    en_proceso: { label: 'En Proceso', icon: FaClock, color: c.amarillo },
    resuelto: { label: 'Resuelto', icon: FaCheckCircle, color: c.verde },
    cancelado: { label: 'Cancelado', icon: FaTimesCircle, color: c.rojo },
  };

  const causasLabels = {
    error_usuario: 'Error del usuario',
    error_sistemas: 'Error de sistemas',
    falla_hardware: 'Falla de hardware',
    falla_software: 'Falla de software',
    configuracion: 'Configuración',
    otro: 'Otro',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-500">Cargando ticket...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Ticket no encontrado</p>
      </div>
    );
  }

  const estadoActual = estados[ticket.estado] || estados.pendiente;
  const EstadoIcon = estadoActual.icon;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      {/* CENEFA SUPERIOR */}
      <div className="w-full h-10 md:h-12 bg-white shadow-sm flex-shrink-0">
        <img src="/cenefa.png" alt="" className="w-full h-full object-cover" />
      </div>

      {/* BARRA DE COLORES */}
      <div className="w-full h-1 flex-shrink-0" style={{ background: `linear-gradient(90deg, ${c.azul}, ${c.verde}, ${c.naranja}, ${c.amarillo})` }} />

      {/* CONTENIDO */}
      <div className="flex-1 p-4 md:p-6 max-w-3xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          
          {/* ENCABEZADO */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/tickets')}
              className="p-2.5 bg-white rounded-xl shadow-md hover:shadow-lg text-gray-500"
            >
              <FaArrowLeft />
            </motion.button>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">👁️ Detalle del Ticket</h1>
              <p className="text-sm text-gray-500">{ticket.folio}</p>
            </div>
          </div>

          {/* TARJETA PRINCIPAL */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            
            {/* HEADER */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                      {ticket.folio}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">{ticket.titulo}</h2>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {ticket.solicitante && (
                      <div className="flex items-center gap-1.5">
                        <FaUser className="text-gray-400" />
                        <span className="font-medium">{ticket.solicitante.nombre} {ticket.solicitante.apellido_paterno}</span>
                      </div>
                    )}
                    {ticket.dependencia && (
                      <div className="flex items-center gap-1.5">
                        <FaBuilding className="text-gray-400" />
                        <span className="font-medium">{ticket.dependencia.nombre}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <FaCalendarAlt className="text-gray-400" />
                      <span>{new Date(ticket.created_at).toLocaleDateString('es-MX')}</span>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-2 rounded-full flex items-center gap-2 shadow-md"
                  style={{ background: estadoActual.color }}>
                  <EstadoIcon className="text-white text-sm" />
                  <span className="text-sm font-bold text-white">{estadoActual.label}</span>
                </div>
              </div>

              {ticket.descripcion && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm font-bold text-gray-500 mb-1">📝 Descripción:</p>
                  <p className="text-sm text-gray-700">{ticket.descripcion}</p>
                </div>
              )}
            </div>

            {/* DIAGNÓSTICO */}
            {ticket.estado === 'resuelto' && (
              <div className="p-6 space-y-5">
                <h3 className="text-lg font-extrabold text-gray-800 flex items-center gap-2">
                  <FaClipboardCheck className="text-green-600" />
                  Diagnóstico y Solución
                </h3>

                {ticket.problema_encontrado && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <p className="text-xs font-bold text-orange-600 uppercase mb-1">
                      <FaExclamationTriangle className="inline mr-1" /> Problema encontrado
                    </p>
                    <p className="text-sm text-gray-800">{ticket.problema_encontrado}</p>
                  </div>
                )}

                {ticket.diagnostico && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-xs font-bold text-blue-600 uppercase mb-1">
                      <FaSearch className="inline mr-1" /> Diagnóstico
                    </p>
                    <p className="text-sm text-gray-800">{ticket.diagnostico}</p>
                  </div>
                )}

                {ticket.solucion && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-xs font-bold text-green-600 uppercase mb-1">
                      <FaLightbulb className="inline mr-1" /> Solución aplicada
                    </p>
                    <p className="text-sm text-gray-800">{ticket.solucion}</p>
                  </div>
                )}

                {ticket.causa && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500">Causa:</span>
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-700">
                      {causasLabels[ticket.causa] || ticket.causa}
                    </span>
                  </div>
                )}

                {/* 📸 FOTO DE COMPROBACIÓN */}
                {ticket.foto_comprobacion ? (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center">
                        <FaCamera className="text-white text-sm" />
                      </div>
                      <span className="font-extrabold text-green-900">Foto de Comprobación</span>
                    </div>

                    {errorFoto ? (
                      <div className="bg-red-50 p-4 rounded-xl text-center">
                        <p className="text-red-600 text-sm mb-2">❌ No se pudo cargar la imagen</p>
                        <p className="text-gray-500 text-xs">Ruta: {ticket.foto_comprobacion}</p>
                        <button 
                          onClick={() => setErrorFoto(false)}
                          className="mt-2 text-blue-600 text-xs underline"
                        >
                          Reintentar
                        </button>
                      </div>
                    ) : (
                      <motion.div 
                        className="relative rounded-xl overflow-hidden border-2 border-green-300 shadow-lg cursor-pointer group"
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setMostrarFotoGrande(true)}
                      >
                        <img 
                          src={getImageUrl(ticket.foto_comprobacion)}
                          alt="Foto de comprobación"
                          className="w-full h-48 object-cover"
                          onError={() => setErrorFoto(true)}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                          <FaExpand className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-all" />
                        </div>
                        <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg">
                          📸 Click para ampliar
                        </div>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-5 text-center">
                    <FaCamera className="text-4xl text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Sin foto de comprobación</p>
                  </div>
                )}

                {ticket.tiempo_minutos && (
                  <div className="text-center text-sm text-gray-500 pt-2">
                    ⏱️ Tiempo de atención: <span className="font-bold text-gray-700">{ticket.tiempo_minutos} minutos</span>
                  </div>
                )}
              </div>
            )}

            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Creado: {new Date(ticket.created_at).toLocaleDateString('es-MX')}</span>
                <span>Actualizado: {new Date(ticket.updated_at).toLocaleDateString('es-MX')}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* MODAL FOTO GRANDE */}
      {mostrarFotoGrande && ticket.foto_comprobacion && (
        <motion.div 
          className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setMostrarFotoGrande(false)}
        >
          <motion.div 
            className="relative max-w-3xl max-h-[90vh]"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={getImageUrl(ticket.foto_comprobacion)}
              alt="Foto ampliada"
              className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl"
            />
            <button 
              onClick={() => setMostrarFotoGrande(false)}
              className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center text-gray-700 hover:text-red-500 font-bold text-lg"
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}

      <div className="w-full h-1 flex-shrink-0" style={{ background: `linear-gradient(90deg, ${c.amarillo}, ${c.naranja}, ${c.verde}, ${c.azul})` }} />
      <div className="w-full h-10 md:h-12 bg-white shadow-sm flex-shrink-0">
        <img src="/cenefa.png" alt="" className="w-full h-full object-cover" style={{ transform: 'rotate(180deg)' }} />
      </div>
    </div>
  );
}