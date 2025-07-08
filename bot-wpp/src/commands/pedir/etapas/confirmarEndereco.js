// src/commands/pedir/etapas/confirmarEndereco.js

const axios = require('axios');
const { estadosDeConversa } = require('@config/state');

async function handleConfirmarEndereco(msg, sock, estado) {
  const userId = msg.key.remoteJid;
  const texto = msg.body.trim().toLowerCase();

  const finalizarConversa = async (messageText) => {
    await sock.sendMessage(userId, { text: messageText });
    estadosDeConversa.delete(userId);
    return false;
  };

  const enviarPedido = async () => {
    try {
      const clienteId = estado.cliente.id;

      if (!estado.dados.carrinho || estado.dados.carrinho.length === 0) {
        console.error('🚨 Erro: Carrinho vazio ao tentar enviar o pedido.');
        return await finalizarConversa('Erro interno: Seu pedido está vazio. Tente novamente mais tarde.');
      }

      // Mapeia os itens do carrinho para o formato esperado pela API de pedidos
      const itensDoPedido = estado.dados.carrinho.map(item => ({
        produtoId: item.produtoId,
        quantidade: parseInt(item.quantidade),
        subtotal: parseFloat(item.precoUnitario) * parseInt(item.quantidade) // Recalcula subtotal final
      }));

      await axios.post('http://localhost:3000/api/pedidos', {
        clienteId,
        observacao: estado.dados.observacao || '',
        status: 'PENDENTE',
        itens: itensDoPedido, // Envia todos os itens do carrinho
        total: estado.dados.totalPedido // Inclui o total do pedido
      });

      // MUDANÇA: Agora finaliza a conversa após o pedido completo
      return await finalizarConversa('Pedido recebido e confirmado! Agradecemos a preferência 😊');

    } catch (e) {
      console.error('Erro ao enviar o pedido:', e.response?.data || e.message);
      // Aqui você pode inspecionar e.response.data para mensagens de erro mais específicas do backend
      let mensagemErro = 'Ocorreu um erro ao finalizar seu pedido. Tente novamente mais tarde.';
      if (e.response && e.response.data && e.response.data.erro) {
        mensagemErro = `Erro ao finalizar pedido: ${e.response.data.erro}`;
      }
      return await finalizarConversa(mensagemErro);
    }
  };

  // Lógica para a etapa 'confirmar_endereco'
  if (estado.etapa === 'confirmar_endereco') {
    if (texto === 'sim') {
      return await enviarPedido();
    } else if (texto === 'não' || texto === 'nao') {
      estado.etapa = 'aguardando_novo_endereco';
      await sock.sendMessage(userId, { text: 'Ok. Por favor, digite seu novo endereço completo (Rua, Número, Bairro, Cidade, CEP).' });
      return true;
    } else {
      await sock.sendMessage(userId, { text: 'Por favor, responda "sim" ou "não" sobre a confirmação do endereço.' });
      return true;
    }
  }

  // Lógica para a etapa 'aguardando_novo_endereco'
  if (estado.etapa === 'aguardando_novo_endereco') {
    const novoEndereco = msg.body.trim();
    if (novoEndereco.length < 5) {
      await sock.sendMessage(userId, { text: 'Endereço muito curto. Por favor, digite seu endereço completo.' });
      return true;
    }

    try {
      await axios.put(`http://localhost:3000/api/clientes/${estado.cliente.id}`, {
        endereco: novoEndereco
      });

      estado.cliente.endereco = novoEndereco;

      estado.etapa = 'aguardando_confirmacao_final_endereco';
      await sock.sendMessage(userId, { text: 'Endereço atualizado com sucesso!' });
      await sock.sendMessage(userId, {
        text: `Seu novo endereço de entrega é: *${novoEndereco}*?\n\nPor favor, responda "sim" para confirmar e finalizar o pedido, ou "não" para digitar novamente.`
      });
      return true;

    } catch (e) {
      console.error('Erro ao atualizar endereço:', e.response?.data || e.message);
      return await finalizarConversa('Ocorreu um erro ao atualizar seu endereço. Tente novamente mais tarde.');
    }
  }

  // Lógica para a etapa 'aguardando_confirmacao_final_endereco'
  if (estado.etapa === 'aguardando_confirmacao_final_endereco') {
    if (texto === 'sim') {
      return await enviarPedido();
    } else if (texto === 'não' || texto === 'nao') {
      estado.etapa = 'aguardando_novo_endereco';
      await sock.sendMessage(userId, { text: 'Ok. Por favor, digite seu novo endereço completo (Rua, Número, Bairro, Cidade, CEP).' });
      return true;
    } else {
      await sock.sendMessage(userId, { text: 'Por favor, responda "sim" ou "não" para confirmar o novo endereço.' });
      return true;
    }
  }

  // Se o bot chegar aqui e a etapa for desconhecida, pode ser um fallback ou erro
  return true;
}

module.exports = { handleConfirmarEndereco };