// src/pages/Produtos.tsx
import { useEffect, useState } from 'react';
import ProdutoList from './components/ProdutoList';
import ProdutoDialog from './components/ProdutoDialog';
import CardapioPreviewDialog from './components/CardapioPreviewDialog';
import type { Produto, ProdutoInput } from '../../types';
import { listarProdutos, criarProduto, deletarProduto } from '../../services/produtoService';

export default function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

  async function fetchProdutos() {
    setLoading(true);
    setError(null);
    try {
      const data = await listarProdutos();
      setProdutos(data);
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProduto(novoProduto: ProdutoInput) {
    try {
      await criarProduto(novoProduto);
      fetchProdutos();
      setShowDialog(false);
    } catch (err: any) {
      alert('Erro ao cadastrar: ' + (err.response?.data?.erro || err.message || err));
    }
  }

  async function handleDeleteProduto(id: string) {
    const confirmar = confirm('Tem certeza que deseja excluir este produto?');
    if (!confirmar) return;

    try {
      await deletarProduto(id);
      fetchProdutos();
    } catch (err: any) {
      alert('Erro ao excluir: ' + (err.response?.data?.erro || err.message || err));
    }
  }

  useEffect(() => {
    fetchProdutos();
  }, []);

  if (loading) return <p className="p-6 text-lg text-gray-700">Carregando produtos...</p>;
  if (error) return <p className="p-6 text-lg text-red-600">Erro: {error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">📋 Gerenciar Cardápio</h1>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setShowDialog(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 shadow-md"
        >
          Cadastrar Produto
        </button>

        <button
          onClick={() => setShowPreviewDialog(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 shadow-md"
        >
          Ver Prévia do Cardápio
        </button>
      </div>

      {/* Dialog de Cadastro de Produto */}
      <ProdutoDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onSubmit={handleCreateProduto}
      />

      {/* Dialog de Prévia do Cardápio */}
      <CardapioPreviewDialog
        isOpen={showPreviewDialog}
        onClose={() => setShowPreviewDialog(false)}
      />

      {/* Lista de Produtos Existentes */}
      <ProdutoList produtos={produtos} onDelete={handleDeleteProduto} />
    </div>
  );
}
