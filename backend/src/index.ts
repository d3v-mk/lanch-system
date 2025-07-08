// backend/src/index.ts
import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import apiRoutes from './routes/api';


dotenv.config();

const app = express();
const server = http.createServer(app); // wrap express no http
const io = new Server(server, {
  cors: {
    origin: '*', // Libera tudo por enquanto, ideal ajustar
  },
});

// Exporta io pra usar em qualquer rota
export { io };

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

// Conexão socket.io (debug)
io.on('connection', (socket) => {
  console.log(`📡 Novo cliente conectado: ${socket.id}`);
});

// Sobe o servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🔥 Servidor rodando em http://localhost:${PORT}`);
});
