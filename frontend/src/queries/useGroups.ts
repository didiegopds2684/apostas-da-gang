import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'
import type { Group, GroupDetail } from '../types/api'

export function useMyGroups() {
  return useQuery<Group[]>({
    queryKey: ['groups'],
    queryFn: async () => {
      const res = await api.get('/groups')
      return res.data.groups
    },
  })
}

export function useGroup(id: string) {
  return useQuery<GroupDetail>({
    queryKey: ['groups', id],
    queryFn: async () => {
      const res = await api.get(`/groups/${id}`)
      return res.data.group
    },
    enabled: !!id,
  })
}

export function useCreateGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (name: string) => {
      const res = await api.post('/groups', { name })
      return res.data.group as Group
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups'] }),
  })
}

export function useJoinGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (inviteCode: string) => {
      const res = await api.post('/groups/join', { inviteCode })
      return res.data.group as Group
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups'] }),
  })
}

export function useRemoveMember(groupId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/groups/${groupId}/members/${userId}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups', groupId] }),
  })
}

export function useLeaveGroup(groupId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await api.delete(`/groups/${groupId}/members/me`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups'] }),
  })
}
