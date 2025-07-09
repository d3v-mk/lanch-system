import React from 'react';
import type { Pedido } from '../../../types/pedidoType';
import type { ItemPedido } from '../../../types/itemPedidoType';

type PedidoListProps = {
  pedidos: Pedido[];
  onDelete: (id: string) => void;
  onEditPedido: (pedido: Pedido) => void;
  onUpdateStatus: (pedidoId: string, currentStatus: string) => void;
};

export default function PedidoList({ pedidos, onEditPedido, onDelete, onUpdateStatus }: PedidoListProps) {
  if (pedidos.length === 0) {
    return (
      <p className="col-span-full text-center text-gray-500 mt-10">
        Nenhum pedido encontrado.
      </p>
    );
  }

  return (
    // Grid container para os cards, responsivo
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {pedidos.map((pedido) => (
        <div
          key={pedido.id}
          className="bg-white rounded-lg shadow-md p-5 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300"
        >
          {/* Informações do Pedido */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Pedido #{pedido.numeroPedido}
              <span className={`ml-2 py-1 px-3 rounded-full text-xs font-semibold
                ${pedido.status === 'PENDENTE' ? 'bg-blue-200 text-blue-800' : ''}
                ${pedido.status === 'EM_PREPARO' ? 'bg-yellow-200 text-yellow-800' : ''}
                ${pedido.status === 'PRONTO' ? 'bg-orange-200 text-orange-800' : ''}
                ${pedido.status === 'SAIU_ENTREGA' ? 'bg-purple-200 text-purple-800' : ''}
                ${pedido.status === 'ENTREGUE' ? 'bg-green-200 text-green-800' : ''}
                ${pedido.status === 'CANCELADO' ? 'bg-red-200 text-red-800' : ''}
              `}>
                {pedido.status.replace(/_/g, ' ')}
              </span>
            </h3>
            
            <p className="text-gray-800 font-medium mb-1">
              Cliente: {pedido.cliente?.nome || 'N/A'}
            </p>
            <p className="text-gray-600 text-sm mb-1">
              Celular:{' '}
              {pedido.cliente?.telefone ? (
                <a
                  href={`https://wa.me/${pedido.cliente.telefone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline"
                >
                  {pedido.cliente.telefone}
                </a>
              ) : (
                'Não informado'
              )}
            </p>
            <p className="text-gray-600 text-sm mb-3">
              Endereço: {pedido.cliente?.endereco || 'Não informado'}
            </p>

            {/* Lista de Itens do Pedido */}
            <div className="border-t border-gray-200 pt-3 mt-3">
              <p className="font-semibold text-gray-700 mb-2">Itens:</p>
              {pedido.itens && pedido.itens.length > 0 ? (
                <div className="space-y-2">
                  {pedido.itens.map((item: ItemPedido) => (
                    <div key={item.id} className="flex items-center text-sm text-gray-800">
                      {item.produto?.imagemUrl && (
                        <img
                          src={item.produto.imagemUrl}
                          alt={item.produto.nome || 'Produto'}
                          className="w-10 h-10 object-cover rounded-md mr-2 border border-gray-200"
                          loading="lazy"
                          // Fallback para imagem quebrada
                          onError={(e) => {
                            e.currentTarget.onerror = null; // Evita loop infinito
                            e.currentTarget.src = "https://placehold.co/40x40/cccccc/000000?text=NoImg"; // Placeholder
                          }}
                        />
                      )}
                      <span>{item.quantidade}x {item.produto?.nome || 'Produto Desconhecido'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Nenhum item neste pedido.</p>
              )}
            </div>

            {/* Total do Pedido */}
            <p className="text-lg font-bold text-gray-900 mt-4 text-right">
              Total: R$ {Number(pedido.total).toFixed(2)}
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="mt-5 flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              onClick={() => onEditPedido(pedido)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors duration-200 shadow-sm text-sm"
              aria-label={`Editar pedido ${pedido.numeroPedido}`}
            >
              Editar
            </button>
            {pedido.status !== 'ENTREGUE' && pedido.status !== 'CANCELADO' && (
              <button
                onClick={() => onUpdateStatus(pedido.id, pedido.status)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors duration-200 shadow-sm text-sm"
                aria-label={`Atualizar status do pedido ${pedido.numeroPedido}`}
              >
                Atualizar
              </button>
            )}
            <button
              onClick={() => onDelete(pedido.id)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors duration-200 shadow-sm text-sm"
              aria-label={`Excluir pedido ${pedido.numeroPedido}`}
            >
              Excluir
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
