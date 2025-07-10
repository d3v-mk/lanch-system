import { Router } from 'express'
import pedidoRoutes from './pedidos'
import produtoRoutes from './produtos'
import clientesRouter from './clientes'
import chatRouter from './chat';
import cardapioRouter from './cardapio';
import categoriasRouter from './categorias';

const router = Router()

router.use('/pedidos', pedidoRoutes)
router.use('/produtos', produtoRoutes)
router.use('/clientes', clientesRouter)
router.use('/chat', chatRouter);
router.use('/cardapio', cardapioRouter)
router.use('/categorias', categoriasRouter)


export default router
