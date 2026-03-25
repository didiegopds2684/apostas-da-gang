import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import type { Game } from '../types/api'

interface GamesFilters {
  stage?: string
  date?: string
}

export function useGames(filters?: GamesFilters) {
  return useQuery<Game[]>({
    queryKey: ['games', filters],
    queryFn: async () => {
      const res = await api.get('/games', { params: filters })
      return res.data.games
    },
  })
}

export function useGame(id: string) {
  return useQuery<Game>({
    queryKey: ['games', id],
    queryFn: async () => {
      const res = await api.get(`/games/${id}`)
      return res.data.game
    },
    enabled: !!id,
  })
}
