import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import CrearTicket from './pages/CrearTicket';
import TicketsLista from './pages/TicketsLista';
import Diagnostico from './pages/Diagnostico';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-lg">Cargando...</div>;
  if (!user) return <Navigate to="/login" />;
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={<PrivateRoute>{user?.rol === 'solicitante' ? <CrearTicket /> : <TicketsLista />}</PrivateRoute>} />
      <Route path="/crear" element={<PrivateRoute><CrearTicket /></PrivateRoute>} />
      <Route path="/tickets" element={<PrivateRoute><TicketsLista /></PrivateRoute>} />
      <Route path="/diagnostico/:id" element={<PrivateRoute><Diagnostico /></PrivateRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-center" />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}