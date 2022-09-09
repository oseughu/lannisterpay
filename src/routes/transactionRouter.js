import transactionController from '#controllers/transactionController'
import { Router } from 'express'

const transactionRouter = Router()

transactionRouter.post('/compute-transaction-fee', transactionController)

export default transactionRouter
