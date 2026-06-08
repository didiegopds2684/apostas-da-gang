import { useParams, useNavigate } from 'react-router-dom'
import { useGroupRanking } from '../queries/useRanking'
import { useGroup } from '../queries/useGroups'
import { Avatar } from '../components/ui/Avatar'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Icon } from '../components/ui/Icon'
import type { RankingEntry } from '../types/api'

const MEDAL_COLORS = ['#f5b417', '#c7ccc9', '#cd7f4d']

function RankRow({ entry, position, compact = false }: { entry: RankingEntry; position: number; compact?: boolean }) {
  const medal = position <= 3
  const mc = MEDAL_COLORS[position - 1]

  return (
    <div className={`flex items-center gap-3 ${compact ? 'py-1.5' : 'p-3.5 rounded-2xl ring-1'} transition
      ${!compact && (entry.isMe ? 'bg-[var(--accent)]/8 ring-[var(--accent)]/30' : 'bg-ink-900 ring-line')}`}>
      <div className="w-7 shrink-0 grid place-items-center">
        {medal ? (
          <span className="grid place-items-center w-6 h-6 rounded-full font-score font-bold text-xs"
            style={{ background: `color-mix(in oklab, ${mc} 22%, transparent)`, color: mc, boxShadow: `inset 0 0 0 1.5px ${mc}` }}>
            {position}
          </span>
        ) : (
          <span className="font-score font-bold text-line-strong">{position}</span>
        )}
      </div>
      <Avatar name={entry.name} avatarUrl={entry.avatarUrl} size={compact ? 'sm' : 'md'} />
      <div className="flex-1 min-w-0">
        <p className={`font-semibold truncate ${entry.isMe ? 'text-[var(--accent)]' : 'text-white'} ${compact ? 'text-sm' : ''}`}>
          {entry.name.split(' ')[0]}
          {entry.isMe && <span className="text-line-strong font-normal text-xs ml-1">(você)</span>}
        </p>
        {!compact && (
          <p className="text-[11px] text-line-strong">{entry.exactScores} exatos · {entry.correctResults} resultados</p>
        )}
      </div>
      <div className="text-right shrink-0">
        <span className={`font-score font-bold tabular-nums ${compact ? 'text-base' : 'text-2xl'} ${entry.isMe ? 'text-[var(--accent)]' : medal ? 'text-white' : 'text-white/80'}`}>
          {entry.totalPoints}
        </span>
        {!compact && <span className="text-[10px] text-line-strong ml-1">pts</span>}
      </div>
    </div>
  )
}

export function RankingPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: ranking, isLoading, error, refetch } = useGroupRanking(id!)
  const { data: group } = useGroup(id!)

  const top3 = ranking?.ranking.slice(0, 3) ?? []
  const rest = ranking?.ranking.slice(3) ?? []
  const pct = ranking ? Math.round((ranking.totalGamesScored / Math.max(ranking.totalGames, 1)) * 100) : 0
  const podiumOrder = [top3[1], top3[0], top3[2]]

  return (
    <div className="px-4 py-6 pb-28 md:pb-10 max-w-2xl mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-line-strong hover:text-white mb-5 transition text-sm font-medium">
        <Icon name="arrow-left" className="w-4 h-4" /> Voltar
      </button>

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🏆</span>
          <div>
            <h1 className="font-display font-extrabold text-2xl text-white leading-tight">Ranking</h1>
            {group && <p className="text-sm text-line-strong">{group.name}</p>}
          </div>
        </div>
        <button onClick={() => refetch()}
          className="grid place-items-center w-9 h-9 rounded-xl bg-ink-900 ring-1 ring-line text-line-strong hover:text-white transition">
          <Icon name="refresh" className="w-4 h-4" />
        </button>
      </div>

      {isLoading && <div className="flex justify-center py-12"><LoadingSpinner /></div>}
      {error && <ErrorMessage message="Erro ao carregar ranking" onRetry={() => refetch()} />}

      {ranking && (
        <>
          {/* Podium */}
          {top3.length > 0 && (
            <div className="relative overflow-hidden rounded-3xl ring-1 ring-line bg-ink-900 mb-4 px-4 pt-6 pb-4">
              <div className="absolute inset-0 stadium-bg" />
              <div className="relative flex items-end justify-center gap-2.5">
                {podiumOrder.map((r, i) => {
                  if (!r) return <div key={i} className="flex-1 max-w-[110px]" />
                  const pos = r.position
                  const h = pos === 1 ? 128 : pos === 2 ? 96 : 72
                  const c = MEDAL_COLORS[pos - 1]
                  return (
                    <div key={i} className="flex-1 max-w-[120px] flex flex-col items-center gap-2">
                      {pos === 1 && <Icon name="crown" className="w-5 h-5 text-gold-400 -mb-1" fill />}
                      <Avatar name={r.name} avatarUrl={r.avatarUrl} size={pos === 1 ? 'lg' : 'md'} ring={r.isMe} />
                      <p className={`text-xs font-semibold text-center truncate w-full ${r.isMe ? 'text-[var(--accent)]' : 'text-white'}`}>
                        {r.name.split(' ')[0]}
                      </p>
                      <div className="w-full rounded-t-xl flex flex-col items-center justify-start pt-2.5 gap-0.5"
                        style={{ height: h, background: `color-mix(in oklab, ${c} 18%, #141d19)`, boxShadow: `inset 0 3px 0 ${c}` }}>
                        <span className="font-score font-bold text-2xl tabular-nums" style={{ color: c }}>{r.totalPoints}</span>
                        <span className="text-[10px] text-line-strong">pts</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Progress */}
          <div className="rounded-2xl bg-ink-900 ring-1 ring-line p-4 mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-line-strong">Progresso do campeonato</span>
              <span className="font-semibold text-white tabular-nums">
                {ranking.totalGamesScored} / {ranking.totalGames} jogos
              </span>
            </div>
            <div className="h-2.5 bg-ink-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--accent), #f5b417)' }} />
            </div>
          </div>

          {/* Rest of list */}
          {rest.length > 0 && (
            <div className="space-y-2">
              {rest.map((r) => <RankRow key={r.userId} entry={r} position={r.position} />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}
