// src/types/produto.ts

export type Produto = {
  id: string
  nome: string
  preco: string
  descricao?: string | null
  imagemUrl?: string | null
  disponivel: boolean
}

export type ProdutoInput = {
  nome: string
  preco: string
  descricao?: string
  imagemUrl?: string
  disponivel: boolean
}
