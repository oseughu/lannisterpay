import { Router } from 'express'
import { feeRouter } from '#routes/feeRouter'
import { transactionRouter } from '#routes/transactionRouter'

export const routes = Router()

routes.use(feeRouter)
routes.use(transactionRouter)
