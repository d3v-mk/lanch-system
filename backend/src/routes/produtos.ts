// backend/src/routes/produtos.ts

import { Router } from 'express'
import { getProdutos } from '../services/produtoService';
import prisma from '../prismaClient'
import { normalizeStringForSearch } from '../utils/stringUtils'

const router = Router()

// cria o produto
router.post('/', async (req, res) => {
  // CORREÇÃO AQUI: Adicione 'categoriaId' aos campos desestruturados do corpo da requisição
  const { nome, preco, descricao, imagemUrl, disponivel = true, categoriaId } = req.body

  // Validação para categoriaId também
  if (!nome || preco === undefined || !categoriaId) {
    return res.status(400).json({ erro: 'Nome, preço e categoria são obrigatórios.' })
  }

  try {
    const produto = await prisma.produto.create({
      data: {
        nome,
        normalizedName: normalizeStringForSearch(nome),
        preco: preco.toString(),
        descricao,
        imagemUrl,
        disponivel,
        categoriaId, // <--- GARANTA QUE categoriaId ESTÁ SENDO PASSADO AQUI
      },
    })

    res.status(201).json(produto)
  } catch (err: any) { // Type as 'any' to access error.code
    console.error('Erro ao cadastrar produto:', err);
    if (err.code === 'P2002') { // Erro de violação de unicidade (ex: normalizedName)
      return res.status(400).json({ erro: 'Já existe um produto com este nome.' });
    }
    // Adicione tratamento para P2025 (registro não encontrado, se aplicável) ou outros erros
    res.status(500).json({ erro: 'Erro ao cadastrar produto.' });
  }
})

// delete o produto
router.delete('/:id', async (req, res) => {
  const { id } = req.params

  try {
    await prisma.produto.delete({
      where: { id },
    })

    return res.status(204).send()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ erro: 'Erro ao deletar produto' })
  }
})

// Listar produtos (com filtro opcional por nome e agora usando o serviço)
router.get('/', async (req, res) => {
  const { nome, cardapio } = req.query

  try {
    const produtos = await getProdutos({
      nome: typeof nome === 'string' ? nome : undefined,
      paraCardapio: cardapio === 'true',
    });

    return res.json(produtos)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ erro: 'Erro ao buscar produtos' })
  }
})

export default router
