/**
 *
 * Responsável por carregar dinamicamente todos os comandos e subcomandos do bot.
 * 
 * 🧠 Como funciona:
 * - Percorre recursivamente a pasta de comandos (ex: /commands).
 * - Para cada arquivo `.js`, cria uma rota de comando baseada na estrutura da pasta.
 * - Exemplo:
 *     - commands/loja/index.js        → /loja
 *     - commands/loja/subcommands/consumiveis.js → /loja consumiveis
 * - Normaliza os nomes dos comandos (sem acento e tudo minúsculo).
 * - Cada comando é armazenado num objeto, onde a chave é o nome do comando e o valor é a função handler.
 * 
 * ✅ Resultado:
 * - Um objeto contendo todos os comandos prontos pra serem roteados no `onMessageHandler.js`.
 * - Totalmente modular, escalável e desacoplado.
 */


const fs = require('fs');
const path = require('path');

const { normalizeStringForSearch } = require('@utils/normalizeText'); // <--- AQUI ESTÁ A CORREÇÃO!

function carregarComandos(dir, baseCommand = '') {
  const commands = {};
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      const pastaComoComando = baseCommand + '/' + file;
      Object.assign(commands, carregarComandos(fullPath, pastaComoComando));
    } else if (file.endsWith('.js')) {
      const nomeBase = file.replace('.js', '');

      let commandName;
      if (nomeBase === 'index') {
        // Se for 'index', o nome do comando é a base da pasta ou '/index'
        commandName = baseCommand || '/index';
      } else {
        // Concatena a base da pasta e o nome do arquivo
        commandName = (baseCommand ? baseCommand + ' ' : '') + nomeBase;
      }
      // Garante que o comando comece com '/' se não for o caso
      if (!commandName.startsWith('/')) commandName = '/' + commandName;

      // --- USO DA FUNÇÃO COM O NOME CORRETO ---
      commands[normalizeStringForSearch(commandName)] = require(fullPath).default || require(fullPath); // <--- AQUI TAMBÉM!
    }
  }
  return commands;
}

module.exports = carregarComandos;