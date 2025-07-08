const makeWASocket = require('@whiskeysockets/baileys').default;
const P = require('pino');
const fs = require('fs');
const path = require('path');
const { getAuthState } = require('./auth');
const { setupSockEvents } = require('./handlers');

let sock = null;

let botStatus = 'offline';
let lastQr = null;

function setBotStatus(status) { botStatus = status; }
function getBotStatus() { return botStatus; }
function setLastQr(qr) { lastQr = qr; }
function getLastQr() { return lastQr; }

async function startSock(io) {
  if (sock) {
    console.log('⚠️ Bot já está rodando, não iniciando de novo');
    if (botStatus === 'qr' && lastQr) {
      console.log('🔄 Reenviando QR code em cache...');
      io.emit('bot_qrcode', lastQr);
    }
    return;
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

  setupSockEvents(sock, io, saveCreds, setBotStatus, getBotStatus, setLastQr, getLastQr, () => {
    sock = null; // Libera para reconexão
    setTimeout(() => startSock(io), 1000);
  });
}

function getStatus() {
  return { status: botStatus, qr: lastQr };
}

module.exports = { startSock, getStatus };
