import WhatsAppHeader from './components/WhatsAppHeader'

export default function Dashboard() {
  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <WhatsAppHeader />

      {/* Status resumo */}
      <section className="bg-white shadow rounded p-4">
        <h3 className="text-xl font-semibold mb-2">Resumo do Bot</h3>
        <ul className="grid grid-cols-3 gap-4 text-center">
          <li className="bg-green-100 rounded p-3">
            <span className="block font-bold text-2xl">12</span>
            <span className="text-sm text-gray-700">Conexões Ativas</span>
          </li>
          <li className="bg-yellow-100 rounded p-3">
            <span className="block font-bold text-2xl">3</span>
            <span className="text-sm text-gray-700">Tentativas de Reconnect</span>
          </li>
          <li className="bg-red-100 rounded p-3">
            <span className="block font-bold text-2xl">0</span>
            <span className="text-sm text-gray-700">Erros Recentes</span>
          </li>
        </ul>
      </section>

      {/* Logs recentes */}
      <section className="bg-white shadow rounded p-4">
        <h3 className="text-xl font-semibold mb-2">Logs Recentes</h3>
        <div className="h-48 overflow-auto bg-gray-50 p-2 rounded border border-gray-200 text-xs font-mono">
          <p>[12:34:56] Bot conectado com sucesso.</p>
          <p>[12:35:02] QR Code gerado, aguardando scan.</p>
          <p>[12:36:15] Usuário 123 conectado.</p>
          <p>[12:40:21] Tentativa de reconexão iniciada.</p>
          <p>[12:42:30] Bot desconectado inesperadamente.</p>
        </div>
      </section>

      {/* Estatísticas */}
      <section className="bg-white shadow rounded p-4">
        <h3 className="text-xl font-semibold mb-2">Estatísticas</h3>
        <div className="flex space-x-4 text-sm">
          <div className="flex-1 bg-blue-100 rounded p-4">
            <p className="font-bold text-lg">1.234</p>
            <p className="text-gray-700">Mensagens enviadas</p>
          </div>
          <div className="flex-1 bg-purple-100 rounded p-4">
            <p className="font-bold text-lg">567</p>
            <p className="text-gray-700">Mensagens recebidas</p>
          </div>
          <div className="flex-1 bg-pink-100 rounded p-4">
            <p className="font-bold text-lg">89%</p>
            <p className="text-gray-700">Taxa de resposta</p>
          </div>
        </div>
      </section>
    </div>
  )
}
