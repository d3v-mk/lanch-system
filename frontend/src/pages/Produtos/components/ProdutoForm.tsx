// src/components/Produtos/ProdutoForm.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog } from '@headlessui/react'; // Mantenha se estiver sendo usado, caso contrário, pode remover

// Importe o novo componente para gerenciar categorias
import CategoriaDialog from './CategoriaDialog'; 

type Category = {
  id: string;
  nome: string;
};

type Props = {
  onSubmit: (produto: any) => void;
  onCancel: () => void;
  initialData?: any; // Opcional: para edição de produto existente
};

export default function ProdutoForm({ onSubmit, onCancel, initialData }: Props) {
  const [nome, setNome] = useState(initialData?.nome || '');
  const [preco, setPreco] = useState(initialData?.preco || '');
  const [descricao, setDescricao] = useState(initialData?.descricao || '');
  const [imagemUrl, setImagemUrl] = useState(initialData?.imagemUrl || '');
  const [disponivel, setDisponivel] = useState(initialData?.disponivel ?? true);
  // Se initialData.categoriaId for undefined, inicializa com '' para a opção "Selecione..."
  const [categoriaId, setCategoriaId] = useState(initialData?.categoriaId || ''); 
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);

  // Estado para controlar a visibilidade do diálogo de gerenciamento de categorias
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);

  // Função para carregar categorias (reutilizável)
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      setErrorCategories(null);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/categorias`);
      setCategorias(response.data);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      setErrorCategories('Não foi possível carregar as categorias.');
    } finally {
      setLoadingCategories(false);
    }
  };

  // Carrega as categorias ao montar o componente e sempre que o gerenciador de categorias for fechado
  useEffect(() => {
    fetchCategories();
  }, [isCategoryManagerOpen]); // Recarrega quando o gerenciador é fechado

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação para categoria obrigatória
    if (!categoriaId) {
      alert('Por favor, selecione uma categoria para o produto.'); // Use um modal personalizado em produção
      return;
    }

    const produtoData = {
      id: initialData?.id,
      nome,
      preco: parseFloat(preco),
      descricao,
      imagemUrl,
      disponivel,
      categoriaId, // Categoria é obrigatória agora
    };
    onSubmit(produtoData);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome do Produto</label>
          <input
            type="text"
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
          />
        </div>

        <div>
          <label htmlFor="preco" className="block text-sm font-medium text-gray-700">Preço</label>
          <input
            type="number"
            id="preco"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            step="0.01"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
          />
        </div>

        <div>
          <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">Descrição</label>
          <textarea
            id="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
          ></textarea>
        </div>

        <div>
          <label htmlFor="imagemUrl" className="block text-sm font-medium text-gray-700">URL da Imagem</label>
          <input
            type="text"
            id="imagemUrl"
            value={imagemUrl}
            onChange={(e) => setImagemUrl(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
          />
        </div>

        {/* Campo de Seleção de Categoria */}
        <div>
          <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">Categoria</label>
          {loadingCategories ? (
            <p className="mt-1 text-sm text-gray-500">Carregando categorias...</p>
          ) : errorCategories ? (
            <p className="mt-1 text-sm text-red-600">{errorCategories}</p>
          ) : (
            <select
              id="categoria"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              required // CATEGORIA AGORA É OBRIGATÓRIA
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            >
              <option value="">Selecione uma categoria</option> {/* Removido "(Opcional)" */}
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nome}
                </option>
              ))}
            </select>
          )}
          {/* Link para Gerenciar Categorias */}
          <button
            type="button"
            onClick={() => setIsCategoryManagerOpen(true)}
            className="mt-2 text-sm text-blue-600 hover:underline focus:outline-none"
          >
            Gerenciar Categorias
          </button>
        </div>

        <div className="flex items-center">
          <input
            id="disponivel"
            type="checkbox"
            checked={disponivel}
            onChange={(e) => setDisponivel(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="disponivel" className="ml-2 block text-sm text-gray-900">Disponível para Cardápio</label>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Salvar Produto
          </button>
        </div >
      </form >

      {/* Diálogo de Gerenciamento de Categorias */}
      <CategoriaDialog
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
      />
    </>
  );
}
