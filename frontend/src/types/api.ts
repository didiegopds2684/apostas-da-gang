export interface User {
  id: string
  email: string
  name: string
  avatarUrl: string | null
}

export interface Prediction {
  id: string
  gameId: string
  homeScore: number
  awayScore: number
  points: number | null
  updatedAt: string
}

export interface Game {
  id: string
  externalId: number
  homeTeam: string
  awayTeam: string
  homeFlag: string | null
  awayFlag: string | null
  startsAt: string
  stage: string
  groupLabel: string | null
  homeScore: number | null
  awayScore: number | null
  status: 'NS' | 'LIVE' | 'FT' | string
  myPrediction: Prediction | null
}

export interface Group {
  id: string
  name: string
  inviteCode?: string
  memberCount: number
  myRole: 'admin' | 'member'
}

export interface GroupMember {
  userId: string
  name: string
  avatarUrl: string | null
  role: 'admin' | 'member'
}

export interface GroupDetail {
  id: string
  name: string
  inviteCode?: string
  members: GroupMember[]
}

export interface RankingEntry {
  position: number
  userId: string
  name: string
  avatarUrl: string | null
  totalPoints: number
  exactScores: number
  correctResults: number
  isMe: boolean
}

export interface RankingResponse {
  ranking: RankingEntry[]
  totalGamesScored: number
  totalGames: number
}
