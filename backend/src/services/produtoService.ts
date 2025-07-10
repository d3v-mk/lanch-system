// backend/src/services/produtoService.ts

import prisma from '../prismaClient';
import { normalizeStringForSearch } from '../utils/stringUtils';

export async function getProdutos(options?: { nome?: string; paraCardapio?: boolean }) {
  const whereConditions: any = {};

  if (options?.nome) {
    const normalizedSearchTerm = normalizeStringForSearch(String(options.nome));
    whereConditions.normalizedName = {
      contains: normalizedSearchTerm,
      mode: 'insensitive',
    };
  }

  if (options?.paraCardapio === true) {
    whereConditions.disponivel = true;
  }

  try {
    const produtos = await prisma.produto.findMany({
      where: whereConditions,
      orderBy: {
        nome: 'asc',
      },
      // ESTE 'INCLUDE' É CRUCIAL PARA OBTER OS DADOS DA CATEGORIA
      include: {
        categoria: {
          select: {
            nome: true,
          },
        },
      },
    });
    return produtos;
  } catch (error) {
    console.error('Erro ao buscar produtos/itens do cardápio:', error);
    throw new Error('Não foi possível carregar os produtos no momento.');
  }
}
