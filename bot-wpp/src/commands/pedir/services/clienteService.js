const axios = require('axios')

async function buscarCliente(telefone) {
  try {
    const res = await axios.get(`http://localhost:3000/api/clientes?telefone=${telefone}`)
    return res.data?.[0] || null
  } catch (e) {
    console.error('Erro ao buscar cliente:', e)
    throw e
  }
}

async function criarCliente(nome, telefone, endereco) {
  try {
    const novoCliente = { nome, telefone, endereco }
    const res = await axios.post('http://localhost:3000/api/clientes', novoCliente)
    return res.data
  } catch (e) {
    console.error('Erro ao criar cliente:', e)
    throw e
  }
}

module.exports = {
  buscarCliente,
  criarCliente,
}
