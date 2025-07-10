// frontend/src/pages/Pedidos/components/PedidoCard.tsx

import React, { useState, useRef, useEffect } from 'react';
import type { Pedido } from '../../../types/pedidoType';
import type { ItemPedido } from '../../../types/itemPedidoType';

import {
  FaEllipsisV, FaEye, FaPrint, FaEdit, FaCheckCircle, FaTrash,
  FaClock, FaHourglassHalf, FaMotorcycle, FaCheckDouble, FaTimesCircle, FaUtensils
} from 'react-icons/fa';

type PedidoCardProps = {
  pedido: Pedido;
  onDelete: (id: string) => void;
  onEditPedido: (pedido: Pedido) => void;
  onUpdateStatus: (pedidoId: string, currentStatus: string) => void;
  onViewDetails?: (pedido: Pedido) => void;
  onPrintReceipt?: (pedido: Pedido) => void;
};

const getStatusDisplay = (status: string) => {
  let icon = null;
  let colorClass = '';
  let text = status.replace(/_/g, ' ');

  switch (status) {
    case 'PENDENTE':
      icon = <FaClock className="text-blue-500" />;
      colorClass = 'text-blue-600';
      break;
    case 'EM_PREPARO':
      icon = <FaHourglassHalf className="text-yellow-600" />;
      colorClass = 'text-yellow-700';
      break;
    case 'PRONTO':
      icon = <FaUtensils className="text-orange-600" />;
      colorClass = 'text-orange-700';
      break;
    case 'SAIU_ENTREGA':
      icon = <FaMotorcycle className="text-purple-600" />;
      colorClass = 'text-purple-700';
      break;
    case 'ENTREGUE':
      icon = <FaCheckDouble className="text-green-600" />;
      colorClass = 'text-green-700';
      break;
    case 'CANCELADO':
      icon = <FaTimesCircle className="text-red-600" />;
      colorClass = 'text-red-700';
      break;
    default:
      icon = <FaClock className="text-gray-500" />;
      colorClass = 'text-gray-600';
      break;
  }
  return (
    <span className={`flex items-center gap-1 text-sm font-semibold ${colorClass}`}>
      {icon} {text}
    </span>
  );
};


export default function PedidoCard({
  pedido,
  onDelete,
  onEditPedido,
  onUpdateStatus,
  onViewDetails,
  onPrintReceipt,
}: PedidoCardProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (openMenuId === pedido.id && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }

    if (openMenuId === pedido.id) {
        document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
        document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [openMenuId, pedido.id]);

  return (
    <div
      key={pedido.id}
      className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300 relative min-h-[420px] border border-gray-100"
    >
      {/* Container do título, status e botão de 3 pontos */}
      {/* Este div serve como um cabeçalho fixo, controlando o espaçamento entre elementos */}
      <div className="relative flex items-start justify-between mb-4 -mt-2 -mx-2"> {/* Negative margin para contrabalancear o padding do p-6 do pai */}
        <h3 className="text-lg font-bold text-gray-900 flex-grow pr-4"> {/* flex-grow para ocupar espaço, pr-4 para afastar do status */}
          Pedido #{pedido.numeroPedido}
        </h3>
        
        {/* Container do Status e Botão de 3 Pontos para controlar o espaçamento entre eles */}
        <div className="flex items-center gap-2 z-20"> {/* z-index para garantir que o status não fique atrás do botão */}
          {getStatusDisplay(pedido.status)}
          
          {/* Botão de 3 pontos para opções adicionais */}
          {/* Posicionado dentro do flex container do cabeçalho, com z-index alto */}
          <div className="relative z-30" ref={openMenuId === pedido.id ? menuRef : null}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId(openMenuId === pedido.id ? null : pedido.id);
              }}
              className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
              aria-label={`Mais opções para o pedido ${pedido.numeroPedido}`}
            >
              <FaEllipsisV className="h-4 w-4" />
            </button>

            {openMenuId === pedido.id && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-40 ring-1 ring-black ring-opacity-5">
                {onViewDetails && (
                  <button
                    onClick={() => {
                      onViewDetails(pedido);
                      setOpenMenuId(null);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <FaEye className="h-4 w-4" /> Ver Detalhes
                  </button>
                )}
                {onPrintReceipt && (
                  <button
                    onClick={() => {
                      onPrintReceipt(pedido);
                      setOpenMenuId(null);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <FaPrint className="h-4 w-4" /> Imprimir Recibo
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo principal do card - flex-grow para ocupar o espaço restante verticalmente */}
      <div className="flex-grow min-h-0"> 
        <div className="bg-gray-50 p-3 rounded-lg mb-3 border border-gray-100 text-sm">
          <p className="text-gray-800 font-medium mb-1">
            <span className="font-semibold">Cliente:</span> {pedido.cliente?.nome || 'N/A'}
          </p>
          <p className="text-gray-600 text-xs">
            <span className="font-semibold">Celular:</span>{' '}
            {pedido.cliente?.telefone ? (
              <a
                href={`https://wa.me/${pedido.cliente.telefone.split('@')[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:underline"
              >
                {pedido.cliente.telefone.split('@')[0]}
              </a>
            ) : (
              'Não informado'
            )}
          </p>
          <p className="text-gray-600 text-xs">
            <span className="font-semibold">Endereço:</span> {pedido.cliente?.endereco || 'Não informado'}
          </p>
          <p className="text-gray-600 text-xs">
            <span className="font-semibold">Referência:</span> {pedido.cliente?.referencia || 'Não informada'}
          </p>
        </div>

        {pedido.observacao && (
          <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm">
            <p className="font-semibold text-blue-700 mb-1">Observações:</p>
            <p className="text-blue-800 italic">
              {pedido.observacao}
            </p>
          </div>
        )}

        {/* Linha separadora completa */}
        <div className="border-t border-gray-200 pt-3 mt-3"> {/* Removido w-full pois o padding do pai já controla */}
          <p className="font-semibold text-gray-700 mb-2 text-sm">Itens do Pedido:</p>
          {pedido.itens && pedido.itens.length > 0 ? (
            <div className="space-y-2 pr-2">
              {pedido.itens.map((item: ItemPedido) => (
                <div key={item.id} className="flex items-center text-sm text-gray-800 bg-gray-50 p-2 rounded-md">
                  {item.produto?.imagemUrl ? (
                    <img
                      src={item.produto.imagemUrl}
                      alt={item.produto.nome || 'Produto'}
                      className="w-8 h-8 object-cover rounded-md mr-2 border border-gray-200 flex-shrink-0"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://placehold.co/32x32/cccccc/000000?text=NoImg";
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 rounded-md mr-2 flex items-center justify-center text-gray-500 text-xs flex-shrink-0">
                        NoImg
                    </div>
                  )}
                  <span className="flex-grow min-w-0 pr-2">{item.quantidade}x {item.produto?.nome || 'Produto Desconhecido'}</span>
                  <span className="font-semibold whitespace-nowrap">
                    R$ {Number(item.subtotal || 0).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">Nenhum item neste pedido.</p>
          )}
        </div>
      </div>

      {/* Seção inferior com total e ações */}
      <div className="mt-auto pt-4 border-t border-gray-200 flex flex-col items-end">
        <div className="flex flex-col items-end text-gray-900 mb-4 w-full">
          <div className="text-xl font-extrabold">
            Total: R$ {Number(pedido.total).toFixed(2)}
          </div>
          <div className="text-gray-600 text-xs mt-1">
            Forma de Pagamento: <span className="font-semibold">Maquininha</span>
          </div>
        </div>

        {/* Layout dos botões corrigido: wrap para mobile, mas sem flex-1 que os deixa gigantes */}
        <div className="flex flex-wrap justify-end gap-2 w-full"> {/* Changed justify-center to justify-end */}
          <button
            onClick={() => onEditPedido(pedido)}
            className="flex items-center justify-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded-md transition-colors duration-200 shadow-md text-sm font-medium w-auto" 
          >
            <FaEdit className="h-4 w-4" /> Editar
          </button>
          {pedido.status !== 'ENTREGUE' && pedido.status !== 'CANCELADO' && (
            <button
              onClick={() => onUpdateStatus(pedido.id, pedido.status)}
              className="flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-md transition-colors duration-200 shadow-md text-sm font-medium w-auto"
            >
              <FaCheckCircle className="h-4 w-4" /> Atualizar Status
            </button>
          )}
          <button
            onClick={() => onDelete(pedido.id)}
            className="flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md transition-colors duration-200 shadow-md text-sm font-medium w-auto"
          >
            <FaTrash className="h-4 w-4" /> Excluir
          </button>
        </div>
      </div>
    </div>
  );
}