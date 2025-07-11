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
  status?: OrderStatus; // Status é opcional para o backend na criação, mas obrigatório para alguns fluxos
  itens: ItemPedido[]; // Itens são obrigatórios para o backend
};

// Use uma instância de axios configurada (se tiver) ou apenas axios.
// Assumindo que VITE_API_URL já inclui a base da API, tipo 'http://localhost:3001'
const API_BASE_URL = import.meta.env.VITE_API_URL;
const PEDIDOS_API = `${API_BASE_URL}/pedidos`; // URL específica para pedidos

/**
 * Lista todos os pedidos do sistema.
 * RENOMEADA DE 'listarPedidos' para 'fetchPedidos' para corresponder ao uso em usePedidoManagement.
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
 * RENOMEADA DE 'atualizarPedido' para 'updatePedido' para consistência.
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
 * RENOMEADA DE 'deletarPedido' para 'deletePedido' para corresponder ao uso em usePedidoManagement.
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