// src/handlers/onMessageHandler.js

const path = require('path');
const { estadosDeConversa } = require('@config/state');
const conversationHandler = require('@handlers/conversationHandler');
const { loadCommands } = require('@core/commandLoader');
const { getMessageBody, getUserId, logMessageInfo } = require('@utils/messageUtils');
const { handleCommand } = require('@handlers/commandHandler');
const { handleFallback } = require('@handlers/fallbackHandler');

// Carregamento dos comandos uma única vez ao iniciar o módulo
const commandsDir = path.join(__dirname, '../commands');
const commands = loadCommands(commandsDir);

// --- Parte para o modo de desenvolvimento ---
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const ALLOWED_DEV_NUMBER = process.env.ALLOWED_DEV_NUMBER;


async function onMessage(sock, msg) {
  // Lógica para ignorar mensagens de status, suas próprias mensagens, etc.
  if (msg.key.remoteJid === 'status@broadcast' || msg.key.fromMe) {
    return;
  }

  const userId = getUserId(msg);
  const body = getMessageBody(msg);

  // --- Adicione esta verificação aqui ---
  if (IS_DEVELOPMENT && userId !== ALLOWED_DEV_NUMBER) {
    console.log(`[DEV_MODE] Mensagem ignorada de ${userId.split('@')[0]}. Somente ${ALLOWED_DEV_NUMBER.split('@')[0]} é permitido em dev.`);
    return; // Ignora a mensagem se não for o número permitido em modo dev
  }
  // --- Fim da verificação ---

  // Logs para depuração
  logMessageInfo(userId, body, estadosDeConversa.get(userId));
  console.log(`[onMessageHandler] estadosDeConversa keys:`, Array.from(estadosDeConversa.keys()));

  // --- 1. Tentar lidar com o fluxo de conversa ---
  console.log(`[${userId.split('@')[0]}] Tentando conversationHandler...`);
  const conversationHandled = await conversationHandler(sock, msg, null);

  if (conversationHandled) {
    console.log(`[${userId.split('@')[0]}] Mensagem TRATADA por conversationHandler.`);
    return; // Mensagem já tratada, não prossiga
  }

  console.log(`[${userId.split('@')[0]}] Mensagem NÃO tratada por conversationHandler. Verificando comandos...`);

  // --- 2. Tentar lidar com comandos ---
  const commandHandled = await handleCommand(sock, msg, commands, userId, body);
  if (commandHandled) {
    return; // Comando processado ou erro de comando
  }

  console.log(`[${userId.split('@')[0]}] Mensagem não é um comando. Verificando fallback...`);

  // --- 3. Lógica padrão/fallback ---
  const estadoAtual = estadosDeConversa.get(userId);
  await handleFallback(sock, userId, estadoAtual);
}

module.exports = { onMessage };