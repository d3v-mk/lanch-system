// bot-wpp/src/core/messageSender.js

// Importa o objeto 'mensagens' para acessar o conteúdo das mensagens
const mensagens = require('@utils/mensagens'); 

/**
 * Envia uma mensagem de conteúdo variável (texto, imagem, etc.) para um JID específico.
 * Esta é a função principal para enviar qualquer tipo de mensagem via Baileys.
 *
 * @param {object} sock A instância do Baileys 'sock' (cliente).
 * @param {string} jid O JID do destinatário (ex: '5511999998888@s.whatsapp.net').
 * @param {object} messageContent O objeto de conteúdo da mensagem do Baileys (ex: { text: 'Olá!' }, { image: buffer, caption: 'Foto' }).
 * @param {string} [logContext='MessageSender'] Contexto para o log, útil para depuração.
 */
async function sendMessage(sock, jid, messageContent, logContext = 'MessageSender') {
  try {
    await sock.sendMessage(jid, messageContent);
    // Para logs, mostra uma prévia do conteúdo, se for texto
    const logMessage = messageContent.text ? `"${messageContent.text.substring(0, 50)}..."` : JSON.stringify(messageContent);
    console.log(`[${logContext}] Mensagem ENVIADA para ${jid.split('@')[0]}: ${logMessage}`);
  } catch (sendError) {
    console.error(`[${logContext}] ERRO CRÍTICO: Falha ao enviar mensagem para ${jid.split('@')[0]}:`, sendError);
    // Aqui você pode decidir se quer ou não tentar enviar uma mensagem de erro genérica.
    // Em alguns casos, um erro de envio pode significar que a conexão está totalmente inoperante,
    // e tentar enviar outra mensagem de erro pode falhar novamente.
  }
}

/**
 * Envia uma mensagem de erro padrão para o cliente, baseada em uma chave do objeto 'mensagens.erros'.
 * @param {object} sock A instância do Baileys 'sock'.
 * @param {string} jid O JID do destinatário.
 * @param {string} errorKey A chave da mensagem de erro no objeto 'mensagens.erros'.
 * @param {string} [logContext='MessageSender'] Contexto para o log.
 */
async function sendErrorMessage(sock, jid, errorKey, logContext = 'MessageSender') {
    // Tenta buscar a mensagem de erro pela chave, se não encontrar, usa 'erroGenerico' ou uma fallback.
    const errorMessageText = mensagens.erros[errorKey] || mensagens.erros.erroGenerico || "Ocorreu um erro inesperado.";
    await sendMessage(sock, jid, { text: errorMessageText }, logContext);
}

/**
 * Envia uma mensagem de imagem para o cliente.
 * @param {object} sock A instância do Baileys 'sock'.
 * @param {string} jid O JID do destinatário.
 * @param {Buffer} buffer O buffer da imagem.
 * @param {string} [caption=''] A legenda da imagem.
 * @param {string} [logContext='MessageSender'] Contexto para o log.
 */
async function sendImageMessage(sock, jid, buffer, caption = '', logContext = 'MessageSender') {
  try {
    await sock.sendMessage(jid, { image: buffer, caption: caption });
    console.log(`[${logContext}] Imagem ENVIADA para ${jid.split('@')[0]}.`);
  } catch (error) {
    console.error(`[${logContext}] ERRO CRÍTICO: Falha ao enviar imagem para ${jid.split('@')[0]}:`, error);
    // Lança o erro para que o chamador possa tratá-lo, se necessário.
    throw new Error('Falha ao enviar imagem pelo bot.');
  }
}


module.exports = { 
  sendMessage, 
  sendErrorMessage,
  sendImageMessage // Exporta a nova função de envio de imagem
};