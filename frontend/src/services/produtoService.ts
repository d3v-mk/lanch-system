// src/services/produtoService.ts
import axios from 'axios'
import type { Produto, ProdutoInput } from '../types'

const API_URL = import.meta.env.VITE_API_URL + '/produtos'

export async function listarProdutos(): Promise<Produto[]> {
  const { data } = await axios.get(API_URL)
  return data
}

export async function criarProduto(produto: ProdutoInput): Promise<Produto> {

  const payload = { ...produto, preco: parseFloat(produto.preco as unknown as string) }

  const { data } = await axios.post(API_URL, payload)
  return data
}

export async function deletarProduto(id: string): Promise<void> {
  await axios.delete(`${API_URL}/${id}`)
}
