import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useGames } from '../queries/useGames'
import { useMyGroups } from '../queries/useGroups'
import { GameCard } from '../components/game/GameCard'
import { Avatar } from '../components/ui/Avatar'
import { Icon } from '../components/ui/Icon'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { isPredictionOpen } from '../utils/dateUtils'

function SectionLabel({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-[12px] font-bold text-line-strong uppercase tracking-[0.14em]">{children}</h2>
      {action}
    </div>
  )
}

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

export function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: games, isLoading: gamesLoading } = useGames()
  const { data: groups } = useMyGroups()

  if (!user) return null

  const firstName = user.name.split(' ')[0]
  const totalPreds = games?.filter((g) => g.myPrediction !== null).length ?? 0
  const exactScores = games?.filter((g) => g.myPrediction?.points === 3).length ?? 0
  const pendingGames = games?.filter((g) => g.status === 'NS' && g.myPrediction === null && isPredictionOpen(g.startsAt)).length ?? 0
  const liveGame = games?.find((g) => g.status === 'LIVE')
  const nextOpen = games?.find((g) => g.status === 'NS' && g.myPrediction === null && isPredictionOpen(g.startsAt))
  const totalGames = games?.length ?? 0

  return (
    <div className="px-4 py-6 pb-28 md:pb-10 max-w-2xl mx-auto space-y-7 animate-fade-in">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <Avatar name={user.name} avatarUrl={user.avatarUrl} size="lg" ring />
          <div>
            <p className="text-line-strong text-sm">Bem-vindo de volta,</p>
            <h1 className="font-display font-extrabold text-2xl text-white leading-tight">{firstName} 👋</h1>
          </div>
        </div>
      </div>

      {/* Tournament banner */}
      <div className="relative overflow-hidden rounded-2xl ring-1 ring-pitch-500/25 pitch-gradient px-5 py-4">
        <div className="pitch-lines" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-950/70">Copa do Mundo 2026</p>
            <p className="font-display font-extrabold text-ink-950 text-lg leading-tight">
              {pendingGames > 0 ? `${pendingGames} palpites pendentes` : 'Fase de grupos em andamento'}
            </p>
          </div>
          <div className="text-right">
            <p className="font-score font-bold text-3xl text-ink-950 leading-none tabular-nums">{totalPreds}/{totalGames}</p>
            <p className="text-[11px] text-ink-950/70 font-semibold">palpites feitos</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile value={totalPreds} label="palpites dados" accent="var(--accent)" icon="target" />
        <StatTile value={exactScores} label="placares exatos" accent="#f5b417" icon="star" />
        <StatTile value={pendingGames} label="jogos pendentes" icon="clock" />
        <StatTile value={groups?.length ?? 0} label="grupos ativos" accent="var(--accent)" icon="users" />
      </div>

      {/* Live game */}
      {liveGame && (
        <div>
          <SectionLabel>Acontecendo agora</SectionLabel>
          <GameCard game={liveGame} />
        </div>
      )}

      {/* Action needed */}
      <div>
        <SectionLabel action={
          <button onClick={() => navigate('/games')} className="text-xs font-semibold text-[var(--accent)] hover:brightness-110 transition">
            Ver todos
          </button>
        }>
          {nextOpen ? 'Ação necessária' : 'Próximos jogos'}
        </SectionLabel>
        {gamesLoading ? (
          <div className="flex justify-center py-8"><LoadingSpinner /></div>
        ) : nextOpen ? (
          <GameCard game={nextOpen} />
        ) : games && games.filter((g) => g.status === 'NS').length > 0 ? (
          <div className="space-y-3">
            {games.filter((g) => g.status === 'NS').slice(0, 3).map((g) => (
              <GameCard key={g.id} game={g} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-ink-900 ring-1 ring-line p-6 text-center">
            <p className="text-line-strong text-sm">Todos os palpites feitos! Aguardando os jogos.</p>
          </div>
        )}
      </div>

      {/* My groups */}
      {groups && groups.length > 0 && (
        <div>
          <SectionLabel action={
            <button onClick={() => navigate('/groups')} className="text-xs font-semibold text-[var(--accent)] hover:brightness-110 transition">
              Gerenciar
            </button>
          }>
            Meus grupos
          </SectionLabel>
          <div className="grid sm:grid-cols-2 gap-3">
            {groups.map((g) => (
              <button key={g.id} onClick={() => navigate(`/groups/${g.id}`)}
                className="text-left rounded-2xl bg-ink-900 ring-1 ring-line hover:ring-line-strong p-4 transition">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-ink-800 grid place-items-center text-lg">🏆</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-display font-bold text-white truncate">{g.name}</p>
                      {g.myRole === 'admin' && <Icon name="crown" className="w-3.5 h-3.5 text-gold-400 shrink-0" fill />}
                    </div>
                    <p className="text-[11px] text-line-strong">{g.memberCount} membros</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
