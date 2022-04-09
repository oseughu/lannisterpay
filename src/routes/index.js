import { Router } from 'express'
import { homeRouter } from '#routes/homeRouter'
import { feeRouter } from '#routes/feeRouter'
import { transactionRouter } from '#routes/transactionRouter'

export const routes = Router()

routes.use(homeRouter)
routes.use(feeRouter)
routes.use(transactionRouter)
