// src/commands/pedir/fluxoPedido.js


const { handleCadastroCliente } = require('./etapas/cadastroCliente');
const { handleEscolherItem } = require('./etapas/escolherItem');
const { handleEscolherQuantidade } = require('./etapas/escolherQuantidade');
const { handleConfirmarPedido } = require('./etapas/confirmarPedido');
const { handleConfirmarEndereco } = require('./etapas/confirmarEndereco');
const { estadosDeConversa } = require('@config/state');
const mensagens = require('@utils/mensagens'); // Certifique-se de que este caminho está correto

// CORREÇÃO: A ordem dos parâmetros deve ser (sock, msg, args, estado)
async function fluxoPedido(sock, msg, args, estado) {
  const userId = msg.key.remoteJid; // 'msg' agora é o objeto de mensagem correto
  const clientName = msg.pushName || userId.split('@')[0];
  // CORREÇÃO: Extrair o texto da mensagem de forma robusta
  const texto = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
  const textoLowerCase = texto.trim().toLowerCase(); // Use a versão robusta do texto

  console.log(`[Fluxo Pedido] Processando etapa '${estado.etapa}' para ${clientName} (${userId}). Mensagem: "${texto}"`);
  console.log('fluxoPedido: dados do estado:', JSON.stringify(estado.dados));

  // --- Lógica de Cadastro de Cliente ---
  // Verifica se o cliente não está cadastrado OU se a etapa é de cadastro
  if (!estado.cliente || ['perguntar_nome', 'perguntar_endereco'].includes(estado.etapa)) {
    console.log(`[Fluxo Pedido] Entrando em lógica de cadastro para ${clientName}.`);

    // Se o cliente digitou algo que parece um item antes de se cadastrar
    if (String(estado.etapa).trim() === 'aguardando_item' && texto && !estado.dados.itemTemporario) {
      console.log(`[Fluxo Pedido] Detectado item temporário durante cadastro: "${texto}"`);
      estado.dados.itemTemporario = texto; // Armazena o texto completo, não msg.body
    }

    // Chama o handler de cadastro de cliente, passando sock e msg na ordem correta
    const cadastroResult = await handleCadastroCliente(sock, msg, estado); // Passa sock e msg
    
    // Se o cadastro foi concluído E havia um item temporário
    if (cadastroResult === true && estado.cliente && estado.dados.itemTemporario) {
      console.log(`[Fluxo Pedido] Processando item temporário após cadastro concluído: "${estado.dados.itemTemporario}"`);
      
      // Cria uma nova mensagem "fake" para simular a entrada do item
      const tempMsg = {
        key: msg.key, // Mantém as chaves originais
        message: { conversation: estado.dados.itemTemporario }, // Conteúdo do item temporário
        body: estado.dados.itemTemporario, // Adiciona body para compatibilidade
        pushName: msg.pushName // Mantém o nome do cliente
      };
      
      delete estado.dados.itemTemporario; // Limpa o item temporário
      estado.etapa = 'aguardando_item'; // Volta para a etapa de aguardar item
      console.log(`[Fluxo Pedido] Redirecionando para handleEscolherItem com item temporário.`);
      // Chama handleEscolherItem com a mensagem "fake" e a ordem correta dos parâmetros
      return await handleEscolherItem(sock, tempMsg, estado);
    }
    console.log(`[Fluxo Pedido] Resultado do cadastro para ${clientName}: ${cadastroResult}`);
    return cadastroResult; // Retorna o resultado do cadastro (true se continua, false se terminou)
  }

  // --- Etapa 'aguardando_algo_mais' ---
  if (estado.etapa === 'aguardando_algo_mais') {
    console.log(`[Fluxo Pedido] Em etapa 'aguardando_algo_mais' para ${clientName}.`);
    if (textoLowerCase === 'não' || textoLowerCase === 'nao') {
      if (!estado.dados.carrinho || estado.dados.carrinho.length === 0) {
        await sock.sendMessage(userId, { text: mensagens.erros.carrinhoVazio || 'Seu carrinho está vazio. Por favor, comece um novo pedido digitando /pedir.' });
        estadosDeConversa.delete(userId);
        return false;
      }
      estado.etapa = 'aguardando_quantidade_carrinho'; // Ou 'confirmar' se não há mais itens para quantidade
      const itemParaProcessar = estado.dados.carrinho.find(item => item.quantidade === 0);
      if (itemParaProcessar) {
        await sock.sendMessage(userId, { text: `Certo! Agora, qual a quantidade de *${itemParaProcessar.nome}*?` });
      } else {
        estado.etapa = 'confirmar'; // Se por algum motivo já não tiver itens, vai direto pra confirmar
        console.log(`[Fluxo Pedido] Todos os itens com quantidade, indo para 'confirmar'.`);
      }
      // Se a etapa mudou para 'confirmar', chame o handler correspondente no mesmo ciclo
      if (estado.etapa === 'confirmar') {
        console.log(`[Fluxo Pedido] Indo para handleConfirmarPedido após 'não' em 'aguardando_algo_mais'.`);
        return await handleConfirmarPedido(sock, msg, estado); // Passa sock e msg
      }
      return true; // Continua aguardando se a etapa não mudou para 'confirmar'
    } else {
      estado.etapa = 'aguardando_item';
      console.log(`[Fluxo Pedido] Indo para handleEscolherItem após 'sim' em 'aguardando_algo_mais'.`);
      return await handleEscolherItem(sock, msg, estado); // Passa sock e msg
    }
  }

  // --- Lógica de Processamento de Itens no Carrinho (quantidade) ---
  if (estado.etapa === 'aguardando_quantidade_carrinho') {
      console.log(`[Fluxo Pedido] Em etapa 'aguardando_quantidade_carrinho' para ${clientName}.`);
      // Passa sock e msg para handleEscolherQuantidade
      const result = await handleEscolherQuantidade(sock, msg, estado);
      
      if (result === false) { // Se handleEscolherQuantidade retornou false, significa que ele já mudou a etapa
          if (estado.etapa === 'confirmar') { // Confirma que a etapa é 'confirmar'
              console.log(`[Fluxo Pedido] Indo para handleConfirmarPedido após aguardar quantidade.`);
              return await handleConfirmarPedido(sock, msg, estado); // Passa sock e msg
          }
          console.log(`[Fluxo Pedido] handleEscolherQuantidade retornou false, mas etapa não é 'confirmar'.`);
          return true; // Se result for false e não for confirmar, continua aguardando
      }
      console.log(`[Fluxo Pedido] handleEscolherQuantidade retornou TRUE, ainda aguardando quantidades.`);
      return true; // Se result for true, ele ainda espera mais quantidades
  }

  // --- Lógica do Fluxo de Pedido (após cliente cadastrado e sem as etapas acima) ---
  // A ordem dessas verificações é importante!
  if (String(estado.etapa).trim() === 'aguardando_item') {
    console.log(`[Fluxo Pedido] Em etapa 'aguardando_item' para ${clientName}.`);
    return await handleEscolherItem(sock, msg, estado); // Passa sock e msg
  }

  if (estado.etapa === 'confirmar') {
    console.log(`[Fluxo Pedido] Em etapa 'confirmar' para ${clientName}.`);
    return await handleConfirmarPedido(sock, msg, estado); // Passa sock e msg
  }

  if (
    estado.etapa === 'confirmar_endereco' ||
    estado.etapa === 'aguardando_novo_endereco' ||
    estado.etapa === 'aguardando_confirmacao_final_endereco'
  ) {
    console.log(`[Fluxo Pedido] Em etapa de confirmação de endereço para ${clientName}.`);
    return await handleConfirmarEndereco(sock, msg, estado); // Passa sock e msg
  }

  console.log('🚨 etapa não reconhecida no fluxoPedido: ', JSON.stringify(estado.etapa));
  console.log('🚨 tipo: ', typeof estado.etapa);
  // Se chegou aqui, a etapa não foi reconhecida.
  // Opcional: Enviar uma mensagem de erro ou resetar o fluxo.
  await sock.sendMessage(userId, { text: mensagens.erros.erroInterno || "Desculpe, ocorreu um erro inesperado no fluxo do pedido. Por favor, tente novamente digitando /pedir." });
  estadosDeConversa.delete(userId); // Limpa o estado para evitar loops
  return false; // Indica que o fluxo terminou com erro
}

module.exports = fluxoPedido;
