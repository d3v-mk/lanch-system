const axios = require('axios')

async function pegarProdutoPorNome(nome) {
  try {
    const res = await axios.get(`http://localhost:3000/api/produtos?nome=${encodeURIComponent(nome)}`)
    return res.data?.[0] || null
  } catch (e) {
    console.error('Erro ao buscar produto:', e)
    return null
  }
}

module.exports = { pegarProdutoPorNome }
