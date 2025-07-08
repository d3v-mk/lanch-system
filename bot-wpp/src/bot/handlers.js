const { DisconnectReason } = require('@whiskeysockets/baileys');
const { deleteAuthFolder } = require('./auth');

function setupSockEvents(
  sock,
  io,
  saveCreds,
  setBotStatus,
  getBotStatus,
  setLastQr,
  getLastQr,
  restartCallback
) {
  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('📱 Novo QR code gerado');
      setLastQr(qr);
      setBotStatus('qr');
      io.emit('bot_qrcode', qr);
      io.emit('bot_status', 'qr');
    }

    if (connection === 'open') {
      console.log('✅ Conectado com sucesso!');
      setBotStatus('conectado');
      setLastQr(null); // LIMPA o QR do cache
      io.emit('bot_qrcode', null); // Front-end remove o QR da tela
      io.emit('bot_status', 'conectado');
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      console.log(`⚠️ Conexão encerrada (code ${statusCode || 'desconhecido'})`);

      if (statusCode === DisconnectReason.loggedOut) {
        console.log('❌ Sessão inválida. Deletando auth e reiniciando...');
        deleteAuthFolder();

        setBotStatus('deslogado');
        io.emit('bot_status', 'deslogado');

        restartCallback();
      } else {
        console.log('🔄 Tentando reconectar...');
        restartCallback();
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const texto = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    const sender = msg.key.remoteJid;

    console.log(`📨 Mensagem recebida de ${sender}: ${texto}`);
    // Lógica de resposta vai aqui!
  });
}

module.exports = { setupSockEvents };
