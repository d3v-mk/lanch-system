import { QRCodeCanvas } from 'qrcode.react'

type Props = {
  qrCode: string | null
  onClose: () => void
}

export default function QRCodeDialog({ qrCode, onClose }: Props) {
  if (!qrCode) return null

  return (
    <>
      {/* Fundo preto cobrindo TUDO, inclusive header */}
      <div className="fixed inset-0 z-40 bg-black bg-opacity-50" />

      {/* Modal fixo, começa abaixo do header */}
      <div
        className="fixed left-0 right-0 bottom-0 z-50 flex items-center justify-center"
        style={{ top: '56px' }} // altura do header sticky
      >
        <div className="bg-white rounded p-6 shadow-lg max-w-sm w-full text-center">
          <h2 className="text-lg font-semibold mb-4">Escaneie o QR Code</h2>
          <QRCodeCanvas value={qrCode} size={256} className="mx-auto mb-4" />
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded w-full"
          >
            Fechar
          </button>
        </div>
      </div>
    </>
  )
}
