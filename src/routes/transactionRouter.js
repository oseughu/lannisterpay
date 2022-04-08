import { Router } from 'express'
import { transactionController } from '#controllers/transactionController'

export const transactionRouter = Router()

transactionRouter.post('/compute-transaction-fee', transactionController)
