const { useMultiFileAuthState } = require('@whiskeysockets/baileys');
const path = require('path');

const AUTH_FOLDER = path.resolve(__dirname, '../auth');

async function getAuthState() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
  return { state, saveCreds };
}

function deleteAuthFolder() {
  const fs = require('fs');
  if (fs.existsSync(AUTH_FOLDER)) {
    fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
    console.log('🧹 Pasta de autenticação deletada com sucesso!');
  }
}

module.exports = { getAuthState, deleteAuthFolder };
