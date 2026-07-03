import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPaperPlane, FaSpinner, FaLaptop, FaPrint, FaNetworkWired, FaEllipsisH, 
  FaBuilding, FaUser, FaMapMarkerAlt, FaClipboardList, FaSearch, FaCheckCircle,
  FaExclamationCircle, FaArrowLeft, FaTicketAlt
} from 'react-icons/fa';

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
  const [isVisible, setIsVisible] = useState(false);
  const [buscarDependencia, setBuscarDependencia] = useState('');
  const [mostrarTodas, setMostrarTodas] = useState(false);
  const [paso, setPaso] = useState(1); // Paso 1: Depto, Paso 2: Problema

  useEffect(() => {
    setIsVisible(true);
    cargarDependencias();
  }, []);

  const cargarDependencias = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/dependencias');
      setDependencias(res.data);
    } catch (err) {
      setDependencias([
        { id: 1, nombre: 'Presidencia Municipal', abreviatura: 'PRES' },
        { id: 2, nombre: 'Secretaría del Ayuntamiento', abreviatura: 'SA' },
        { id: 3, nombre: 'Tesorería Municipal', abreviatura: 'TM' },
        { id: 4, nombre: 'Obras Públicas', abreviatura: 'OP' },
        { id: 5, nombre: 'Desarrollo Social', abreviatura: 'DS' },
        { id: 6, nombre: 'Seguridad Pública', abreviatura: 'SP' },
        { id: 7, nombre: 'Sistemas', abreviatura: 'SIS' },
        { id: 8, nombre: 'Jurídico', abreviatura: 'JUR' },
        { id: 9, nombre: 'Atención Ciudadana', abreviatura: 'AC' },
        { id: 10, nombre: 'Educación', abreviatura: 'EDU' },
        { id: 11, nombre: 'Concesionados', abreviatura: 'CONC' },
        { id: 12, nombre: 'Rural', abreviatura: 'RUR' },
        { id: 13, nombre: 'Regidores', abreviatura: 'REG' },
        { id: 14, nombre: 'Recursos Humanos', abreviatura: 'RH' },
        { id: 15, nombre: 'Cajas', abreviatura: 'CAJ' },
        { id: 16, nombre: 'Adquisiciones', abreviatura: 'ADQ' },
        { id: 17, nombre: 'Contraloría', abreviatura: 'CONT' },
        { id: 18, nombre: 'Despacho', abreviatura: 'DES' },
        { id: 19, nombre: 'Logística', abreviatura: 'LOG' },
        { id: 20, nombre: 'Comunicación Social', abreviatura: 'CS' },
        { id: 21, nombre: 'Juventud', abreviatura: 'JUV' },
        { id: 22, nombre: 'Transparencia', abreviatura: 'TRANS' },
        { id: 23, nombre: 'Tenencia de la Tierra', abreviatura: 'TT' },
      ]);
    }
  };

  const cargarPersonas = async (id) => {
    try {
      const res = await axios.get(`http://localhost:8000/api/dependencias/${id}/personas`);
      setPersonas(res.data);
    } catch (err) {
      setPersonas([]);
    }
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
      toast.success(`✅ Ticket creado: ${res.data.ticket.folio}`);
      setForm({ dependencia_id: '', persona_id: '', tipo: '', titulo: '', descripcion: '', ubicacion: '' });
      setPersonas([]);
      setBuscarDependencia('');
      setPaso(1);
    } catch (err) {
      toast.error('❌ Error al crear ticket');
    } finally {
      setLoading(false);
    }
  };

  const dependenciasFiltradas = dependencias.filter(d => 
    d.nombre.toLowerCase().includes(buscarDependencia.toLowerCase())
  );
  const dependenciasVisibles = mostrarTodas ? dependenciasFiltradas : dependenciasFiltradas.slice(0, 8);

  const c = {
    azul: '#2C5282', azulOscuro: '#1A365D', azulClaro: '#4299E1',
    verde: '#48BB78', naranja: '#ED8936', amarillo: '#ECC94B',
    rojo: '#E53E3E', gris: '#718096', morado: '#9F7AEA',
  };

  const tiposProblema = [
    { value: 'computadora', label: 'Computadora', icon: FaLaptop, color: c.azul, ejemplos: 'PC lenta, no enciende, pantalla azul' },
    { value: 'impresora', label: 'Impresora', icon: FaPrint, color: c.verde, ejemplos: 'No imprime, atascos, sin tóner' },
    { value: 'red', label: 'Internet / Red', icon: FaNetworkWired, color: c.naranja, ejemplos: 'Sin internet, WiFi caído, red lenta' },
    { value: 'otro', label: 'Otro', icon: FaEllipsisH, color: c.morado, ejemplos: 'Teléfono, software, correo, etc.' },
  ];

  const iconosDepto = {
    'PRES': '🏛️', 'SA': '📋', 'TM': '💰', 'OP': '🏗️', 'DS': '🤝',
    'SP': '🚔', 'SIS': '💻', 'JUR': '⚖️', 'AC': '📞', 'EDU': '📚',
    'CONC': '📄', 'RUR': '🌾', 'REG': '🏛️', 'RH': '👥', 'CAJ': '💵',
    'ADQ': '📦', 'CONT': '🔍', 'DES': '📝', 'LOG': '🚚', 'CS': '📢',
    'JUV': '🎯', 'TRANS': '🔎', 'TT': '🏠'
  };

  const pasosTotal = 3;
  const progreso = (paso / pasosTotal) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      {/* CENEFA SUPERIOR */}
      <div className="w-full h-10 md:h-12 bg-white shadow-sm flex-shrink-0">
        <img src="/cenefa.png" alt="" className="w-full h-full object-cover" />
      </div>

      {/* BARRA DE COLORES */}
      <div className="w-full h-1 flex-shrink-0" style={{ background: `linear-gradient(90deg, ${c.azul}, ${c.verde}, ${c.naranja}, ${c.amarillo})` }} />

      {/* CONTENIDO */}
      <div className="flex-1 p-4 md:p-6 flex items-start justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          {/* ENCABEZADO */}
          <div className="text-center mb-6">
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg mb-4"
            >
              <FaTicketAlt className="text-2xl text-white" />
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">Crear Nuevo Ticket</h1>
            <p className="text-sm text-gray-500 mt-1">Gobierno Municipal de Ramos Arizpe</p>
          </div>

          {/* BARRA DE PROGRESO */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              {['Departamento', 'Problema', 'Detalles'].map((label, i) => (
                <div key={i} className="text-center">
                  <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-bold mb-1 transition-all
                    ${paso > i + 1 ? 'bg-green-500 text-white' : paso === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                    {paso > i + 1 ? <FaCheckCircle /> : i + 1}
                  </div>
                  <span className={`text-[10px] font-bold hidden sm:block ${paso === i + 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-green-500"
                animate={{ width: `${progreso}%` }} transition={{ duration: 0.5 }} />
            </div>
          </div>

          {/* FORMULARIO */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <form onSubmit={handleSubmit}>
              
              {/* PASO 1: DEPARTAMENTO */}
              <AnimatePresence mode="wait">
                {paso === 1 && (
                  <motion.div key="paso1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    <h3 className="text-lg font-extrabold text-gray-800 mb-4 flex items-center gap-2">
                      <FaBuilding className="text-blue-600" />
                      ¿De qué departamento eres?
                    </h3>
                    
                    <div className="relative mb-4">
                      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" placeholder="Buscar departamento..." value={buscarDependencia}
                        onChange={(e) => setBuscarDependencia(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-gray-50" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-80 overflow-auto pr-1">
                      {dependenciasVisibles.map((dep) => (
                        <motion.div key={dep.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => { setForm({...form, dependencia_id: dep.id}); cargarPersonas(dep.id); }}
                          className={`cursor-pointer rounded-xl p-3 border-2 transition-all flex items-center gap-3
                            ${form.dependencia_id === dep.id ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white'}`}>
                          <span className="text-xl">{iconosDepto[dep.abreviatura] || '🏢'}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-700 truncate">{dep.nombre}</p>
                            <p className="text-[10px] text-gray-400">{dep.abreviatura}</p>
                          </div>
                          {form.dependencia_id === dep.id && (
                            <FaCheckCircle className="text-blue-500 flex-shrink-0" />
                          )}
                        </motion.div>
                      ))}
                    </div>

                    {dependenciasFiltradas.length > 8 && (
                      <button type="button" onClick={() => setMostrarTodas(!mostrarTodas)}
                        className="mt-3 w-full py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-xl transition-all">
                        {mostrarTodas ? '▲ Ver menos' : `▼ Ver todas (${dependenciasFiltradas.length})`}
                      </button>
                    )}

                    {personas.length > 0 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                          <FaUser className="text-green-600" /> Persona que reporta
                        </label>
                        <select value={form.persona_id} onChange={(e) => setForm({...form, persona_id: e.target.value})}
                          className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-gray-50">
                          <option value="">Selecciona persona</option>
                          {personas.map(p => <option key={p.id} value={p.id}>{p.nombre_completo}</option>)}
                        </select>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* PASO 2: TIPO DE PROBLEMA */}
                {paso === 2 && (
                  <motion.div key="paso2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    <h3 className="text-lg font-extrabold text-gray-800 mb-4 flex items-center gap-2">
                      <FaExclamationCircle className="text-orange-500" />
                      ¿Qué tipo de problema tienes?
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {tiposProblema.map((tipo) => (
                        <motion.div key={tipo.value} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => setForm({...form, tipo: tipo.value})}
                          className={`cursor-pointer rounded-xl p-4 border-2 transition-all
                            ${form.tipo === tipo.value ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white'}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${tipo.color}15` }}>
                              <tipo.icon className="text-xl" style={{ color: tipo.color }} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-700">{tipo.label}</p>
                              <p className="text-[10px] text-gray-400">{tipo.ejemplos}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* PASO 3: DETALLES */}
                {paso === 3 && (
                  <motion.div key="paso3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                    <h3 className="text-lg font-extrabold text-gray-800 mb-4">📝 Cuéntanos los detalles</h3>
                    
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-2 block">Título del problema *</label>
                      <input type="text" value={form.titulo} onChange={(e) => setForm({...form, titulo: e.target.value})} required
                        className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-gray-50"
                        placeholder="Ej: Mi PC no enciende" />
                    </div>

                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-2 block">Descripción</label>
                      <textarea value={form.descripcion} onChange={(e) => setForm({...form, descripcion: e.target.value})} rows={3}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-gray-50 resize-none"
                        placeholder="Describe el problema con más detalle..." />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                        <FaMapMarkerAlt className="text-red-500" /> Ubicación
                      </label>
                      <input type="text" value={form.ubicacion} onChange={(e) => setForm({...form, ubicacion: e.target.value})}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-gray-50"
                        placeholder="Ej: Oficina 203, Planta Baja" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* BOTONES DE NAVEGACIÓN */}
              <div className="flex gap-3 mt-6 pt-6 border-t">
                {paso > 1 && (
                  <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setPaso(paso - 1)}
                    className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">
                    <FaArrowLeft /> Atrás
                  </motion.button>
                )}
                
                {paso < 3 ? (
                  <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setPaso(paso + 1)}
                    disabled={paso === 1 && !form.dependencia_id || paso === 2 && !form.tipo}
                    className="ml-auto px-6 py-3 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-50"
                    style={{ background: `linear-gradient(135deg, ${c.azul}, ${c.azulOscuro})` }}>
                    Siguiente →
                  </motion.button>
                ) : (
                  <motion.button type="submit" disabled={loading}
                    whileHover={!loading ? { scale: 1.02 } : {}}
                    className="ml-auto flex items-center gap-2 px-8 py-3 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-50"
                    style={{ background: loading ? c.gris : `linear-gradient(135deg, ${c.verde}, ${c.verdeOscuro})` }}>
                    {loading ? <><FaSpinner className="animate-spin" /> Creando...</> : <><FaPaperPlane /> Enviar Ticket</>}
                  </motion.button>
                )}
              </div>
            </form>
          </div>
        </motion.div>
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