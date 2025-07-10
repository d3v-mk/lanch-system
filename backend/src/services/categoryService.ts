// backend/src/services/categoryService.ts
import prisma from '../prismaClient';

/**
 * Busca todas as categorias disponíveis no banco de dados.
 * @returns Uma lista de objetos Categoria.
 */
export async function getCategories() {
  try {
    const categories = await prisma.categoria.findMany({
      orderBy: {
        nome: 'asc',
      },
    });
    return categories;
  } catch (error: unknown) { // Explicitly type error as unknown
    console.error('Erro ao buscar categorias:', error);
    // Check if error is an instance of Error to safely access message
    if (error instanceof Error) {
      console.error('Detalhes do erro:', error.message);
    }
    throw new Error('Não foi possível carregar as categorias no momento.');
  }
}

/**
 * Cria uma nova categoria.
 * @param nome O nome da nova categoria.
 * @returns A categoria criada.
 */
export async function createCategory(nome: string) {
  try {
    const newCategory = await prisma.categoria.create({
      data: { nome },
    });
    return newCategory;
  } catch (error: any) { // Type as 'any' for simpler access to Prisma error codes
    console.error('Erro ao criar categoria:', error);
    if (error.code === 'P2002') { // Prisma error code for unique constraint violation
      throw new Error(`Já existe uma categoria com o nome '${nome}'.`);
    }
    throw new Error('Não foi possível criar a categoria.');
  }
}

/**
 * Atualiza uma categoria existente.
 * @param id O ID da categoria a ser atualizada.
 * @param nome O novo nome da categoria.
 * @returns A categoria atualizada.
 */
export async function updateCategory(id: string, nome: string) {
  try {
    const updatedCategory = await prisma.categoria.update({
      where: { id },
      data: { nome },
    });
    return updatedCategory;
  } catch (error: any) { // Type as 'any' for simpler access to Prisma error codes
    console.error(`Erro ao atualizar categoria ${id}:`, error);
    if (error.code === 'P2002') {
      throw new Error(`Já existe uma categoria com o nome '${nome}'.`);
    }
    throw new Error('Não foi possível atualizar a categoria.');
  }
}

/**
 * Deleta uma categoria.
 * @param id O ID da categoria a ser deletada.
 */
export async function deleteCategory(id: string) {
  try {
    // Opcional: Adicionar verificação se há produtos associados a esta categoria
    // Se houver produtos, você pode:
    // 1. Impedir a exclusão e retornar um erro.
    // 2. Definir categoriaId para null nos produtos (se fosse opcional).
    // 3. Deletar os produtos em cascata (requer onDelete: Cascade no schema).
    // Por enquanto, vamos apenas tentar deletar. Se houver produtos, o banco pode dar erro de FK.

    await prisma.categoria.delete({
      where: { id },
    });
  } catch (error: any) { // Type as 'any' for simpler access to Prisma error codes
    console.error(`Erro ao deletar categoria ${id}:`, error);
    if (error.code === 'P2003') { // Prisma error code for foreign key constraint violation
      throw new Error('Não é possível deletar esta categoria, pois existem produtos associados a ela.');
    }
    throw new Error('Não foi possível deletar a categoria.');
  }
}
