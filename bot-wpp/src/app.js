// bot-wpp/src/app.js
console.log('app.js carregado');

const express = require('express'); // Importa o Express
const http = require('http');       // Importa o módulo HTTP
const { Server } = require('socket.io'); // Importa o Socket.IO Server
const cors = require('cors');       // Para lidar com CORS

// Cria a instância do Express
const app = express();
// Cria um servidor HTTP usando a instância do Express
const server = http.createServer(app);

// Cria a instância do Socket.IO Server
const io = new Server(server, {
  cors: {
    origin: '*', // Permite todas as origens para desenvolvimento (ajuste em produção)
    methods: ['GET', 'POST'],
  },
});

// Agora que 'app' e 'io' estão definidos, podemos usá-los
app.set('io', io); // Seta a instância do Socket.IO no objeto 'app' do Express

// Importa as rotas e a função para setar o sock do Baileys
const { router: botRoutesRouter, setBaileysSock } = require('@routes/botRoutes');
const { startSock } = require('./bot/index'); // Importa startSock do seu bot/index

// Middlewares
app.use(cors());
app.use(express.json()); // Importante para receber o body das requisições POST

// Usa as rotas do bot
app.use('/api', botRoutesRouter);

// Lógica para iniciar o bot Baileys e setar a instância do sock
async function initializeBotAndRoutes() {
  try {
    const sockInstance = await startSock(io); // Passa a instância 'io' para startSock
    setBaileysSock(sockInstance); // Define a instância do sock no módulo de rotas
    console.log('Bot Baileys inicializado e instância do sock definida em botRoutes.');
  } catch (error) {
    console.error('Erro ao inicializar o bot Baileys:', error);
  }
}

// Inicia o bot e configura as rotas
initializeBotAndRoutes();

// Define a porta do servidor Express/Socket.IO do bot
const PORT = process.env.BOT_PORT || 3001; // Use uma porta diferente do backend principal (ex: 3001)

// Faz o servidor HTTP escutar na porta
server.listen(PORT, () => {
  console.log(`🚀 Bot API rodando em http://localhost:${PORT}`);
});

// Exporta o 'app' se outros módulos precisarem dele (porém, para um server, geralmente não é necessário exportar o 'app')
// O importante é que 'server.listen' está sendo chamado aqui.
// module.exports = app; // Se start.js apenas "requires" app.js e não o exporta.