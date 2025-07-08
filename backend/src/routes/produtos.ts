// src/routes/produtos.ts

import { Router } from 'express'
import prisma from '../prismaClient'
import { normalizeStringForSearch } from '../utils/stringUtils' // Importe a função

const router = Router()

// cria o produto
router.post('/', async (req, res) => {
  const { nome, preco, descricao, imagemUrl, disponivel = true } = req.body

  if (!nome || preco === undefined) {
    return res.status(400).json({ erro: 'Nome e preço são obrigatórios' })
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
      },
    })

    res.status(201).json(produto)
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: 'Erro ao cadastrar produto' })
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

// Listar produtos (com filtro opcional por nome)
router.get('/', async (req, res) => {
  const { nome } = req.query

  try {
    let produtos

    if (nome) {
      const normalizedSearchTerm = normalizeStringForSearch(String(nome)); // <-- Use a mesma normalização aqui

      produtos = await prisma.produto.findMany({
        where: {
          normalizedName: { // <-- BUSCA PELA NOVA COLUNA NORMALIZADA
            contains: normalizedSearchTerm,
            mode: 'insensitive',
          },
        },
      })
    } else {
      produtos = await prisma.produto.findMany()
    }

    return res.json(produtos)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ erro: 'Erro ao buscar produtos' })
  }
})

export default router