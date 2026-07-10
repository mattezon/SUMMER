import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import http from 'http'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import { errorHandler } from './middlewares/errorMiddleware.js'
import authRouter from './routes/authRotes.js'

dotenv.config()

const app = express()

app.use(
	cors({
		origin: [process.env.CLIENT_URL],
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
	})
)

app.use(express.json())
app.use(cookieParser())

app.use('/auth', authRouter)

app.use(errorHandler)

const port = process.env.PORT || 5000
const server = http.createServer(app)

const startServer = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URI)
		console.log('MongoDB connected successfully')

		server.listen(port, () => {
			console.log(`Server is running on PORT: ${port}`)
		})
	} catch (error) {
		console.error('MongoDB connection failed:', error)
		process.exit(1)
	}
}

startServer()
