// frontend/src/components/Sidebar.tsx
import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePedidosContext } from '../contexts/PedidosContext';

// 🚨 NOVO: Defina a interface para as props da Sidebar
interface SidebarProps {
  onLogout?: () => void; // A função de logout é opcional
}

// 🚨 NOVO: Aceite as props na função do componente
export default function Sidebar({ onLogout }: SidebarProps) {
  const { newPedidosCount, resetNewPedidosCount } = usePedidosContext();
  const location = useLocation();

  const handlePedidosLinkClick = () => {
    resetNewPedidosCount();
  };

  return (
    <aside className="w-64 bg-blue-800 text-white p-6 flex flex-col">
      <h1 className="text-3xl font-bold mb-8">Painel</h1>
      <nav className="flex flex-col gap-4">
        <Link to="/" className="hover:bg-blue-700 p-2 rounded">Dashboard</Link>
        <Link to="/atendimento" className="hover:bg-blue-700 p-2 rounded">Atendimento</Link>
        <Link
          to="/pedidos"
          className="relative hover:bg-blue-700 p-2 rounded flex items-center justify-between"
          onClick={handlePedidosLinkClick}
        >
          <span>Pedidos</span>
          {newPedidosCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {newPedidosCount}
            </span>
          )}
        </Link>
        <Link to="/produtos" className="hover:bg-blue-700 p-2 rounded">Produtos</Link>

        {/* Exemplo de botão de logout - você pode adicionar isso no seu JSX da Sidebar */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="mt-auto bg-blue-700 hover:bg-blue-600 p-2 rounded text-left"
          >
            Sair
          </button>
        )}
      </nav>
    </aside>
  );
}