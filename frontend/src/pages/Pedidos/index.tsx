// frontend/src/pages/Pedidos/index.tsx

import React, { useEffect } from 'react';
import PedidoList from './components/PedidoList';
import PedidoForm from './components/PedidoForm';
import { usePedidoManagement } from './hooks/usePedidoManagement';
import { usePedidosContext } from '../../contexts/PedidosContext';

export default function Pedidos() {
  const {
    pedidos,
    loading,
    error,
    loadPedidos, // Função para recarregar a lista de pedidos
    isFormOpen,
    pedidoFormData,
    handleUpdateStatus,
    handleEditPedido,
    handleNewPedido,
    handleSubmitForm,
    onCloseForm,
    excluirPedido,
  } = usePedidoManagement();

  const { activateNotifications, soundActive, onNewPedidoReceived } = usePedidosContext(); // 🚨 Importe onNewPedidoReceived

  // Carrega os pedidos na montagem inicial da página (já estava)
  useEffect(() => {
    loadPedidos();
  }, [loadPedidos]);

  // 🚨 NOVO: Efeito para escutar novos pedidos do contexto
  useEffect(() => {
    console.log('Página Pedidos: Registrando listener para novos pedidos do contexto.');
    const unsubscribe = onNewPedidoReceived(() => {
      console.log('Página Pedidos: Novo pedido detectado pelo contexto, recarregando lista.');
      loadPedidos(); // Chama a função para recarregar a lista de pedidos
    });

    // Função de limpeza: remove o listener quando o componente é desmontado
    return () => {
      console.log('Página Pedidos: Desregistrando listener de novos pedidos do contexto.');
      unsubscribe();
    };
  }, [onNewPedidoReceived, loadPedidos]); // Depende de onNewPedidoReceived e loadPedidos

  return (
    <div className="bg-gray-100 min-h-screen w-full flex justify-center">
      <div className="flex flex-col w-full max-w-screen-2xl px-4 py-6 md:px-8 lg:px-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Gerenciar Pedidos</h1>
          <div className="flex gap-4">
            {!soundActive && (
              <button
                onClick={activateNotifications}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
                title="Clique para ativar notificações sonoras e pop-up de novos pedidos"
              >
                Ativar Notificações
              </button>
            )}
            <button
              onClick={handleNewPedido}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
            >
              Novo Pedido
            </button>
          </div>
        </div>

        {isFormOpen && (
          <PedidoForm
            pedido={pedidoFormData}
            onSubmit={handleSubmitForm}
            onClose={onCloseForm}
          />
        )}

        <div className="bg-white p-4 rounded-lg shadow-md w-full">
          {loading && <p className="text-center p-4">Carregando...</p>}
          {error && <p className="text-center p-4 text-red-500">Erro: {error}</p>}
          {!loading && !error && (
            <PedidoList
              pedidos={pedidos}
              onEditPedido={handleEditPedido}
              onUpdateStatus={handleUpdateStatus}
              onDelete={excluirPedido}
            />
          )}
        </div>
      </div>
    </div>
  );
}