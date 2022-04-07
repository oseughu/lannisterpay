import express from 'express'

export const homeRouter = express.Router()

homeRouter.get('/', (req, res) => {
  res.json({ message: 'ok' })
})
