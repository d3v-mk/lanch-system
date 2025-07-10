// frontend/src/pages/Pedidos/hooks/usePedidoManagement.ts

import { useState, useCallback } from 'react';
import { usePedidos } from './usePedidos'; // Importa o hook existente de pedidos
import { Pedido, OrderStatus } from '../../../types/pedidoType'; // Tipos de Pedido e OrderStatus
import { updateOrderStatus, criarPedido, atualizarPedido, PedidoPayload } from '../../../services/pedidoService'; // Funções de serviço e PedidoPayload
import { PedidoFormData } from '../components/PedidoForm'; // Tipo de dados do formulário

/**
 * Hook personalizado para gerenciar toda a lógica da página de Pedidos.
 * Inclui carregamento, criação, edição, exclusão e atualização de status de pedidos.
 */
export const usePedidoManagement = () => {
  // Estados do hook usePedidos (carregamento, erro, lista de pedidos, função de exclusão)
  const { pedidos, loading, error, loadPedidos, excluirPedido } = usePedidos();

  // Estados locais para o formulário de pedido
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pedidoFormData, setPedidoFormData] = useState<PedidoFormData | undefined>(undefined);

  // Função para lidar com a atualização do status do pedido (chamada pelo PedidoList)
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
        loadPedidos(); // Recarrega a lista para atualizar a UI
      } catch (err) {
        console.error('Erro ao atualizar status:', err);
        alert('Erro ao atualizar status do pedido.');
      }
    }
  }, [loadPedidos]); // Depende de loadPedidos para recarregar a lista

  // Função para lidar com a edição de um pedido (chamada pelo PedidoList)
  const handleEditPedido = useCallback((pedido: Pedido) => {
    // Transforma o objeto Pedido completo para o formato PedidoFormData
    const dataForForm: PedidoFormData = {
      id: pedido.id,
      clienteId: pedido.cliente.id,
      observacao: pedido.observacao,
      total: pedido.total,
      // Não inclua 'status' ou 'itens' aqui, pois PedidoFormData não os possui
      // e eles serão definidos no payload de envio.
    };
    setPedidoFormData(dataForForm); // Define os dados para o formulário
    setIsFormOpen(true); // Abre o formulário
  }, []); // Sem dependências, função estável

  // Função para abrir o formulário para um NOVO pedido (chamada pelo botão "Novo Pedido")
  const handleNewPedido = useCallback(() => {
    setPedidoFormData(undefined); // Garante que o formulário esteja limpo para um novo pedido
    setIsFormOpen(true);
  }, []); // Sem dependências, função estável

  // Função para lidar com o envio do formulário (criação ou atualização)
  const handleSubmitForm = useCallback(async (data: PedidoFormData) => {
    try {
      // Constrói o PedidoPayload completo para enviar ao backend
      const payload: PedidoPayload = {
        id: data.id, // Inclui o ID se for uma atualização
        clienteId: data.clienteId,
        observacao: data.observacao,
        total: data.total,
        status: 'PENDENTE', // Status padrão para novos pedidos (ou mantenha o do pedido existente se for edição e o form não o alterar)
        itens: [], // Itens padrão vazios, se o formulário não gerenciar itens
      };

      if (payload.id) { // Se houver um ID, é uma atualização
        await atualizarPedido(payload);
        alert('Pedido atualizado com sucesso!');
      } else { // Caso contrário, é uma criação
        await criarPedido(payload);
        alert('Pedido criado com sucesso!');
      }
      onCloseForm(); // Fecha o formulário e recarrega os pedidos
    } catch (err) {
      console.error('Erro ao salvar pedido:', err);
      alert('Erro ao salvar pedido.');
    }
  }, [atualizarPedido, criarPedido]); // Dependências das funções de serviço

  // Função para fechar o formulário de pedido
  const onCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setPedidoFormData(undefined); // Limpa os dados do formulário
    loadPedidos(); // Recarrega os pedidos após fechar o formulário
  }, [loadPedidos]); // Depende de loadPedidos

  // Retorna todos os estados e handlers necessários para o componente de UI
  return {
    pedidos,
    loading,
    error,
    isFormOpen,
    pedidoFormData,
    handleUpdateStatus,
    handleEditPedido,
    handleNewPedido,
    handleSubmitForm,
    onCloseForm,
    excluirPedido, // A função de exclusão ainda é exposta
  };
};