import { Request, Response } from 'express'
import { getGames, getGameById } from '../services/gameService'

export async function listGames(req: Request, res: Response): Promise<void> {
  const stage = typeof req.query.stage === 'string' ? req.query.stage : undefined
  const date = typeof req.query.date === 'string' ? req.query.date : undefined
  const games = await getGames({ stage, date }, req.user.id)
  res.json({ games })
}

export async function getGame(req: Request, res: Response): Promise<void> {
  const game = await getGameById(String(req.params.id), req.user.id)
  if (!game) {
    res.status(404).json({ error: 'Jogo não encontrado' })
    return
  }
  res.json({ game })
}
