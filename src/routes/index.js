import feeRouter from '#routes/feeRouter'
import transactionRouter from '#routes/transactionRouter'
import { Router } from 'express'

const routes = Router()

routes.use(feeRouter)
routes.use(transactionRouter)

export default routes
