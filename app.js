import morgan from 'morgan'
import express from 'express'
import sanitizeMongo from 'express-mongo-sanitize'
import giftRouter from './routes/gifts.js'
import peopleRouter from './routes/people.js'
import connectDatabase from './startup/connectDatabase.js'
import authRouter from "./routes/auth/index.js"
import logError from './middleware/logErrors.js'
import handleError from './middleware/errorHandler.js'

connectDatabase()

const app = express()

app.use(morgan('tiny'))
app.use(express.json())
app.use(sanitizeMongo())

// routes
app.use('/api/people/:id/gifts', giftRouter)
app.use('/api/people', peopleRouter)
app.use('/auth', authRouter)

// Error handlers
app.use(logError)
app.use(handleError)

export default app
