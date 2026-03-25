import { prisma } from '../lib/prisma'

type ScoreObj = { homeScore: number; awayScore: number }

function getResult(obj: ScoreObj): 'home' | 'away' | 'draw' {
  if (obj.homeScore > obj.awayScore) return 'home'
  if (obj.awayScore > obj.homeScore) return 'away'
  return 'draw'
}

export async function scoreGame(gameId: string): Promise<void> {
  const game = await prisma.game.findUnique({ where: { id: gameId } })
  if (!game || game.homeScore === null || game.awayScore === null) return

  const predictions = await prisma.prediction.findMany({ where: { gameId } })

  for (const pred of predictions) {
    const exactScore = pred.homeScore === game.homeScore && pred.awayScore === game.awayScore
    const correctResult = getResult({ homeScore: pred.homeScore, awayScore: pred.awayScore }) === getResult({ homeScore: game.homeScore!, awayScore: game.awayScore! })

    const points = exactScore ? 3 : correctResult ? 1 : 0
    await prisma.prediction.update({ where: { id: pred.id }, data: { points } })
  }
}
