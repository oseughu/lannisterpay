import 'dotenv/config'
import mongoose from 'mongoose'

export const connectToDb = () => mongoose.connect(process.env.MONGO_URL)
