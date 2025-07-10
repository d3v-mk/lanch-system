// frontend/src/pages/Pedidos/components/PedidoList.tsx

import type { Pedido } from '../../../types/pedidoType';
import PedidoCard from './PedidoCard'; 

type PedidoListProps = {
  pedidos: Pedido[];
  onDelete: (id: string) => void;
  onEditPedido: (pedido: Pedido) => void;
  onUpdateStatus: (pedidoId: string, currentStatus: string) => void;
  onViewDetails?: (pedido: Pedido) => void;
  onPrintReceipt?: (pedido: Pedido) => void;
};

export default function PedidoList({
  pedidos,
  onEditPedido,
  onDelete,
  onUpdateStatus,
  onViewDetails,
  onPrintReceipt,
}: PedidoListProps) {
  if (pedidos.length === 0) {
    return (
      <p className="col-span-full text-center text-gray-500 mt-10">
        Nenhum pedido encontrado.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6"> {/* AQUI ESTÁ A MUDANÇA PRINCIPAL */}
      {pedidos.map((pedido) => (
        <PedidoCard
          key={pedido.id} 
          pedido={pedido}
          onDelete={onDelete}
          onEditPedido={onEditPedido}
          onUpdateStatus={onUpdateStatus}
          onViewDetails={onViewDetails}
          onPrintReceipt={onPrintReceipt}
        />
      ))}
    </div>
  );
}