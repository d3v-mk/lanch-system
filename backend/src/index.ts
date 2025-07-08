// backend/src/index.ts
import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import apiRoutes from './routes/api'; // Suas rotas API gerais
import prisma from './prismaClient'; // Importe o Prisma Client
import { sendWhatsAppMessage } from './whatsappService'; // Importe o serviço que você criará

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Idealmente, ajuste para o domínio do seu frontend em produção (ex: 'http://localhost:5173')
    methods: ['*'],
  },
});

// Exporta io para usar em outros módulos, se necessário
export { io };

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas da API REST
app.use('/api', apiRoutes);

// Lógica de Conexão e Eventos Socket.IO
io.on('connection', (socket) => {
  console.log(`📡 Novo cliente conectado ao Socket.IO: ${socket.id}`);

  // Evento vindo do BOT: Cliente quer falar com atendente ou enviou mensagem em chat ativo
  socket.on('bot:chat_message', async ({ userId, message, type = 'CLIENTE', clientName = 'Cliente WhatsApp' }) => {
    try {
      let conversa = await prisma.conversaAtendimento.findFirst({
        where: { clienteId: userId, status: { in: ['PENDENTE', 'EM_ATENDIMENTO'] } },
      });

      if (!conversa) {
        // Se não houver conversa ativa/pendente, cria uma nova
        conversa = await prisma.conversaAtendimento.create({
          data: {
            clienteId: userId,
            clienteNome: clientName,
            status: 'PENDENTE',
          },
        });
        // Notifica todos os atendentes que há uma nova conversa pendente
        io.emit('admin:new_chat_request', conversa);
        console.log(`[Socket.IO] Nova solicitação de chat do cliente ${userId}`);
      }

      // Salva a mensagem no banco de dados
      const novaMensagem = await prisma.mensagemAtendimento.create({
        data: {
          conversaId: conversa.id,
          remetente: type,
          conteudo: message,
        },
      });

      // Emite a mensagem para a sala específica do cliente (para o atendente que estiver nela)
      io.to(conversa.id).emit('admin:chat_update', {
        conversaId: conversa.id,
        message: novaMensagem,
      });

      // Emite um evento para que o painel possa atualizar a lista de chats (status)
      io.emit('admin:chat_list_update');
      console.log(`[Socket.IO] Mensagem do cliente ${userId} (${type}): ${message}`);

    } catch (error) {
      console.error('Erro ao receber mensagem do bot:', error);
    }
  });

  // Evento vindo do PAINEL: Atendente enviou mensagem
  socket.on('admin:send_message', async ({ conversaId, message, atendenteId }) => {
    try {
      const conversa = await prisma.conversaAtendimento.findUnique({
        where: { id: conversaId },
      });

      if (!conversa) {
        console.error(`[Socket.IO] Conversa ${conversaId} não encontrada para envio de mensagem.`);
        return;
      }

      // Garante que o status mude para EM_ATENDIMENTO se um atendente enviar mensagem
      if (conversa.status === 'PENDENTE') {
        await prisma.conversaAtendimento.update({
          where: { id: conversaId },
          data: { status: 'EM_ATENDIMENTO', atendenteId: atendenteId }, // Armazena quem pegou o chat
        });
        io.emit('admin:chat_list_update'); // Atualiza status para outros atendentes
      }

      // Salva a mensagem no banco de dados
      const novaMensagem = await prisma.mensagemAtendimento.create({
        data: {
          conversaId: conversa.id,
          remetente: 'ATENDENTE',
          conteudo: message,
        },
      });

      // Envia a mensagem de volta para o cliente via WhatsApp (usando o serviço que você criará)
      await sendWhatsAppMessage(conversa.clienteId, message);
      console.log(`[Socket.IO] Mensagem do atendente para ${conversa.clienteId}: ${message}`);

      // Emite a mensagem de volta para a sala no painel (para manter o histórico atualizado)
      io.to(conversa.id).emit('admin:chat_update', {
        conversaId: conversa.id,
        message: novaMensagem,
      });

    } catch (error) {
      console.error('Erro ao enviar mensagem do atendente:', error);
    }
  });

  // Evento do PAINEL: Atendente finaliza o chat
  socket.on('admin:end_chat', async ({ conversaId }) => {
    try {
      await prisma.conversaAtendimento.update({
        where: { id: conversaId },
        data: { status: 'FINALIZADO' },
      });
      // Notifica o bot que o chat foi finalizado
      io.emit('bot:chat_ended', { conversaId }); // Bot pode usar isso para limpar estado
      io.emit('admin:chat_list_update'); // Atualiza a lista no painel
      console.log(`[Socket.IO] Chat ${conversaId} finalizado.`);
    } catch (error) {
      console.error('Erro ao finalizar chat:', error);
    }
  });

  // Evento do PAINEL: Atendente entra em uma sala de chat para ver as mensagens
  socket.on('admin:join_chat_room', (conversaId) => {
    socket.join(conversaId);
    console.log(`[Socket.IO] ${socket.id} entrou na sala de chat: ${conversaId}`);
  });

  // Evento do PAINEL: Atendente sai de uma sala de chat
  socket.on('admin:leave_chat_room', (conversaId) => {
    socket.leave(conversaId);
    console.log(`[Socket.IO] ${socket.id} saiu da sala de chat: ${conversaId}`);
  });

  socket.on('disconnect', () => {
    console.log(`📡 Cliente desconectado do Socket.IO: ${socket.id}`);
  });
});

// Sobe o servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🔥 Servidor rodando em http://localhost:${PORT}`);
});