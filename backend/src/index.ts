// backend/src/index.ts
import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import apiRoutes from './routes/api';
import prisma from './prismaClient';
import { sendWhatsAppMessage } from './services/whatsappService'; 
import { setupSocketHandlers } from './socket';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', 
    methods: ['*'],
  },
});

export { io };

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas da API REST
app.use('/api', apiRoutes);

// Lógica de Conexão e Eventos Socket.IO
io.on('connection', (socket) => {
  // Chama a função centralizada para configurar todos os listeners para este socket
  setupSocketHandlers(io, socket); // <-- AGORA CHAMANDO O MÓDULO EXTERNO
});

// Sobe o servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🔥 Servidor rodando em http://localhost:${PORT}`);
});