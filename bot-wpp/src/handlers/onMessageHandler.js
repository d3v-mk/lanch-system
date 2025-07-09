// src/handlers/onMessageHandler.js

const path = require('path');
const { estadosDeConversa } = require('@config/state');
const conversationHandler = require('@handlers/conversationHandler');
const { loadCommands } = require('@core/commandLoader');
const { getMessageBody, getUserId, logMessageInfo } = require('@utils/messageUtils');
const { handleCommand } = require('@handlers/commandHandler');
const { handleFallback } = require('@handlers/fallbackHandler');

const commandsDir = path.join(__dirname, '../commands');
const commands = loadCommands(commandsDir);

const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const ALLOWED_DEV_NUMBER = process.env.ALLOWED_DEV_NUMBER;

// --- Única variável para o timestamp de online ---
let botOnlineTimestamp = null;

/**
 * Define o timestamp de quando o bot ficou online.
 * Esta função deve ser chamada APÓS o bot se conectar com sucesso.
 */
function setBotOnlineTimestamp() {
  botOnlineTimestamp = Date.now(); // Armazena o timestamp atual em milissegundos
  console.log(`[INIT] Bot online em: ${new Date(botOnlineTimestamp).toLocaleString()}`);
}

async function onMessage(sock, msg) {
  if (msg.key.remoteJid === 'status@broadcast' || msg.key.fromMe) {
    return;
  }

  const userId = getUserId(msg);
  const body = getMessageBody(msg);

  if (IS_DEVELOPMENT && userId !== ALLOWED_DEV_NUMBER) {
    console.log(`[DEV_MODE] Mensagem ignorada de ${userId.split('@')[0]}. Somente ${ALLOWED_DEV_NUMBER.split('@')[0]} é permitido em dev.`);
    return;
  }

  // --- Lógica para ignorar mensagens antigas (recebidas offline) ---
  // Esta verificação se baseia APENAS no timestamp da mensagem e do bot.
  // Ela será eficaz porque `onMessage` só será chamada quando o bot estiver "conectado".
  const messageTimestampInMs = msg.messageTimestamp ? msg.messageTimestamp * 1000 : null;

  if (botOnlineTimestamp && messageTimestampInMs && messageTimestampInMs < botOnlineTimestamp) {
    console.log(`[DEBUG] Mensagem de ${userId.split('@')[0]} ignorada. Enviada ${new Date(messageTimestampInMs).toLocaleString()} (antes do bot ficar online ${new Date(botOnlineTimestamp).toLocaleString()}).`);
    return; // Ignora a mensagem
  }
  // --- Fim da verificação ---


  logMessageInfo(userId, body, estadosDeConversa.get(userId));
  console.log(`[onMessageHandler] estadosDeConversa keys:`, Array.from(estadosDeConversa.keys()));

  console.log(`[${userId.split('@')[0]}] Tentando conversationHandler...`);
  const conversationHandled = await conversationHandler(sock, msg, null);

  if (conversationHandled) {
    console.log(`[${userId.split('@')[0]}] Mensagem TRATADA por conversationHandler.`);
    return;
  }

  console.log(`[${userId.split('@')[0]}] Mensagem NÃO tratada por conversationHandler. Verificando comandos...`);

  const commandHandled = await handleCommand(sock, msg, commands, userId, body);
  if (commandHandled) {
    return;
  }

  console.log(`[${userId.split('@')[0]}] Mensagem não é um comando. Verificando fallback...`);

  const estadoAtual = estadosDeConversa.get(userId);
  await handleFallback(sock, userId, estadoAtual);
}

module.exports = { onMessage, setBotOnlineTimestamp }; // <--- NÃO EXPORTA MAIS `isBotFullyOnline`