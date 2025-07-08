import { Router } from 'express'
import prisma from '../prismaClient'
import { Prisma } from '@prisma/client'
import { io } from '../index' // 👈 importa o socket.io

const { Decimal } = Prisma
const router = Router()

// ✅ GET /pedidos - listar todos
router.get('/', async (_, res) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      include: {
        cliente: true,
        itens: { include: { produto: true } },
      },
      orderBy: { criadoEm: 'desc' },
    })
    res.json(pedidos)
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error)
    res.status(500).json({ erro: 'Erro ao buscar pedidos' })
  }
})

// 🔐 Função de validação central
function validarItens(itens: any[]): { produtoId: string, quantidade: number, subtotal: number }[] {
  if (!Array.isArray(itens) || itens.length === 0) throw new Error('Itens do pedido são obrigatórios')

  return itens.map((item, index) => {
    const quantidade = Number(item.quantidade)
    const subtotal = Number(item.subtotal)
    const produtoId = item.produtoId

    if (!produtoId || isNaN(quantidade) || isNaN(subtotal) || quantidade <= 0 || subtotal < 0) {
      throw new Error(`Item inválido na posição ${index + 1}`)
    }

    return { produtoId, quantidade, subtotal }
  })
}

// 🔐 Função para validar cliente e produtos
async function validarReferencias(clienteId: string, itens: { produtoId: string }[]) {
  const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } })
  if (!cliente) throw new Error('Cliente não encontrado')

  const produtoIds = itens.map(i => i.produtoId)
  const produtos = await prisma.produto.findMany({ where: { id: { in: produtoIds } } })
  if (produtos.length !== produtoIds.length) throw new Error('Um ou mais produtos não existem')
}

// ✅ POST /pedidos - criar novo pedido
router.post('/', async (req, res) => {
  const { clienteId, observacao, status, itens } = req.body

  try {
    if (!clienteId) throw new Error('clienteId é obrigatório')

    const itensConvertidos = validarItens(itens)
    await validarReferencias(clienteId, itensConvertidos)

    const total = itensConvertidos.reduce((acc, item) => acc + item.subtotal, 0)

    const novoPedido = await prisma.pedido.create({
      data: {
        clienteId,
        observacao,
        status,
        total: new Decimal(total),
        itens: {
          create: itensConvertidos.map(item => ({
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            subtotal: new Decimal(item.subtotal),
          })),
        },
      },
      include: {
        cliente: true,
        itens: { include: { produto: true } },
      },
    })

    // 🎉 Emitir evento real-time pros painéis
    io.emit('novo_pedido', novoPedido)

    res.status(201).json(novoPedido)
  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    res.status(400).json({ erro: (error as any).message || 'Erro ao criar pedido' })
  }
})

// ✅ PUT /pedidos/:id - editar pedido
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { clienteId, observacao, status, itens } = req.body

  try {
    if (!clienteId) throw new Error('clienteId é obrigatório')

    const itensConvertidos = validarItens(itens)
    await validarReferencias(clienteId, itensConvertidos)

    const total = itensConvertidos.reduce((acc, item) => acc + item.subtotal, 0)

    await prisma.itemPedido.deleteMany({ where: { pedidoId: id } })

    const pedidoAtualizado = await prisma.pedido.update({
      where: { id },
      data: {
        clienteId,
        observacao,
        status,
        total: new Decimal(total),
        itens: {
          create: itensConvertidos.map(item => ({
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            subtotal: new Decimal(item.subtotal),
          })),
        },
      },
      include: {
        cliente: true,
        itens: { include: { produto: true } },
      },
    })

    res.json(pedidoAtualizado)
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error)
    res.status(400).json({ erro: (error as any).message || 'Erro ao atualizar pedido' })
  }
})

export default router
