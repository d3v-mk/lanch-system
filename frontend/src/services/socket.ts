// frontend/src/services/socket.ts

import { io, Socket } from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:3000'; 

const socket: Socket = io(SOCKET_SERVER_URL, {
  // Opcional: Adicione quaisquer opções de conexão aqui
});

export default socket; 

// Funções utilitárias (opcionais, mas boas para ter)
export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
    console.log('Socket: Tentando reconectar...');
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    console.log('Socket: Desconectado.');
  }
};