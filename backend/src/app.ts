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

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))
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
