/**
 * ================================================================
 * 🎮 Simulador de Bot Local (modo terminal) para testes no Arkevia
 * ================================================================
 * 
 * Este script permite testar os comandos do bot localmente via terminal,
 * sem precisar escanear QR Code do WhatsApp ou subir o backend.
 * 
 * 🧪 Ideal para:
 * - Testar comandos rapidamente com diferentes usuários fake
 * - Debugar a lógica do `onMessage.js` no ambiente local
 * - Simular interação como se fosse no WhatsApp
 * 
 * 👤 Exemplo:
 * >> /login user 123456
 * >> /user 5511999998888@c.us
 * >> /status
 * 
 * 💻 Como rodar:
 * 3. No terminal, rode:
 *    node caminho/para/este/script.js
 * 
 * ⚠️ Importante:
 * - O `onMessage` deve aceitar objetos com `.body` e `.reply()`
 * - O sistema pode ser expandido pra simular grupos, botões, etc.
 */

require('dotenv').config();
require('module-alias/register');

const readline = require('readline');
const onMessage = require('../src/handlers/onMessageHandler.js');

// Mock do sock (cliente WhatsApp) turbo atualizado pra não travar
const mockSock = {
  sendPresenceUpdate: async (status, jid) => {
    console.log(`[MOCK] sendPresenceUpdate chamado com status='${status}', jid='${jid}'`);
  },
  sendMessage: async (jid, content) => {
    console.log(`[MOCK] sendMessage para ${jid} com conteúdo:`, content);
  },
  // adiciona aqui mais mocks se precisar (ex: sendReaction, sendReadReceipt...)
};

// Classe mock da mensagem, com estrutura que o handler espera
class MockMessage {
  constructor(body, from) {
    this.key = {
      remoteJid: from,
      fromMe: false,
      id: 'fake-msg-id-' + Math.random().toString(36).slice(2),
    };
    this.message = {
      conversation: body,
    };
    this.body = body;
    this.from = from;
  }

  async reply(text) {
    console.log(`[BOT RESPONDEU] ${text}`);
  }
}

// Função que simula envio da mensagem pro handler, agora com sock
async function simulateMessage(text, from, sock) {
  const mockMsg = new MockMessage(text, from);
  await onMessage(mockMsg, sock);
}

// Usuários fake pra simular troca
const usuarios = {
  '5511999992222@c.us': 'mk',
  '5511999991111@c.us': 'dev-mk',
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '>> '
});

console.log('Bot local iniciado. Digite comandos tipo /login nome senha');
console.log('Para testar como outro usuário, digite: /user <whatsappId>');
console.log('Usuários disponíveis:', Object.keys(usuarios).join(', '));

let currentUserId = '5511999992222@c.us';

rl.prompt();

rl.on('line', async (line) => {
  line = line.trim();

  if (line.startsWith('/user ')) {
    const userId = line.split(' ')[1];
    if (usuarios[userId]) {
      currentUserId = userId;
      console.log(`[INFO] Usuário atual setado para ${usuarios[userId]} (${currentUserId})`);
    } else {
      console.log(`[ERRO] Usuário desconhecido. Use um dos disponíveis: ${Object.keys(usuarios).join(', ')}`);
    }
    rl.prompt();
    return;
  }

  await simulateMessage(line, currentUserId, mockSock);

  rl.prompt();
}).on('close', () => {
  console.log('Bot local encerrado');
  process.exit(0);
});
