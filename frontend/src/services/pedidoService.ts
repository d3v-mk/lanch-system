// frontend/src/services/pedidoService.ts
import axios from 'axios';
import type { Pedido, OrderStatus } from '../types/pedidoType'; // Importa Pedido e OrderStatus
import type { ItemPedido } from '../types/itemPedidoType'; // Importa ItemPedido

// NOVO TIPO: Representa a estrutura de dados que o backend espera para criar/atualizar um pedido
export type PedidoPayload = {
  id?: string; // ID opcional para atualização (PUT)
  clienteId: string;
  observacao?: string | null;
  total: number;
  status: OrderStatus; // Status é obrigatório para o backend
  itens: ItemPedido[]; // Itens são obrigatórios para o backend
};

const API = import.meta.env.VITE_API_URL + '/pedidos';

/**
 * Lista todos os pedidos do sistema.
 * @returns {Promise<Pedido[]>} Uma promessa que resolve com um array de pedidos.
 */
export async function listarPedidos(): Promise<Pedido[]> {
  const { data } = await axios.get(API);
  return data;
}

/**
 * Cria um novo pedido.
 * @param payload Os dados do pedido a serem enviados para o backend.
 * @returns {Promise<Pedido>} Uma promessa que resolve com o pedido criado.
 */
export async function criarPedido(payload: PedidoPayload): Promise<Pedido> {
  // O backend espera um objeto com clienteId, observacao, status, total, itens
  const { data } = await axios.post(API, payload);
  return data;
}

/**
 * Atualiza um pedido existente.
 * @param payload Os dados do pedido a serem atualizados. Deve incluir o ID.
 * @returns {Promise<Pedido>} Uma promessa que resolve com o pedido atualizado.
 */
export async function atualizarPedido(payload: PedidoPayload): Promise<Pedido> {
  if (!payload.id) {
    throw new Error('ID do pedido é obrigatório para atualização.');
  }
  // O backend espera um objeto com clienteId, observacao, status, total, itens
  const { data } = await axios.put(`${API}/${payload.id}`, payload);
  return data;
}

/**
 * Deleta um pedido pelo seu ID.
 * @param id O ID do pedido a ser deletado.
 * @returns {Promise<void>} Uma promessa que resolve quando o pedido é deletado.
 */
export async function deletarPedido(id: string): Promise<void> {
  await axios.delete(`${API}/${id}`);
}

/**
 * Atualiza o status de um pedido.
 * @param pedidoId O ID do pedido a ser atualizado.
 * @param newStatus O novo status (ex: "RECEBIDO", "PREPARANDO", "SAIU_PARA_ENTREGA", "ENTREGUE").
 * @returns {Promise<Pedido>} Uma promessa que resolve com o pedido atualizado.
 */
export async function updateOrderStatus(pedidoId: string, newStatus: string): Promise<Pedido> {
  try {
    const { data } = await axios.patch<Pedido>(`${API}/${pedidoId}/status`, { status: newStatus });
    return data;
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    throw error;
  }
}