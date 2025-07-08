// src/routes/clientes.ts
import { Router } from 'express'
import prisma from '../prismaClient'

const router = Router()

// GET /api/clientes - Busca todos os clientes
router.get('/', async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany({
      include: { pedidos: true },
      orderBy: { criadoEm: 'desc' },
    })
    res.json(clientes)
  } catch (err) {
    console.error(err)
    res.status(500).json({ erro: 'Erro ao buscar clientes' })
  }
})

// POST /api/clientes - Cria um novo cliente
router.post('/', async (req, res) => {
  const { nome, telefone, endereco } = req.body
  if (!nome || !telefone) {
    return res.status(400).json({ erro: 'Nome e telefone são obrigatórios' })
  }
  try {
    const cliente = await prisma.cliente.create({
      data: {
        nome,
        telefone,
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
  const { id } = req.params // Pega o ID do cliente da URL
  const { nome, telefone, endereco } = req.body // Pega os dados a serem atualizados do corpo da requisição

  try {
    const clienteAtualizado = await prisma.cliente.update({
      where: { id: String(id) }, // Garante que o ID seja uma string
      data: {
        // Apenas atualiza os campos que foram passados no corpo da requisição
        ...(nome && { nome }),
        ...(telefone && { telefone: String(telefone) }), // Garante que telefone seja String
        ...(endereco && { endereco }),
      },
    })
    res.status(200).json(clienteAtualizado) // Retorna o cliente atualizado
  } catch (err: unknown) { // <--- AQUI ESTÁ A MUDANÇA: Adicionado ': unknown'
    console.error(err)
    
    // Tratamento de erro específico do Prisma (registro não encontrado)
    // O 'err' pode ser 'any' ou você pode verificar a estrutura
    if (typeof err === 'object' && err !== null && 'code' in err && err.code === 'P2025') {
      return res.status(404).json({ erro: 'Cliente não encontrado.' })
    }
    
    // Tratamento de erros gerais
    res.status(500).json({ erro: 'Erro ao atualizar cliente' })
  }
})


// DELETE /api/clientes/:id - Deleta um cliente
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    await prisma.cliente.delete({ where: { id } })
    res.status(204).send()
  } catch (err: unknown) { // <--- AQUI TAMBÉM: Adicionado ': unknown'
    console.error(err)
    // Tratamento de erro específico do Prisma
    if (typeof err === 'object' && err !== null && 'code' in err && err.code === 'P2025') {
      return res.status(404).json({ erro: 'Cliente não encontrado.' })
    }
    res.status(500).json({ erro: 'Erro ao deletar cliente' })
  }
})

export default router