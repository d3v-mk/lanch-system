// backend/src/routes/categorias.ts
import { Router } from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryService';

const router = Router();

// Listar categorias
router.get('/', async (req, res) => {
  try {
    const categories = await getCategories();
    res.json(categories);
  } catch (error: any) {
    console.error('Erro na rota GET /categorias:', error);
    res.status(500).json({ erro: error.message });
  }
});

// Criar categoria
router.post('/', async (req, res) => {
  const { nome } = req.body;
  if (!nome) {
    return res.status(400).json({ erro: 'O nome da categoria é obrigatório.' });
  }
  try {
    const newCategory = await createCategory(nome);
    res.status(201).json(newCategory);
  } catch (error: any) {
    console.error('Erro na rota POST /categorias:', error);
    res.status(400).json({ erro: error.message }); // Retorna a mensagem de erro do serviço
  }
});

// Atualizar categoria
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;
  if (!nome) {
    return res.status(400).json({ erro: 'O nome da categoria é obrigatório.' });
  }
  try {
    const updatedCategory = await updateCategory(id, nome);
    res.json(updatedCategory);
  } catch (error: any) {
    console.error(`Erro na rota PUT /categorias/${id}:`, error);
    res.status(400).json({ erro: error.message }); // Retorna a mensagem de erro do serviço
  }
});

// Deletar categoria
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await deleteCategory(id);
    res.status(204).send(); // No Content
  } catch (error: any) {
    console.error(`Erro na rota DELETE /categorias/${id}:`, error);
    res.status(400).json({ erro: error.message }); // Retorna a mensagem de erro do serviço
  }
});

export default router;
