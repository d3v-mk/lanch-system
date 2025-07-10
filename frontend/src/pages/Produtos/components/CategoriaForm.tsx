// src/components/Categorias/CategoriaForm.tsx
import { useState, useEffect } from 'react';

type Props = {
  onSubmit: (categoryData: { id?: string; nome: string }) => void;
  onCancel: () => void;
  initialData?: { id: string; nome: string } | null;
};

export default function CategoriaForm({ onSubmit, onCancel, initialData }: Props) {
  const [nome, setNome] = useState(initialData?.nome || '');

  // Atualiza o estado 'nome' se 'initialData' mudar (para edição)
  useEffect(() => {
    setNome(initialData?.nome || '');
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      alert('O nome da categoria não pode ser vazio.'); // Use um modal personalizado
      return;
    }
    onSubmit({ id: initialData?.id, nome });
    setNome(''); // Limpa o campo após submissão
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end space-x-3 mb-4 p-2 border rounded bg-gray-50">
      <div className="flex-grow">
        <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">
          {initialData ? 'Editar Categoria' : 'Nova Categoria'}
        </label>
        <input
          type="text"
          id="categoryName"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
          placeholder="Nome da categoria"
        />
      </div>
      <button
        type="submit"
        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {initialData ? 'Salvar Edição' : 'Adicionar'}
      </button>
      {initialData && (
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Cancelar
        </button>
      )}
    </form>
  );
}
