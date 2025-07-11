// frontend/src/App.tsx
import { useState, useEffect } from 'react'; // Importe useEffect
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Produtos from './pages/Produtos';
import Pedidos from './pages/Pedidos';
import AtendimentoPage from './pages/Atendimento';
import { PedidosProvider } from './contexts/PedidosContext';

export default function App() {
  // ESTA É A LINHA CRÍTICA PARA A PERSISTÊNCIA DO LOGIN
  const [logado, setLogado] = useState(() => {
    const storedLoginStatus = localStorage.getItem('isLoggedIn');
    return storedLoginStatus === 'true';
  });

  console.log('App.tsx: Renderizado. Estado de logado =', logado);

  const handleLoginSuccess = () => {
    setLogado(true);
    localStorage.setItem('isLoggedIn', 'true'); // Salva no localStorage
    console.log('App.tsx: Login bem-sucedido, setLogado(true) e salvo no localStorage.');
  };

  const handleLogout = () => { // Função de logout (se precisar)
    setLogado(false);
    localStorage.removeItem('isLoggedIn');
    console.log('App.tsx: Logout realizado, removido do localStorage.');
  };

  // useEffect para sincronizar o estado 'logado' com o 'localStorage'
  useEffect(() => {
    const checkLoginStatus = () => {
      const storedStatus = localStorage.getItem('isLoggedIn');
      if (storedStatus === 'true' && !logado) {
        setLogado(true);
      } else if (storedStatus !== 'true' && logado) {
        setLogado(false);
      }
    };
    window.addEventListener('storage', checkLoginStatus);
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, [logado]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route
          path="/*"
          element={
            logado ? (
              (() => {
                console.log('App.tsx: logado é true, renderizando PedidosProvider.');
                return (
                  <PedidosProvider>
                    <div className="flex h-screen bg-gray-100">
                      <Sidebar onLogout={handleLogout} /> {/* Passe onLogout se usar */}
                      <main className="flex-1 p-6 overflow-auto">
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/produtos" element={<Produtos />} />
                          <Route path="/pedidos" element={<Pedidos />} />
                          <Route path="/atendimento" element={<AtendimentoPage />} />
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </main>
                    </div>
                  </PedidosProvider>
                );
              })()
            ) : (
              (() => {
                console.log('App.tsx: logado é false, redirecionando para /login.');
                return (
                  <Navigate to="/login" replace />
                );
              })()
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}