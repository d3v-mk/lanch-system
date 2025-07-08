const { DisconnectReason } = require('@whiskeysockets/baileys');
const { deleteAuthFolder } = require('./auth');
const { onMessage } = require('../handlers/onMessageHandler'); // <-- NOVO: Importa seu handler principal!

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
    
    // **NOVO**: Adiciona um filtro inicial para mensagens que não contêm conteúdo
    if (!msg.message) {
      console.log(`[DEBUG] Mensagem sem conteúdo principal de ${msg.key.remoteJid}. Ignorando.`);
      return;
    }

    const texto = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    const sender = msg.key.remoteJid;

    console.log(`📨 Mensagem recebida de ${sender}: "${texto}"`);
    
    // **NOVO**: Filtra mensagens enviadas pelo próprio bot e mensagens de status de transmissão
    if (!msg.key.fromMe && sender !== 'status@broadcast') {
      // Opcional: Se quiser ignorar grupos por enquanto, adicione a linha abaixo
      // if (sender.endsWith('@g.us')) {
      //   console.log(`[DEBUG] Mensagem de grupo de ${sender} ignorada.`);
      //   return;
      // }

      // --- AQUI É ONDE SEU HANDLER PRINCIPAL É CHAMADO ---
      console.log(`[DEBUG] Encaminhando mensagem de ${sender} para onMessageHandler.`);
      try {
        await onMessage(sock, msg); // <-- CHAMA SEU HANDLER PRINCIPAL AQUI!
        console.log(`[DEBUG] onMessageHandler executado para ${sender}.`);
      } catch (handlerError) {
        console.error(`[ERRO CRÍTICO] Falha ao processar mensagem em onMessageHandler para ${sender}:`, handlerError);
        // Opcional: Enviar uma mensagem de erro genérica de volta ao usuário se desejar
        // try {
        //   await sock.sendMessage(sender, { text: "Desculpe, ocorreu um erro interno ao processar sua solicitação." });
        // } catch (sendError) {
        //   console.error(`[ERRO CRÍTICO] Falha ao enviar mensagem de erro de fallback para ${sender}:`, sendError);
        // }
      }
    } else {
      console.log(`[DEBUG] Mensagem filtrada (fromMe ou status): ${sender}.`);
    }
  });
}

module.exports = { setupSockEvents };