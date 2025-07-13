// src/commands/pedir/etapas/confirmarEndereco.js

const axios = require('axios');
const { estadosDeConversa } = require('@config/state');
const mensagens = require('@utils/mensagens'); // OK: Importa mensagens para respostas
const { sendMessage } = require('@core/messageSender'); // NOVO: Importa a função sendMessage

// URL da API do seu backend para pedidos e clientes
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3000/api'; // Certifique-se que esta variável está no .env do BACKEND

// CORREÇÃO: A ordem dos parâmetros deve ser (sock, msg, estado)
async function handleConfirmarEndereco(sock, msg, estado) {
  const userId = msg.key.remoteJid; // 'msg' agora é o objeto de mensagem correto
  const clientName = msg.pushName || userId.split('@')[0];
  // CORREÇÃO: Extrair o texto da mensagem de forma robusta
  const textoOriginal = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
  const texto = textoOriginal.trim().toLowerCase();

  console.log(`[Confirmar Endereço] Processando para ${clientName} (${userId}). Etapa: '${estado.etapa}'. Mensagem: "${texto}"`);
  console.log('Dados do estado de confirmação de endereço:', JSON.stringify(estado.dados));

  // Função auxiliar para finalizar a conversa e enviar uma mensagem
  // REFATORADO: Usando sendMessage aqui também
  const finalizarConversa = async (messageText, logContext = 'Finalizar Conversa') => {
    try {
      await sendMessage(sock, userId, { text: messageText }, `Confirmar Endereço - ${logContext}`);
      console.log(`[Confirmar Endereço] Conversa finalizada para ${clientName} com mensagem: "${messageText}"`);
    } catch (sendError) {
      console.error(`[Confirmar Endereço] ERRO CRÍTICO: Falha ao enviar mensagem de finalização para ${clientName}:`, sendError);
    } finally {
      estadosDeConversa.delete(userId); // Limpa o estado
    }
    return false; // Indica que o fluxo terminou
  };

  // Função auxiliar para enviar o pedido para o backend
  const enviarPedido = async () => {
    console.log(`[Confirmar Endereço] Tentando enviar pedido para o backend para ${clientName}.`);
    try {
      const clienteId = estado.cliente.id;

      if (!estado.dados.carrinho || estado.dados.carrinho.length === 0) {
        console.error(`🚨 [Confirmar Endereço] Erro: Carrinho vazio ao tentar enviar o pedido para ${clientName}.`);
        // REFATORADO: Acessando diretamente mensagens.erros.carrinhoVazio
        return await finalizarConversa(mensagens.erros.carrinhoVazio, 'Erro Enviar Pedido - Carrinho Vazio');
      }

      // Mapeia os itens do carrinho para o formato esperado pela API de pedidos
      const itensDoPedido = estado.dados.carrinho.map(item => ({
        produtoId: item.produtoId,
        quantidade: parseInt(item.quantidade),
        // Recalcula subtotal final para garantir precisão
        subtotal: parseFloat(item.precoUnitario) * parseInt(item.quantidade)
      }));

      // CORREÇÃO: Usar BACKEND_API_URL
      const response = await axios.post(`${BACKEND_API_URL}/pedidos`, {
        clienteId,
        observacao: estado.dados.observacao || '',
        status: 'PENDENTE', // Ou outro status inicial
        itens: itensDoPedido,
        total: estado.dados.totalPedido // Inclui o total do pedido
      });

      console.log(`[Confirmar Endereço] Pedido enviado com sucesso para o backend para ${clientName}. Resposta:`, response.data);

      // MUDANÇA: Agora finaliza a conversa após o pedido completo
      // REFATORADO: Acessando diretamente mensagens.pedido.pedidoFinalizado
      return await finalizarConversa(mensagens.pedido.pedidoFinalizado, 'Pedido Enviado Sucesso');

    } catch (e) {
      console.error(`[Confirmar Endereço] ERRO ao enviar o pedido para ${clientName}:`, e.response?.data || e.message);
      // REFATORADO: Acessando diretamente mensagens.erros.erroInterno
      let mensagemErro = mensagens.erros.erroInterno;
      if (e.response && e.response.data && e.response.data.erro) {
        mensagemErro = `Erro ao finalizar pedido: ${e.response.data.erro}`;
      }
      return await finalizarConversa(mensagemErro, 'Erro Enviar Pedido - Backend');
    }
  };

  // --- Lógica para a etapa 'confirmar_endereco' ---
  if (estado.etapa === 'confirmar_endereco') {
    if (texto === 'sim') {
      console.log(`[Confirmar Endereço] Endereço confirmado por ${clientName}. Enviando pedido.`);
      return await enviarPedido();
    } else if (texto === 'não' || texto === 'nao') {
      estado.etapa = 'aguardando_novo_endereco';
      try {
        // REFATORADO: Usando sendMessage e mensagens.pedido.novoEnderecoPergunta
        await sendMessage(sock, userId, { text: mensagens.pedido.novoEnderecoPergunta }, 'Confirmar Endereco - Solicitar Novo');
        console.log(`[Confirmar Endereço] Solicitando novo endereço para ${clientName}.`);
      } catch (sendError) {
        console.error(`[Confirmar Endereço] ERRO CRÍTICO: Falha ao enviar 'novo endereço' para ${clientName}:`, sendError);
      }
      return true;
    } else {
      try {
        // REFATORADO: Usando sendMessage e mensagens.pedido.respostaInvalidaEndereco
        await sendMessage(sock, userId, { text: mensagens.pedido.respostaInvalidaEndereco }, 'Confirmar Endereco - Resposta Invalida');
        console.log(`[Confirmar Endereço] Resposta inválida de endereço de ${clientName}.`);
      } catch (sendError) {
        console.error(`[Confirmar Endereço] ERRO CRÍTICO: Falha ao enviar 'resposta inválida' para ${clientName}:`, sendError);
      }
      return true;
    }
  }

  // --- Lógica para a etapa 'aguardando_novo_endereco' ---
  if (estado.etapa === 'aguardando_novo_endereco') {
    const novoEndereco = textoOriginal.trim(); // Usar textoOriginal aqui para preservar a capitalização/formato
    if (novoEndereco.length < 5) { // Validação básica
      try {
        // REFATORADO: Usando sendMessage e mensagens.pedido.enderecoCurto
        await sendMessage(sock, userId, { text: mensagens.pedido.enderecoCurto }, 'Confirmar Endereco - Endereco Curto');
        console.log(`[Confirmar Endereço] Endereço muito curto de ${clientName}.`);
      } catch (sendError) {
        console.error(`[Confirmar Endereço] ERRO CRÍTICO: Falha ao enviar 'endereço curto' para ${clientName}:`, sendError);
      }
      return true;
    }

    try {
      // CORREÇÃO: Usar BACKEND_API_URL
      await axios.put(`${BACKEND_API_URL}/clientes/${estado.cliente.id}`, {
        endereco: novoEndereco
      });

      estado.cliente.endereco = novoEndereco; // Atualiza o endereço no estado

      estado.etapa = 'aguardando_confirmacao_final_endereco';
      try {
        // REFATORADO: Usando sendMessage e mensagens.pedido.enderecoAtualizadoSucesso
        await sendMessage(sock, userId, { text: mensagens.pedido.enderecoAtualizadoSucesso }, 'Confirmar Endereco - Atualizado Sucesso');
        // REFATORADO: Usando sendMessage e mensagens.pedido.perguntaConfirmarEndereco
        // A segunda mensagem usa a função de mensagem para formatar com o novo endereço
        await sendMessage(sock, userId, { text: mensagens.pedido.perguntaConfirmarEndereco(novoEndereco) }, 'Confirmar Endereco - Confirmar Novo');
        console.log(`[Confirmar Endereço] Endereço atualizado e solicitando confirmação final para ${clientName}.`);
      } catch (sendError) {
        console.error(`[Confirmar Endereço] ERRO CRÍTICO: Falha ao enviar 'endereço atualizado' para ${clientName}:`, sendError);
      }
      return true;

    } catch (e) {
      console.error(`[Confirmar Endereço] ERRO ao atualizar endereço para ${clientName}:`, e.response?.data || e.message);
      // REFATORADO: Acessando diretamente mensagens.erros.erroInterno
      return await finalizarConversa(mensagens.erros.erroInterno, 'Erro Atualizar Endereco - Backend');
    }
  }

  // --- Lógica para a etapa 'aguardando_confirmacao_final_endereco' ---
  if (estado.etapa === 'aguardando_confirmacao_final_endereco') {
    if (texto === 'sim') {
      console.log(`[Confirmar Endereço] Confirmação final de endereço por ${clientName}. Enviando pedido.`);
      return await enviarPedido();
    } else if (texto === 'não' || texto === 'nao') {
      estado.etapa = 'aguardando_novo_endereco';
      try {
        // REFATORADO: Usando sendMessage e mensagens.pedido.novoEnderecoPergunta
        await sendMessage(sock, userId, { text: mensagens.pedido.novoEnderecoPergunta }, 'Confirmar Endereco - Novo Endereco Apos Nao Confirmar');
        console.log(`[Confirmar Endereço] Solicitando novo endereço após não confirmar final para ${clientName}.`);
      } catch (sendError) {
        console.error(`[Confirmar Endereço] ERRO CRÍTICO: Falha ao enviar 'novo endereço após não confirmar' para ${clientName}:`, sendError);
      }
      return true;
    } else {
      try {
        // REFATORADO: Usando sendMessage e mensagens.pedido.respostaInvalidaEndereco
        await sendMessage(sock, userId, { text: mensagens.pedido.respostaInvalidaEndereco }, 'Confirmar Endereco - Resposta Invalida Final');
        console.log(`[Confirmar Endereço] Resposta inválida para confirmação final de endereço de ${clientName}.`);
      } catch (sendError) {
        console.error(`[Confirmar Endereço] ERRO CRÍTICO: Falha ao enviar 'resposta inválida final' para ${clientName}:`, sendError);
      }
      return true;
    }
  }

  // Se o bot chegar aqui e a etapa for desconhecida, pode ser um fallback ou erro
  console.warn(`[Confirmar Endereço] Etapa desconhecida ou não tratada para ${clientName}: ${estado.etapa}. Mensagem: "${texto}"`);
  // Opcional: Enviar uma mensagem de erro ou resetar o fluxo.
  // REFATORADO: Acessando diretamente mensagens.erros.erroInterno
  return await finalizarConversa(mensagens.erros.erroInterno, 'Confirmar Endereco - Etapa Desconhecida');
}

module.exports = { handleConfirmarEndereco };