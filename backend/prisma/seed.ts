// backend/prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categoriesToSeed = [
    'Lanches',
    'Bebidas',
    'Pizzas',
    'Acréscimos',
    'Sobremesas',
  ];

  console.log('Iniciando o seeding de categorias...');

  for (const categoryName of categoriesToSeed) {
    // Tenta encontrar a categoria existente pelo nome
    const existingCategory = await prisma.categoria.findUnique({
      where: { nome: categoryName },
    });

    if (!existingCategory) {
      // Se não existir, cria a categoria
      await prisma.categoria.create({
        data: { nome: categoryName },
      });
      console.log(`Categoria '${categoryName}' criada.`);
    } else {
      console.log(`Categoria '${categoryName}' já existe. Pulando.`);
    }
  }

  console.log('Seeding de categorias concluído.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
