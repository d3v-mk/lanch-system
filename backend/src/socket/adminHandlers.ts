// backend/src/socket/adminHandlers.ts
import { Server, Socket } from 'socket.io';

/**
 * Configura os handlers para eventos administrativos de salas.
 * @param io Instância do Socket.IO Server
 * @param socket Instância do Socket conectado
 */
export const setupAdminHandlers = (io: Server, socket: Socket) => {

  // Evento do PAINEL: Atendente entra em uma sala de chat para ver as mensagens
  socket.on('admin:join_chat_room', (conversaId) => {
    socket.join(conversaId);
    console.log(`[Socket.IO - Admin] ${socket.id} entrou na sala de chat: ${conversaId}`);
  });

  // Evento do PAINEL: Atendente sai de uma sala de chat
  socket.on('admin:leave_chat_room', (conversaId) => {
    socket.leave(conversaId);
    console.log(`[Socket.IO - Admin] ${socket.id} saiu da sala de chat: ${conversaId}`);
  });
};