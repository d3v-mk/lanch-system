// src/commands/pedir/etapas/cadastroCliente.js

const { buscarCliente, criarCliente } = require('../services/clienteService'); // Certifique-se do caminho correto
const { estadosDeConversa } = require('@config/state');
const mensagens = require('@utils/mensagens'); // OK: Importa o módulo de mensagens
const { sendMessage } = require('@core/messageSender'); // NOVO: Importa a função sendMessage

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
        // REFATORADO: Usando sendMessage e mensagens.cadastro.clienteExistente
        await sendMessage(sock, userId, { text: mensagens.cadastro.clienteExistente }, 'Cadastro Cliente - Existente');
        return true; // Cliente tratado, continua o fluxo
      } else {
        estado.etapa = 'perguntar_nome'; // Cliente não encontrado, inicia o cadastro
        console.log(`[Cadastro Cliente] Cliente ${telefone} NÃO encontrado. Iniciando cadastro.`);
        // REFATORADO: Usando sendMessage e mensagens.cadastro.perguntarNome
        await sendMessage(sock, userId, { text: mensagens.cadastro.perguntarNome }, 'Cadastro Cliente - Perguntar Nome');
        return true; // Continua no fluxo de cadastro
      }
    } catch (error) {
      console.error(`[Cadastro Cliente] ERRO ao buscar cliente ${telefone}:`, error);
      // REFATORADO: Usando sendMessage e mensagens.erros.erroInterno
      await sendMessage(sock, userId, { text: mensagens.erros.erroInterno }, 'Cadastro Cliente - Erro Busca');
      estadosDeConversa.delete(userId); // Limpa o estado em caso de erro crítico
      return false; // Indica falha no fluxo
    }
  }

  // --- Etapa 'perguntar_nome' ---
  if (estado.etapa === 'perguntar_nome') {
    if (!texto || texto.length < 2) { // Validação simples do nome
      // REFATORADO: Usando sendMessage e mensagens.cadastro.nomeInvalido
      await sendMessage(sock, userId, { text: mensagens.cadastro.nomeInvalido }, 'Cadastro Cliente - Nome Inválido');
      console.log(`[Cadastro Cliente] Nome inválido recebido de ${userId.split('@')[0]}.`);
      return true; // Continua na mesma etapa
    }
    estado.dados.nomeTemporario = texto; // Armazena o nome temporariamente
    estado.etapa = 'perguntar_endereco';
    // REFATORADO: Usando sendMessage e mensagens.cadastro.perguntarEndereco
    await sendMessage(sock, userId, { text: mensagens.cadastro.perguntarEndereco }, 'Cadastro Cliente - Perguntar Endereco');
    console.log(`[Cadastro Cliente] Nome '${texto}' recebido de ${userId.split('@')[0]}. Perguntando endereço.`);
    return true;
  }

  // --- Etapa 'perguntar_endereco' ---
  if (estado.etapa === 'perguntar_endereco') {
    if (!texto || texto.length < 10) { // Validação simples do endereço
      // REFATORADO: Usando sendMessage e mensagens.cadastro.enderecoInvalido
      await sendMessage(sock, userId, { text: mensagens.cadastro.enderecoInvalido }, 'Cadastro Cliente - Endereco Inválido');
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
      // REFATORADO: Usando sendMessage e mensagens.cadastro.cadastroSucesso
      await sendMessage(sock, userId, { text: mensagens.cadastro.cadastroSucesso }, 'Cadastro Cliente - Sucesso');
      console.log(`[Cadastro Cliente] Cliente ${novoCliente.nome} (${telefone}) cadastrado com sucesso.`);
      // Limpa os dados temporários após o cadastro
      delete estado.dados.nomeTemporario;
      delete estado.dados.enderecoTemporario;
      return true; // Cadastro concluído, continua o fluxo
    } catch (error) {
      console.error(`[Cadastro Cliente] ERRO ao criar cliente ${telefone}:`, error);
      // REFATORADO: Usando sendMessage e mensagens.erros.erroInterno
      await sendMessage(sock, userId, { text: mensagens.erros.erroInterno }, 'Cadastro Cliente - Erro Criacao');
      estadosDeConversa.delete(userId); // Limpa o estado em caso de erro crítico
      return false; // Indica falha no fluxo
    }
  }

  // Se chegou aqui, a mensagem não corresponde a nenhuma etapa de cadastro esperada
  console.log(`[Cadastro Cliente] Mensagem "${texto}" não tratada pelo fluxo de cadastro para ${userId.split('@')[0]}.`);
  return false; // Indica que o cadastro não foi tratado por esta função
}

module.exports = { handleCadastroCliente };