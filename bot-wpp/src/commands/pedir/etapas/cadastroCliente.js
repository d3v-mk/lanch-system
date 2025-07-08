const { buscarCliente, criarCliente } = require('../services/clienteService')
const { estadosDeConversa } = require('@config/state')

async function handleCadastroCliente(msg, sock, estado) {
  const userId = msg.key.remoteJid
  const telefone = userId.replace('@c.us', '')
  const texto = msg.body.trim()

  if (!estado.clienteBuscado) {
    const cliente = await buscarCliente(telefone)
    estado.clienteBuscado = true

    if (cliente) {
      estado.cliente = cliente
      estado.etapa = 'aguardando_item'
    } else {
      estado.etapa = 'perguntar_nome'
      await sock.sendMessage(userId, {
        text: 'Olá! Para finalizar seu cadastro, qual seu nome completo?',
      })
    }
    return true
  }

  if (estado.etapa === 'perguntar_nome' && !estado.nomeCliente) {
    estado.nomeCliente = texto
    estado.etapa = 'perguntar_endereco'
    await sock.sendMessage(userId, {
      text: `Obrigado, ${texto}. Agora, qual o seu endereço?`,
    })
    return true
  }

  if (estado.etapa === 'perguntar_endereco' && !estado.enderecoCliente) {
    estado.enderecoCliente = texto
    try {
      const novoCliente = await criarCliente(
        estado.nomeCliente,
        telefone,
        estado.enderecoCliente
      )
      estado.cliente = novoCliente
      estado.etapa = 'aguardando_item'
      await sock.sendMessage(userId, {
        text: 'Cadastro realizado com sucesso! Agora, qual item você deseja pedir?',
      })
    } catch {
      await sock.sendMessage(userId, {
        text: 'Erro ao criar seu cadastro. Tente novamente mais tarde.',
      })
      estadosDeConversa.delete(userId)
    }
    return true
  }

  return true
}

module.exports = { handleCadastroCliente }
