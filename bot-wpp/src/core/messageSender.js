// src/core/messageSender.js
const mensagens = require('@utils/mensagens'); // Certifique-se de que o caminho está correto

async function sendMessage(sock, userId, messageContent, logContext = '') {
  try {
    await sock.sendMessage(userId, messageContent);
    console.log(`[${logContext}] Mensagem ENVIADA para ${userId.split('@')[0]}.`);
  } catch (sendError) {
    console.error(`[${logContext}] ERRO CRÍTICO: Falha ao enviar mensagem para ${userId.split('@')[0]}:`, sendError);
    // Opcional: tentar enviar uma mensagem de erro genérica aqui se a primeira falhar miseravelmente
    // (mas cuidado para não entrar em loop infinito de erros de envio)
  }
}

async function sendErrorMessage(sock, userId, errorType, logContext = '') {
    const errorMessage = mensagens.erros[errorType] || mensagens.erros.erroInterno || "Ocorreu um erro inesperado.";
    await sendMessage(sock, userId, { text: errorMessage }, logContext);
}

module.exports = { sendMessage, sendErrorMessage };