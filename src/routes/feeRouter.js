import feeController from '#controllers/feeController'
import { Router } from 'express'

const feeRouter = Router()

feeRouter.post('/fees', feeController)

export default feeRouter
