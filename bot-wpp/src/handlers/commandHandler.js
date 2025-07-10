// src/handlers/commandHandler.js

// Importa a função de envio de mensagem de erro.
// Certifique-se de que '@core/messageSender' está mapeado corretamente para o seu sendErrorMessage.
const { sendErrorMessage } = require('@core/messageSender'); 
// Importa o módulo de mensagens para acesso a outras utilidades, se necessário.
const mensagens = require('@utils/mensagens');

/**
 * Manipula a execução de comandos.
 * @param {object} sock - O objeto cliente do Baileys (sock).
 * @param {object} msg - O objeto da mensagem recebida do WhatsApp.
 * @param {object} commands - Um objeto contendo todos os comandos carregados.
 * @param {string} userId - O JID do usuário que enviou a mensagem.
 * @param {string} body - O corpo da mensagem.
 * @returns {boolean} - Retorna true se a mensagem foi um comando e foi tratada, false caso contrário.
 */
async function handleCommand(sock, msg, commands, userId, body) {
  // Verifica se a mensagem começa com '/' para identificar um comando.
  if (!body.startsWith('/')) {
    return false; // Não é um comando, não faz nada.
  }

  // Extrai o nome do comando e os argumentos da mensagem.
  const [commandName, ...argsRaw] = body.slice(1).split(' ');
  // Busca o objeto do comando no mapa de comandos carregados.
  const command = commands[commandName];

  // Verifica se o comando existe e se possui uma função 'handle' válida.
  if (command && typeof command.handle === 'function') {
    console.log(`[${userId.split('@')[0]}] Executando comando: /${commandName}`);
    try {
      // CORREÇÃO AQUI: Passa um único objeto para o handler do comando.
      // Este objeto contém 'client' (que é o 'sock'), 'message' (o 'msg' original),
      // e 'args' (os argumentos brutos do comando).
      await command.handle({ client: sock, message: msg, args: argsRaw });
      console.log(`[${userId.split('@')[0]}] Comando /${commandName} executado com SUCESSO.`);
    } catch (commandError) {
      // Em caso de erro na execução do comando, loga o erro e envia uma mensagem de erro ao usuário.
      console.error(`[${userId.split('@')[0]}] ERRO ao executar comando /${commandName}:`, commandError);
      await sendErrorMessage(sock, userId, 'erroInterno', `${userId.split('@')[0]} - Command Exec`);
    }
    return true; // Indica que a mensagem foi um comando e foi tratada.
  } else {
    // Se o comando não for encontrado ou não tiver um handler válido.
    console.log(`[${userId.split('@')[0]}] Comando desconhecido ou handler ausente: /${commandName}`);
    // Envia uma mensagem informando que o comando é desconhecido.
    await sendErrorMessage(sock, userId, 'comandoDesconhecido', `${userId.split('@')[0]} - Command Desconhecido`);
    return true; // Indica que a mensagem foi tratada como um comando (desconhecido).
  }
}

// Exporta a função para ser usada em outros módulos.
module.exports = { handleCommand };
