// src/components/Cardapio/CardapioPreviewDialog.tsx
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import CardapioPreview from './CardapioPreview'; // Importa o componente de preview real

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CardapioPreviewDialog({ isOpen, onClose }: Props) {
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
            <Dialog.Panel className="bg-white w-full max-w-md h-5/6 overflow-y-auto rounded-lg p-6 shadow-xl"> {/* <--- ALTERADO AQUI: max-w-2xl */}
              <Dialog.Title className="text-xl font-bold mb-4 text-gray-800">Prévia do Cardápio</Dialog.Title>
              <CardapioPreview /> {/* O componente de preview é renderizado aqui */}
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Fechar Prévia
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
