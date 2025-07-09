// backend/src/socket/chatHandlers.ts
import { Server, Socket } from 'socket.io';
import prisma from '../prismaClient'; // Importe o Prisma Client
import { sendWhatsAppMessage } from '../services/whatsappService'; // Ajuste o caminho se whatsappService.ts for para a pasta services

/**
 * Configura os handlers para eventos de chat de cliente e atendente.
 * @param io Instância do Socket.IO Server
 * @param socket Instância do Socket conectado
 */
export const setupChatHandlers = (io: Server, socket: Socket) => {

  // Evento vindo do BOT: Cliente quer falar com atendente ou enviou mensagem em chat ativo
  socket.on('bot:chat_message', async ({ userId, message, type = 'CLIENTE', clientName = 'Cliente WhatsApp' }) => {
    try {
      let conversa = await prisma.conversaAtendimento.findFirst({
        where: { clienteId: userId, status: { in: ['PENDENTE', 'EM_ATENDIMENTO'] } },
      });

      if (!conversa) {
        conversa = await prisma.conversaAtendimento.create({
          data: {
            clienteId: userId,
            clienteNome: clientName,
            status: 'PENDENTE',
          },
        });
        io.emit('admin:new_chat_request', conversa);
        console.log(`[Socket.IO - Chat] Nova solicitação de chat do cliente ${userId}`);
      }

      const novaMensagem = await prisma.mensagemAtendimento.create({
        data: {
          conversaId: conversa.id,
          remetente: type,
          conteudo: message,
          // createdAt: new Date(), // Descomente se não tiver padrão no Prisma model
        },
      });

      io.to(conversa.id).emit('admin:chat_update', {
        conversaId: conversa.id,
        message: novaMensagem,
      });

      io.emit('admin:chat_list_update');
      console.log(`[Socket.IO - Chat] Mensagem do cliente ${userId} (${type}): ${message}`);

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
        console.error(`[Socket.IO - Chat] Conversa ${conversaId} não encontrada para envio de mensagem.`);
        return;
      }

      if (conversa.status === 'PENDENTE') {
        await prisma.conversaAtendimento.update({
          where: { id: conversaId },
          data: { status: 'EM_ATENDIMENTO', atendenteId: atendenteId },
        });
        io.emit('admin:chat_list_update');
      }

      const novaMensagem = await prisma.mensagemAtendimento.create({
        data: {
          conversaId: conversa.id,
          remetente: 'ATENDENTE',
          conteudo: message,
          // createdAt: new Date(), // Descomente se não tiver padrão no Prisma model
        },
      });

      await sendWhatsAppMessage(conversa.clienteId, message);
      console.log(`[Socket.IO - Chat] Mensagem do atendente para ${conversa.clienteId}: ${message}`);

      // Emite a mensagem de volta para a sala NO PAINEL, mas APENAS para os outros atendentes
      socket.broadcast.to(conversa.id).emit('admin:chat_update', {
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
      io.emit('bot:chat_ended', { conversaId });
      io.emit('admin:chat_list_update');
      console.log(`[Socket.IO - Chat] Chat ${conversaId} finalizado.`);
    } catch (error) {
      console.error('Erro ao finalizar chat:', error);
    }
  });
};