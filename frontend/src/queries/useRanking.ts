import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import type { RankingResponse } from '../types/api'

export function useGroupRanking(groupId: string) {
  return useQuery<RankingResponse>({
    queryKey: ['ranking', groupId],
    queryFn: async () => {
      const res = await api.get(`/groups/${groupId}/ranking`)
      return res.data
    },
    enabled: !!groupId,
    refetchInterval: 5 * 60 * 1000, // 5 minutos
  })
}
