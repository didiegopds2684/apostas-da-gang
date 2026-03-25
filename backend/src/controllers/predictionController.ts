import { Request, Response } from 'express'
import { z } from 'zod'
import { upsertPrediction, getMyPredictions } from '../services/predictionService'

const predictionSchema = z.object({
  gameId: z.string().min(1),
  homeScore: z.number().int().min(0).max(20),
  awayScore: z.number().int().min(0).max(20),
})

export async function savePrediction(req: Request, res: Response): Promise<void> {
  const parsed = predictionSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    return
  }

  const { gameId, homeScore, awayScore } = parsed.data

  try {
    const result = await upsertPrediction(req.user.id, gameId, homeScore, awayScore)
    res.status(result.created ? 201 : 200).json({ prediction: result.prediction })
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string }
    res.status(e.status || 500).json({ error: e.message || 'Erro ao salvar palpite' })
  }
}

export async function myPredictions(req: Request, res: Response): Promise<void> {
  const predictions = await getMyPredictions(req.user.id)
  res.json({ predictions })
}
