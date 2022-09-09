import connectDb from '#config/db'
import routes from '#routes'
import 'dotenv/config'
import express from 'express'

const port = process.env.PORT || 3000
const app = express()

connectDb()

app.use(routes)

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
