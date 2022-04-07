import express from 'express'
import { homeRouter } from './homeRouter.js'
import { feeRouter } from './feeRouter.js'
import { transactionRouter } from './transactionRouter.js'

export const routes = express.Router()

routes.use(homeRouter)
routes.use(feeRouter)
routes.use(transactionRouter)
