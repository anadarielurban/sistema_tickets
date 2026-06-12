import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-blue-600 text-white">
      <div className="max-w-3xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="font-bold text-lg">🏛️ Tickets</Link>
        <div className="flex items-center gap-2">
          {(user?.rol === 'auxiliar' || user?.rol === 'admin') && (
            <>
              <Link to="/tickets" className="text-sm hover:underline">📋 Tickets</Link>
              <Link to="/crear" className="text-sm hover:underline">➕</Link>
            </>
          )}
          {user?.rol === 'admin' && (
            <Link to="/dashboard" className="text-sm hover:underline">📊</Link>
          )}
          <span className="text-sm hidden sm:inline">{user?.nombre}</span>
          <button onClick={logout} className="bg-red-500 px-3 py-1 rounded text-sm hover:bg-red-600">
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
}