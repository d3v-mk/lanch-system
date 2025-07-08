// onMessageHandler.js
const path = require('path');
const carregarComandos = require('@core/commandLoader');
const middlewares = require('@middleware/loader');
const { normalizeStringForSearch } = require('@utils/normalizeText');
const handleConversationState = require('@handlers/conversationHandler');
const mensagens = require('@utils/mensagens');
const { estadosDeConversa } = require('@config/state'); // O Map compartilhado

const commandsDir = path.resolve(__dirname, '../commands');
const commands = carregarComandos(commandsDir);

async function onMessage(msg, sock) {
  const texto = (msg.body || '').trim();
  const userId = msg.key.remoteJid;

  console.log(`[${userId}] Estado atual:`, estadosDeConversa.get(userId));
  console.log('[onMessageHandler] estadosDeConversa keys:', Array.from(estadosDeConversa.keys()));

  if (!texto) {
    await sock.sendMessage(userId, { text: 'Não entendi sua mensagem, pode tentar de novo?' });
    return;
  }

  const args = texto.split(' ').slice(1).map(normalizeStringForSearch);

  // 1) Primeiro tenta tratar fluxo (estado da conversa)
  if (estadosDeConversa.has(userId)) {
    // handleConversationState agora retorna true se o fluxo continua, ou false se terminou e o estado foi limpo.
    const conversationContinues = await handleConversationState(msg, args, sock);

    // Se a conversa continua (conversationContinues é true), significa que a mensagem foi tratada pelo fluxo.
    // Se a conversa NÃO continua (conversationContinues é false), significa que o fluxo terminou e o estado foi limpo.
    // Em ambos os casos, a mensagem já foi "consumida" pelo fluxo de conversa.
    if (conversationContinues === true || conversationContinues === false) {
      return; // Sai do onMessage, pois a mensagem já foi tratada pelo fluxo de conversa
    }
    // Se handleConversationState retornasse undefined ou algo inesperado, o fluxo continuaria abaixo.
    // Mas com a lógica atual, ele sempre retornará true ou false.
  }

  // 2) Depois roda middlewares
  for (const middleware of middlewares) {
    const resultado = await middleware(msg, sock);
    if (resultado) return resultado;
  }

  // 3) Processa comando
  const [cmdRaw, ...argsRaw] = texto.split(' ');
  const cmd = normalizeStringForSearch(cmdRaw);
  const argsOriginais = argsRaw;
  let comando = null;

  for (let i = argsRaw.length; i >= 0; i--) {
    const tentativa = [cmd, ...argsRaw.slice(0, i)].join(' ');
    comando = commands[normalizeStringForSearch(tentativa)];
    if (comando) {
      argsRaw.splice(0, i);
      break;
    }
  }

  if (comando) {
    return comando(msg, argsRaw, sock, argsOriginais);
  }

  // 4) Se começou com '/' mas comando não existe
  if (cmd.startsWith('/')) {
    return msg.reply(mensagens.gerais.comandoDesconhecido);
  }

  // 5) Se mensagem normal, responde padrão
  await sock.sendMessage(userId, { text: 'Oi! Digite /ajuda para ver os comandos disponíveis.' });
}

module.exports = onMessage;