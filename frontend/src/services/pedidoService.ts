// frontend/src/services/pedidoService.ts
import axios from 'axios';
import type { Pedido, PedidoPayload } from '../types/pedidoType'; 

const API_BASE_URL = import.meta.env.VITE_API_URL;
const PEDIDOS_API = `${API_BASE_URL}/pedidos`; // URL específica para pedidos

/**
 * Lista todos os pedidos do sistema.
 * @returns {Promise<Pedido[]>} Uma promessa que resolve com um array de pedidos.
 */
export async function fetchPedidos(): Promise<Pedido[]> {
  const { data } = await axios.get(PEDIDOS_API);
  return data;
}

/**
 * Cria um novo pedido.
 * @param payload Os dados do pedido a serem enviados para o backend.
 * @returns {Promise<Pedido>} Uma promessa que resolve com o pedido criado.
 */
export async function criarPedido(payload: PedidoPayload): Promise<Pedido> {
  const { data } = await axios.post(PEDIDOS_API, payload);
  return data;
}

/**
 * Atualiza um pedido existente.
 * @param payload Os dados do pedido a serem atualizados. Deve incluir o ID.
 * @returns {Promise<Pedido>} Uma promessa que resolve com o pedido atualizado.
 */
export async function updatePedido(payload: PedidoPayload): Promise<Pedido> {
  if (!payload.id) {
    throw new Error('ID do pedido é obrigatório para atualização.');
  }
  const { data } = await axios.put(`${PEDIDOS_API}/${payload.id}`, payload);
  return data;
}

/**
 * Deleta um pedido pelo seu ID.
 * @param id O ID do pedido a ser deletado.
 * @returns {Promise<void>} Uma promessa que resolve quando o pedido é deletado.
 */
export async function deletePedido(id: string): Promise<void> {
  await axios.delete(`${PEDIDOS_API}/${id}`);
}

/**
 * Atualiza o status de um pedido.
 * @param pedidoId O ID do pedido a ser atualizado.
 * @param newStatus O novo status (ex: "RECEBIDO", "PREPARANDO", "SAIU_PARA_ENTREGA", "ENTREGUE").
 * @returns {Promise<Pedido>} Uma promessa que resolve com o pedido atualizado.
 */
export async function updateOrderStatus(pedidoId: string, newStatus: string): Promise<Pedido> {
  try {
    const { data } = await axios.patch<Pedido>(`${PEDIDOS_API}/${pedidoId}/status`, { status: newStatus });
    return data;
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    throw error;
  }
}