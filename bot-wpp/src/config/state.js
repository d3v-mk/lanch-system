/**
 * 🧠 Módulo de Estado de Conversa dos Jogadores
 *
 * Este arquivo mantém o "estado de conversa" de cada jogador durante interações com o bot via WhatsApp.
 * Ele utiliza um `Map` onde a chave é o número do WhatsApp (JID) e o valor é um objeto contendo:
 *  - `fluxo`: o nome do fluxo atual (ex: 'register', 'missao', etc)
 *  - `passo`: o passo atual da conversa dentro do fluxo
 *  - `respostas`: as respostas já dadas pelo jogador
 *  - `handler`: função que continuará tratando a conversa
 *
 * 🚀 Isso permite conversas multi-etapas (tipo um formulário), com controle total por jogador.
 *
 * Exemplo de uso:
 *   estadosDeConversa.set(jid, { fluxo: 'register', passo: 0, respostas: {}, handler: fn });
 *   const estado = estadosDeConversa.get(jid);
 */

const estadosDeConversa = new Map();
const confirmacoesViagem = new Map();

module.exports = { 
    estadosDeConversa, 
    confirmacoesViagem 
};
