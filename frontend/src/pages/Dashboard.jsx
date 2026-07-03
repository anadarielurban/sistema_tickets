import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTicketAlt, FaClock, FaCheckCircle, FaSpinner, FaUsers, FaExclamationTriangle,
  FaSearch, FaBell, FaChartBar, FaTimesCircle, FaArrowUp, FaArrowDown,
  FaDownload, FaBuilding, FaCog, FaClipboardList, FaChartLine,
  FaFilter, FaSync, FaStar, FaPlus
} from 'react-icons/fa';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Cargar datos REALES de la API
  useEffect(() => { cargarStats(); }, []);

  const cargarStats = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
      const res = await axios.get('http://localhost:8000/api/estadisticas/dashboard', config);
      console.log('✅ Datos reales cargados:', res.data);
      setStats(res.data);
    } catch (err) {
      console.warn('⚠️ Usando datos de prueba:', err.message);
      setError('Mostrando datos locales - Sin conexión al servidor');
      
      // Datos de prueba basados en la BD real
      setStats({
        total_mes: 3,
        pendientes: 0,
        en_proceso: 1,
        resueltos: 2,
        cancelados: 0,
        tiempo_promedio: 8,
        satisfaccion: 95,
        eficiencia: 85,
        por_tipo: [
          { tipo: 'computadora', total: 3, tendencia: 'up' },
          { tipo: 'impresora', total: 0, tendencia: 'stable' },
          { tipo: 'red', total: 0, tendencia: 'stable' },
          { tipo: 'otro', total: 0, tendencia: 'stable' }
        ],
        por_auxiliar: [
          { nombre: 'Luis Hernández', total: 3, resueltos: 2, eficiencia: 85 },
          { nombre: 'Rosa González', total: 0, resueltos: 0, eficiencia: 0 },
          { nombre: 'Carlos López', total: 0, resueltos: 0, eficiencia: 0 },
          { nombre: 'Pedro Ramírez', total: 0, resueltos: 0, eficiencia: 0 }
        ],
        por_dependencia: [
          { nombre: 'Presidencia Municipal', total: 1, color: '#2C5282' },
          { nombre: 'Tesorería Municipal', total: 1, color: '#48BB78' },
          { nombre: 'Secretaría del Ayuntamiento', total: 0, color: '#ED8936' },
          { nombre: 'Obras Públicas', total: 0, color: '#ECC94B' },
          { nombre: 'Desarrollo Social', total: 1, color: '#9F7AEA' }
        ],
        por_mes: [
          { mes: 'Jun', total: 3 }
        ],
        tiempo_resolucion: [
          { rango: '< 15 min', total: 2 },
          { rango: '15-30 min', total: 0 },
          { rango: '30-60 min', total: 1 },
          { rango: '> 60 min', total: 0 }
        ],
        usuarios_frecuentes: [
          { nombre: 'María García', total: 1, dependencia: 'Tesorería' },
          { nombre: 'Luis Hernández', total: 1, dependencia: 'Sistemas' }
        ],
        equipos_problematicos: [
          { titulo: 'PC no enciende', total: 1, tipo: 'computadora', severidad: 'alta' },
          { titulo: 'se traba', total: 1, tipo: 'computadora', severidad: 'media' }
        ],
        ultimos_tickets: [
          { folio: 'TKT-2026-0003', titulo: 'mi pc no funciona, se traba mucho', estado: 'resuelto', fecha: '2026-06-15', auxiliar: 'Luis H.', prioridad: 'alta' },
          { folio: 'TKT-2026-0002', titulo: 'se traba', estado: 'en_proceso', fecha: '2026-06-13', auxiliar: 'Luis H.', prioridad: 'media' },
          { folio: 'TKT-2026-0001', titulo: 'PC no enciende', estado: 'resuelto', fecha: '2026-06-12', auxiliar: 'Luis H.', prioridad: 'alta' }
        ],
        notificaciones: [
          { id: 1, text: 'Ticket #0003 resuelto por Luis H.', time: '15 jun', color: 'green', tipo: 'exito' },
          { id: 2, text: 'Ticket #0002 sigue en proceso', time: '13 jun', color: 'orange', tipo: 'info' },
          { id: 3, text: 'Nuevo ticket de María García', time: '12 jun', color: 'blue', tipo: 'info' }
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
    morado: '#9F7AEA', rosa: '#ED64A6'
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
    computadora: '🖥️', impresora: '🖨️', red: '🌐', otro: '❓' 
  };

  const tabs = [
    { id: 'general', label: 'General', icon: FaChartBar, color: c.azul },
    { id: 'tickets', label: 'Tickets', icon: FaClipboardList, color: c.verde },
    { id: 'rendimiento', label: 'Rendimiento', icon: FaChartLine, color: c.naranja },
    { id: 'auxiliares', label: 'Auxiliares', icon: FaUsers, color: c.azulClaro },
    { id: 'dependencias', label: 'Dependencias', icon: FaBuilding, color: c.amarillo },
  ];

  // ============================================
  // LOADING
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="w-full h-12 bg-white shadow-md"><img src="/cenefa.png" alt="" className="w-full h-full object-cover" /></div>
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }} className="text-center">
            <FaCog className="text-6xl text-blue-700 mx-auto mb-4" />
            <p className="text-xl font-bold text-gray-700">Cargando Dashboard...</p>
            <div className="w-48 h-2 bg-gray-200 rounded-full mt-4 mx-auto overflow-hidden">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-green-500"
                animate={{ width: ['0%', '100%'] }} transition={{ duration: 1.5, repeat: Infinity }} />
            </div>
          </motion.div>
        </div>
        <div className="w-full h-12 bg-white shadow-md"><img src="/cenefa.png" alt="" className="w-full h-full object-cover" style={{ transform: 'rotate(180deg)' }} /></div>
      </div>
    );
  }

  // ============================================
  // COMPONENTES DE TABS (Versión compacta)
  // ============================================

  const TabGeneral = () => (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { t: 'Total', v: stats.total_mes, i: FaTicketAlt, co: c.azul },
          { t: 'Pendientes', v: stats.pendientes, i: FaSpinner, co: c.naranja },
          { t: 'En Proceso', v: stats.en_proceso, i: FaClock, co: c.amarillo },
          { t: 'Resueltos', v: stats.resueltos, i: FaCheckCircle, co: c.verde },
          { t: 'Cancelados', v: stats.cancelados, i: FaTimesCircle, co: c.rojo },
          { t: 'Eficiencia', v: stats.eficiencia + '%', i: FaChartBar, co: c.azulClaro },
        ].map((card, i) => (
          <motion.div key={i} whileHover={{ scale: 1.05 }} className="bg-white rounded-2xl p-4 shadow-lg">
            <card.i className="text-2xl mb-2" style={{ color: card.co }} />
            <p className="text-[10px] text-gray-400 uppercase font-bold">{card.t}</p>
            <p className="text-2xl font-extrabold mt-1" style={{ color: card.co }}>{card.v}</p>
          </motion.div>
        ))}
      </div>

      {/* Gráfico + Últimos tickets */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-lg">
          <h3 className="font-extrabold text-gray-800 mb-4">📈 Tickets por Mes</h3>
          <div className="flex items-end gap-2 h-40">
            {stats.por_mes?.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-bold">{item.total}</span>
                <motion.div initial={{ height: 0 }} animate={{ height: `${Math.min((item.total / 5) * 100, 100)}%` }}
                  transition={{ delay: i * 0.1 }} className="w-full rounded-t-lg bg-gradient-to-t from-blue-700 to-blue-400" />
                <span className="text-[10px] text-gray-500">{item.mes}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-lg">
          <h3 className="font-extrabold text-gray-800 mb-4">📋 Últimos Tickets</h3>
          <div className="space-y-2 max-h-60 overflow-auto">
            {stats.ultimos_tickets?.map((ticket, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }} className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl hover:bg-gray-100">
                <span className="text-xs font-mono font-bold">{ticket.folio}</span>
                <span className="flex-1 text-sm truncate">{ticket.titulo}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: estadoColor[ticket.estado] }}>
                  {ticket.estado.replace('_', ' ')}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const TabTickets = () => (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-lg">
          <h3 className="font-extrabold text-gray-800 mb-4">📂 Por Tipo</h3>
          {stats.por_tipo?.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-2">
              <span className="text-2xl">{iconos[item.tipo]}</span>
              <span className="flex-1 capitalize font-medium">{item.tipo}</span>
              <span className="font-extrabold text-blue-700">{item.total}</span>
              {item.tendencia === 'up' && <FaArrowUp className="text-green-500 text-xs" />}
              {item.tendencia === 'down' && <FaArrowDown className="text-red-500 text-xs" />}
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-lg">
          <h3 className="font-extrabold text-gray-800 mb-4">📋 Todos los Tickets</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-400 text-xs border-b">
                <th className="pb-2">Folio</th><th className="pb-2">Título</th><th className="pb-2">Estado</th><th className="pb-2">Fecha</th>
              </tr></thead>
              <tbody>
                {stats.ultimos_tickets?.map((t, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="py-2 text-xs font-mono">{t.folio}</td>
                    <td className="py-2">{t.titulo}</td>
                    <td className="py-2"><span className="px-2 py-0.5 rounded-full text-[10px] text-white font-bold" style={{ background: estadoColor[t.estado] }}>{t.estado.replace('_', ' ')}</span></td>
                    <td className="py-2 text-xs text-gray-400">{t.fecha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const TabRendimiento = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white text-center">
          <FaClock className="text-3xl mx-auto mb-2 opacity-50" />
          <p className="text-3xl font-extrabold">{stats.tiempo_promedio} min</p>
          <p className="text-sm opacity-80">Tiempo promedio</p>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-6 text-white text-center">
          <FaStar className="text-3xl mx-auto mb-2 opacity-50" />
          <p className="text-3xl font-extrabold">{stats.satisfaccion}%</p>
          <p className="text-sm opacity-80">Satisfacción</p>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 text-white text-center">
          <FaChartLine className="text-3xl mx-auto mb-2 opacity-50" />
          <p className="text-3xl font-extrabold">{stats.eficiencia}%</p>
          <p className="text-sm opacity-80">Eficiencia</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-lg">
        <h3 className="font-extrabold text-gray-800 mb-4">👥 Usuarios Frecuentes</h3>
        {stats.usuarios_frecuentes?.map((usr, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ background: usr.total >= 5 ? c.rojo : c.azulClaro }}>{usr.nombre.charAt(0)}</div>
            <div className="flex-1"><p className="font-semibold text-sm">{usr.nombre}</p><p className="text-xs text-gray-400">{usr.dependencia}</p></div>
            <span className="text-xl font-extrabold text-blue-700">{usr.total}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const TabAuxiliares = () => (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.por_auxiliar?.map((aux, i) => (
        <motion.div key={i} whileHover={{ scale: 1.03 }} className="bg-white rounded-2xl p-5 shadow-lg text-center">
          <span className="text-4xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '👤'}</span>
          <p className="font-extrabold mt-2">{aux.nombre}</p>
          <div className="flex justify-center gap-4 mt-3">
            <div><p className="text-xs text-gray-400">Total</p><p className="text-xl font-extrabold text-blue-700">{aux.total}</p></div>
            <div><p className="text-xs text-gray-400">Resueltos</p><p className="text-xl font-extrabold text-green-600">{aux.resueltos}</p></div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1"><span>Eficiencia</span><span className="font-bold">{aux.eficiencia}%</span></div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div className="h-full bg-green-500 rounded-full" initial={{ width: 0 }}
                animate={{ width: `${aux.eficiencia}%` }} transition={{ delay: i * 0.2 }} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const TabDependencias = () => (
    <div className="grid md:grid-cols-2 gap-4">
      {stats.por_dependencia?.map((dep, i) => (
        <motion.div key={i} whileHover={{ scale: 1.02 }} className="bg-white rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: dep.color }}>
              <FaBuilding />
            </div>
            <div className="flex-1">
              <p className="font-extrabold">{dep.nombre}</p>
              <p className="text-sm text-gray-400">{dep.total} tickets</p>
            </div>
          </div>
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background: dep.color }}
              initial={{ width: 0 }} animate={{ width: `${Math.min((dep.total / 5) * 100, 100)}%` }}
              transition={{ delay: i * 0.2 }} />
          </div>
        </motion.div>
      ))}
    </div>
  );

  // ============================================
  // RENDER PRINCIPAL
  // ============================================
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      {/* CENEFA SUPERIOR */}
      <div className="w-full h-10 md:h-12 bg-white shadow-sm flex-shrink-0">
        <img src="/cenefa.png" alt="" className="w-full h-full object-cover" />
      </div>

      {/* HEADER */}
      <div className="bg-white border-b shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-gray-800">📊 Panel de Control</h1>
            <p className="text-xs text-gray-400 uppercase">Gobierno Municipal de Ramos Arizpe</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border rounded-lg w-40 focus:outline-none focus:border-blue-500" />
            </div>
            <motion.button whileTap={{ scale: 0.9 }} onClick={cargarStats} className="p-1.5 hover:bg-gray-100 rounded-lg">
              <FaSync className={`text-gray-500 text-sm ${isRefreshing ? 'animate-spin' : ''}`} />
            </motion.button>
            <div className="relative">
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1.5 hover:bg-gray-100 rounded-lg">
                <FaBell className="text-gray-500" />
                {stats.notificaciones?.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {stats.notificaciones.length}
                  </span>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* BARRA DE COLORES */}
      <div className="w-full h-1 flex-shrink-0" style={{ background: `linear-gradient(90deg, ${c.azul}, ${c.verde}, ${c.naranja}, ${c.amarillo})` }} />

      {/* ALERTA DE DATOS LOCALES */}
      {error && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-center text-xs text-yellow-700">
          ⚠️ {error}
        </div>
      )}

      {/* TABS */}
      <div className="bg-white border-b shadow-sm flex-shrink-0 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <motion.button key={tab.id} whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase border-b-2 whitespace-nowrap
                ${activeTab === tab.id ? 'border-current' : 'border-transparent text-gray-400'}`}
              style={activeTab === tab.id ? { color: tab.color, borderColor: tab.color } : {}}>
              <tab.icon className="text-sm" />{tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="flex-1 p-4 max-w-7xl mx-auto w-full overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            {activeTab === 'general' && <TabGeneral />}
            {activeTab === 'tickets' && <TabTickets />}
            {activeTab === 'rendimiento' && <TabRendimiento />}
            {activeTab === 'auxiliares' && <TabAuxiliares />}
            {activeTab === 'dependencias' && <TabDependencias />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* BARRA DE COLORES INFERIOR */}
      <div className="w-full h-1 flex-shrink-0" style={{ background: `linear-gradient(90deg, ${c.amarillo}, ${c.naranja}, ${c.verde}, ${c.azul})` }} />

      {/* CENEFA INFERIOR */}
      <div className="w-full h-10 md:h-12 bg-white shadow-sm flex-shrink-0">
        <img src="/cenefa.png" alt="" className="w-full h-full object-cover" style={{ transform: 'rotate(180deg)' }} />
      </div>
    </div>
  );
}