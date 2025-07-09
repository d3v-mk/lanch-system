// src/handlers/fallbackHandler.js
const { sendMessage } = require('@core/messageSender');
const mensagens = require('@utils/mensagens');

async function handleFallback(sock, userId, estadoAtual) {
  if (!estadoAtual) {
    console.log(`[${userId.split('@')[0]}] Mensagem sem estado e sem comando. Enviando menu inicial.`);
    await sendMessage(sock, userId, { text: mensagens.gerais.menuInicial }, `${userId.split('@')[0]} - Menu Inicial`);
    return true;
  } else {
    console.log(`[${userId.split('@')[0]}] Mensagem não tratada, mas com estado existente: ${estadoAtual.etapa}.`);
    // Opcional: avisar o usuário que a mensagem não foi entendida no contexto atual
    // await sendMessage(sock, userId, { text: mensagens.erros.naoEntendido || "Desculpe, não entendi. Por favor, digite /menu para ver as opções." }, `${userId.split('@')[0]} - Fallback Nao Entendido`);
    return false; // Não foi um fallback "tratado" no sentido de dar uma resposta genérica, mas apenas logado
  }
}

module.exports = { handleFallback };