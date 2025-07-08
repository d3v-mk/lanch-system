// src/commands/pedir/etapas/cadastroCliente.js (CORRIGIDO)

const { buscarCliente, criarCliente } = require('../services/clienteService'); // Certifique-se do caminho correto
const { estadosDeConversa } = require('@config/state');
const mensagens = require('@utils/mensagens'); // <-- NOVO: Importa o módulo de mensagens

// CORREÇÃO: A ordem dos parâmetros deve ser (sock, msg, estado)
async function handleCadastroCliente(sock, msg, estado) {
  const userId = msg.key.remoteJid; // 'msg' agora é o objeto de mensagem correto
  const telefone = userId.replace('@c.us', '');
  // CORREÇÃO: Extrair o texto da mensagem de forma robusta
  const texto = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
  const textoLowerCase = texto.trim().toLowerCase(); // Usar para comparações

  console.log(`[Cadastro Cliente] Processando etapa '${estado.etapa}' para ${userId.split('@')[0]}. Mensagem: "${texto}"`);
  console.log('Dados do estado de cadastro:', JSON.stringify(estado.dados));

  // --- Lógica para buscar/verificar cliente ---
  if (!estado.clienteBuscado) {
    console.log(`[Cadastro Cliente] Buscando cliente ${telefone}...`);
    try {
      const cliente = await buscarCliente(telefone);
      estado.clienteBuscado = true; // Marca que a busca já foi feita

      if (cliente) {
        estado.cliente = cliente;
        estado.etapa = 'aguardando_item'; // Cliente encontrado, pode ir para o próximo passo do pedido
        console.log(`[Cadastro Cliente] Cliente ${cliente.nome} (${telefone}) encontrado. Indo para 'aguardando_item'.`);
        // Opcional: Enviar uma mensagem de boas-vindas ao cliente existente
        // await sock.sendMessage(userId, { text: mensagens.cadastro.clienteExistente || `Olá novamente, ${cliente.nome}! Qual item você gostaria de pedir?` });
        return true; // Cliente tratado, continua o fluxo
      } else {
        estado.etapa = 'perguntar_nome'; // Cliente não encontrado, inicia o cadastro
        console.log(`[Cadastro Cliente] Cliente ${telefone} NÃO encontrado. Iniciando cadastro.`);
        await sock.sendMessage(userId, {
          text: mensagens.cadastro.perguntarNome || 'Olá! Para prosseguirmos com seu pedido, qual é o seu nome completo?',
        });
        return true; // Continua no fluxo de cadastro
      }
    } catch (error) {
      console.error(`[Cadastro Cliente] ERRO ao buscar cliente ${telefone}:`, error);
      await sock.sendMessage(userId, { text: mensagens.erros.erroInterno || 'Ocorreu um erro ao buscar seu cadastro. Tente novamente mais tarde.' });
      estadosDeConversa.delete(userId); // Limpa o estado em caso de erro crítico
      return false; // Indica falha no fluxo
    }
  }

  // --- Etapa 'perguntar_nome' ---
  if (estado.etapa === 'perguntar_nome') {
    if (!texto || texto.length < 2) { // Validação simples do nome
      await sock.sendMessage(userId, { text: mensagens.cadastro.nomeInvalido || 'Nome inválido. Por favor, digite seu nome completo.' });
      console.log(`[Cadastro Cliente] Nome inválido recebido de ${userId.split('@')[0]}.`);
      return true; // Continua na mesma etapa
    }
    estado.dados.nomeTemporario = texto; // Armazena o nome temporariamente
    estado.etapa = 'perguntar_endereco';
    await sock.sendMessage(userId, {
      text: mensagens.cadastro.perguntarEndereco || `Obrigado, ${texto}! Agora, por favor, me informe seu endereço completo (Rua, Número, Bairro, Cidade, CEP, Complemento se houver).`,
    });
    console.log(`[Cadastro Cliente] Nome '${texto}' recebido de ${userId.split('@')[0]}. Perguntando endereço.`);
    return true;
  }

  // --- Etapa 'perguntar_endereco' ---
  if (estado.etapa === 'perguntar_endereco') {
    if (!texto || texto.length < 10) { // Validação simples do endereço
      await sock.sendMessage(userId, { text: mensagens.cadastro.enderecoInvalido || 'Endereço inválido. Por favor, digite seu endereço completo e detalhado.' });
      console.log(`[Cadastro Cliente] Endereço inválido recebido de ${userId.split('@')[0]}.`);
      return true; // Continua na mesma etapa
    }
    estado.dados.enderecoTemporario = texto; // Armazena o endereço temporariamente

    try {
      console.log(`[Cadastro Cliente] Criando novo cliente para ${userId.split('@')[0]}...`);
      const novoCliente = await criarCliente(
        estado.dados.nomeTemporario,
        telefone,
        estado.dados.enderecoTemporario
      );
      estado.cliente = novoCliente; // Armazena o cliente completo no estado
      estado.etapa = 'aguardando_item'; // Cliente cadastrado, pode ir para o próximo passo do pedido
      await sock.sendMessage(userId, {
        text: mensagens.cadastro.cadastroSucesso || 'Cadastro realizado com sucesso! Agora, qual item você deseja pedir?',
      });
      console.log(`[Cadastro Cliente] Cliente ${novoCliente.nome} (${telefone}) cadastrado com sucesso.`);
      // Limpa os dados temporários após o cadastro
      delete estado.dados.nomeTemporario;
      delete estado.dados.enderecoTemporario;
      return true; // Cadastro concluído, continua o fluxo
    } catch (error) {
      console.error(`[Cadastro Cliente] ERRO ao criar cliente ${telefone}:`, error);
      await sock.sendMessage(userId, {
        text: mensagens.erros.erroInterno || 'Erro ao criar seu cadastro. Tente novamente mais tarde.',
      });
      estadosDeConversa.delete(userId); // Limpa o estado em caso de erro crítico
      return false; // Indica falha no fluxo
    }
  }

  // Se chegou aqui, a mensagem não corresponde a nenhuma etapa de cadastro esperada
  console.log(`[Cadastro Cliente] Mensagem "${texto}" não tratada pelo fluxo de cadastro para ${userId.split('@')[0]}.`);
  return false; // Indica que o cadastro não foi tratado por esta função
}

module.exports = { handleCadastroCliente };