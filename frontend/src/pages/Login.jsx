import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaBuilding, FaArrowRight, FaCheckCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const { scrollY, scrollX } = useScroll();
  const smoothScrollY = useSpring(scrollY, { stiffness: 50, damping: 30, mass: 0.5 });
  const smoothScrollX = useSpring(scrollX, { stiffness: 30, damping: 40, mass: 0.8 });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const colors = {
    azul: '#2C5282',
    azulOscuro: '#1A365D',
    azulClaro: '#4299E1',
    azulHover: '#3182CE',
    verde: '#48BB78',
    verdeOscuro: '#2F855A',
    verdeClaro: '#68D391',
    naranja: '#ED8936',
    naranjaClaro: '#F6AD55',
    amarillo: '#ECC94B',
    gris: '#2D3748',
    grisOscuro: '#1A202C',
    grisClaro: '#A0AEC0',
    grisBorder: '#E2E8F0',
    fondo: '#F7FAFC',
    blanco: '#FFFFFF',
    rojo: '#E53E3E',
    rojoClaro: '#FED7D7',
    success: '#48BB78',
    warning: '#ED8936',
    info: '#4299E1',
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
        duration: 0.6,
        ease: [0.215, 0.610, 0.355, 1.000]
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.215, 0.610, 0.355, 1.000]
      }
    }
  };

  const getPasswordStrength = (pass) => {
    if (pass.length === 0) return 0;
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) strength++;
    if (pass.match(/\d/)) strength++;
    if (pass.match(/[^a-zA-Z\d]/)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthColors = ['#E2E8F0', '#E53E3E', '#ED8936', '#ECC94B', '#48BB78'];
  const strengthLabels = ['', 'Débil', 'Regular', 'Buena', 'Excelente'];

  const polygons = [
    { top: "-10%", left: "-5%", width: 900, height: 600, gradient: "linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)", delay: 0, shape: 0 },
    { top: "5%", left: "40%", width: 850, height: 580, gradient: "linear-gradient(135deg, #e8f0f8 0%, #dbe4f0 100%)", delay: 0.15, shape: 1 },
    { top: "25%", left: "-15%", width: 950, height: 620, gradient: "linear-gradient(135deg, #f2f6fa 0%, #e5edf5 100%)", delay: 0.3, shape: 2 },
    { top: "35%", left: "50%", width: 800, height: 560, gradient: "linear-gradient(135deg, #edf2f7 0%, #dce4ef 100%)", delay: 0.45, shape: 3 },
    { top: "50%", left: "-8%", width: 880, height: 600, gradient: "linear-gradient(135deg, #f5f8fb 0%, #e8eff7 100%)", delay: 0.6, shape: 0 },
    { top: "60%", left: "45%", width: 820, height: 570, gradient: "linear-gradient(135deg, #eaf0f6 0%, #d9e2ed 100%)", delay: 0.75, shape: 1 },
    { top: "75%", left: "-20%", width: 920, height: 610, gradient: "linear-gradient(135deg, #f3f7fa 0%, #e6edf5 100%)", delay: 0.9, shape: 2 },
    { top: "85%", left: "40%", width: 860, height: 580, gradient: "linear-gradient(135deg, #eef3f8 0%, #dde5f0 100%)", delay: 1.05, shape: 3 },
  ];

  const shapes = [
    "polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)",
    "polygon(0% 10%, 90% 0%, 100% 90%, 10% 100%)",
    "polygon(20% 0%, 100% 0%, 80% 100%, 0% 100%)",
    "polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%)",
  ];

  const floatingParticles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.3 + 0.1,
  }));

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: '#f8fafc' }}>
      
      <motion.div 
        className="w-full h-10 md:h-12 flex-shrink-0 relative z-20 bg-white shadow-sm"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-blue-600/5" />
        <img
          src="/cenefa.png"
          alt=""
          className="w-full h-full object-cover relative z-10"
        />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50" />
      </motion.div>

      <div className="flex-1 flex items-center justify-center p-4 md:p-6 relative">
        
        <motion.div 
          className="absolute top-0 left-0 right-0 h-1.5 z-30"
          style={{ 
            background: `linear-gradient(90deg, ${colors.azul}, ${colors.verde}, ${colors.naranja}, ${colors.amarillo})`,
            boxShadow: `0 0 20px ${colors.azul}40, 0 0 40px ${colors.verde}20`
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
        />

        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-1.5 z-30"
          style={{ 
            background: `linear-gradient(90deg, ${colors.amarillo}, ${colors.naranja}, ${colors.verde}, ${colors.azul})`,
            boxShadow: `0 0 20px ${colors.amarillo}40, 0 0 40px ${colors.naranja}20`
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
        />
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {floatingParticles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: particle.size,
                height: particle.size,
                background: `radial-gradient(circle, ${colors.azul}40, transparent)`,
                opacity: particle.opacity,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, 15, 0],
                scale: [1, 1.5, 1],
                opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            style={{
              background: `radial-gradient(ellipse at 20% 50%, rgba(44,82,130,0.06) 0%, transparent 50%), 
                           radial-gradient(ellipse at 80% 50%, rgba(72,187,120,0.05) 0%, transparent 50%),
                           radial-gradient(ellipse at 50% 0%, rgba(237,137,54,0.04) 0%, transparent 50%)`
            }}
          />
          
          {polygons.map((poly, index) => (
            <motion.div
              key={index}
              initial={{ 
                x: index % 2 === 0 ? -200 : 200, 
                y: -100,
                opacity: 0,
                rotate: index % 3 === 0 ? -10 : 10,
                scale: 0.8
              }}
              animate={{ 
                x: 0, 
                y: 0,
                opacity: 0.7, 
                rotate: 0,
                scale: 1
              }}
              transition={{
                duration: 2,
                delay: poly.delay,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              className="absolute"
              style={{
                top: poly.top,
                left: poly.left,
                width: poly.width,
                height: poly.height,
                background: poly.gradient,
                clipPath: shapes[poly.shape],
                filter: 'blur(0.5px)',
              }}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
            />
          ))}
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          className="relative z-10 w-full max-w-sm"
        >
          <motion.div 
            className="backdrop-blur-2xl bg-white/95 rounded-[2.5rem] p-6 md:p-8 relative overflow-hidden border-2 border-white/60"
            style={{ 
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.8) inset, 0 0 30px rgba(44,82,130,0.1)' 
            }}
            whileHover={{ 
              boxShadow: '0 30px 60px -12px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.8) inset, 0 0 40px rgba(44,82,130,0.15)' 
            }}
          >
            <motion.div 
              className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl"
              style={{ background: `radial-gradient(circle, ${colors.azul}15, transparent)` }}
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5] 
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            <motion.div className="text-center mb-6" variants={itemVariants}>
              <div className="flex justify-center mb-1">
                <div className="relative">
                  <div className="relative inline-block">
                    <img 
                      src="/logo-ramos.png" 
                      alt="Municipio de Ramos Arizpe" 
                      className="h-32 md:h-36 w-auto object-contain relative z-10"
                      style={{ 
                        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1)) drop-shadow(0 0 20px rgba(44,82,130,0.2))',
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="h-32 md:h-36 w-32 md:w-36 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#2C5282] to-[#1A365D] shadow-2xl"><span class="text-white font-bold text-4xl">RA</span></div>';
                      }}
                    />
                    <motion.div 
                      className="absolute inset-0 rounded-full blur-2xl -z-10"
                      style={{ background: `radial-gradient(circle, ${colors.azul}20, transparent 70%)` }}
                      animate={{ 
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 0.7, 0.5] 
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  </div>
                </div>
              </div>
              
              <motion.h1 
                className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent -mt-2 mb-1"
                variants={itemVariants}
                style={{ letterSpacing: '-0.5px' }}
              >
                Sistema de Tickets
              </motion.h1>
              
              <motion.p 
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: colors.azul, letterSpacing: '0.2em' }}
                variants={itemVariants}
              >
                Gobierno Municipal de Ramos Arizpe
              </motion.p>

              <motion.div className="flex items-center justify-center gap-2" variants={itemVariants}>
                <div className="h-px w-6" style={{ background: `linear-gradient(90deg, transparent, ${colors.azul})` }} />
                {[colors.azul, colors.verde, colors.naranja, colors.amarillo].map((color, index) => (
                  <motion.div 
                    key={index}
                    className="w-2 h-2 rounded-full shadow-lg"
                    style={{ background: color }}
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.7, 1, 0.7],
                      boxShadow: [
                        `0 0 5px ${color}40`,
                        `0 0 15px ${color}80`,
                        `0 0 5px ${color}40`
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                  />
                ))}
                <div className="h-px w-6" style={{ background: `linear-gradient(90deg, ${colors.amarillo}, transparent)` }} />
              </motion.div>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  className="px-4 py-3 rounded-2xl text-xs mb-4 flex items-center gap-3 backdrop-blur-sm"
                  style={{ 
                    background: `linear-gradient(135deg, ${colors.rojoClaro}, #FEE2E2)`, 
                    color: colors.rojo,
                    border: '1px solid #FECACA'
                  }}
                >
                  <motion.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    ⚠️
                  </motion.span>
                  <span className="font-medium">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div variants={itemVariants} className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.grisOscuro }}>
                  Correo Electrónico
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <motion.div
                      animate={focusedField === 'email' ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <FaEnvelope className="text-xs" style={{ color: focusedField === 'email' ? colors.azul : colors.grisClaro }} />
                    </motion.div>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm transition-all duration-300 bg-gray-50/80 group-hover:bg-white"
                    style={{
                      border: `2px solid ${focusedField === 'email' ? colors.azul : colors.grisBorder}`,
                      boxShadow: focusedField === 'email' ? `0 0 0 4px ${colors.azul}15, 0 4px 6px -1px rgba(0,0,0,0.05)` : '0 2px 4px -1px rgba(0,0,0,0.03)',
                      outline: 'none'
                    }}
                    placeholder="usuario@ramos.gob.mx"
                    required
                  />
                  {email.includes('@') && email.includes('.') && (
                    <motion.div 
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <FaCheckCircle className="text-xs" style={{ color: colors.success }} />
                    </motion.div>
                  )}
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.grisOscuro }}>
                  Contraseña
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <motion.div
                      animate={focusedField === 'password' ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <FaLock className="text-xs" style={{ color: focusedField === 'password' ? colors.azul : colors.grisClaro }} />
                    </motion.div>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-10 pr-12 py-3 rounded-2xl text-sm transition-all duration-300 bg-gray-50/80 group-hover:bg-white"
                    style={{
                      border: `2px solid ${focusedField === 'password' ? colors.azul : colors.grisBorder}`,
                      boxShadow: focusedField === 'password' ? `0 0 0 4px ${colors.azul}15, 0 4px 6px -1px rgba(0,0,0,0.05)` : '0 2px 4px -1px rgba(0,0,0,0.03)',
                      outline: 'none'
                    }}
                    placeholder="••••••••"
                    required
                  />
                  
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1.5 rounded-xl"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.85 }}
                  >
                    <motion.div
                      key={showPassword ? 'open' : 'closed'}
                      initial={{ scaleY: 0, opacity: 0 }}
                      animate={{ scaleY: 1, opacity: 1 }}
                      exit={{ scaleY: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      style={{ transformOrigin: "center" }}
                    >
                      {showPassword ? (
                        <FaEye className="text-sm" />
                      ) : (
                        <FaEyeSlash className="text-sm" />
                      )}
                    </motion.div>
                  </motion.button>
                </div>
                
                {password && (
                  <motion.div 
                    className="mt-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map((level) => (
                        <motion.div
                          key={level}
                          className="flex-1 h-1 rounded-full"
                          style={{
                            background: level <= passwordStrength ? strengthColors[passwordStrength] : colors.grisBorder,
                          }}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: level * 0.1 }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] font-medium" style={{ color: strengthColors[passwordStrength] }}>
                        {strengthLabels[passwordStrength]}
                      </span>
                      {passwordStrength === 4 && (
                        <motion.span 
                          className="text-[10px] font-bold"
                          style={{ color: colors.success }}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          ✓ Segura
                        </motion.span>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-center justify-between py-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      className="sr-only"
                    />
                    <motion.div 
                      className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-colors ${rememberMe ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'}`}
                      whileTap={{ scale: 0.9 }}
                    >
                      {rememberMe && (
                        <motion.svg 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2.5 h-2.5 text-white"
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </motion.svg>
                      )}
                    </motion.div>
                  </div>
                  <span className="text-xs font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
                    Recordarme
                  </span>
                </label>
                
                <motion.a 
                  href="#" 
                  className="text-xs font-bold hover:underline"
                  style={{ color: colors.azul }}
                  whileHover={{ scale: 1.05 }}
                >
                  ¿Olvidaste tu contraseña?
                </motion.a>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-2">
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-2xl font-bold text-white transition-all duration-300 relative overflow-hidden group"
                  style={{
                    background: loading ? colors.grisClaro : `linear-gradient(135deg, ${colors.azul} 0%, ${colors.azulOscuro} 100%)`,
                    boxShadow: loading ? 'none' : `0 10px 25px -5px ${colors.azul}40, 0 8px 10px -6px ${colors.azul}20`
                  }}
                  whileHover={!loading ? { scale: 1.02, boxShadow: `0 15px 30px -5px ${colors.azul}60` } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                >
                  <motion.div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
                    }}
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  
                  {loading ? (
                    <span className="flex items-center justify-center gap-3 relative z-10">
                      <motion.div 
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      />
                      <span className="font-semibold">Verificando...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2 relative z-10">
                      <span className="font-semibold tracking-wide">Iniciar Sesión</span>
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <FaArrowRight className="text-sm" />
                      </motion.div>
                    </span>
                  )}
                </motion.button>
              </motion.div>
            </form>

            <motion.div className="relative my-6" variants={itemVariants}>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <motion.span 
                  className="px-4 py-1.5 bg-white rounded-full text-[10px] font-bold uppercase tracking-widest border border-gray-200 shadow-sm"
                  style={{ color: colors.grisClaro, letterSpacing: '0.2em' }}
                  whileHover={{ scale: 1.05, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                >
                  Sistemas
                </motion.span>
              </div>
            </motion.div>

            <motion.div className="text-center space-y-3" variants={itemVariants}>
              <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <FaBuilding className="text-xs opacity-60" />
                </motion.div>
                <span className="font-semibold">Gobierno Municipal de Ramos Arizpe</span>
                <span className="opacity-40">•</span>
                <span className="font-bold text-gray-400">{new Date().getFullYear()}</span>
              </div>
              
              <motion.p 
                className="text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-500"
                whileHover={{ scale: 1.05 }}
              >
                Todos por Más • Administración 2025-2027
              </motion.p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div 
        className="w-full h-10 md:h-12 flex-shrink-0 relative z-20 bg-white shadow-sm"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-blue-600/5" />
        <img
          src="/cenefa.png"
          alt=""
          className="w-full h-full object-cover relative z-10"
          style={{ transform: 'rotate(180deg)' }}
        />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50" />
      </motion.div>
    </div>
  );
}