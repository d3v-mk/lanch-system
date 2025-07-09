// frontend/src/pages/Pedidos/hooks/usePedidos.ts
import { useState, useEffect, useCallback } from 'react';
import { listarPedidos, deletarPedido } from '../../../services/pedidoService';
import socket from '../../../services/socket';
import type { Pedido } from '../../../types/pedidoType';

export function usePedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para carregar os pedidos (renomeada de fetchPedidos para loadPedidos)
  const loadPedidos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listarPedidos();
      setPedidos(data);
    } catch (err) {
      setError('Falha ao carregar os pedidos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []); // Dependências vazias, pois não depende de estado externo

  // Efeito para buscar dados e conectar ao socket na montagem do componente
  useEffect(() => {
    loadPedidos(); // Chama a função para buscar os pedidos iniciais

    // Ouve por novos pedidos em tempo real
    socket.on('novo_pedido', (novoPedido: Pedido) => {
      console.log('[Socket.IO] Novo pedido recebido:', novoPedido);
      setPedidos(prevPedidos => [novoPedido, ...prevPedidos]);
    });

    // Limpeza: desliga o listener quando o componente desmontar
    return () => {
      socket.off('novo_pedido');
    };
  }, [loadPedidos]); // Adiciona loadPedidos como dependência para useCallback

  // Função para excluir um pedido
  const excluirPedido = useCallback(async (id: string) => {
    // Substituído window.confirm por um alerta mais controlado se necessário,
    // mas mantendo a funcionalidade original com confirm por enquanto.
    if (window.confirm('Quer mesmo excluir esse pedido?')) {
      try {
        await deletarPedido(id);
        // Remove o pedido do estado local para uma resposta de UI imediata
        setPedidos(prevPedidos => prevPedidos.filter(p => p.id !== id));
        alert('Pedido excluído com sucesso!'); // Feedback de sucesso
      } catch (err) {
        setError('Falha ao excluir o pedido.');
        console.error(err);
        alert('Erro ao excluir o pedido.'); // Feedback de erro
        // Opcional: recarregar os pedidos para garantir consistência
        loadPedidos();
      }
    }
  }, [loadPedidos]); // Adiciona loadPedidos como dependência para useCallback

  // Retorna os valores e funções que o componente irá precisar
  return { pedidos, loading, error, loadPedidos, excluirPedido }; // Inclui loadPedidos no retorno
}
