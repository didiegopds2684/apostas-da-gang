import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useGroup, useRemoveMember, useLeaveGroup } from '../queries/useGroups'
import { useAuth } from '../contexts/AuthContext'
import { Avatar } from '../components/ui/Avatar'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Icon } from '../components/ui/Icon'

export function GroupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: group, isLoading, error, refetch } = useGroup(id!)
  const removeMember = useRemoveMember(id!)
  const leaveGroup = useLeaveGroup(id!)
  const [copied, setCopied] = useState(false)

  if (isLoading) return <div className="flex justify-center py-16"><LoadingSpinner /></div>
  if (error || !group) return <div className="px-4 py-6"><ErrorMessage message="Grupo não encontrado" onRetry={() => refetch()} /></div>

  const isAdmin = group.members.find((m) => m.userId === user?.id)?.role === 'admin'

  function copyCode() {
    if (group?.inviteCode) {
      navigator.clipboard.writeText(group.inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
      toast.success('Código copiado!')
    }
  }

  function shareLink() {
    const url = `${window.location.origin}/groups/join?code=${group?.inviteCode}`
    navigator.clipboard.writeText(url)
    toast.success('Link copiado!')
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
    <div className="px-4 py-6 pb-28 md:pb-10 max-w-2xl mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-line-strong hover:text-white mb-5 transition text-sm font-medium">
        <Icon name="arrow-left" className="w-4 h-4" /> Voltar
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-ink-800 ring-1 ring-line grid place-items-center text-2xl">🏆</div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-extrabold text-2xl text-white">{group.name}</h1>
              {isAdmin && <Icon name="crown" className="w-4 h-4 text-gold-400" fill />}
            </div>
            <p className="text-sm text-line-strong">{group.members.length} membros</p>
          </div>
        </div>
        <button onClick={() => navigate(`/groups/${id}/ranking`)}
          className="flex items-center gap-1.5 bg-[var(--accent)]/15 ring-1 ring-[var(--accent)]/30 text-[var(--accent)] px-3 py-2 rounded-xl text-sm font-bold hover:bg-[var(--accent)]/25 transition">
          <Icon name="trophy" className="w-4 h-4" /> Ranking
        </button>
      </div>

      <div className="space-y-4">
        {/* Invite code */}
        {isAdmin && group.inviteCode && (
          <div className="rounded-2xl bg-ink-900 ring-1 ring-line p-4">
            <p className="text-[11px] text-line-strong uppercase tracking-wider font-bold mb-2.5">Código de convite</p>
            <div className="flex items-center gap-3">
              <span className="flex-1 font-score font-bold text-3xl text-white tracking-[0.2em]">{group.inviteCode}</span>
              <button onClick={copyCode}
                className="grid place-items-center w-10 h-10 rounded-xl bg-ink-800 ring-1 ring-line text-line-strong hover:text-white transition">
                <Icon name={copied ? 'check' : 'copy'} className="w-4 h-4" />
              </button>
              <button onClick={shareLink}
                className="grid place-items-center w-10 h-10 rounded-xl bg-[var(--accent)]/15 ring-1 ring-[var(--accent)]/30 text-[var(--accent)] hover:bg-[var(--accent)]/25 transition">
                <Icon name="share" className="w-4 h-4" />
              </button>
            </div>
            {copied && <p className="text-[11px] text-pitch-400 mt-2 font-semibold animate-fade-in">Copiado!</p>}
          </div>
        )}

        {/* Members */}
        <div className="rounded-2xl bg-ink-900 ring-1 ring-line p-4">
          <p className="text-[11px] text-line-strong uppercase tracking-wider font-bold mb-3">Membros</p>
          <div className="space-y-1">
            {group.members.map((member) => (
              <div key={member.userId} className="flex items-center gap-3 py-1.5">
                <Avatar name={member.name} avatarUrl={member.avatarUrl} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-white truncate">{member.name}</span>
                    {member.role === 'admin' && <Icon name="crown" className="w-3.5 h-3.5 text-gold-400" fill />}
                    {member.userId === user?.id && <span className="text-[11px] text-line-strong">(você)</span>}
                  </div>
                </div>
                {isAdmin && member.userId !== user?.id && (
                  <button onClick={() => handleRemove(member.userId, member.name)}
                    className="p-2 rounded-lg text-line-strong hover:text-live hover:bg-live/10 transition">
                    <Icon name="x" className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Leave group */}
        {!isAdmin && (
          <button onClick={handleLeave}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl ring-1 ring-live/30 text-live hover:bg-live/10 transition text-sm font-semibold">
            <Icon name="logout" className="w-4 h-4" />
            Sair do grupo
          </button>
        )}
      </div>
    </div>
  )
}
