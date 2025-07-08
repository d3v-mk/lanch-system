module.exports = {

    adminUsoIncorretoSetXp: 
    `❌ Uso incorreto!\nExemplo: /admin setxp nome 100`,

    adminUsoIncorretoSetLevel:
    `❌ Uso incorreto!\nExemplo: /admin setlevel nome 10`,

    adminUsoIncorretoSetEnergia:
    `❌ Uso incorreto!\nExemplo: /admin setenergia mk 50`,

    adminUsoIncorretoSetName:
    `❌ Uso incorreto!\nExemplo: /admin setname Nome NovoNome`,

    adminSetNameCaracteresIncorretos:
    `❌ O novo nome deve ter entre 6 e 10 caracteres.`,

    adminTpUsoIncorreto:
    `❌ Uso incorreto!\nExemplo: /admin tp nomeJogador vilarejo inicial`,

    adminTpLocalNaoEncontado: (destino) =>
    `❌ Local "${destino}" não encontrado.`,

    adminTpJogadorTeleportado: (jogador, local) =>
    `✅ Jogador "${jogador.nome}" teleportado para "${local.nome}".`,

    adminSetNameExistente: (novoNome) =>
    `❌ Já existe um jogador com o nome "${novoNome}". Escolha outro.`,

    adminSetNameAtualizado: (nomeAlvo, novoNome) =>
    `✅ Jogador "${nomeAlvo}" foi renomeado para "${novoNome}".`,

    adminXpJogadorAtualizado: (jogador, novoXp) =>
    `✅ XP de ${jogador.nome} atualizado para ${novoXp}.`,

    adminLevelJogadorAtualizado: (jogador, novoLevel) =>
    `📈 O jogador ${jogador.nome} agora está no nível ${novoLevel}.`,

    adminEnergiaJogadorAtualizado: (jogador, novaEnergia) =>
    `🔋 Energia de ${jogador.nome} atualizada para ${novaEnergia}.`,


    adminUsoIncorretoDarConquista: 
    `❌ Uso correto: /admin darconquista <nome do jogador> <nome da conquista>`,

    conquistaNaoEncontrada: (nome) => 
    `❌ Conquista "${nome}" não encontrada.`,

    jogadorJaTemConquista: (jogador, conquista) => 
    `⚠️ O jogador ${jogador} já possui a conquista "${conquista}".`,

    sucessoDarConquista: (jogador, conquista) => 
    `✅ Conquista "${conquista}" dada para o jogador ${jogador}!`,
    
};