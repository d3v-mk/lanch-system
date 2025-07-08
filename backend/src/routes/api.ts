import { Router } from 'express'
import pedidoRoutes from './pedidos'
import produtoRoutes from './produtos'
import clientesRouter from './clientes'
import chatRouter from './chat';

const router = Router()

router.use('/pedidos', pedidoRoutes)
router.use('/produtos', produtoRoutes)
router.use('/clientes', clientesRouter)
router.use('/api/chat', chatRouter);


export default router
