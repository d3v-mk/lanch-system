// src/commands/pedir/etapas/escolherItem.js

const { pegarProdutoPorNome } = require('../services/produtoService');
const { normalizeStringForSearch } = require('@utils/normalizeText');

async function handleEscolherItem(msg, sock, estado) {
  const userId = msg.key.remoteJid;
  const itemEscolhidoOriginal = msg.body.trim();

  // Usa a função normalizeStringForSearch importada
  const itemParaBusca = normalizeStringForSearch(itemEscolhidoOriginal);

  console.log(`[DEBUG] Item escolhido (original): "${itemEscolhidoOriginal}"`);
  console.log(`[DEBUG] Item para busca (normalizado): "${itemParaBusca}"`); // Removi a descrição extensa para clareza no log
  
  const produtoEncontrado = await pegarProdutoPorNome(itemParaBusca);

  console.log(`[DEBUG] Produto encontrado (do DB/mock):`, produtoEncontrado);

  if (produtoEncontrado) {
    if (!estado.dados.carrinho) {
      estado.dados.carrinho = [];
    }

    estado.dados.carrinho.push({
      nome: produtoEncontrado.nome, // Usa o nome exato do produto retornado pelo DB
      produtoId: produtoEncontrado.id,
      precoUnitario: produtoEncontrado.preco,
      quantidade: 0,
    });

    estado.etapa = 'aguardando_algo_mais';
    await sock.sendMessage(userId, { text: `"${produtoEncontrado.nome}" adicionado ao seu pedido! Algo mais? Digite o nome de outro item ou "não" para prosseguir.` });
    return true;

  } else {
    await sock.sendMessage(userId, { text: `Desculpe, não temos *${itemEscolhidoOriginal}* em nosso cardápio. Por favor, escolha outro item.` });
    estado.etapa = 'aguardando_item';
    return true;
  }
}

module.exports = { handleEscolherItem };