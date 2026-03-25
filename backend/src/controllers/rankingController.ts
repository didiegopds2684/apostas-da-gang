import { Request, Response } from 'express'
import { getGroupRanking } from '../services/rankingService'

export async function groupRanking(req: Request, res: Response): Promise<void> {
  try {
    const data = await getGroupRanking(String(req.params.id), req.user.id)
    res.json(data)
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string }
    res.status(e.status || 500).json({ error: e.message })
  }
}
