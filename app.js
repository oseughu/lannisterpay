import express, { json } from 'express'
import compression from 'compression'
import { routes } from '#routes'

const app = express()
const port = process.env.PORT || 3000

app.use(compression())
app.use(json())
app.use(routes)

app.listen(port, () => console.log('Server started successfully.'))
