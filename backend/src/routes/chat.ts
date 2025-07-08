// backend/src/routes/chat.ts (exemplo, você pode integrar em api.ts)
import { Router } from 'express';
import prisma from '../prismaClient';

const chatRouter = Router();

// Rota para obter conversas pendentes
chatRouter.get('/pendentes', async (req, res) => {
  try {
    const conversas = await prisma.conversaAtendimento.findMany({
      where: { status: "PENDENTE" },
      orderBy: { criadoEm: 'asc' },
    });
    res.json(conversas);
  } catch (error) {
    console.error("Erro ao buscar conversas pendentes:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Rota para obter conversas EM ATENDIMENTO
chatRouter.get('/ativas', async (req, res) => {
  try {
    const conversas = await prisma.conversaAtendimento.findMany({
      where: { status: "EM_ATENDIMENTO" },
      orderBy: { atualizadoEm: 'desc' }, // Ou por quem pegou, etc.
    });
    res.json(conversas);
  } catch (error) {
    console.error("Erro ao buscar conversas ativas:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Rota para obter mensagens de uma conversa específica
chatRouter.get('/:conversaId/mensagens', async (req, res) => {
  const { conversaId } = req.params;
  try {
    const mensagens = await prisma.mensagemAtendimento.findMany({
      where: { conversaId },
      orderBy: { timestamp: 'asc' },
    });
    res.json(mensagens);
  } catch (error) {
    console.error("Erro ao buscar mensagens da conversa:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default chatRouter; // Adicione este router ao seu index.ts principal