// frontend/src/types/itemPedidoType.ts

import type { Produto } from './produtoType';

export type ItemPedido = {
  id: string;
  pedidoId: string;
  produtoId: string;
  quantidade: number;
  subtotal: number;
  produto?: Produto; // Produto é opcional aqui, mas será incluído se o backend o enviar
};