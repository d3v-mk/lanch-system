// backend/src/routes/cardapio.ts
import { Router } from 'express';
import { generateMenuImage } from '../services/imageGeneratorService'; // Ajuste o caminho

const router = Router();

router.get('/cardapio-image', async (req, res) => {
  try {
    const imageBuffer = await generateMenuImage();

    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': imageBuffer.length
    });
    res.end(imageBuffer); // Envia o buffer da imagem como resposta
  } catch (error) {
    console.error('Erro ao gerar imagem do cardápio:', error);
    res.status(500).json({ erro: 'Erro ao gerar imagem do cardápio.' });
  }
});

export default router;