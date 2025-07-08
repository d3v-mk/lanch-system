// bot-wpp/src/commands/atendimento/index.js (CORRIGIDO)

const { estadosDeConversa } = require('@config/state');
const mensagens = require('@utils/mensagens');
const { io } = require('@bot/socket');

/**
 * Lida com o comando /atendimento, solicitando o atendimento humano.
 * @param {object} sock A instância do Baileys 'sock'.
 * @param {object} msg O objeto da mensagem recebida.
 * @returns {boolean} Sempre retorna true, pois o comando foi tratado.
 */
async function handleAtendimentoCommand(sock, msg) {
  const userId = msg.key.remoteJid;
  const clientName = msg.pushName || userId.split('@')[0];
  
  // --- CORREÇÃO AQUI: Obter o texto da mensagem de forma robusta ---
  const texto = msg.message?.conversation || msg.message?.extendedTextMessage?.text || ''; 
  // Agora 'texto' terá o valor de '/atendimento' ou será uma string vazia se não houver texto.
  // O .trim() será chamado apenas se 'texto' não for undefined.

  // Define o estado da conversa para aguardando_atendente
  estadosDeConversa.set(userId, { etapa: 'aguardando_atendente', dados: {} });

  console.log(`[Comando Atendimento] Cliente ${clientName} (${userId}) solicitou atendimento humano.`);

  // Envia a notificação para o backend via Socket.IO
  try { // Adicionado try/catch para a emissão Socket.IO para depuração
    io.emit('bot:chat_message', {
      userId,
      message: `**Solicitação de Atendimento:** O cliente *${clientName}* (${userId.split('@')[0]}) solicitou falar com um atendente.`,
      type: "SISTEMA", // Indica que esta mensagem é do sistema do bot
      clientName: clientName,
    });
    console.log(`[Comando Atendimento] Notificação de atendimento para ${clientName} ENVIADA ao backend.`);
  } catch (socketError) {
    console.error(`[Comando Atendimento] ERRO ao emitir notificação para o backend para ${clientName}:`, socketError);
  }


  // Envia uma mensagem de confirmação para o cliente no WhatsApp
  try { // Adicionado try/catch para sendMessage para depuração
    await sock.sendMessage(userId, { text: mensagens.gerais.aguardeAtendimentoHumano });
    console.log(`[Comando Atendimento] Mensagem de 'aguarde atendimento' ENVIADA para ${clientName}.`);
  } catch (sendError) {
    console.error(`[Comando Atendimento] ERRO CRÍTICO: Falha ao enviar 'aguarde atendimento' para ${clientName}:`, sendError);
  }

  return true; // Indica que o comando foi tratado
}

module.exports = {
  name: 'atendimento', // Nome do comando
  description: 'Solicita atendimento com um atendente humano.',
  handle: handleAtendimentoCommand,
};