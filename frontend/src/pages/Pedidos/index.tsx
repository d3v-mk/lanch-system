// frontend/src/pages/Pedidos/index.tsx

import React from 'react';
import PedidoList from './components/PedidoList';
import PedidoForm from './components/PedidoForm';
import { usePedidoManagement } from './hooks/usePedidoManagement';

export default function Pedidos() {
  const {
    pedidos,
    loading,
    error,
    isFormOpen,
    pedidoFormData,
    handleUpdateStatus,
    handleEditPedido,
    handleNewPedido,
    handleSubmitForm,
    onCloseForm,
    excluirPedido,
  } = usePedidoManagement();

  return (
    <div className="bg-gray-100 min-h-screen w-full flex justify-center">
      <div className="flex flex-col w-full max-w-screen-2xl px-4 py-6 md:px-8 lg:px-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Gerenciar Pedidos</h1>
          <button
            onClick={handleNewPedido}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
          >
            Novo Pedido
          </button>
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
