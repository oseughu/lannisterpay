import { Router } from 'express'
import { feeController } from '#controllers/feeController'

export const feeRouter = Router()

feeRouter.post('/fees', feeController)
