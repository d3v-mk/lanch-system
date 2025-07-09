// src/core/commandLoader.js
const fs = require('fs');
const path = require('path');

function loadCommands(commandsDir) {
  const commands = {};
  fs.readdirSync(commandsDir).forEach(dir => {
    const commandPath = path.join(commandsDir, dir, 'index.js');
    if (fs.existsSync(commandPath)) {
      try {
        const commandModule = require(commandPath);
        commands[dir] = commandModule;
        console.log(`[Comandos] Comando /${dir} carregado com sucesso.`);
      } catch (loadError) {
        console.error(`[Comandos] ERRO ao carregar o comando /${dir} de ${commandPath}:`, loadError.message);
      }
    }
  });
  return commands;
}

module.exports = { loadCommands };