// bot-wpp/src/bot/socket.js
const { io } = require('socket.io-client');
const { estadosDeConversa } = require('../config/state'); // Para limpar o estado
const { sock } = require('./index'); // Importa o 'sock' para enviar mensagem de volta ao cliente

const API_URL = process.env.API_URL || 'http://localhost:3000'; // URL do seu Backend
const socket = io(API_URL); // Conecta o cliente Socket.IO do bot ao backend

socket.on('connect', () => {
  console.log('[Bot Socket] Conectado ao backend via Socket.IO');
});

socket.on('disconnect', () => {
  console.log('[Bot Socket] Desconectado do backend via Socket.IO');
});

// Evento do backend: Chat humano finalizado
socket.on('bot:chat_ended', async ({ conversaId, userId }) => {
  // Usa o userId que o backend pode ter passado, ou tenta encontrar no seu mapa
  let clienteJid = userId;
  if (!clienteJid) {
    // Se o userId não veio, você pode ter que iterar sobre estadosDeConversa
    // para encontrar a conversa associada ao conversaId (se você armazenou)
    // Isso pode ser mais complexo se você não salvou o conversaId no estado do cliente
    for (const [jid, estado] of estadosDeConversa.entries()) {
      if (estado.etapa === 'em_atendimento_humano' /* && estado.conversaId === conversaId */) {
        clienteJid = jid;
        break;
      }
    }
  }

  if (clienteJid) {
    estadosDeConversa.delete(clienteJid); // Limpa o estado do cliente no bot
    if (sock) { // Garante que o sock está disponível
      await sock.sendMessage(clienteJid, { text: mensagens.gerais.atendimentoFinalizado });
    }
    console.log(`[Bot Socket] Atendimento finalizado para ${clienteJid}. Estado do bot limpo.`);
  }
});

module.exports = { io: socket }; // Exporta a instância do socket client