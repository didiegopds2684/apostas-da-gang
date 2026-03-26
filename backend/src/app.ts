import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { authenticate } from './middlewares/authenticate'
import { errorHandler } from './middlewares/errorHandler'
import authRouter from './routes/auth'
import gamesRouter from './routes/games'
import predictionsRouter from './routes/predictions'
import groupsRouter from './routes/groups'

const app = express()

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
].filter(Boolean) as string[]

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`CORS: origin not allowed — ${origin}`))
    }
  },
  credentials: true,
}

app.options('*', cors(corsOptions))
app.use(cors(corsOptions))
app.use(express.json())

app.use('/auth', authRouter)
app.use('/games', authenticate, gamesRouter)
app.use('/predictions', authenticate, predictionsRouter)
app.use('/groups', authenticate, groupsRouter)

app.get('/health', (_req, res) => res.json({ ok: true }))

app.use(errorHandler)

const PORT = process.env.PORT || 3333
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`)
})

export default app
