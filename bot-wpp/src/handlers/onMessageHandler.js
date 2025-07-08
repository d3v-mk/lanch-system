// bot-wpp/src/handlers/onMessageHandler.js

const { estadosDeConversa } = require('@config/state');
const conversationHandler = require('./conversationHandler');
const mensagens = require('../utils/mensagens'); // Importe o módulo de mensagens
const fs = require('fs');   // Módulo para leitura de arquivos
const path = require('path'); // Módulo para lidar com caminhos de arquivos

// --- Carregamento Dinâmico de Comandos ---
const commands = {};
const commandsDir = path.join(__dirname, '../commands'); // Caminho para a pasta commands

// Lê todas as subpastas dentro de 'commands'
fs.readdirSync(commandsDir).forEach(dir => {
  const commandPath = path.join(commandsDir, dir, 'index.js');
  // Verifica se o 'index.js' existe dentro da subpasta do comando
  if (fs.existsSync(commandPath)) {
    try {
      const commandModule = require(commandPath);
      // O nome da pasta (dir) será o nome do comando
      commands[dir] = commandModule;
      console.log(`[Comandos] Comando /${dir} carregado com sucesso.`);
    } catch (loadError) {
      console.error(`[Comandos] ERRO ao carregar o comando /${dir} de ${commandPath}:`, loadError.message);
    }
  }
});
// --- Fim do Carregamento Dinâmico ---


async function onMessage(sock, msg) {
  // Lógica para ignorar mensagens de status, suas próprias mensagens, etc.
  if (msg.key.remoteJid === 'status@broadcast' || msg.key.fromMe) {
    return;
  }

  const userId = msg.key.remoteJid;
  // --- CORREÇÃO AQUI: Garante que 'body' capture o texto real da mensagem ---
  const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';

  // Logs para depuração
  console.log(`[${userId.split('@')[0]}] Mensagem recebida: "${body}"`); // Agora deve mostrar o comando
  console.log(`[${userId.split('@')[0]}] Estado atual (antes):`, estadosDeConversa.get(userId) ? estadosDeConversa.get(userId).etapa : 'Nenhum');
  console.log(`[onMessageHandler] estadosDeConversa keys:`, Array.from(estadosDeConversa.keys()));


  // --- 1. Tentar lidar com o fluxo de conversa (atendimento humano, pedidos, etc.) ---
  console.log(`[${userId.split('@')[0]}] Tentando conversationHandler...`);
  // O conversationHandler já espera 'msg' em vez de 'body' para extrair o texto internamente.
  const conversationHandled = await conversationHandler(sock, msg, null);

  if (conversationHandled) {
    console.log(`[${userId.split('@')[0]}] Mensagem TRATADA por conversationHandler.`);
    return; // Mensagem já tratada, não prossiga para comandos
  }

  console.log(`[${userId.split('@')[0]}] Mensagem NÃO tratada por conversationHandler. Verificando comandos...`);

  // --- 2. Tentar lidar com comandos (se a mensagem não foi tratada por conversa) ---
  if (body.startsWith('/')) { // Agora 'body' deve ter "/atendimento" ou "/pedir"
    const [commandName, ...argsRaw] = body.slice(1).split(' '); // Separa comando e argumentos
    const command = commands[commandName]; // Obtém o módulo do comando do mapa carregado dinamicamente

    if (command && typeof command.handle === 'function') {
      console.log(`[${userId.split('@')[0]}] Executando comando: /${commandName}`);
      try {
        // Chama a função 'handle' dentro do módulo do comando
        await command.handle(sock, msg, argsRaw);
        console.log(`[${userId.split('@')[0]}] Comando /${commandName} executado com SUCESSO.`);
      } catch (commandError) {
        console.error(`[${userId.split('@')[0]}] ERRO ao executar comando /${commandName}:`, commandError);
        try {
          await sock.sendMessage(userId, { text: mensagens.erros.erroInterno || "Ocorreu um erro ao processar seu comando." });
        } catch (sendError) {
          console.error(`[${userId.split('@')[0]}] ERRO CRÍTICO: Falha ao enviar mensagem de erro para o usuário:`, sendError);
        }
      }
    } else {
      console.log(`[${userId.split('@')[0]}] Comando desconhecido ou handler ausente: /${commandName}`);
      try {
        await sock.sendMessage(userId, { text: mensagens.erros.comandoDesconhecido });
        console.log(`[${userId.split('@')[0]}] Mensagem de 'comando desconhecido' ENVIADA.`);
      } catch (sendError) {
        console.error(`[${userId.split('@')[0]}] ERRO CRÍTICO: Falha ao enviar 'comando desconhecido' para o usuário:`, sendError);
      }
    }
    return; // Comando processado ou erro de comando, não faça mais nada
  }

  console.log(`[${userId.split('@')[0]}] Mensagem não é um comando. Verificando fallback...`);

  // --- 3. Lógica padrão/fallback (se não foi conversação nem comando) ---
  const estadoAtual = estadosDeConversa.get(userId);
  if (!estadoAtual) { // Se não há estado e não é comando, é uma nova interação
    console.log(`[${userId.split('@')[0]}] Mensagem sem estado e sem comando. Enviando menu inicial.`);
    try {
      await sock.sendMessage(userId, { text: mensagens.gerais.menuInicial }); // Sua mensagem de boas-vindas
      console.log(`[${userId.split('@')[0]}] Mensagem de 'menu inicial' ENVIADA.`);
    } catch (sendError) {
      console.error(`[${userId.split('@')[0]}] ERRO CRÍTICO: Falha ao enviar 'menu inicial' para o usuário:`, sendError);
    }
  } else {
    console.log(`[${userId.split('@')[0]}] Mensagem não tratada, mas com estado existente: ${estadoAtual.etapa}.`);
    // Opcional: Avisar o usuário que a mensagem não foi entendida no contexto atual
    // try {
    //   await sock.sendMessage(userId, { text: mensagens.erros.naoEntendido || "Desculpe, não entendi. Por favor, digite /menu para ver as opções." });
    //   console.log(`[${userId.split('@')[0]}] Mensagem de 'não entendido no estado' ENVIADA.`);
    // } catch (sendError) {
    //   console.error(`[${userId.split('@')[0]}] ERRO CRÍTICO: Falha ao enviar 'não entendido no estado' para o usuário:`, sendError);
    // }
  }
}

module.exports = { onMessage };