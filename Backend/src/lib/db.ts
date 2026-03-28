import mongo from 'mongoose'
import dotenv from 'dotenv'

dotenv.config();
const MONGO_URI = process.env.MONGO_URI!

export const connectDB = async () => {
    try {
        const conn = await mongo.connect(MONGO_URI)
        console.log(`MongoDB connected: ${conn.connection.host}`)
    } catch (error) {
        console.error(`Error: ${error}`)
    }
}