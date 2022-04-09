import express, { json } from 'express'
import compression from 'compression'
import { connectToDb } from '#config/db'
import { routes } from '#routes'

const port = process.env.PORT || 3000
const app = express()
connectToDb()

app.use(compression())
app.use(json())
app.use(routes)

app.listen(port, () => {
  console.log('Server started successfully.')
})
