import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Copy, Share2, Trophy, Crown, UserX } from 'lucide-react'
import toast from 'react-hot-toast'
import { useGroup, useRemoveMember, useLeaveGroup } from '../queries/useGroups'
import { useAuth } from '../contexts/AuthContext'
import { Avatar } from '../components/ui/Avatar'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'

export function GroupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: group, isLoading, error, refetch } = useGroup(id!)
  const removeMember = useRemoveMember(id!)
  const leaveGroup = useLeaveGroup(id!)

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !group) {
    return (
      <div className="px-4 py-6">
        <ErrorMessage message="Grupo não encontrado" onRetry={() => refetch()} />
      </div>
    )
  }

  const isAdmin = group.members.find((m) => m.userId === user?.id)?.role === 'admin'

  function copyCode() {
    if (group?.inviteCode) {
      navigator.clipboard.writeText(group.inviteCode)
      toast.success('Código copiado!')
    }
  }

  function shareLink() {
    const url = `${window.location.origin}/groups/join?code=${group?.inviteCode}`
    navigator.clipboard.writeText(url)
    toast.success('Link de convite copiado!')
  }

  async function handleRemove(userId: string, name: string) {
    if (!confirm(`Remover ${name} do grupo?`)) return
    try {
      await removeMember.mutateAsync(userId)
      toast.success('Membro removido')
    } catch {
      toast.error('Erro ao remover membro')
    }
  }

  async function handleLeave() {
    if (!confirm('Sair do grupo?')) return
    try {
      await leaveGroup.mutateAsync()
      toast.success('Você saiu do grupo')
      navigate('/groups')
    } catch {
      toast.error('Erro ao sair do grupo')
    }
  }

  return (
    <div className="px-4 py-6 pb-24 md:pb-6 max-w-2xl mx-auto animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{group.name}</h1>
          <p className="text-sm text-gray-500">{group.members.length} membros</p>
        </div>
        <Link
          to={`/groups/${id}/ranking`}
          className="flex items-center gap-1.5 bg-copa-green/20 hover:bg-copa-green/30 text-copa-green-light px-3 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <Trophy className="h-4 w-4" />
          Ranking
        </Link>
      </div>

      {/* Invite code — admin only */}
      {isAdmin && group.inviteCode && (
        <div className="card p-4 mb-6">
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-medium">Código de convite</p>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-mono font-black text-white tracking-[0.3em] flex-1">
              {group.inviteCode}
            </span>
            <button
              onClick={copyCode}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
              title="Copiar código"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={shareLink}
              className="p-2 rounded-lg bg-copa-green/20 hover:bg-copa-green/30 text-copa-green-light transition-colors"
              title="Compartilhar link"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Members */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Membros</h2>
        <div className="space-y-2">
          {group.members.map((member) => (
            <div key={member.userId} className="card p-3 flex items-center gap-3">
              <Avatar name={member.name} avatarUrl={member.avatarUrl} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-medium text-white truncate">{member.name}</p>
                  {member.role === 'admin' && (
                    <Crown className="h-3.5 w-3.5 text-copa-yellow flex-shrink-0" />
                  )}
                  {member.userId === user?.id && (
                    <span className="text-xs text-gray-500">(você)</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 capitalize">{member.role}</p>
              </div>
              {isAdmin && member.userId !== user?.id && (
                <button
                  onClick={() => handleRemove(member.userId, member.name)}
                  className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  title="Remover membro"
                >
                  <UserX className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Leave group */}
      {!isAdmin && (
        <div className="mt-8 pt-6 border-t border-gray-800">
          <button
            onClick={handleLeave}
            className="text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            Sair do grupo
          </button>
        </div>
      )}
    </div>
  )
}
