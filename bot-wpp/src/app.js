// bot-wpp/src/app.js
console.log('app.js carregado');

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);

const { router: botRoutesRouter, setBaileysSock } = require('@routes/botRoutes');
// NOVO: Importar a função setBotOnlineTimestamp
const { startSock } = require('./bot/index');
const { setBotOnlineTimestamp } = require('./handlers/onMessageHandler'); // <--- Adicione esta linha


app.use(cors());
app.use(express.json());

app.use('/api', botRoutesRouter);

async function initializeBotAndRoutes() {
  try {
    // Passa a instância 'io' E A FUNÇÃO setBotOnlineTimestamp para startSock
    const sockInstance = await startSock(io, setBotOnlineTimestamp); // <--- Modificado aqui
    setBaileysSock(sockInstance);
    console.log('Bot Baileys inicializado e instância do sock definida em botRoutes.');
  } catch (error) {
    console.error('Erro ao inicializar o bot Baileys:', error);
  }
}

initializeBotAndRoutes();

const PORT = process.env.BOT_PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Bot API rodando em http://localhost:${PORT}`);
});