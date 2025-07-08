

const fs = require('fs');
const path = require('path');

const dir = __dirname;

const arquivos = fs
  .readdirSync(dir)
  .filter(f => f !== 'loader.js' && f.endsWith('.js'));

module.exports = arquivos.map(file => require(path.join(dir, file)));
