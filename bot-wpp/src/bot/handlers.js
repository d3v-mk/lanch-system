// bot-wpp/src/bot/handlers.js
const dotenv = require('dotenv');
dotenv.config();

const { DisconnectReason } = require('@whiskeysockets/baileys');
// Importa APENAS onMessage (não mais isBotFullyOnline)
const { onMessage } = require('../handlers/onMessageHandler'); 
const { deleteAuthFolder } = require('./auth');


function setupSockEvents(
  sock,
  io,
  saveCreds,
  setBotStatus,
  getBotStatus, // <--- Este é o que vamos usar para o controle de fluxo
  setLastQr,
  getLastQr,
  setBotOnlineFunc, // Este ainda é setBotOnlineTimestamp
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
      setBotStatus('conectado'); // Primeiro, atualiza o status para 'conectado'
      setLastQr(null);
      io.emit('bot_qrcode', null);
      io.emit('bot_status', 'conectado');

      // Chamar a função para registrar o timestamp de online APÓS o status ser 'conectado'
      if (setBotOnlineFunc && typeof setBotOnlineFunc === 'function') {
        setBotOnlineFunc(); // Isso define `botOnlineTimestamp` em `onMessageHandler`
        console.log('[DEBUG] setBotOnlineTimestamp chamado ao ficar online.');
      }
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
    
    if (!msg.message) {
      console.log(`[DEBUG] Mensagem sem conteúdo principal de ${msg.key.remoteJid}. Ignorando.`);
      return;
    }

    const texto = msg.message.conversation || msg.message.extendedTextMessage?.text || 
                  msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || 
                  '';

    const sender = msg.key.remoteJid;

    console.log(`📨 Mensagem recebida de ${sender}: "${texto}"`);
    
    // --- VERIFICAÇÃO DO STATUS DO BOT ANTES de encaminhar para onMessageHandler ---
    // Apenas se o bot estiver no estado 'conectado' ele deve processar mensagens.
    // Isso deve ser suficiente para evitar que onMessage seja chamado muito cedo.
    if (getBotStatus() !== 'conectado') { 
        console.log(`[DEBUG] Mensagem de ${sender} ignorada: Bot não está no status 'conectado'. Status atual: ${getBotStatus()}`);
        return; 
    }
    // --- FIM DA VERIFICAÇÃO ---

    // Filtra mensagens enviadas pelo próprio bot e mensagens de status de transmissão
    if (!msg.key.fromMe && sender !== 'status@broadcast') {
      // Opcional: Se quiser ignorar grupos por enquanto, adicione a linha abaixo
      // if (sender.endsWith('@g.us')) {
      //   console.log(`[DEBUG] Mensagem de grupo de ${sender} ignorada.`);
      //   return;
      // }

      console.log(`[DEBUG] Encaminhando mensagem de ${sender} para onMessageHandler.`);
      try {
        await onMessage(sock, msg);
        console.log(`[DEBUG] onMessageHandler executado para ${sender}.`);
      } catch (handlerError) {
        console.error(`[ERRO CRÍTICO] Falha ao processar mensagem em onMessageHandler para ${sender}:`, handlerError);
      }
    } else {
      console.log(`[DEBUG] Mensagem filtrada (fromMe ou status): ${sender}.`);
    }
  });
}

module.exports = { setupSockEvents };