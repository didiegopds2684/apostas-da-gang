import { prisma } from '../lib/prisma'
import { footballApi } from '../lib/footballApi'
import { scoreGame } from './scoringService'
import fixtureData from '../lib/fixtures/games.json'

const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hora
const WORLD_CUP_LEAGUE_ID = 1
const WORLD_CUP_SEASON = 2026

interface ApiFixture {
  fixture: { id: number; date: string; status: { short: string } }
  league: { round: string }
  teams: {
    home: { name: string; logo: string }
    away: { name: string; logo: string }
  }
  goals: { home: number | null; away: number | null }
}

function parseGroupLabel(round: string): string | null {
  const match = round.match(/Group Stage - (\d+)/i)
  if (match) return `Rodada ${match[1]}`
  return null
}

function mapFixture(f: ApiFixture) {
  return {
    externalId: f.fixture.id,
    homeTeam: f.teams.home.name,
    awayTeam: f.teams.away.name,
    homeFlag: f.teams.home.logo,
    awayFlag: f.teams.away.logo,
    startsAt: new Date(f.fixture.date),
    stage: f.league.round,
    groupLabel: parseGroupLabel(f.league.round),
    status: f.fixture.status.short,
    homeScore: f.goals.home ?? null,
    awayScore: f.goals.away ?? null,
  }
}

async function isCacheValid(): Promise<boolean> {
  const latest = await prisma.game.findFirst({
    where: { status: { not: 'FT' } },
    orderBy: { updatedAt: 'desc' },
  })
  if (!latest) return false
  return Date.now() - latest.updatedAt.getTime() < CACHE_TTL_MS
}

async function fetchFromApi(): Promise<ApiFixture[]> {
  if (process.env.USE_MOCK_API === 'true') {
    return fixtureData as ApiFixture[]
  }
  const res = await footballApi.get('/fixtures', {
    params: { league: WORLD_CUP_LEAGUE_ID, season: WORLD_CUP_SEASON },
  })
  return res.data.response as ApiFixture[]
}

export async function syncGames(): Promise<void> {
  const fixtures = await fetchFromApi()

  for (const f of fixtures) {
    const data = mapFixture(f)
    const existing = await prisma.game.findUnique({ where: { externalId: data.externalId } })

    const wasFinished = existing?.status === 'FT'
    const nowFinished = data.status === 'FT'

    await prisma.game.upsert({
      where: { externalId: data.externalId },
      update: data,
      create: data,
    })

    if (!wasFinished && nowFinished) {
      const game = await prisma.game.findUnique({ where: { externalId: data.externalId } })
      if (game) await scoreGame(game.id)
    }
  }
}

export async function getGames(filters?: { stage?: string; date?: string }, userId?: string) {
  const cacheValid = await isCacheValid()
  const hasAnyGame = await prisma.game.count()

  if (!cacheValid || !hasAnyGame) {
    await syncGames()
  }

  const where: Record<string, unknown> = {}
  if (filters?.stage === 'group') where.stage = { contains: 'Group Stage' }
  if (filters?.stage === 'knockout') where.stage = { not: { contains: 'Group Stage' } }
  if (filters?.date) {
    const start = new Date(filters.date)
    const end = new Date(filters.date)
    end.setDate(end.getDate() + 1)
    where.startsAt = { gte: start, lt: end }
  }

  const games = await prisma.game.findMany({
    where,
    orderBy: { startsAt: 'asc' },
  })

  if (!userId) return games.map(g => ({ ...g, myPrediction: null }))

  const predictions = await prisma.prediction.findMany({
    where: { userId, gameId: { in: games.map(g => g.id) } },
  })

  const predMap = new Map(predictions.map(p => [p.gameId, p]))

  return games.map(g => ({
    ...g,
    myPrediction: predMap.get(g.id) ?? null,
  }))
}

export async function getGameById(id: string, userId?: string) {
  const game = await prisma.game.findUnique({ where: { id } })
  if (!game) return null

  const myPrediction = userId
    ? await prisma.prediction.findUnique({ where: { userId_gameId: { userId, gameId: id } } })
    : null

  return { ...game, myPrediction }
}
