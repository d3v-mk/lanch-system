// src/commands/pedir/etapas/escolherItem.js

const { pegarProdutoPorNome } = require('../services/produtoService'); // Importa o serviço para buscar produtos
const { normalizeStringForSearch } = require('@utils/normalizeText'); // Importa função para normalizar texto
const mensagens = require('@utils/mensagens'); // OK: Mensagens para o cliente
const { sendMessage } = require('@core/messageSender'); // NOVO: Importa a função sendMessage

// CORREÇÃO: A ordem dos parâmetros deve ser (sock, msg, estado)
async function handleEscolherItem(sock, msg, estado) {
  const userId = msg.key.remoteJid;
  const clientName = msg.pushName || userId.split('@')[0];
  
  // CORREÇÃO: Extrair o texto da mensagem de forma robusta
  const textoOriginalDaMensagem = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
  
  // Normaliza o texto para busca (ex: remove acentos, caixa alta/baixa)
  const itemParaBusca = normalizeStringForSearch(textoOriginalDaMensagem);

  console.log(`[Escolher Item] Processando para ${clientName} (${userId}). Mensagem Original: "${textoOriginalDaMensagem}"`);
  console.log(`[Escolher Item] Item para busca (normalizado): "${itemParaBusca}"`);
  console.log('Dados do estado de escolher item:', JSON.stringify(estado.dados));

  // --- Lógica para processar a seleção do item ---
  // Esta função agora espera que o usuário já tenha digitado o item
  if (!itemParaBusca) {
    // Se o texto estiver vazio, pede para o usuário digitar um item
    // REFATORADO: Usando sendMessage e mensagens.pedido.perguntarItem
    await sendMessage(sock, userId, { text: mensagens.pedido.perguntarItem }, 'Escolher Item - Mensagem Vazia');
    estado.etapa = 'aguardando_selecao_item'; // Mantém ou define a etapa para aguardar seleção
    console.log(`[Escolher Item] Mensagem vazia, solicitando item para ${clientName}.`);
    return true;
  }

  try {
    const produtoEncontrado = await pegarProdutoPorNome(itemParaBusca);

    console.log(`[Escolher Item] Produto encontrado (do DB/mock):`, produtoEncontrado);

    if (produtoEncontrado) {
      if (!estado.dados.carrinho) {
        estado.dados.carrinho = [];
      }

      // Adiciona o item ao carrinho com quantidade inicial 0
      estado.dados.carrinho.push({
        nome: produtoEncontrado.nome, // Usa o nome exato do produto retornado pelo DB
        produtoId: produtoEncontrado.id,
        precoUnitario: produtoEncontrado.preco,
        quantidade: 0, // Inicia com 0, a quantidade será perguntada depois
      });

      // Avança para a etapa de perguntar "algo mais?"
      estado.etapa = 'aguardando_algo_mais';
      // REFATORADO: Usando sendMessage e mensagens.pedido.itemAdicionado (que é uma função)
      await sendMessage(sock, userId, { text: mensagens.pedido.itemAdicionado(produtoEncontrado.nome) }, 'Escolher Item - Adicionado');
      console.log(`[Escolher Item] Item '${produtoEncontrado.nome}' adicionado ao carrinho para ${clientName}.`);
      return true;

    } else {
      // Item não encontrado
      // REFATORADO: Usando sendMessage e mensagens.pedido.itemNaoEncontrado
      await sendMessage(sock, userId, { text: mensagens.pedido.itemNaoEncontrado }, 'Escolher Item - Nao Encontrado');
      estado.etapa = 'aguardando_item'; // Permanece na etapa de aguardar item (ou pode voltar para 'aguardando_selecao_item')
      console.log(`[Escolher Item] Item '${textoOriginalDaMensagem}' não encontrado para ${clientName}.`);
      return true; // Continua na mesma etapa
    }
  } catch (error) {
    console.error(`[Escolher Item] ERRO ao buscar produto para ${clientName}:`, error);
    // REFATORADO: Usando sendMessage e mensagens.erros.erroInterno
    await sendMessage(sock, userId, { text: mensagens.erros.erroInterno }, 'Escolher Item - Erro Busca');
    // Opcional: Limpar o estado ou voltar para uma etapa segura
    return false;
  }
}

module.exports = { handleEscolherItem };