import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSignOutAlt, FaBars, FaTimes, FaClipboardList, FaHome,
  FaPlus, FaChartBar, FaUserCircle, FaChevronDown
} from 'react-icons/fa';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const c = {
    azul: '#2C5282',
    azulOscuro: '#1A365D',
    azulClaro: '#4299E1',
    verde: '#48BB78',
    naranja: '#ED8936',
    amarillo: '#ECC94B',
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Inicio', icon: FaHome, roles: ['admin', 'auxiliar', 'solicitante'] },
    { path: '/dashboard', label: 'Dashboard', icon: FaChartBar, roles: ['admin'] },
    { path: '/tickets', label: 'Tickets', icon: FaClipboardList, roles: ['admin', 'auxiliar'] },
    { path: '/crear', label: 'Nuevo Ticket', icon: FaPlus, roles: ['admin', 'auxiliar', 'solicitante'] },
  ];

  const filteredLinks = navLinks.filter(link => link.roles.includes(user?.rol));

  // Obtener iniciales para el avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    return parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0][0];
  };

  return (
    <>
      {/* BARRA SUPERIOR - CENEFA */}
      <div className="w-full h-1.5 bg-gradient-to-r from-blue-600 via-green-500 to-amber-400" />
      
      {/* NAVBAR PRINCIPAL */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* LOGO Y MARCA */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <img 
                  src="/logo-ramos.png" 
                  alt="Ramos Arizpe" 
                  className="h-10 md:h-11 w-auto object-contain relative z-10"
                />
                <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-all" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm md:text-base font-extrabold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent leading-tight">
                  Sistema de Tickets
                </h1>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider leading-tight">
                  Ramos Arizpe
                </p>
              </div>
            </Link>

            {/* LINKS DE NAVEGACIÓN - DESKTOP */}
            <div className="hidden md:flex items-center gap-1">
              {filteredLinks.map((link) => (
                <Link key={link.path} to={link.path}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer
                      ${isActive(link.path) 
                        ? 'text-white shadow-lg' 
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'}`}
                    style={isActive(link.path) ? { background: `linear-gradient(135deg, ${c.azul}, ${c.azulOscuro})` } : {}}
                  >
                    <link.icon className="text-xs" />
                    <span>{link.label}</span>
                    {isActive(link.path) && (
                      <motion.div layoutId="activeIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/50 rounded-full" />
                    )}
                  </motion.div>
                </Link>
              ))}
            </div>

            {/* USUARIO - DESKTOP */}
            <div className="hidden md:flex items-center gap-2">
              {/* Dropdown de usuario */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 pl-3 pr-2 py-2 rounded-xl hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
                >
                  {/* Avatar con iniciales */}
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold shadow-md text-sm">
                    {getInitials(user?.nombre)}
                  </div>
                  
                  {/* Info del usuario */}
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-bold text-gray-700 leading-tight">{user?.nombre || 'Usuario'}</p>
                    <p className="text-[10px] text-gray-400 capitalize leading-tight">{user?.rol || 'rol'}</p>
                  </div>
                  
                  <FaChevronDown className={`text-gray-400 text-xs transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      {/* Overlay para cerrar al hacer clic fuera */}
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                      >
                        {/* Header del dropdown */}
                        <div className="p-4 bg-gradient-to-br from-gray-50 to-white border-b">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold shadow">
                              {getInitials(user?.nombre)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-800">{user?.nombre}</p>
                              <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full capitalize">
                              {user?.rol}
                            </span>
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">
                              Activo
                            </span>
                          </div>
                        </div>
                        
                        {/* Opciones */}
                        <div className="p-1.5">
                          <button
                            onClick={() => { logout(); setUserMenuOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium"
                          >
                            <FaSignOutAlt className="text-base" />
                            Cerrar Sesión
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* BOTÓN HAMBURGUESA - MÓVIL */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
            >
              {menuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </motion.button>
          </div>
        </div>

        {/* MENÚ MÓVIL */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t bg-white overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1.5">
                {/* Links */}
                {filteredLinks.map((link) => (
                  <Link key={link.path} to={link.path} onClick={() => setMenuOpen(false)}>
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all
                        ${isActive(link.path) 
                          ? 'text-white shadow-lg' 
                          : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'}`}
                      style={isActive(link.path) ? { background: `linear-gradient(135deg, ${c.azul}, ${c.azulOscuro})` } : {}}
                    >
                      <link.icon className="text-base" />
                      <span>{link.label}</span>
                    </motion.div>
                  </Link>
                ))}
                
                {/* Separador */}
                <div className="my-3 border-t border-gray-100" />
                
                {/* Info del usuario en móvil */}
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold shadow">
                    {getInitials(user?.nombre)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-700">{user?.nombre}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full capitalize">
                    {user?.rol}
                  </span>
                </div>

                {/* Botón cerrar sesión móvil */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-red-600 hover:bg-red-50 rounded-xl font-medium transition-all"
                >
                  <FaSignOutAlt className="text-base" />
                  Cerrar Sesión
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}