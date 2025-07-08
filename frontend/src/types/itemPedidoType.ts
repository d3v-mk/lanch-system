// types/itemPedidoType.ts

import type { Produto } from './produtoType'

export type ItemPedido = {
  id: string
  pedidoId: string
  produtoId: string
  quantidade: number
  produto: Produto  // ← isso aqui é necessário se você estiver usando include no Prisma
}
