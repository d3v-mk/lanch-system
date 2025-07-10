// src/routes/clientes.ts
import { Router } from 'express'
import prisma from '../prismaClient'

const router = Router()

// GET /api/clientes - Busca clientes (todos ou por telefone)
router.get('/', async (req, res) => {
  try {
    const { telefone } = req.query // Pega o parâmetro 'telefone' da query string

    if (telefone) {
      // Se um telefone for fornecido, filtre por ele
      const cliente = await prisma.cliente.findMany({
        where: {
          telefone: String(telefone) // Garante que é string
        },
        include: { pedidos: true },
        orderBy: { criadoEm: 'desc' }, // Mantém a ordenação, embora para um único cliente não faça muita diferença
        take: 1 // Pega apenas o primeiro cliente encontrado com esse telefone
      })
      // O bot espera um array com o cliente ou um array vazio
      return res.json(cliente) // Retorna o array (mesmo que com 0 ou 1 cliente)
    } else {
      // Se nenhum telefone for fornecido, retorna todos os clientes (comportamento original)
      const clientes = await prisma.cliente.findMany({
        include: { pedidos: true },
        orderBy: { criadoEm: 'desc' },
      })
      return res.json(clientes)
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: 'Erro ao buscar clientes' })
  }
})

// POST /api/clientes - Cria um novo cliente
// Esta rota está OK, pois recebe 'telefone' do corpo da requisição e o usa
router.post('/', async (req, res) => {
  const { nome, telefone, endereco } = req.body
  if (!nome || !telefone) {
    return res.status(400).json({ erro: 'Nome e telefone são obrigatórios' })
  }
  try {
    // IMPORTANTE: Antes de criar, VERIFIQUE se já existe um cliente com esse telefone
    const clienteExistente = await prisma.cliente.findUnique({
      where: { telefone: String(telefone) }, // Garante que telefone seja String
    });

    if (clienteExistente) {
      // Se o cliente já existe, retorne-o em vez de criar um novo
      // Isso é crucial para evitar duplicatas e garantir que o bot pegue o cliente certo
      return res.status(200).json(clienteExistente); // Status 200 OK para recurso já existente
    }

    const cliente = await prisma.cliente.create({
      data: {
        nome,
        telefone: String(telefone), // Garante que telefone seja String
        endereco, 
      },
    })
    res.status(201).json(cliente)
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: 'Erro ao criar cliente' })
  }
})

// PUT /api/clientes/:id - ATUALIZA um cliente existente
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { nome, telefone, endereco } = req.body

  try {
    const clienteAtualizado = await prisma.cliente.update({
      where: { id: String(id) },
      data: {
        ...(nome && { nome }),
        ...(telefone && { telefone: String(telefone) }),
        ...(endereco && { endereco }),
      },
    })
    res.status(200).json(clienteAtualizado)
  } catch (err: unknown) {
    console.error(err)
    if (typeof err === 'object' && err !== null && 'code' in err && err.code === 'P2025') {
      return res.status(404).json({ erro: 'Cliente não encontrado.' })
    }
    res.status(500).json({ erro: 'Erro ao atualizar cliente' })
  }
})

// DELETE /api/clientes/:id - Deleta um cliente
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    await prisma.cliente.delete({ where: { id } })
    res.status(204).send()
  } catch (err: unknown) {
    console.error(err)
    if (typeof err === 'object' && err !== null && 'code' in err && err.code === 'P2025') {
      return res.status(404).json({ erro: 'Cliente não encontrado.' })
    }
    res.status(500).json({ erro: 'Erro ao deletar cliente' })
  }
})

export default router