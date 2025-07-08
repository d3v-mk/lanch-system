// src/components/Produtos/ProdutoDialog.tsx
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import ProdutoForm from './ProdutoForm'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (produto: any) => void
}

export default function ProdutoDialog({ isOpen, onClose, onSubmit }: Props) {
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
            <Dialog.Panel className="bg-white w-full max-w-md rounded-lg p-6 shadow-xl">
              <Dialog.Title className="text-lg font-bold mb-4">Cadastrar Produto</Dialog.Title>
              <ProdutoForm onSubmit={onSubmit} onCancel={onClose} />
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}
