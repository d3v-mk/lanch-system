// types/pedidoType.ts

import type { Cliente } from './clienteType'
import type { ItemPedido } from './itemPedidoType'

export type Pedido = {
  id: string
  numeroPedido: number
  cliente: Cliente
  total: number | string
  criadoEm: string
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'FINALIZADO'
  observacao?: string | null
  itens: ItemPedido[]
}
