// backend/src/services/imageGeneratorService.ts
import { createCanvas, loadImage, registerFont } from 'canvas';
import { getProdutos } from './produtoService'; // Caminho corrigido para o novo serviço
import { getCategories } from './categoryService'; // <--- Importa o serviço de categorias
import path from 'path';

// --- Configurações de Fontes (Opcional) ---
// Para um design bom, usar fontes personalizadas é essencial.
// Se você tiver arquivos de fonte (.ttf, .otf) no seu backend, pode registrá-los aqui.
// Exemplo:
// registerFont(path.resolve(__dirname, '../../fonts/BebasNeue-Regular.ttf'), { family: 'Bebas Neue' });
// registerFont(path.resolve(__dirname, '../../fonts/OpenSans-Bold.ttf'), { family: 'Open Sans', weight: 'bold' });
// registerFont(path.resolve(__dirname, '../../fonts/OpenSans-Regular.ttf'), { family: 'Open Sans' });
// Se não registrar, 'Arial' será usado como fallback, mas o design pode não ser tão impactante.

export async function generateMenuImage(): Promise<Buffer> {
  // Busca apenas os produtos disponíveis para o cardápio
  const allItems = await getProdutos({ paraCardapio: true });

  // DEBUG: Veja todos os itens retornados do banco de dados
  console.log('DEBUG: allItems do banco de dados:', JSON.stringify(allItems, null, 2));

  // --- Agrupamento de Itens por Categoria ---
  const categorizedItems: { [key: string]: any[] } = {};
  allItems.forEach(item => {
    const categoryName = item.categoria?.nome || 'Outros'; // Fallback para "Outros" se não tiver categoria
    if (!categorizedItems[categoryName]) {
      categorizedItems[categoryName] = [];
    }
    categorizedItems[categoryName].push(item);
  });

  // DEBUG: Veja como os itens foram categorizados
  console.log('DEBUG: Itens categorizados:', JSON.stringify(categorizedItems, null, 2));

  // --- BUSCA CATEGORIAS DO BANCO DE DADOS DINAMICAMENTE ---
  let dbCategories = await getCategories();
  // Converte os nomes das categorias para MAIÚSCULAS para consistência com os produtos
  // E garante que a ordem seja mantida conforme a ordem do DB (ou alfabética se preferir)
  const dynamicCategoryOrder = dbCategories.map(cat => cat.nome.toUpperCase()).sort(); // Adicionei .sort() para ordem alfabética

  // Adiciona 'Outros' se houver produtos sem categoria ou com categoria não listada no DB
  if (categorizedItems['Outros'] && !dynamicCategoryOrder.includes('Outros')) {
    dynamicCategoryOrder.push('Outros');
  }

  // Filtra as categorias a serem desenhadas com base nas que realmente têm produtos
  const categoriesToDraw = dynamicCategoryOrder.filter(catName => categorizedItems[catName] && categorizedItems[catName].length > 0);

  // DEBUG: Veja quais categorias serão desenhadas
  console.log('DEBUG: Categorias a serem desenhadas:', categoriesToDraw);


  const canvasWidth = 800;
  const padding = 40;
  const itemLineHeight = 28; // Altura da linha para o nome/preço do item
  const descriptionLineHeight = 20; // Altura da linha para a descrição (um pouco menor)
  const itemBlockSpacing = 25; // Espaçamento entre blocos de itens (nome + descrição)
  const categoryTitleSpacing = 50; // Espaço antes de um novo título de categoria
  const categoryTitleHeight = 35; // Altura do background do título da categoria

  const headerHeight = 170; // Mais espaço para título principal e logo
  const footerHeight = 90; // Mais espaço para rodapé

  // --- Criação inicial do Canvas e Contexto para medições ---
  const tempCanvas = createCanvas(canvasWidth, 100);
  const tempCtx = tempCanvas.getContext('2d');

  let estimatedContentHeight = 0;
  categoriesToDraw.forEach(categoryName => {
    estimatedContentHeight += categoryTitleSpacing;
    estimatedContentHeight += categoryTitleHeight; // Conta o background do título da categoria
    
    tempCtx.font = 'bold 30px Arial'; // Fonte para medição do título da categoria
    
    categorizedItems[categoryName].forEach(item => {
      estimatedContentHeight += itemLineHeight;
      if (item.descricao) {
        const maxWidth = (canvasWidth / 2) - padding * 1.5;
        tempCtx.font = '16px Arial'; // Fonte para medição da descrição
        const words = item.descricao.split(' ');
        let tempLine = '';
        let numLines = 0;
        for (let n = 0; n < words.length; n++) {
          const testLine = tempLine + words[n] + ' ';
          const metrics = tempCtx.measureText(testLine);
          const testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            numLines++;
            tempLine = words[n] + ' ';
          } else {
            tempLine = testLine;
          }
        }
        numLines++;
        estimatedContentHeight += numLines * descriptionLineHeight;
      }
      estimatedContentHeight += itemBlockSpacing;
    });
  });

  const totalHeight = headerHeight + estimatedContentHeight + footerHeight;
  const canvas = createCanvas(canvasWidth, Math.max(totalHeight, 800)); // Garante uma altura mínima para um bom design
  const ctx = canvas.getContext('2d');

  // --- Imagem de Fundo (Placeholder) ---
  // Use uma URL de imagem de fundo que simule o estilo desejado.
  // Esta é uma imagem placeholder genérica. Você pode substituir pela sua.
  try {
    const backgroundImage = await loadImage('https://placehold.co/800x1200/f0e0d0/333333?text=Fundo+Cardapio');
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  } catch (e) {
    console.warn('Não foi possível carregar a imagem de fundo, usando cor sólida:', e);
    ctx.fillStyle = '#f8f8f8'; // Fallback para cor sólida
    ctx.fillRect(0, 0, canvasWidth, canvas.height);
  }

  // --- Área Principal do Conteúdo (Semi-transparente para leitura fácil) ---
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'; // Branco semi-transparente
  ctx.fillRect(padding / 2, headerHeight - 30, canvasWidth - padding, canvas.height - headerHeight - footerHeight + 60);
  
  // Borda suave para a área de conteúdo
  ctx.strokeStyle = '#dddddd';
  ctx.lineWidth = 1;
  ctx.strokeRect(padding / 2, headerHeight - 30, canvasWidth - padding, canvas.height - headerHeight - footerHeight + 60);

  // --- Header ---
  // Título Principal
  ctx.font = 'bold 52px "Arial Black", Arial'; // Fonte mais impactante
  ctx.fillStyle = '#4a2c0f'; // Marrom escuro para um toque quente
  ctx.textAlign = 'center';
  ctx.fillText('NOSSO CARDÁPIO', canvasWidth / 2, 60);

  // Logo/Nome da Lanchonete com um background em forma de retângulo arredondado
  ctx.fillStyle = '#e74c3c'; // Fundo vermelho-alaranjado para o texto do logo
  ctx.beginPath();
  // Desenha um retângulo arredondado. Ajuste os valores (x, y, largura, altura, raio da borda)
  ctx.roundRect(canvasWidth / 2 - 160, 75, 320, 45, 10); 
  ctx.fill();

  ctx.font = 'bold 28px Arial';
  ctx.fillStyle = '#ffffff'; // Texto branco para o logo
  ctx.fillText('BORCELLE', canvasWidth / 2, 105);
  // Opcional: Adicionar uma sombra sutil ao texto do logo para destacá-lo
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 5;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.fillText('BORCELLE', canvasWidth / 2, 105); // Redesenha para aplicar a sombra
  ctx.shadowColor = 'transparent'; // Reseta a sombra para não afetar o resto do desenho

  let currentY = headerHeight; // Inicia o desenho dos itens abaixo do header

  // --- Desenho das Colunas e Categorias ---
  const column1X = padding + 10; // Um pouco mais de padding
  const column2X = canvasWidth / 2 + 30; // Inicia a segunda coluna mais à direita do meio
  const columnWidth = (canvasWidth / 2) - padding * 1.5 - 20; // Largura ajustada para as colunas

  let currentYCol1 = currentY;
  let currentYCol2 = currentY;

  // Função auxiliar para desenhar um item
  const drawMenuItem = (item: any, x: number, y: number, colMaxWidth: number) => {
  // Define fonte do produto + preço
  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = '#333333';
  ctx.textAlign = 'left';

  // Monta a linha: nome + pontos + preço
  const nome = item.nome.trim();
  const preco = `R$ ${parseFloat(item.preco.toString()).toFixed(2).replace('.', ',')}`;
  const dots = '.'.repeat(80); // vai ser cortado com medida abaixo

  const fullLine = `${nome} ${dots}`;
  let trimmedLine = fullLine;

  while (ctx.measureText(trimmedLine + preco).width > colMaxWidth) {
    trimmedLine = trimmedLine.slice(0, -1); // corta ponto por ponto até caber
  }

  ctx.fillText(trimmedLine, x, y);
  ctx.textAlign = 'right';
  ctx.fillText(preco, x + colMaxWidth, y);

  let nextY = y + itemLineHeight;

  // Descrição (se existir)
  if (item.descricao) {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#666666';
    ctx.textAlign = 'left';

    const maxWidth = colMaxWidth;
    const words = item.descricao.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x + 10, nextY); // indentação da descrição
        line = words[n] + ' ';
        nextY += descriptionLineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x + 10, nextY);
    nextY += descriptionLineHeight;
  }

  return nextY + itemBlockSpacing;
};


  // Desenha as categorias
  for (const categoryName of categoriesToDraw) {
    const itemsInCategory = categorizedItems[categoryName];

    // Lógica para atribuir a categoria à coluna mais curta
    let targetX: number;
    let targetY: number;
    let currentColumnY: number;

    if (currentYCol1 <= currentYCol2) {
      targetX = column1X;
      targetY = currentYCol1;
      currentColumnY = currentYCol1;
    } else {
      targetX = column2X;
      targetY = currentYCol2;
      currentColumnY = currentYCol2;
    }

    // Background do Título da Categoria
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(targetX - 10, currentColumnY + categoryTitleSpacing - 25, columnWidth + 20, categoryTitleHeight);

    // Texto do Título da Categoria
    ctx.font = 'bold 26px Arial';
    ctx.fillStyle = '#4a2c0f';
    ctx.textAlign = 'left';
    ctx.fillText(categoryName.toUpperCase(), targetX, currentColumnY + categoryTitleSpacing);

    let currentCategoryY = currentColumnY + categoryTitleSpacing + 15;

    // Espaçamento adicional entre categoria e primeiro item
    currentCategoryY += 25; // Aumentado para mais espaçamento visual

    for (const item of itemsInCategory) {
      let estimatedItemHeight = itemLineHeight;

      if (item.descricao) {
        const maxWidth = (canvasWidth / 2) - padding * 1.5;
        tempCtx.font = '16px Arial';
        const words = item.descricao.split(' ');
        let tempLine = '';
        let numLines = 0;

        for (let n = 0; n < words.length; n++) {
          const testLine = tempLine + words[n] + ' ';
          const metrics = tempCtx.measureText(testLine);
          const testWidth = metrics.width;

          if (testWidth > maxWidth && n > 0) {
            numLines++;
            tempLine = words[n] + ' ';
          } else {
            tempLine = testLine;
          }
        }
        numLines++;
        estimatedItemHeight += numLines * descriptionLineHeight;
      }

      estimatedItemHeight += itemBlockSpacing;

      if (currentCategoryY + estimatedItemHeight > canvas.height - footerHeight - padding) {
        break;
      }

      currentCategoryY = drawMenuItem(item, targetX, currentCategoryY, columnWidth);
    }

    if (targetX === column1X) {
      currentYCol1 = currentCategoryY + 30; // mais espaço entre categorias
    } else {
      currentYCol2 = currentCategoryY + 30;
    }
  }


  // --- Rodapé ---
  ctx.fillStyle = '#e74c3c'; // Cor vermelho-alaranjado para o fundo do rodapé
  ctx.fillRect(0, canvas.height - footerHeight, canvasWidth, footerHeight);

  // Texto do rodapé
  ctx.font = 'bold 22px Arial';
  ctx.fillStyle = '#ffffff'; // Texto branco
  ctx.textAlign = 'center';
  ctx.fillText('@grandesite', canvasWidth / 2, canvas.height - footerHeight / 2 - 15);
  ctx.fillText('(12) 3456-7890', canvasWidth / 2, canvas.height - footerHeight / 2 + 10);

  // --- Finalização ---
  return canvas.toBuffer('image/png'); // Retorna a imagem como um buffer PNG
}
