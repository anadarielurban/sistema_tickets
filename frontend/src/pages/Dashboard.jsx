import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarStats();
  }, []);

  const cargarStats = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/estadisticas/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-8 text-lg">Cargando estadísticas...</div>;
  if (!stats) return <div className="text-center p-8">Error al cargar</div>;

  const coloresTipo = {
    computadora: 'bg-blue-500',
    impresora: 'bg-yellow-500',
    red: 'bg-green-500',
    otro: 'bg-gray-500',
  };

  const iconosTipo = {
    computadora: '🖥️',
    impresora: '🖨️',
    red: '🌐',
    otro: '❓',
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">📊 Dashboard</h2>

        {/* Tarjetas principales */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-gray-500 text-sm">Total del mes</p>
            <p className="text-3xl font-bold text-blue-600">{stats.total_mes}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-gray-500 text-sm">Pendientes</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pendientes}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-gray-500 text-sm">Resueltos</p>
            <p className="text-3xl font-bold text-green-600">{stats.resueltos}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-gray-500 text-sm">Tiempo promedio</p>
            <p className="text-3xl font-bold text-purple-600">{stats.tiempo_promedio} min</p>
          </div>
        </div>

        {/* Tickets por tipo */}
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <h3 className="font-bold text-lg mb-3">📂 Por tipo de problema</h3>
          <div className="space-y-2">
            {stats.por_tipo?.map((item) => (
              <div key={item.tipo} className="flex items-center">
                <span className="text-2xl mr-3">{iconosTipo[item.tipo]}</span>
                <span className="flex-1 text-sm capitalize">{item.tipo}</span>
                <span className="font-bold text-lg">{item.total}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Por auxiliar */}
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <h3 className="font-bold text-lg mb-3">👨‍🔧 Por auxiliar</h3>
          <div className="space-y-2">
            {stats.por_auxiliar?.map((aux, index) => (
              <div key={index} className="flex items-center">
                <span className="text-xl mr-3">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤'}
                </span>
                <span className="flex-1 text-sm">{aux.nombre}</span>
                <span className="font-bold text-lg">{aux.total || 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Usuarios frecuentes */}
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <h3 className="font-bold text-lg mb-3">⚠️ Usuarios con más tickets</h3>
          <div className="space-y-2">
            {stats.usuarios_frecuentes?.map((usr, index) => (
              <div key={index} className="flex items-center">
                <span className="text-sm mr-3">#{index + 1}</span>
                <span className="flex-1 text-sm">{usr.nombre}</span>
                <span className="font-bold text-lg">{usr.total}</span>
                {usr.total >= 5 && <span className="ml-2 text-red-500">⚠️</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Equipos problemáticos */}
        {stats.equipos_problematicos?.length > 0 && (
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-bold text-lg mb-3">🔧 Equipos problemáticos</h3>
            <div className="space-y-2">
              {stats.equipos_problematicos?.map((eq, index) => (
                <div key={index} className="flex items-center">
                  <span className="text-sm mr-3">💻</span>
                  <span className="flex-1 text-sm">{eq.titulo || 'Sin nombre'}</span>
                  <span className="font-bold text-lg text-red-600">{eq.total}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}