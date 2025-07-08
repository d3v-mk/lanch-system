import type { Pedido } from '../../../types/pedidoType'

type PedidoListProps = {
  pedidos: Pedido[]
  onDelete: (id: string) => void
  onEdit?: (pedido: Pedido) => void
}

export default function PedidoList({ pedidos, onEdit, onDelete }: PedidoListProps) {
  return (
    <div className="max-w-5xl mx-auto p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {pedidos.length === 0 && (
        <p className="col-span-full text-center text-gray-500 mt-10">
          Nenhum pedido encontrado.
        </p>
      )}

      {pedidos.map(pedido => (
        <div
          key={pedido.id}
          className="bg-white rounded-lg shadow-md p-5 flex flex-col justify-between hover:shadow-lg transition"
        >
          <div>
            <p className="text-lg font-semibold text-gray-900 mb-1">
              Pedido #{pedido.numeroPedido}
            </p>
            <p className="text-gray-800 font-medium mb-1">
              {pedido.cliente.nome}
            </p>
            <p className="text-gray-600 text-sm mb-1">
              Celular:{' '}
              {pedido.cliente.telefone ? (
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
              Endereço: {pedido.cliente.endereco || 'Não informado'}
            </p>

            {/* Carrossel horizontal com imagens dos produtos */}
            <div className="flex space-x-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 py-2">
              {pedido.itens.map(item => (
                <img
                  key={item.id}
                  src={item.produto?.imagemUrl || '/placeholder.png'}
                  alt={item.produto?.nome || 'Produto'}
                  className="w-20 h-20 object-cover rounded-md flex-shrink-0 border border-gray-200"
                  loading="lazy"
                />
              ))}
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            {onEdit && (
              <button
                onClick={() => onEdit(pedido)}
                className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-md transition"
                aria-label={`Editar pedido ${pedido.numeroPedido}`}
              >
                Editar
              </button>
            )}
            <button
              onClick={() => onDelete(pedido.id)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
              aria-label={`Excluir pedido ${pedido.numeroPedido}`}
            >
              Excluir
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
