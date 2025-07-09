// src/utils/messageUtils.js

function getMessageBody(msg) {
  return msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
}

function getUserId(msg) {
  return msg.key.remoteJid;
}

function logMessageInfo(userId, body, state) {
  console.log(`[${userId.split('@')[0]}] Mensagem recebida: "${body}"`);
  console.log(`[${userId.split('@')[0]}] Estado atual (antes):`, state ? state.etapa : 'Nenhum');
}

module.exports = {
  getMessageBody,
  getUserId,
  logMessageInfo
};