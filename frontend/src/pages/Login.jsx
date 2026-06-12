import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError('Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🏛️</div>
          <h1 className="text-2xl font-bold text-gray-900">Sistema de Tickets</h1>
          <p className="text-gray-500">Municipio de Ramos Arizpe</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg text-lg"
              placeholder="ejemplo@municipio.local"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg text-lg"
              placeholder="••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white text-lg font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}