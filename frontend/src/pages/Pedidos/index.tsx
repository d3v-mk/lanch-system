// frontend/src/pages/Pedidos/index.tsx

import React from 'react'; // Não precisa mais de useState e useCallback aqui
import PedidoList from './components/PedidoList';
import PedidoForm from './components/PedidoForm';
import { usePedidoManagement } from './hooks/usePedidoManagement'; // <--- Importa o novo hook

export default function Pedidos() {
  // Usa o hook personalizado para obter todos os estados e handlers
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
  } = usePedidoManagement(); // <--- CHAMA O HOOK AQUI!

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gerenciar Pedidos</h1>
        <button
          onClick={handleNewPedido} // Chama a função do hook
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300"
        >
          Novo Pedido
        </button>
      </div>

      {isFormOpen && (
        <PedidoForm
          pedido={pedidoFormData} // Passa os dados do formulário do hook
          onSubmit={handleSubmitForm} // Passa o handler de envio do hook
          onClose={onCloseForm} // Passa o handler de fechamento do hook
        />
      )}

      <div className="bg-white p-4 rounded-lg shadow-md">
        {loading && <p className="text-center p-4">Carregando...</p>}
        {error && <p className="text-center p-4 text-red-500">Erro: {error}</p>}
        {!loading && !error && (
          <PedidoList
            pedidos={pedidos}
            onEditPedido={handleEditPedido} // Passa o handler de edição do hook
            onUpdateStatus={handleUpdateStatus} // Passa o handler de atualização de status do hook
            onDelete={excluirPedido} // Passa o handler de exclusão do hook
          />
        )}
      </div>
    </div>
  );
}