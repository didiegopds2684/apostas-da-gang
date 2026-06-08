import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useGames } from '../queries/useGames'
import { useMyGroups } from '../queries/useGroups'
import { Avatar } from '../components/ui/Avatar'
import { Icon } from '../components/ui/Icon'

function StatTile({ value, label, accent, icon }: { value: string | number; label: string; accent?: string; icon?: string }) {
  return (
    <div className="rounded-2xl bg-ink-900 ring-1 ring-line px-3 py-3.5 flex flex-col gap-1">
      <div className="flex items-center gap-1.5" style={{ color: accent || 'white' }}>
        {icon && <Icon name={icon as any} className="w-3.5 h-3.5" />}
        <span className="font-score font-bold text-[28px] leading-none tabular-nums">{value}</span>
      </div>
      <span className="text-[11px] text-line-strong leading-tight">{label}</span>
    </div>
  )
}

const ACHIEVEMENTS = [
  { icon: 'star', label: 'Olho de águia', sub: '5 placares exatos', color: '#f5b417', key: 'exactScores', threshold: 5 },
  { icon: 'target', label: 'Pontaria', sub: '70% de acerto', color: 'var(--accent)', key: 'accuracy', threshold: 70 },
  { icon: 'trophy', label: 'Boleiro', sub: '10 palpites feitos', color: '#f5b417', key: 'preds', threshold: 10 },
  { icon: 'fire', label: 'Em chamas', sub: '3 acertos seguidos', color: '#ff5a5f', key: 'none', threshold: 999 },
]

export function ProfilePage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { data: games } = useGames()
  const { data: groups } = useMyGroups()

  if (!user) return null

  const totalPreds = games?.filter((g) => g.myPrediction !== null).length ?? 0
  const exactScores = games?.filter((g) => g.myPrediction?.points === 3).length ?? 0
  const correctResults = games?.filter((g) => (g.myPrediction?.points ?? 0) > 0 && g.myPrediction?.points !== 3).length ?? 0
  const totalPoints = games?.reduce((acc, g) => acc + (g.myPrediction?.points ?? 0), 0) ?? 0
  const scored = games?.filter((g) => g.myPrediction?.points != null).length ?? 0
  const accuracy = scored ? Math.round(((exactScores + correctResults) / scored) * 100) : 0

  const achieved: Record<string, number> = { exactScores, accuracy, preds: totalPreds }

  return (
    <div className="px-4 py-6 pb-28 md:pb-10 max-w-2xl mx-auto animate-fade-in space-y-6">
      {/* Header card */}
      <div className="relative overflow-hidden rounded-3xl ring-1 ring-line bg-ink-900 px-5 py-7">
        <div className="absolute inset-0 stadium-bg" />
        <div className="relative flex flex-col items-center text-center gap-3">
          <Avatar name={user.name} avatarUrl={user.avatarUrl} size="xl" ring />
          <div>
            <h1 className="font-display font-extrabold text-2xl text-white">{user.name}</h1>
            <p className="text-sm text-line-strong">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/15 ring-1 ring-gold-500/30 text-gold-400 text-xs font-bold">
              <Icon name="trophy" className="w-3.5 h-3.5" /> {totalPoints} pts totais
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent)]/12 ring-1 ring-[var(--accent)]/25 text-[var(--accent)] text-xs font-bold">
              <Icon name="users" className="w-3.5 h-3.5" /> {groups?.length ?? 0} grupos
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile value={totalPreds} label="palpites dados" icon="target" />
        <StatTile value={exactScores} label="placares exatos" accent="#f5b417" icon="star" />
        <StatTile value={correctResults} label="resultados certos" accent="var(--accent)" icon="check" />
        <StatTile value={`${accuracy}%`} label="aproveitamento" accent="var(--accent)" icon="flash" />
      </div>

      {/* Achievements */}
      <div>
        <h2 className="text-[12px] font-bold text-line-strong uppercase tracking-[0.14em] mb-3">Conquistas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ACHIEVEMENTS.map((a) => {
            const done = a.key !== 'none' && (achieved[a.key] ?? 0) >= a.threshold
            return (
              <div key={a.label}
                className={`rounded-2xl ring-1 p-4 flex flex-col items-center text-center gap-2 transition ${done ? 'bg-ink-900 ring-line' : 'bg-ink-900/40 ring-line opacity-45'}`}>
                <div className="w-12 h-12 rounded-2xl grid place-items-center"
                  style={{ background: done ? `color-mix(in oklab, ${a.color} 18%, #141d19)` : '#141d19', color: done ? a.color : '#3a4a43' }}>
                  <Icon name={a.icon as any} className="w-6 h-6" fill={done} />
                </div>
                <div>
                  <p className="text-sm font-display font-bold text-white">{a.label}</p>
                  <p className="text-[11px] text-line-strong">{a.sub}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Settings */}
      <div className="rounded-2xl bg-ink-900 ring-1 ring-line overflow-hidden">
        {[
          { icon: 'users', label: 'Meus grupos', sub: `${groups?.length ?? 0} grupos ativos`, action: () => navigate('/groups') },
          { icon: 'logout', label: 'Sair da conta', sub: null, danger: true, action: signOut },
        ].map((r, i) => (
          <button key={r.label} onClick={r.action}
            className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.03] transition ${i > 0 ? 'border-t border-line' : ''}`}>
            <div className={`w-9 h-9 rounded-xl grid place-items-center ${r.danger ? 'bg-live/12 text-live' : 'bg-ink-800 text-line-strong'}`}>
              <Icon name={r.icon as any} className="w-4 h-4" />
            </div>
            <div className="flex-1 text-left">
              <p className={`text-sm font-semibold ${r.danger ? 'text-live' : 'text-white'}`}>{r.label}</p>
              {r.sub && <p className="text-[11px] text-line-strong">{r.sub}</p>}
            </div>
            {!r.danger && <Icon name="chevron-right" className="w-4 h-4 text-line-strong" />}
          </button>
        ))}
      </div>
    </div>
  )
}
