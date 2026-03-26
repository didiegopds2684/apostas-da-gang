import { prisma } from '../lib/prisma'

interface RankingRow {
  userId: string
  name: string
  avatarUrl: string | null
  totalPoints: bigint
  exactScores: bigint
  correctResults: bigint
}

export async function getGroupRanking(groupId: string, requesterId: string) {
  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: requesterId } },
  })
  if (!membership) throw { status: 403, message: 'Você não é membro deste grupo' }

  const rows = await prisma.$queryRaw<RankingRow[]>`
    SELECT
      u.id AS "userId",
      u.name,
      u."avatarUrl",
      COALESCE(SUM(p.points), 0)::bigint AS "totalPoints",
      COUNT(CASE WHEN p.points = 3 THEN 1 END)::bigint AS "exactScores",
      COUNT(CASE WHEN p.points = 1 THEN 1 END)::bigint AS "correctResults"
    FROM "GroupMember" gm
    JOIN "User" u ON u.id = gm."userId"
    LEFT JOIN "Prediction" p ON p."userId" = u.id
    LEFT JOIN "Game" g ON g.id = p."gameId" AND g.status = 'FT'
    WHERE gm."groupId" = ${groupId}
    GROUP BY u.id, u.name, u."avatarUrl"
    ORDER BY "totalPoints" DESC, "exactScores" DESC
  `

  const totalGamesScored = await prisma.game.count({ where: { status: 'FT' } })
  const totalGames = await prisma.game.count()

  return {
    ranking: rows.map((row: RankingRow, index: number) => ({
      position: index + 1,
      userId: row.userId,
      name: row.name,
      avatarUrl: row.avatarUrl,
      totalPoints: Number(row.totalPoints),
      exactScores: Number(row.exactScores),
      correctResults: Number(row.correctResults),
      isMe: row.userId === requesterId,
    })),
    totalGamesScored,
    totalGames,
  }
}
