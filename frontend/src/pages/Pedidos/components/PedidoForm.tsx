// frontend/src/pages/Pedidos/components/PedidoForm.tsx
import React, { useState, useEffect } from 'react';
import { PedidoFormData } from '../../../types';

// Definição das props do componente PedidoForm
type PedidoFormProps = {
  pedido?: PedidoFormData; // O pedido inicial para edição (opcional)
  onSubmit: (data: PedidoFormData) => void; // Função para lidar com o envio do formulário
  onClose: () => void; // Função para fechar o formulário
};

export default function PedidoForm({ pedido, onSubmit, onClose }: PedidoFormProps) {
  // Estados para os campos do formulário, inicializados com os dados do pedido existente ou valores padrão
  const [clienteId, setClienteId] = useState(pedido?.clienteId || '');
  const [observacao, setObservacao] = useState(pedido?.observacao || '');
  const [total, setTotal] = useState(pedido?.total || 0);

  // Efeito para atualizar os estados do formulário se o 'pedido' prop mudar (para edição)
  useEffect(() => {
    if (pedido) {
      setClienteId(pedido.clienteId || '');
      setObservacao(pedido.observacao || '');
      setTotal(pedido.total || 0);
    } else {
      // Limpa o formulário se não houver pedido (para novo pedido)
      setClienteId('');
      setObservacao('');
      setTotal(0);
    }
  }, [pedido]); // Dependência do objeto 'pedido'

  // Handler para o envio do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Previne o comportamento padrão de recarregar a página
    // Chama a função onSubmit passada via props com os dados atuais do formulário
    // Inclui o ID do pedido se estiver em modo de edição
    onSubmit({ id: pedido?.id, clienteId, observacao, total });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">
          {/* Ajusta o título para usar pedido?.id para edição */}
          {pedido?.id ? `Editar Pedido #${pedido.id.substring(0, 8)}...` : 'Novo Pedido'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="clienteId" className="block text-sm font-medium text-gray-700">
              ID do Cliente:
            </label>
            <input
              type="text"
              id="clienteId"
              value={clienteId}
              onChange={e => setClienteId(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="observacao" className="block text-sm font-medium text-gray-700">
              Observação:
            </label>
            <textarea
              id="observacao"
              value={observacao}
              onChange={e => setObservacao(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            ></textarea>
          </div>

          <div>
            <label htmlFor="total" className="block text-sm font-medium text-gray-700">
              Total:
            </label>
            <input
              type="number"
              id="total"
              value={total}
              onChange={e => setTotal(parseFloat(e.target.value))}
              required
              min={0}
              step={0.01}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Salvar Pedido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}