// src/commands/pedir/fluxoPedido.js

const { handleCadastroCliente } = require('./etapas/cadastroCliente');
const { handleEscolherItem } = require('./etapas/escolherItem');
const { handleEscolherQuantidade } = require('./etapas/escolherQuantidade');
const { handleConfirmarPedido } = require('./etapas/confirmarPedido');
const { handleConfirmarEndereco } = require('./etapas/confirmarEndereco');
const { estadosDeConversa } = require('@config/state');

async function fluxoPedido(msg, args, sock, estado) {
  const userId = msg.key.remoteJid;
  const texto = msg.body.trim().toLowerCase();

  console.log('fluxoPedido: etapa:', estado.etapa, 'dados:', JSON.stringify(estado.dados));

  // --- Lógica de Cadastro de Cliente ---
  if (!estado.cliente || ['perguntar_nome', 'perguntar_endereco'].includes(estado.etapa)) {
    if (String(estado.etapa).trim() === 'aguardando_item' && msg.body && !estado.dados.itemTemporario) {
      console.log('Detectado item temporário durante cadastro: ', msg.body);
      estado.dados.itemTemporario = msg.body;
    }
    const cadastroResult = await handleCadastroCliente(msg, sock, estado);
    if (cadastroResult === true && estado.dados.itemTemporario && estado.cliente) {
      console.log('Processando item temporário após cadastro concluído: ', estado.dados.itemTemporario);
      const tempMsg = {
        body: estado.dados.itemTemporario,
        from: msg.from,
        key: msg.key
      };
      delete estado.dados.itemTemporario;
      estado.etapa = 'aguardando_item';
      return await handleEscolherItem(tempMsg, sock, estado);
    }
    return cadastroResult;
  }

  // --- Etapa 'aguardando_algo_mais' ---
  if (estado.etapa === 'aguardando_algo_mais') {
    if (texto === 'não' || texto === 'nao') {
      if (!estado.dados.carrinho || estado.dados.carrinho.length === 0) {
        await sock.sendMessage(userId, { text: 'Seu carrinho está vazio. Por favor, comece um novo pedido digitando /pedir.' });
        estadosDeConversa.delete(userId);
        return false;
      }
      estado.etapa = 'aguardando_quantidade_carrinho';
      const itemParaProcessar = estado.dados.carrinho.find(item => item.quantidade === 0);
      if (itemParaProcessar) {
        await sock.sendMessage(userId, { text: `Certo! Agora, qual a quantidade de *${itemParaProcessar.nome}*?` });
      } else {
        estado.etapa = 'confirmar'; // Se por algum motivo já não tiver itens, vai direto pra confirmar
      }
      return true;
    } else {
      estado.etapa = 'aguardando_item';
      return await handleEscolherItem(msg, sock, estado);
    }
  }

  // --- Lógica de Processamento de Itens no Carrinho (quantidade) ---
  if (estado.etapa === 'aguardando_quantidade_carrinho') {
      const result = await handleEscolherQuantidade(msg, sock, estado);
      // Se handleEscolherQuantidade retornou false, significa que ele já
      // mudou a etapa para 'confirmar' (todos os itens têm quantidade).
      // Agora, reavalie a etapa atual para chamar a próxima handler NO MESMO CICLO.
      if (result === false) {
          // A etapa já foi alterada para 'confirmar'. Chame a handler correspondente.
          if (estado.etapa === 'confirmar') { // Confirma que a etapa é 'confirmar'
              return await handleConfirmarPedido(msg, sock, estado);
          }
          // Se não for 'confirmar', ou se houver outro estado que handleEscolherQuantidade
          // possa retornar false, você pode adicionar mais lógica aqui.
          return true; // Continua aguardando se a etapa não mudou para 'confirmar'
      }
      return true; // Se result for true, ele ainda espera mais quantidades
  }

  // --- Lógica do Fluxo de Pedido (após cliente cadastrado e sem as etapas acima) ---
  // A ordem dessas verificações é importante!
  if (String(estado.etapa).trim() === 'aguardando_item') {
    return await handleEscolherItem(msg, sock, estado);
  }

  if (estado.etapa === 'confirmar') {
    return await handleConfirmarPedido(msg, sock, estado);
  }

  if (
    estado.etapa === 'confirmar_endereco' ||
    estado.etapa === 'aguardando_novo_endereco' ||
    estado.etapa === 'aguardando_confirmacao_final_endereco'
  ) {
    return await handleConfirmarEndereco(msg, sock, estado);
  }

  console.log('🚨 etapa não reconhecida no fluxoPedido: ', JSON.stringify(estado.etapa));
  console.log('🚨 tipo: ', typeof estado.etapa);
  return false;
}

module.exports = fluxoPedido;