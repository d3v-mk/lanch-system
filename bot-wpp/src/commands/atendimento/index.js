// bot-wpp/src/commands/atendimento/index.js

const { estadosDeConversa } = require('@config/state');
const mensagens = require('@utils/mensagens'); // Importa o objeto 'mensagens'
const { io } = require('@bot/socket');
const { sendMessage } = require('@core/messageSender'); // Importa a função sendMessage do seu módulo

/**
 * Lida com o comando /atendimento, solicitando o atendimento humano.
 * @param {object} sock A instância do Baileys 'sock'.
 * @param {object} msg O objeto da mensagem recebida.
 * @returns {boolean} Sempre retorna true, pois o comando foi tratado.
 */
async function handleAtendimentoCommand(sock, msg) {
  const userId = msg.key.remoteJid;
  const clientName = msg.pushName || userId.split('@')[0];
  
  const texto = msg.message?.conversation || msg.message?.extendedTextMessage?.text || ''; 

  // Define o estado da conversa para aguardando_atendente
  estadosDeConversa.set(userId, { etapa: 'aguardando_atendente', dados: {} });

  console.log(`[Comando Atendimento] Cliente ${clientName} (${userId}) solicitou atendimento humano.`);

  // Envia a notificação para o backend via Socket.IO
  // Esta mensagem NÃO vai para o cliente, então NÃO está no mensagens.js
  try {
    io.emit('bot:chat_message', {
      userId,
      message: `**Solicitação de Atendimento:** O cliente *${clientName}* (${userId.split('@')[0]}) solicitou falar com um atendente.`,
      type: "SISTEMA",
      clientName: clientName,
    });
    console.log(`[Comando Atendimento] Notificação de atendimento para ${clientName} ENVIADA ao backend.`);
  } catch (socketError) {
    console.error(`[Comando Atendimento] ERRO ao emitir notificação para o backend para ${clientName}:`, socketError);
  }

  // Envia uma mensagem de confirmação para o cliente no WhatsApp
  // Agora usando a função centralizada sendMessage do messageSender
  await sendMessage(sock, userId, { text: mensagens.gerais.aguardeAtendimentoHumano }, 'Comando Atendimento');

  return true;
}

module.exports = {
  name: 'atendimento',
  description: 'Solicita atendimento com um atendente humano.',
  handle: handleAtendimentoCommand,
};