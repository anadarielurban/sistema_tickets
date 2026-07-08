import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSearch, FaLightbulb, FaSave, FaArrowLeft, FaCheckCircle,
  FaExclamationTriangle, FaTools, FaRobot, FaClipboardCheck,
  FaDesktop, FaCogs, FaUserCog, FaBug, FaWrench,
  FaCamera, FaTrash, FaEye, FaUpload
} from 'react-icons/fa';

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
  const [isVisible, setIsVisible] = useState(false);
  
  // Estados para la foto de comprobación
  const [fotoComprobacion, setFotoComprobacion] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Manejar selección de foto
  const handleFotoSeleccionada = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes (JPG, PNG, WEBP)');
      return;
    }
    
    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar 5MB');
      return;
    }
    
    setFotoComprobacion(file);
    
    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => setPreviewFoto(reader.result);
    reader.readAsDataURL(file);
    
    toast.success('📸 Foto seleccionada correctamente');
  };

  // Eliminar foto
  const eliminarFoto = () => {
    setFotoComprobacion(null);
    setPreviewFoto(null);
  };

  const consultarIA = async () => {
    const textoParaIA = form.problema_encontrado || form.diagnostico;
    if (!textoParaIA || textoParaIA.length < 3) {
      toast.error('Describe más el problema para consultar la IA');
      return;
    }
    setIaLoading(true);
    setIaSugerencia(null);
    try {
      const res = await axios.post('http://localhost:5000/sugerir', { texto: textoParaIA });
      setIaSugerencia(res.data);
      toast.success(`🧠 IA: ${res.data.categoria} (${res.data.confianza}%)`);
    } catch (err) {
      toast.error('IA no disponible');
    } finally {
      setIaLoading(false);
    }
  };

  const usarSugerencia = () => {
    if (iaSugerencia) {
      setForm({
        ...form,
        diagnostico: iaSugerencia.diagnostico_probable || iaSugerencia.diagnostico || '',
      });
      toast.success('✅ Diagnóstico sugerido aplicado');
      setIaSugerencia(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.diagnostico || !form.solucion) {
      toast.error('Llena diagnóstico y solución');
      return;
    }
    
    if (!fotoComprobacion) {
      toast.error('📸 Debes subir una foto de comprobación del trabajo realizado');
      return;
    }
    
    setLoading(true);
    setSubiendoFoto(true);
    
    try {
      // ✅ OBTENER TOKEN DE AUTENTICACIÓN
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('No hay sesión activa. Redirigiendo al login...');
        setTimeout(() => navigate('/login'), 1500);
        return;
      }
      
      // Crear FormData para enviar archivo
      const formData = new FormData();
      formData.append('problema_encontrado', form.problema_encontrado);
      formData.append('diagnostico', form.diagnostico);
      formData.append('solucion', form.solucion);
      formData.append('causa', form.causa);
      formData.append('equipo_en_sistemas', form.equipo_en_sistemas ? '1' : '0');
      
      // ✅ CORREGIDO: Agregar foto con nombre de archivo
      formData.append('foto_comprobacion', fotoComprobacion, fotoComprobacion.name);
      
      console.log('📤 Enviando diagnóstico...');
      console.log('Token:', token.substring(0, 20) + '...');
      console.log('Foto:', fotoComprobacion.name, '(', (fotoComprobacion.size / 1024).toFixed(1), 'KB)');
      
      // ✅ ENVIAR CON TOKEN EN LOS HEADERS
      const response = await axios.post(
        `http://localhost:8000/api/tickets/${id}/diagnosticar`, 
        formData, 
        {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('✅ Respuesta del servidor:', response.data);
      
      if (response.data.success) {
        toast.success('✅ Ticket resuelto con foto de comprobación');
        setTimeout(() => navigate('/tickets'), 1000);
      } else {
        toast.error(response.data.message || 'Error al guardar');
      }
      
    } catch (err) {
      console.error('❌ Error completo:', err);
      console.error('Respuesta del servidor:', err.response?.data);
      console.error('Status:', err.response?.status);
      
      if (err.response?.status === 401) {
        toast.error('Sesión expirada. Inicia sesión nuevamente.');
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 1500);
      } else if (err.response?.status === 422) {
        const errores = err.response.data.errors;
        const mensajeError = errores ? Object.values(errores).flat().join(', ') : 'Error de validación';
        toast.error(mensajeError);
      } else if (err.response?.status === 500) {
        toast.error('Error del servidor: ' + (err.response.data.message || 'Error interno'));
      } else {
        toast.error('Error al guardar: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setLoading(false);
      setSubiendoFoto(false);
    }
  };

  const problemasComunes = [
    'No enciende', 'No enciende, pantalla negra', 'No enciende, hace beeps',
    'Está muy lenta', 'Se apaga sola', 'Se reinicia sola', 'Pantalla azul',
    'No da video', 'Hace ruido extraño', 'Se calienta mucho', 'No tiene sonido',
    'Teclado no funciona', 'Mouse no funciona', 'USB no funciona',
    'No hay internet', 'Internet muy lento', 'WiFi no conecta',
    'No imprime', 'Impresora atascada', 'Imprime borroso/manchado', 'No tiene tóner/tinta',
    'Word no abre', 'Excel no abre', 'Outlook no funciona', 'No envía/recibe correos',
    'Windows no inicia', 'Windows pide activación', 'Programa no instala', 'Otro',
  ];

  const causasOpciones = [
    { value: 'error_usuario', label: 'Error del usuario', icon: FaUserCog, color: '#ED8936' },
    { value: 'error_sistemas', label: 'Error de sistemas', icon: FaCogs, color: '#4299E1' },
    { value: 'falla_hardware', label: 'Falla de hardware', icon: FaDesktop, color: '#E53E3E' },
    { value: 'falla_software', label: 'Falla de software', icon: FaBug, color: '#9F7AEA' },
    { value: 'configuracion', label: 'Configuración', icon: FaWrench, color: '#48BB78' },
    { value: 'otro', label: 'Otro', icon: FaExclamationTriangle, color: '#718096' },
  ];

  const c = {
    azul: '#2C5282', azulOscuro: '#1A365D', azulClaro: '#4299E1',
    verde: '#48BB78', naranja: '#ED8936', amarillo: '#ECC94B',
    rojo: '#E53E3E', morado: '#7C3AED', gris: '#718096',
  };

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
          className="w-full max-w-2xl"
        >
          {/* ENCABEZADO */}
          <div className="flex items-center gap-3 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/tickets')}
              className="p-2.5 bg-white rounded-xl shadow-md hover:shadow-lg text-gray-500 hover:text-gray-700 transition-all"
            >
              <FaArrowLeft />
            </motion.button>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">🔍 Diagnosticar Ticket</h1>
              <p className="text-sm text-gray-500">Ticket #{id}</p>
            </div>
          </div>

          {/* FORMULARIO */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* 1. PROBLEMA ENCONTRADO */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                  <FaSearch className="text-blue-600" />
                  ¿Qué encontraste?
                </label>
                <select
                  value={form.problema_encontrado}
                  onChange={(e) => setForm({...form, problema_encontrado: e.target.value})}
                  required
                  className="w-full p-3.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-gray-50 hover:bg-white transition-all"
                >
                  <option value="">Selecciona el problema encontrado...</option>
                  {problemasComunes.map((p, i) => (
                    <option key={i} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* 2. DIAGNÓSTICO */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                  <FaClipboardCheck className="text-green-600" />
                  Tu diagnóstico
                </label>
                <textarea
                  value={form.diagnostico}
                  onChange={(e) => setForm({...form, diagnostico: e.target.value})}
                  required
                  rows={3}
                  className="w-full p-3.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-gray-50 hover:bg-white transition-all resize-none"
                  placeholder="Describe lo que diagnosticaste..."
                />
              </div>

              {/* 3. SOLUCIÓN */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                  <FaCheckCircle className="text-green-600" />
                  Solución aplicada
                </label>
                <textarea
                  value={form.solucion}
                  onChange={(e) => setForm({...form, solucion: e.target.value})}
                  required
                  rows={3}
                  className="w-full p-3.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none bg-gray-50 hover:bg-white transition-all resize-none"
                  placeholder="¿Cómo lo resolviste?"
                />
              </div>

              {/* 📸 FOTO DE COMPROBACIÓN */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center">
                      <FaCamera className="text-white text-sm" />
                    </div>
                    <div>
                      <span className="font-extrabold text-green-900">Foto de Comprobación</span>
                      <span className="text-red-500 ml-1">*</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2.5 py-1 rounded-full">
                    OBLIGATORIO
                  </span>
                </div>
                
                <p className="text-xs text-gray-500 mb-4">
                  📸 Sube una foto donde se vea claramente que el problema quedó resuelto.
                  Esto servirá como evidencia del trabajo realizado.
                </p>

                {/* Área de upload/preview */}
                {previewFoto ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
                    <div className="relative rounded-xl overflow-hidden border-2 border-green-300 shadow-lg">
                      <img src={previewFoto} alt="Comprobación" className="w-full h-64 object-cover" />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => window.open(previewFoto, '_blank')}
                          className="p-2 bg-white rounded-xl shadow-md text-gray-600 hover:text-blue-600"
                        >
                          <FaEye />
                        </motion.button>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={eliminarFoto}
                          className="p-2 bg-red-500 rounded-xl shadow-md text-white hover:bg-red-600"
                        >
                          <FaTrash />
                        </motion.button>
                      </div>
                      <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg flex items-center gap-1">
                        <FaCheckCircle /> Foto seleccionada
                      </div>
                    </div>
                    <p className="text-xs text-green-600 font-medium text-center">
                      ✅ {fotoComprobacion?.name} ({(fotoComprobacion?.size / 1024).toFixed(1)} KB)
                    </p>
                  </motion.div>
                ) : (
                  <motion.label
                    whileHover={{ scale: 1.02 }}
                    className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-green-300 rounded-xl cursor-pointer hover:border-green-500 hover:bg-white transition-all"
                  >
                    <FaUpload className="text-4xl text-green-400 mb-3" />
                    <p className="text-sm font-bold text-green-700">Haz clic para subir foto</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG o WEBP (máx. 5MB)</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFotoSeleccionada}
                      className="hidden"
                    />
                  </motion.label>
                )}
              </div>

              {/* ASISTENTE IA */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center">
                      <FaRobot className="text-white text-sm" />
                    </div>
                    <span className="font-extrabold text-purple-900">Asistente IA</span>
                  </div>
                  <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2.5 py-1 rounded-full">
                    OPCIONAL
                  </span>
                </div>
                
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={consultarIA}
                  disabled={iaLoading}
                  className="w-full py-3.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 disabled:opacity-50 transition-all shadow-lg"
                >
                  {iaLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>🧠</motion.div>
                      Analizando...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <FaRobot /> Sugerir clasificación con IA
                    </span>
                  )}
                </motion.button>

                <AnimatePresence>
                  {iaSugerencia && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 space-y-3">
                      <div className="bg-white rounded-xl p-4 border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-bold text-purple-800">🤖 Sugerencia IA</p>
                          <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                            {iaSugerencia.confianza}% confianza
                          </span>
                        </div>
                        <p className="text-sm"><strong>🔍 Diagnóstico probable:</strong> {iaSugerencia.diagnostico_probable || iaSugerencia.diagnostico}</p>
                      </div>
                      <div className="flex gap-2">
                        <motion.button type="button" whileHover={{ scale: 1.02 }} onClick={usarSugerencia}
                          className="flex-1 py-2.5 bg-purple-600 text-white text-sm rounded-xl font-bold">📋 Usar</motion.button>
                        <motion.button type="button" onClick={() => setIaSugerencia(null)}
                          className="px-4 py-2.5 text-sm text-gray-500 rounded-xl">Ignorar</motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* CAUSA RAÍZ */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                  <FaExclamationTriangle className="text-orange-500" />
                  Causa raíz
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {causasOpciones.map((causa) => (
                    <motion.div key={causa.value} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setForm({...form, causa: causa.value})}
                      className={`cursor-pointer rounded-xl p-3 text-center border-2 transition-all
                        ${form.causa === causa.value ? 'border-current shadow-md' : 'border-gray-200 bg-gray-50'}`}
                      style={form.causa === causa.value ? { borderColor: causa.color, background: `${causa.color}10` } : {}}>
                      <causa.icon className="text-lg mx-auto mb-1" style={{ color: causa.color }} />
                      <p className="text-xs font-bold">{causa.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* EQUIPO EN SISTEMAS */}
              <motion.label whileHover={{ scale: 1.01 }}
                className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer border-2 transition-all
                  ${form.equipo_en_sistemas ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                  ${form.equipo_en_sistemas ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                  {form.equipo_en_sistemas && <FaCheckCircle className="text-white text-xs" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-700">¿Equipo se queda en sistemas?</p>
                  <p className="text-xs text-gray-400">Marcar si el equipo permanecerá en el departamento</p>
                </div>
                <FaTools className={`text-xl ml-auto ${form.equipo_en_sistemas ? 'text-blue-600' : 'text-gray-300'}`} />
              </motion.label>

              {/* BOTÓN GUARDAR */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                className="w-full py-4 rounded-2xl font-bold text-white text-lg transition-all relative overflow-hidden disabled:opacity-50"
                style={{
                  background: loading ? c.gris : `linear-gradient(135deg, ${c.verde}, #2F855A)`,
                  boxShadow: loading ? 'none' : `0 10px 25px -5px ${c.verde}40`
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>⏳</motion.div>
                    {subiendoFoto ? 'Subiendo foto...' : 'Guardando...'}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <FaSave /> Guardar Diagnóstico Final
                  </span>
                )}
              </motion.button>
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