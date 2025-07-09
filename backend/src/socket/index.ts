// backend/src/socket/index.ts
import { Server as SocketIOServer, Socket } from 'socket.io';
import { setupChatHandlers } from './chatHandlers';
import { setupAdminHandlers } from './adminHandlers';

/**
 * Configura todos os listeners de eventos Socket.IO para um novo cliente conectado.
 * @param io Instância do Socket.IO Server
 * @param socket Instância do Socket conectado
 */
export const setupSocketHandlers = (io: SocketIOServer, socket: Socket) => {
  console.log(`📡 Novo cliente conectado ao Socket.IO: ${socket.id}`);

  // Configura handlers de chat
  setupChatHandlers(io, socket);

  // Configura handlers administrativos
  setupAdminHandlers(io, socket);

  // Lógica de desconexão (pode ficar aqui ou em um arquivo separado se houver mais complexidade)
  socket.on('disconnect', () => {
    console.log(`📡 Cliente desconectado do Socket.IO: ${socket.id}`);
  });
};