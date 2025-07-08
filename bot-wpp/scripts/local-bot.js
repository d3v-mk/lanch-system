require('dotenv').config();
require('module-alias/register');

const readline = require('readline');
const { onMessage } = require('../src/handlers/onMessageHandler.js'); // Importa corretamente a função onMessage

// Mock do sock (cliente WhatsApp) turbo atualizado pra não travar
const mockSock = {
  sendPresenceUpdate: async (status, jid) => {
    // console.log(`[MOCK] sendPresenceUpdate chamado com status='${status}', jid='${jid}'`); // Descomente para depurar
  },
  sendMessage: async (jid, content) => {
    console.log(`[MOCK SÓCIO] Mensagem para ${jid}:`, content); // Saída mais clara para sendMessage
  },
  // adiciona aqui mais mocks se precisar (ex: sendReaction, sendReadReceipt...)
};

// Classe mock da mensagem, com estrutura que o handler espera
class MockMessage {
  constructor(body, from) {
    this.key = {
      remoteJid: from,
      fromMe: false, // Mensagens do cliente não são 'fromMe'
      id: 'fake-msg-id-' + Math.random().toString(36).slice(2), // ID único para cada mensagem mock
    };
    this.message = {
      conversation: body, // Baileys usa 'conversation' para mensagens de texto simples
    };
    this.body = body; // Propriedade 'body' direta para facilitar acesso no handler
    this.pushName = 'Cliente Teste'; // Nome do usuário para simulação
  }

  // Se você tiver uma função reply no seu handler, pode mockar aqui também
  async reply(text) {
    console.log(`[BOT RESPONDEU] ${text}`);
    // Opcional: Você pode querer que a resposta do bot seja processada de volta como uma mensagem 'fromMe'
    // const botReplyMsg = new MockMessage(text, this.key.remoteJid);
    // botReplyMsg.key.fromMe = true;
    // await onMessage(mockSock, botReplyMsg);
  }
}

// Função que simula envio da mensagem pro handler, agora com sock
async function simulateMessage(text, from, sock) {
  const mockMsg = new MockMessage(text, from);
  console.log(`\n>> [${usuarios[from] || from.split('@')[0]}] Enviando: "${text}"`);
  
  // CORREÇÃO: Inverter a ordem dos argumentos para (sock, msg)
  await onMessage(sock, mockMsg); 
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

let currentUserId = '5511999992222@c.us'; // Usuário padrão de teste

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

  await simulateMessage(line, currentUserId, mockSock); // Passando sock como último argumento

  rl.prompt();
}).on('close', () => {
  console.log('Bot local encerrado');
  process.exit(0);
});