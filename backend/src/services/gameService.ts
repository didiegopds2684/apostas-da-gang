import { prisma } from '../lib/prisma'
import axios from 'axios'
import { scoreGame } from './scoringService'
import { translateTeamName } from '../lib/teamNamesPt'

const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hora
const CACHE_TTL_LIVE_MS = 60 * 1000 // 1 minuto quando há jogos ao vivo
const WORLDCUP_API = 'https://worldcup26.ir/get'

interface ApiGame {
  id: string
  home_team_id: string
  away_team_id: string
  home_score: string
  away_score: string
  group: string
  matchday: string
  local_date: string
  finished: string
  time_elapsed: string
  type: string
  home_team_name_en: string
  away_team_name_en: string
}

interface ApiTeam {
  id: string
  name_en: string
  flag: string
}

function parseDate(localDate: string): Date {
  // format: "06/11/2026 13:00" — CST/UTC-6 (Mexico City, sem DST)
  const [datePart, timePart] = localDate.split(' ')
  const [month, day, year] = datePart.split('/')
  const [hour, minute] = timePart.split(':')
  const utcHour = parseInt(hour) + 6 // CST → UTC
  return new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), utcHour, parseInt(minute)))
}

function mapStatus(finished: string, timeElapsed: string): string {
  if (finished === 'TRUE') return 'FT'
  if (timeElapsed === 'notstarted') return 'NS'
  return 'LIVE'
}

function mapStage(type: string, group: string, matchday: string): string {
  if (type === 'group') return `Group Stage - ${matchday}`
  if (type === 'round_of_32') return 'Round of 32'
  if (type === 'round_of_16') return 'Round of 16'
  if (type === 'quarter') return 'Quarter-finals'
  if (type === 'semi') return 'Semi-finals'
  if (type === 'final') return 'Final'
  return type
}

async function isCacheValid(): Promise<boolean> {
  const latest = await prisma.game.findFirst({
    where: { status: { not: 'FT' } },
    orderBy: { updatedAt: 'desc' },
  })
  if (!latest) return false
  const hasLive = await prisma.game.count({ where: { status: 'LIVE' } })
  const ttl = hasLive > 0 ? CACHE_TTL_LIVE_MS : CACHE_TTL_MS
  return Date.now() - latest.updatedAt.getTime() < ttl
}

async function fetchTeamFlags(): Promise<Map<string, string>> {
  const res = await axios.get<{ teams: ApiTeam[] }>(`${WORLDCUP_API}/teams`)
  const map = new Map<string, string>()
  for (const t of res.data.teams) {
    map.set(t.name_en, t.flag)
  }
  return map
}

export async function syncGames(): Promise<void> {
  const [gamesRes, flagMap] = await Promise.all([
    axios.get<{ games: ApiGame[] }>(`${WORLDCUP_API}/games`),
    fetchTeamFlags(),
  ])

  for (const g of gamesRes.data.games) {
    const status = mapStatus(g.finished, g.time_elapsed)
    const data = {
      externalId: parseInt(g.id),
      homeTeam: translateTeamName(g.home_team_name_en) || 'A definir',
      awayTeam: translateTeamName(g.away_team_name_en) || 'A definir',
      homeFlag: flagMap.get(g.home_team_name_en) ?? null,
      awayFlag: flagMap.get(g.away_team_name_en) ?? null,
      startsAt: parseDate(g.local_date),
      stage: mapStage(g.type, g.group, g.matchday),
      groupLabel: g.type === 'group' ? `Grupo ${g.group}` : null,
      status,
      homeScore: status !== 'NS' ? parseInt(g.home_score) : null,
      awayScore: status !== 'NS' ? parseInt(g.away_score) : null,
    }

    const existing = await prisma.game.findUnique({ where: { externalId: data.externalId } })
    const wasFinished = existing?.status === 'FT'
    const nowFinished = status === 'FT'

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
