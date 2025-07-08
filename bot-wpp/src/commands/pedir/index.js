const fluxoPedido = require('./fluxoPedido')
const { estadosDeConversa } = require('@config/state')

async function pedir(msg, args, sock) {
  const userId = msg.key.remoteJid

  if (estadosDeConversa.has(userId)) {
    const estado = estadosDeConversa.get(userId)
    if (estado.handler) {
      return estado.handler(msg, args, sock, estado)
    }
  } else {
    estadosDeConversa.set(userId, {
      etapa: 'aguardando_item',
      dados: {},
      handler: fluxoPedido,
    })
    console.log('Novo estado setado:', estadosDeConversa.get(userId))
    await sock.sendMessage(userId, { text: 'Opa! O que você gostaria de pedir?' })
  }
}

module.exports = pedir
