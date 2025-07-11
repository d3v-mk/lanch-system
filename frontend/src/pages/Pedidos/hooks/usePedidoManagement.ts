// frontend/src/pages/Pedidos/hooks/usePedidoManagement.ts

import { useState, useCallback, useEffect } from 'react'; // Adicionado useEffect

import { Pedido, OrderStatus } from '../../../types/pedidoType';
// Importe PedidoFormData
import { PedidoFormData } from '../components/PedidoForm'; // Certifique-se de que este caminho está correto

// Importe todas as funções do serviço de pedidos
import {
  updateOrderStatus,
  criarPedido,
  updatePedido, // Renomeado de 'atualizarPedido' para 'updatePedido' na última atualização
  PedidoPayload,
  fetchPedidos,    // Renomeado de 'listarPedidos' para 'fetchPedidos'
  deletePedido     // Renomeado de 'deletarPedido' para 'deletePedido'
} from '../../../services/pedidoService';

/**
 * Hook personalizado para gerenciar a lógica de criação, edição, exclusão e atualização de status de pedidos.
 * NÃO DEVE CONTER LÓGICA DE SOCKET.IO OU NOTIFICAÇÕES (elas vêm do PedidosContext).
 */
export const usePedidoManagement = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // loadPedidos é uma função de callback para ser estável e recarregada apenas quando necessário
  const loadPedidos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPedidos();
      setPedidos(data);
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err);
      setError('Falha ao carregar pedidos.');
    } finally {
      setLoading(false);
    }
  }, []); // Sem dependências para que seja criada apenas uma vez

  // Lógica para excluir pedido
  const excluirPedido = useCallback(async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este pedido?')) {
      try {
        await deletePedido(id);
        alert('Pedido excluído com sucesso!');
        loadPedidos(); // Recarrega a lista após a exclusão
      } catch (err) {
        console.error('Erro ao excluir pedido:', err);
        alert('Erro ao excluir pedido.');
      }
    }
  }, [loadPedidos]); // Depende de loadPedidos para garantir que a versão mais recente seja usada

  // Carrega os pedidos na montagem inicial do hook (e, portanto, da página que o usa)
  useEffect(() => {
    loadPedidos();
    // No futuro, se houver um evento de socket para "pedido atualizado/excluido",
    // você pode chamar loadPedidos() aqui para manter a lista em tempo real.
  }, [loadPedidos]); // Depende de loadPedidos para que seja executado se a função mudar (o que não deve acontecer)


  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pedidoFormData, setPedidoFormData] = useState<PedidoFormData | undefined>(undefined);

  const onCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setPedidoFormData(undefined);
    loadPedidos(); // Recarrega os pedidos após fechar o formulário
  }, [loadPedidos]); // Depende de loadPedidos

  const handleSubmitForm = useCallback(async (data: PedidoFormData) => {
    try {
      const payload: PedidoPayload = {
        id: data.id,
        clienteId: data.clienteId,
        observacao: data.observacao,
        total: data.total,
        // O status é adicionado apenas na criação se o ID não existe
        ...(data.id ? {} : { status: 'PENDENTE' }),
        itens: [], // Assumindo que itens são tratados em outro lugar ou são opcionais para esta payload simples
      };

      if (payload.id) {
        await updatePedido(payload); // 🚨 Corrigido para updatePedido
        alert('Pedido atualizado com sucesso!');
      } else {
        await criarPedido(payload);
        alert('Pedido criado com sucesso!');
      }
      onCloseForm();
    } catch (err) {
      console.error('Erro ao salvar pedido:', err);
      alert('Erro ao salvar pedido.');
    }
  }, [criarPedido, updatePedido, onCloseForm]); // 🚨 Adicionadas dependências criarPedido e updatePedido

  const handleUpdateStatus = useCallback(async (pedidoId: string, currentStatus: string) => {
    let nextStatus: OrderStatus;
    switch (currentStatus as OrderStatus) {
      case 'PENDENTE':
        nextStatus = 'EM_PREPARO';
        break;
      case 'EM_PREPARO':
        nextStatus = 'PRONTO';
        break;
      case 'PRONTO':
        nextStatus = 'SAIU_ENTREGA';
        break;
      case 'SAIU_ENTREGA':
        nextStatus = 'ENTREGUE';
        break;
      case 'ENTREGUE':
        alert('Este pedido já foi entregue e não pode ser atualizado.');
        return;
      case 'CANCELADO':
        alert('Este pedido foi cancelado e não pode ser atualizado.');
        return;
      default:
        alert('Status desconhecido. Não é possível atualizar.');
        return;
    }

    if (window.confirm(`Mudar status do pedido de "${currentStatus}" para "${nextStatus}"?`)) {
      try {
        await updateOrderStatus(pedidoId, nextStatus);
        alert(`Status do pedido ${pedidoId.substring(0, 8)}... atualizado para ${nextStatus}!`);
        loadPedidos(); // Recarrega a lista após a atualização de status
      } catch (err) {
        console.error('Erro ao atualizar status:', err);
        alert('Erro ao atualizar status do pedido.');
      }
    }
  }, [loadPedidos]); // Depende de loadPedidos

  const handleEditPedido = useCallback((pedido: Pedido) => {
    const dataForForm: PedidoFormData = {
      id: pedido.id,
      clienteId: pedido.cliente.id,
      observacao: pedido.observacao,
      total: pedido.total,
      // Se PedidoFormData precisa de mais campos de Pedido, adicione aqui
    };
    setPedidoFormData(dataForForm);
    setIsFormOpen(true);
  }, []);

  const handleNewPedido = useCallback(() => {
    setPedidoFormData(undefined); // Limpa o formulário para um novo pedido
    setIsFormOpen(true);
  }, []);

  return {
    pedidos,
    loading,
    error,
    loadPedidos, // Exponha o loadPedidos se a página precisar chamá-lo manualmente
    isFormOpen,
    pedidoFormData,
    handleUpdateStatus,
    handleEditPedido,
    handleNewPedido,
    handleSubmitForm,
    onCloseForm,
    excluirPedido,
  };
};