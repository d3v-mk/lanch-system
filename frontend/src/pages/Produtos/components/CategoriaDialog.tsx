// src/components/Categorias/CategoriaDialog.tsx
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import axios from 'axios';
import CategoriaForm from './CategoriaForm'; // Importe o formulário para adicionar/editar

type Category = {
  id: string;
  nome: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CategoriaDialog({ isOpen, onClose }: Props) {
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null); // Categoria sendo editada

  // Função para carregar categorias
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/categorias`);
      setCategorias(response.data);
    } catch (err) {
      console.error('Erro ao buscar categorias:', err);
      setError('Erro ao carregar categorias.');
    } finally {
      setLoading(false);
    }
  };

  // Carrega categorias ao abrir o diálogo ou após uma operação CRUD
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const handleAddOrUpdateCategory = async (categoryData: { id?: string; nome: string }) => {
    try {
      if (categoryData.id) {
        // Atualizar
        await axios.put(`${import.meta.env.VITE_API_URL}/categorias/${categoryData.id}`, { nome: categoryData.nome });
      } else {
        // Adicionar
        await axios.post(`${import.meta.env.VITE_API_URL}/categorias`, { nome: categoryData.nome });
      }
      setEditingCategory(null); // Fecha o formulário de edição/adição
      fetchCategories(); // Recarrega a lista
    } catch (err: any) {
      console.error('Erro ao salvar categoria:', err);
      alert(`Erro ao salvar categoria: ${err.response?.data?.erro || err.message}`); // Use um modal melhor
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar esta categoria?')) { // Use um modal personalizado
      return;
    }
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/categorias/${id}`);
      fetchCategories(); // Recarrega a lista
    } catch (err: any) {
      console.error('Erro ao deletar categoria:', err);
      alert(`Erro ao deletar categoria: ${err.response?.data?.erro || err.message}`); // Use um modal melhor
    }
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="bg-white w-full max-w-lg rounded-lg p-6 shadow-xl">
              <Dialog.Title className="text-lg font-bold mb-4">Gerenciar Categorias</Dialog.Title>

              {/* Formulário para Adicionar/Editar Categoria */}
              <CategoriaForm
                onSubmit={handleAddOrUpdateCategory}
                onCancel={() => setEditingCategory(null)}
                initialData={editingCategory}
              />

              <h3 className="text-md font-semibold mt-6 mb-3">Categorias Existentes:</h3>
              {loading ? (
                <p className="text-gray-500">Carregando...</p>
              ) : error ? (
                <p className="text-red-600">{error}</p>
              ) : categorias.length === 0 ? (
                <p className="text-gray-500">Nenhuma categoria cadastrada.</p>
              ) : (
                <ul className="space-y-2 max-h-60 overflow-y-auto border rounded p-2">
                  {categorias.map((cat) => (
                    <li key={cat.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <span className="text-gray-800">{cat.nome}</span>
                      <div className="space-x-2">
                        <button
                          type="button"
                          onClick={() => setEditingCategory(cat)}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="text-red-600 hover:underline text-sm"
                        >
                          Excluir
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Fechar
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
