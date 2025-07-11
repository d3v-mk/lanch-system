// frontend/src/types/pedidoType.ts

import type { Cliente } from './clienteType';
import type { ItemPedido } from './itemPedidoType';

// Defina os status possíveis do pedido (deve corresponder ao seu enum do Prisma)
export type OrderStatus = 'PENDENTE' | 'EM_PREPARO' | 'PRONTO' | 'SAIU_ENTREGA' | 'ENTREGUE' | 'CANCELADO';

export type Pedido = {
  id: string;
  numeroPedido: number;
  cliente: Cliente; // Cliente é obrigatório e deve ser do tipo Cliente
  total: number; // Total deve ser um número
  criadoEm: string; // ISO Date string
  status: OrderStatus; // Tipo de status atualizado
  observacao?: string | null;
  itens: ItemPedido[]; // Itens são obrigatórios e são um array de ItemPedido
};

export type PedidoPayload = {
  id?: string; // ID é opcional para criação, mas necessário para atualização
  clienteId: string;
  observacao?: string | null;
  total: number;
  status?: OrderStatus; // Status pode ser opcional na criação, mas obrigatório para updateStatus
  itens: ItemPedido[];
};

export type PedidoFormData = {
  id?: string; // NOVO: Adiciona 'id' opcional para diferenciar edição de criação
  clienteId: string;
  observacao?: string | null;
  total: number;
  // Se o formulário fosse lidar com itens ou status, eles seriam adicionados aqui:
  // status?: OrderStatus;
  // itens?: ItemPedidoFormData[];
};