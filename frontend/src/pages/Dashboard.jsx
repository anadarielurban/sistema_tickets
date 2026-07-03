import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTicketAlt, FaClock, FaCheckCircle, FaSpinner, FaUsers, FaLaptop, FaExclamationTriangle,
  FaSearch, FaBell, FaChartBar, FaChartPie, FaCalendarAlt, FaHourglassHalf, FaTimesCircle,
  FaArrowUp, FaArrowDown, FaDownload, FaUserCheck, FaBuilding, FaCog, FaList, FaPlus,
  FaClipboardList, FaChartLine, FaDesktop, FaPrint, FaNetworkWired, FaEllipsisH,
  FaFilter, FaSync, FaUserTie, FaCity, FaHeadset, FaTools, FaStar
} from 'react-icons/fa';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('mes');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => { cargarStats(); }, []);

  const cargarStats = async () => {
    setIsRefreshing(true);
    try {
      const res = await axios.get('http://localhost:8000/api/estadisticas/dashboard');
      setStats(res.data);
    } catch (err) {
      setStats({
        total_mes: 127, pendientes: 23, en_proceso: 15, resueltos: 89, cancelados: 8,
        tiempo_promedio: 34, satisfaccion: 92, eficiencia: 87,
        por_tipo: [
          { tipo: 'computadora', total: 48, tendencia: 'up' },
          { tipo: 'impresora', total: 32, tendencia: 'down' },
          { tipo: 'red', total: 25, tendencia: 'up' },
          { tipo: 'otro', total: 22, tendencia: 'stable' }
        ],
        por_auxiliar: [
          { nombre: 'Luis Hernández', total: 34, resueltos: 28, eficiencia: 82, departamento: 'Soporte Técnico' },
          { nombre: 'Rosa González', total: 28, resueltos: 24, eficiencia: 86, departamento: 'Redes' },
          { nombre: 'Carlos López', total: 22, resueltos: 18, eficiencia: 82, departamento: 'Hardware' },
          { nombre: 'Pedro Ramírez', total: 18, resueltos: 15, eficiencia: 83, departamento: 'Software' }
        ],
        por_dependencia: [
          { nombre: 'Tesorería', total: 28, color: '#2C5282', icono: '💰' },
          { nombre: 'Obras Públicas', total: 22, color: '#48BB78', icono: '🏗️' },
          { nombre: 'Seguridad Pública', total: 18, color: '#ED8936', icono: '🚔' },
          { nombre: 'Desarrollo Social', total: 15, color: '#ECC94B', icono: '🤝' }
        ],
        por_mes: [
          { mes: 'Ene', total: 18 }, { mes: 'Feb', total: 22 }, { mes: 'Mar', total: 25 },
          { mes: 'Abr', total: 20 }, { mes: 'May', total: 28 }, { mes: 'Jun', total: 14 }
        ],
        tiempo_resolucion: [
          { rango: '< 15 min', total: 25 }, { rango: '15-30 min', total: 35 },
          { rango: '30-60 min', total: 20 }, { rango: '> 60 min', total: 9 }
        ],
        usuarios_frecuentes: [
          { nombre: 'María García', total: 12, dependencia: 'Tesorería', avatar: null },
          { nombre: 'Juan Pérez', total: 8, dependencia: 'Obras Públicas', avatar: null },
          { nombre: 'Ana López', total: 5, dependencia: 'Seguridad Pública', avatar: null }
        ],
        equipos_problematicos: [
          { titulo: 'PC Oficina 203', total: 8, tipo: 'computadora', severidad: 'alta' },
          { titulo: 'Impresora HP LaserJet', total: 5, tipo: 'impresora', severidad: 'media' },
          { titulo: 'Router Principal', total: 3, tipo: 'red', severidad: 'alta' }
        ],
        ultimos_tickets: [
          { folio: 'TKT-0045', titulo: 'PC no enciende', estado: 'resuelto', fecha: '2026-06-30', auxiliar: 'Luis H.', prioridad: 'alta' },
          { folio: 'TKT-0044', titulo: 'Impresora atascada', estado: 'en_proceso', fecha: '2026-06-30', auxiliar: 'Rosa G.', prioridad: 'media' },
          { folio: 'TKT-0043', titulo: 'Sin internet', estado: 'pendiente', fecha: '2026-06-29', auxiliar: '-', prioridad: 'critica' },
          { folio: 'TKT-0042', titulo: 'Pantalla azul', estado: 'resuelto', fecha: '2026-06-29', auxiliar: 'Carlos L.', prioridad: 'alta' },
          { folio: 'TKT-0041', titulo: 'Teclado falla', estado: 'cancelado', fecha: '2026-06-28', auxiliar: 'Pedro R.', prioridad: 'baja' }
        ],
        notificaciones: [
          { id: 1, text: 'Ticket #0045 resuelto por Luis H.', time: '5 min', color: 'green', tipo: 'exito' },
          { id: 2, text: 'Nuevo ticket de María García', time: '12 min', color: 'blue', tipo: 'info' },
          { id: 3, text: 'Equipo crítico: PC Oficina 203', time: '1 hora', color: 'red', tipo: 'alerta' },
        ]
      });
    } finally { 
      setLoading(false); 
      setIsRefreshing(false);
    }
  };

  const c = { 
    azul: '#2C5282', azulOscuro: '#1A365D', azulClaro: '#4299E1',
    verde: '#48BB78', verdeOscuro: '#2F855A', naranja: '#ED8936', 
    amarillo: '#ECC94B', rojo: '#E53E3E', gris: '#718096',
    morado: '#9F7AEA', rosa: '#ED64A6', cian: '#00B5D8'
  };

  const estadoColor = { 
    pendiente: c.naranja, 
    en_proceso: c.amarillo, 
    resuelto: c.verde, 
    cancelado: c.rojo 
  };
  
  const prioridadColor = {
    critica: c.rojo,
    alta: c.naranja,
    media: c.amarillo,
    baja: c.verde
  };

  const iconos = { 
    computadora: '🖥️', 
    impresora: '🖨️', 
    red: '🌐', 
    otro: '❓' 
  };

  const tabs = [
    { id: 'general', label: 'Vista General', icon: FaChartBar, color: c.azul },
    { id: 'tickets', label: 'Gestión de Tickets', icon: FaClipboardList, color: c.verde },
    { id: 'rendimiento', label: 'Rendimiento', icon: FaChartLine, color: c.naranja },
    { id: 'auxiliares', label: 'Auxiliares', icon: FaUsers, color: c.azulClaro },
    { id: 'dependencias', label: 'Dependencias', icon: FaBuilding, color: c.amarillo },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Cenefa superior en loading */}
        <div className="w-full h-12 md:h-16 bg-white shadow-md relative z-20 flex-shrink-0">
          <img src="/cenefa.png" alt="" className="w-full h-full object-cover opacity-80" />
        </div>
        
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-gray-50">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="relative"
            >
              <FaCog className="text-7xl text-blue-600 mx-auto" />
              <motion.div 
                className="absolute inset-0 border-4 border-blue-300 rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            
            <div>
              <p className="text-2xl font-extrabold text-gray-800 mb-2">
                Cargando Dashboard
              </p>
              <p className="text-sm text-gray-500">
                Gobierno Municipal de Ramos Arizpe
              </p>
            </div>
            
            <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden shadow-inner">
              <motion.div 
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${c.azul}, ${c.verde}, ${c.naranja})` }}
                animate={{ 
                  width: ['0%', '100%'],
                  transition: { duration: 1.5, repeat: Infinity }
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* Cenefa inferior en loading */}
        <div className="w-full h-12 md:h-16 bg-white shadow-md relative z-20 flex-shrink-0">
          <img 
            src="/cenefa.png" 
            alt="" 
            className="w-full h-full object-cover opacity-80" 
            style={{ transform: 'rotate(180deg)' }} 
          />
        </div>
      </div>
    );
  }

  // ============================================
  // COMPONENTES DE CADA TAB
  // ============================================

  const TabGeneral = () => (
    <div className="space-y-6">
      {/* TARJETAS KPI MEJORADAS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { t: 'Total del Mes', v: stats.total_mes, i: FaTicketAlt, co: c.azul, bg: 'from-blue-500 to-blue-700' },
          { t: 'Pendientes', v: stats.pendientes, i: FaSpinner, co: c.naranja, bg: 'from-orange-400 to-orange-600' },
          { t: 'En Proceso', v: stats.en_proceso, i: FaClock, co: c.amarillo, bg: 'from-yellow-400 to-yellow-600' },
          { t: 'Resueltos', v: stats.resueltos, i: FaCheckCircle, co: c.verde, bg: 'from-green-400 to-green-600' },
          { t: 'Cancelados', v: stats.cancelados, i: FaTimesCircle, co: c.rojo, bg: 'from-red-400 to-red-600' },
          { t: 'Eficiencia', v: stats.eficiencia + '%', i: FaChartBar, co: c.azulClaro, bg: 'from-purple-400 to-purple-600' },
        ].map((card, i) => (
          <motion.div 
            key={i} 
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="relative overflow-hidden bg-white rounded-2xl shadow-lg cursor-pointer group"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.bg} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
            <div className="relative p-5">
              <div className="flex items-start justify-between mb-3">
                <card.i className="text-2xl" style={{ color: card.co }} />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{card.t}</span>
              </div>
              <p className="text-3xl font-extrabold" style={{ color: card.co }}>
                {card.v}
              </p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r" style={{ 
              background: `linear-gradient(90deg, ${card.co}, transparent)` 
            }} />
          </motion.div>
        ))}
      </div>

      {/* GRÁFICO + ÚLTIMOS TICKETS MEJORADOS */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* GRÁFICO DE BARRAS MEJORADO */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-extrabold text-gray-800">📈 Tickets por Mes</h3>
              <p className="text-xs text-gray-500">Tendencia mensual</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <FaDownload className="text-gray-400 text-sm" />
            </motion.button>
          </div>
          
          <div className="flex items-end gap-3 h-48">
            {stats.por_mes?.map((item, i) => {
              const altura = (item.total / 30) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.2 }}
                    className="text-xs font-bold text-gray-600"
                  >
                    {item.total}
                  </motion.span>
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${altura}%` }}
                    transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
                    className="w-full rounded-t-lg relative group"
                    style={{ 
                      background: `linear-gradient(180deg, ${c.azul}, ${c.azulClaro})`,
                      boxShadow: '0 4px 6px -1px rgba(44, 82, 130, 0.2)'
                    }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {item.total} tickets
                    </div>
                  </motion.div>
                  <span className="text-[10px] text-gray-500 font-medium">{item.mes}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ÚLTIMOS TICKETS MEJORADO */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-extrabold text-gray-800">📋 Últimos Tickets</h3>
              <p className="text-xs text-gray-500">Actualizado en tiempo real</p>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
              +{stats.ultimos_tickets?.length || 0} hoy
            </span>
          </div>
          
          <div className="space-y-2 max-h-72 overflow-auto pr-2">
            {stats.ultimos_tickets?.map((ticket, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.01, x: 5 }}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-all group"
              >
                <div className="flex-shrink-0">
                  <span className="text-xs font-mono font-bold text-gray-500 bg-white px-2 py-1 rounded">
                    {ticket.folio}
                  </span>
                </div>
                <span className="flex-1 text-sm font-medium truncate">{ticket.titulo}</span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-full text-[10px] font-bold text-white shadow-sm" 
                    style={{ background: estadoColor[ticket.estado] }}>
                    {ticket.estado.replace('_', ' ')}
                  </span>
                  {ticket.prioridad && (
                    <span className="hidden group-hover:inline-block text-[10px] px-1.5 py-0.5 rounded font-bold"
                      style={{ 
                        background: prioridadColor[ticket.prioridad] + '20',
                        color: prioridadColor[ticket.prioridad]
                      }}>
                      {ticket.prioridad}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* NOTIFICACIONES MEJORADAS */}
      <div className="grid md:grid-cols-3 gap-4">
        {stats.notificaciones?.map((notif, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl p-5 shadow-lg cursor-pointer border-l-4"
            style={{ borderLeftColor: notif.color }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: notif.color + '15' }}>
                {notif.tipo === 'exito' && <FaCheckCircle style={{ color: notif.color }} />}
                {notif.tipo === 'info' && <FaBell style={{ color: notif.color }} />}
                {notif.tipo === 'alerta' && <FaExclamationTriangle style={{ color: notif.color }} />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-700">{notif.text}</p>
                <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const TabTickets = () => (
    <div className="space-y-6">
      {/* POR TIPO MEJORADO */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-extrabold text-gray-800">📂 Por Tipo de Equipo</h3>
            <FaFilter className="text-gray-400 cursor-pointer hover:text-gray-600" />
          </div>
          <div className="space-y-4">
            {stats.por_tipo?.map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02, x: 10 }}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:shadow-md transition-all"
              >
                <div className="text-4xl">{iconos[item.tipo]}</div>
                <div className="flex-1">
                  <p className="font-semibold capitalize">{item.tipo}</p>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${c.azul}, ${c.azulClaro})` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.total / 50) * 100}%` }}
                      transition={{ delay: i * 0.2, duration: 0.8 }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-blue-700">{item.total}</span>
                  <div className="mt-1">
                    {item.tendencia === 'up' && (
                      <span className="text-xs text-green-500 font-bold flex items-center gap-1">
                        <FaArrowUp /> +12%
                      </span>
                    )}
                    {item.tendencia === 'down' && (
                      <span className="text-xs text-red-500 font-bold flex items-center gap-1">
                        <FaArrowDown /> -5%
                      </span>
                    )}
                    {item.tendencia === 'stable' && (
                      <span className="text-xs text-gray-500 font-bold">Estable</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* TABLA DE TICKETS MEJORADA */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-extrabold text-gray-800">📋 Registro de Tickets</h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-100"
            >
              <FaPlus className="inline mr-1" /> Nuevo
            </motion.button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-xs uppercase font-bold border-b border-gray-200">
                  <th className="pb-3 pr-4">Folio</th>
                  <th className="pb-3 pr-4">Título</th>
                  <th className="pb-3 pr-4">Estado</th>
                  <th className="pb-3 pr-4">Prioridad</th>
                  <th className="pb-3">Auxiliar</th>
                </tr>
              </thead>
              <tbody>
                {stats.ultimos_tickets?.map((ticket, i) => (
                  <motion.tr 
                    key={i} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-t border-gray-50 hover:bg-gray-50 cursor-pointer group"
                  >
                    <td className="py-3 pr-4">
                      <span className="font-mono text-xs font-bold text-gray-600">{ticket.folio}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="font-medium text-sm">{ticket.titulo}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold text-white shadow-sm" 
                        style={{ background: estadoColor[ticket.estado] }}>
                        {ticket.estado.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full"
                        style={{ 
                          background: prioridadColor[ticket.prioridad] + '15',
                          color: prioridadColor[ticket.prioridad]
                        }}>
                        {ticket.prioridad}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                          {ticket.auxiliar.charAt(0)}
                        </div>
                        <span className="text-xs text-gray-500">{ticket.auxiliar}</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* EQUIPOS PROBLEMÁTICOS MEJORADO */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 shadow-lg border border-red-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
            <FaExclamationTriangle className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-gray-800">Equipos Críticos</h3>
            <p className="text-xs text-gray-500">Requieren atención inmediata</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          {stats.equipos_problematicos?.map((eq, i) => (
            <motion.div 
              key={i} 
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-xl p-5 shadow-md hover:shadow-xl transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-4xl">{iconos[eq.tipo]}</span>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold text-white ${
                  eq.severidad === 'alta' ? 'bg-red-500' : 'bg-yellow-500'
                }`}>
                  {eq.severidad}
                </span>
              </div>
              <h4 className="font-semibold text-gray-800">{eq.titulo}</h4>
              <p className="text-sm text-gray-500 capitalize mt-1">{eq.tipo}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-2xl font-extrabold text-red-600">{eq.total}</span>
                <span className="text-xs text-gray-400">tickets</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const TabRendimiento = () => (
    <div className="space-y-6">
      {/* GRÁFICO DE DONA Y USUARIOS MEJORADO */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-extrabold text-gray-800 mb-6 text-center">⏱️ Tiempo de Resolución</h3>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {stats.tiempo_resolucion?.map((item, i) => {
                  const colors = [c.verde, c.azulClaro, c.naranja, c.rojo];
                  const total = stats.tiempo_resolucion.reduce((a, b) => a + b.total, 0);
                  const offset = stats.tiempo_resolucion.slice(0, i).reduce((a, b) => a + b.total, 0) / total * 100;
                  const dash = item.total / total * 100;
                  return (
                    <motion.circle 
                      key={i} 
                      cx="50" cy="50" r="40" 
                      fill="transparent" 
                      stroke={colors[i]}
                      strokeWidth="12" 
                      strokeDasharray={`${dash} ${100 - dash}`} 
                      strokeDashoffset={-offset}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, delay: i * 0.2 }}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-4xl font-extrabold text-gray-800"
                >
                  {stats.tiempo_promedio}
                </motion.span>
                <span className="text-xs text-gray-500">minutos promedio</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {stats.tiempo_resolucion?.map((item, i) => {
              const colors = [c.verde, c.azulClaro, c.naranja, c.rojo];
              return (
                <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <span className="w-3 h-3 rounded-full" style={{ background: colors[i] }}></span>
                  <div className="flex-1">
                    <span className="text-xs text-gray-600">{item.rango}</span>
                    <span className="ml-2 text-xs font-bold">{item.total}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* USUARIOS FRECUENTES MEJORADO */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-extrabold text-gray-800">👥 Usuarios Frecuentes</h3>
            <span className="text-xs text-gray-400">Top 3</span>
          </div>
          <div className="space-y-4">
            {stats.usuarios_frecuentes?.map((usr, i) => (
              <motion.div 
                key={i} 
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:shadow-md transition-all"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg"
                    style={{ 
                      background: `linear-gradient(135deg, ${usr.total >= 8 ? c.rojo : usr.total >= 5 ? c.naranja : c.azulClaro}, ${usr.total >= 8 ? c.rosa : usr.total >= 5 ? c.amarillo : c.azul})` 
                    }}>
                    {usr.nombre.charAt(0)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow">
                    <span className="text-xs">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{usr.nombre}</p>
                  <p className="text-xs text-gray-500">{usr.dependencia}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold" 
                    style={{ color: usr.total >= 8 ? c.rojo : c.azul }}>
                    {usr.total}
                  </span>
                  <p className="text-[10px] text-gray-400">tickets</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* MÉTRICAS DE RENDIMIENTO MEJORADAS */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 shadow-xl text-white">
          <div className="flex items-center justify-between mb-4">
            <FaClock className="text-3xl opacity-50" />
            <span className="text-xs opacity-75">Objetivo: {'<'}30min</span>
          </div>
          <p className="text-3xl font-extrabold">{stats.tiempo_promedio} min</p>
          <p className="text-sm opacity-90 mt-1">Tiempo promedio</p>
          <div className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '75%' }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-6 shadow-xl text-white">
          <div className="flex items-center justify-between mb-4">
            <FaStar className="text-3xl opacity-50" />
            <span className="text-xs opacity-75">Meta: 95%</span>
          </div>
          <p className="text-3xl font-extrabold">{stats.satisfaccion}%</p>
          <p className="text-sm opacity-90 mt-1">Satisfacción</p>
          <div className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${stats.satisfaccion}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 shadow-xl text-white">
          <div className="flex items-center justify-between mb-4">
            <FaChartLine className="text-3xl opacity-50" />
            <span className="text-xs opacity-75">Meta: 90%</span>
          </div>
          <p className="text-3xl font-extrabold">{stats.eficiencia}%</p>
          <p className="text-sm opacity-90 mt-1">Eficiencia</p>
          <div className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${stats.eficiencia}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const TabAuxiliares = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.por_auxiliar?.map((aux, i) => (
          <motion.div 
            key={i} 
            whileHover={{ scale: 1.03, y: -5 }}
            className="bg-white rounded-2xl p-6 shadow-lg text-center relative overflow-hidden group"
          >
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
              i === 0 ? 'from-yellow-400 to-yellow-600' :
              i === 1 ? 'from-gray-300 to-gray-500' :
              i === 2 ? 'from-orange-400 to-orange-600' :
              'from-blue-400 to-blue-600'
            }`} />
            
            <div className="relative">
              <div className="text-5xl mb-3">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '👤'}</div>
              <h3 className="text-lg font-extrabold text-gray-800">{aux.nombre}</h3>
              <p className="text-xs text-gray-500 mt-1">{aux.departamento}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-xl font-extrabold text-blue-700">{aux.total}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Resueltos</p>
                <p className="text-xl font-extrabold text-green-600">{aux.resueltos}</p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between text-xs font-bold mb-2">
                <span>Eficiencia</span>
                <span className={aux.eficiencia >= 85 ? 'text-green-600' : 'text-yellow-600'}>
                  {aux.eficiencia}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full rounded-full"
                  style={{
                    background: aux.eficiencia >= 85 ? 
                      'linear-gradient(90deg, #48BB78, #38A169)' : 
                      'linear-gradient(90deg, #ED8936, #DD6B20)'
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${aux.eficiencia}%` }}
                  transition={{ delay: i * 0.2, duration: 0.8 }}
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-center gap-4">
                <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                  Ver detalles
                </button>
                <button className="text-xs text-gray-400 hover:text-gray-600 font-medium">
                  Historial
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const TabDependencias = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {stats.por_dependencia?.map((dep, i) => (
          <motion.div 
            key={i} 
            whileHover={{ scale: 1.02, y: -3 }}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${dep.color}, ${dep.color}CC)`,
                }}>
                <span>{dep.icono}</span>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-gray-800 text-lg">{dep.nombre}</h3>
                  <span className="text-xs text-gray-400">{i + 1}° lugar</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{dep.total} tickets este mes</p>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Volumen</span>
                    <span className="font-bold">{((dep.total / 30) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${dep.color}, ${dep.color}99)` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(dep.total / 30) * 100}%` }}
                      transition={{ delay: i * 0.2, duration: 1 }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <span className="px-3 py-1 bg-gray-50 rounded-full text-xs font-medium text-gray-600">
                    Activa
                  </span>
                  <span className="px-3 py-1 bg-blue-50 rounded-full text-xs font-medium text-blue-600">
                    {dep.total} tickets
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // ============================================
  // RENDER PRINCIPAL
  // ============================================
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      {/* CENEFA SUPERIOR */}
      <div className="w-full h-12 md:h-16 bg-white shadow-lg relative z-20 flex-shrink-0">
        <img src="/cenefa.png" alt="Cenefa decorativa superior" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent" />
      </div>

      {/* HEADER PRINCIPAL MEJORADO */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full" />
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Panel de Control
                  </h1>
                  <p className="text-sm text-gray-500 mt-1 font-medium">
                    Gobierno Municipal de Ramos Arizpe
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Selector de período */}
              <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="hidden md:block px-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="hoy">Hoy</option>
                <option value="semana">Esta semana</option>
                <option value="mes">Este mes</option>
                <option value="trimestre">Este trimestre</option>
              </select>

              {/* Búsqueda */}
              <div className="relative hidden md:block">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Buscar tickets..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-56 focus:outline-none focus:border-blue-500 bg-gray-50"
                />
              </div>

              {/* Botón de actualizar */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={cargarStats}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <FaSync className={`text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
              </motion.button>

              {/* Notificaciones */}
              <div className="relative">
                <motion.button 
                  whileTap={{ scale: 0.9 }} 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaBell className="text-gray-500" />
                  {stats.notificaciones?.length > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                    >
                      {stats.notificaciones.length}
                    </motion.span>
                  )}
                </motion.button>
                
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b bg-gray-50">
                        <div className="flex items-center justify-between">
                          <h3 className="font-extrabold text-sm text-gray-700">Notificaciones</h3>
                          <span className="text-xs text-blue-600 font-medium cursor-pointer hover:text-blue-800">
                            Marcar todas leídas
                          </span>
                        </div>
                      </div>
                      <div className="max-h-96 overflow-auto">
                        {stats.notificaciones?.map(n => (
                          <motion.div 
                            key={n.id} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer flex items-start gap-3 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                              style={{ background: n.color + '15' }}>
                              <span className="w-2 h-2 rounded-full" style={{ background: n.color }}></span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-700 font-medium">{n.text}</p>
                              <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Avatar de usuario */}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold shadow-lg">
                  A
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-gray-700">Admin</p>
                  <p className="text-xs text-gray-500">Administrador</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BARRA DE COLORES DECORATIVA */}
      <div className="w-full h-1.5 flex-shrink-0 shadow-sm" 
        style={{ 
          background: `linear-gradient(90deg, ${c.azul}, ${c.verde}, ${c.naranja}, ${c.amarillo}, ${c.morado}, ${c.rosa})` 
        }} 
      />

      {/* TABS DE NAVEGACIÓN MEJORADOS */}
      <div className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-2 overflow-x-auto">
          {tabs.map(tab => (
            <motion.button 
              key={tab.id} 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'border-current bg-gray-50/50' 
                  : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50/30'}`}
              style={activeTab === tab.id ? { color: tab.color, borderColor: tab.color } : {}}
            >
              <tab.icon className="text-base" />
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }} 
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'general' && <TabGeneral />}
            {activeTab === 'tickets' && <TabTickets />}
            {activeTab === 'rendimiento' && <TabRendimiento />}
            {activeTab === 'auxiliares' && <TabAuxiliares />}
            {activeTab === 'dependencias' && <TabDependencias />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* BARRA DE COLORES INFERIOR */}
      <div className="w-full h-1.5 flex-shrink-0 shadow-sm" 
        style={{ 
          background: `linear-gradient(90deg, ${c.rosa}, ${c.morado}, ${c.amarillo}, ${c.naranja}, ${c.verde}, ${c.azul})` 
        }} 
      />

      {/* CENEFA INFERIOR MEJORADA */}
      <div className="w-full h-12 md:h-16 bg-white shadow-lg relative z-20 flex-shrink-0">
        <img 
          src="/cenefa.png" 
          alt="Cenefa decorativa inferior" 
          className="w-full h-full object-cover" 
          style={{ transform: 'rotate(180deg)' }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 to-transparent" />
      </div>
    </div>
  );
}