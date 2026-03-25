import { prisma } from '../lib/prisma'

const DEADLINE_MS = 5 * 60 * 1000 // 5 minutos

export async function upsertPrediction(userId: string, gameId: string, homeScore: number, awayScore: number) {
  const game = await prisma.game.findUnique({ where: { id: gameId } })
  if (!game) throw { status: 404, message: 'Jogo não encontrado' }

  const deadline = game.startsAt.getTime() - DEADLINE_MS
  if (Date.now() >= deadline) throw { status: 400, message: 'Prazo para palpite encerrado' }

  const existing = await prisma.prediction.findUnique({
    where: { userId_gameId: { userId, gameId } },
  })

  if (existing) {
    const updated = await prisma.prediction.update({
      where: { id: existing.id },
      data: { homeScore, awayScore },
    })
    return { prediction: updated, created: false }
  }

  const created = await prisma.prediction.create({
    data: { userId, gameId, homeScore, awayScore },
  })
  return { prediction: created, created: true }
}

export async function getMyPredictions(userId: string) {
  return prisma.prediction.findMany({
    where: { userId },
    include: {
      game: {
        select: {
          id: true,
          homeTeam: true,
          awayTeam: true,
          homeFlag: true,
          awayFlag: true,
          startsAt: true,
          status: true,
          homeScore: true,
          awayScore: true,
        },
      },
    },
    orderBy: { game: { startsAt: 'asc' } },
  })
}
