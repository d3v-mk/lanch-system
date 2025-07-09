// @bot/index.js
const makeWASocket = require('@whiskeysockets/baileys').default;
const P = require('pino');
const fs = require('fs');
const path = require('path');
const { getAuthState } = require('./auth');
// Importa setupSockEvents e, se você tiver uma nova função em handlers, adicione-a aqui
const { setupSockEvents } = require('./handlers'); 
const { setBotOnlineTimestamp } = require('@handlers/onMessageHandler'); // <--- Importe aqui!

let sock = null;
let botStatus = 'offline';
let lastQr = null;

function setBotStatus(status) { botStatus = status; }
function getBotStatus() { return botStatus; }
function setLastQr(qr) { lastQr = qr; }
function getLastQr() { return lastQr; }

/**
 * Inicia a conexão com o WhatsApp usando o Baileys.
 * @param {object} io A instância do Socket.IO para comunicação em tempo real.
 * @returns {Promise<object>} Uma Promise que resolve com a instância do Baileys 'sock'.
 */
async function startSock(io) {
  if (sock) {
    console.log('⚠️ Bot já está rodando, não iniciando de novo.');
    if (botStatus === 'qr' && lastQr) {
      console.log('🔄 Reenviando QR code em cache...');
      io.emit('bot_qrcode', lastQr);
    }
    return sock;
  }

  console.log('🚀 Iniciando conexão com o WhatsApp...');
  setBotStatus('iniciando');
  setLastQr(null);
  io.emit('bot_status', botStatus);

  const { state, saveCreds } = await getAuthState();

  sock = makeWASocket({
    logger: P({ level: 'silent' }),
    auth: state,
  });

  // Configura os listeners de eventos do sock (conexão, mensagens, etc.)
  // Passa setBotOnlineTimestamp como um novo argumento para setupSockEvents
  setupSockEvents(
    sock, 
    io, 
    saveCreds, 
    setBotStatus, 
    getBotStatus, 
    setLastQr, 
    getLastQr, 
    setBotOnlineTimestamp, // <--- NOVO: Passe a função aqui
    () => {
      // Callback para quando a conexão termina, tenta reconectar
      sock = null;
      console.log('🔌 Conexão do Baileys encerrada, tentando reconectar em 1 segundo...');
      setTimeout(() => startSock(io), 1000);
    }
  );

  return sock;
}

/**
 * Obtém o status atual do bot e o último QR Code gerado (se houver).
 * @returns {object} Um objeto contendo o status e o QR Code.
 */
function getStatus() {
  return { status: botStatus, qr: lastQr };
}

module.exports = { startSock, getStatus };