// src/components/Cardapio/CardapioPreview.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function CardapioPreview() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCardapioImage() {
      try {
        setLoading(true);
        setError(null);
        // Faz a requisição para o endpoint do backend que gera a imagem
        // responseType: 'blob' é ideal para imagens no navegador
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/cardapio/cardapio-image`, {
          responseType: 'blob', // Recebe a resposta como um Blob
        });

        // Cria uma URL de objeto a partir do Blob para usar no atributo src da imagem
        const objectURL = URL.createObjectURL(response.data);
        setImageUrl(objectURL);
      } catch (err) {
        console.error('Erro ao buscar imagem do cardápio para preview:', err);
        setError('Não foi possível carregar o preview do cardápio. Verifique o backend.');
      } finally {
        setLoading(false);
      }
    }

    fetchCardapioImage();

    // Limpa a URL do objeto quando o componente for desmontado para liberar memória
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, []); // O array de dependências vazio garante que o efeito só rode uma vez ao montar

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto my-8">
      
      {loading && (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600 text-lg">Carregando prévia do cardápio...</p>
        </div>
      )}

      {error && (
        <div className="flex justify-center items-center h-64">
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      )}

      {imageUrl && !loading && !error && (
        <div className="flex justify-center">
          <img 
            src={imageUrl} 
            alt="Prévia do Cardápio" 
            className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
            style={{ maxWidth: '100%', height: 'auto', display: 'block' }} // Garante responsividade
          />
        </div>
      )}

      {!imageUrl && !loading && !error && (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600 text-lg">Nenhuma prévia disponível.</p>
        </div>
      )}
    </div>
  );
}
