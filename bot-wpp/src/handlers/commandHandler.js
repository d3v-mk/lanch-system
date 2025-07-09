// src/handlers/commandHandler.js
const { sendErrorMessage } = require('@core/messageSender'); // Usar o novo messageSender
const mensagens = require('@utils/mensagens');

async function handleCommand(sock, msg, commands, userId, body) {
  if (!body.startsWith('/')) {
    return false; // Não é um comando
  }

  const [commandName, ...argsRaw] = body.slice(1).split(' ');
  const command = commands[commandName];

  if (command && typeof command.handle === 'function') {
    console.log(`[${userId.split('@')[0]}] Executando comando: /${commandName}`);
    try {
      await command.handle(sock, msg, argsRaw);
      console.log(`[${userId.split('@')[0]}] Comando /${commandName} executado com SUCESSO.`);
    } catch (commandError) {
      console.error(`[${userId.split('@')[0]}] ERRO ao executar comando /${commandName}:`, commandError);
      await sendErrorMessage(sock, userId, 'erroInterno', `${userId.split('@')[0]} - Command Exec`);
    }
    return true; // Comando tratado
  } else {
    console.log(`[${userId.split('@')[0]}] Comando desconhecido ou handler ausente: /${commandName}`);
    await sendErrorMessage(sock, userId, 'comandoDesconhecido', `${userId.split('@')[0]} - Command Desconhecido`);
    return true; // Mensagem tratada como comando desconhecido
  }
}

module.exports = { handleCommand };