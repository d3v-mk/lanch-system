// src/services/pedidoService.ts
import axios from 'axios'
import type { Pedido } from '../types/pedidoType'

const API = import.meta.env.VITE_API_URL + '/pedidos'

export async function listarPedidos(): Promise<Pedido[]> {
  const { data } = await axios.get(API)
  return data
}

export async function criarPedido(pedido: Pedido): Promise<Pedido> {
  const { data } = await axios.post(API, pedido)
  return data
}

export async function atualizarPedido(pedido: Pedido): Promise<Pedido> {
  const { data } = await axios.put(`${API}/${pedido.id}`, pedido)
  return data
}

export async function deletarPedido(id: string): Promise<void> {
  await axios.delete(`${API}/${id}`)
}
