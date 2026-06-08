import { useState } from 'react'
import { useGames } from '../queries/useGames'
import { GameCard } from '../components/game/GameCard'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Icon } from '../components/ui/Icon'

type StageFilter = 'all' | 'group' | 'knockout'

const TABS: { label: string; value: StageFilter }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Grupos', value: 'group' },
  { label: 'Eliminatórias', value: 'knockout' },
]

const DOW = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MON = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function fmtDayLabel(s: string) {
  const d = new Date(s)
  return `${DOW[d.getDay()]}, ${d.getDate()} ${MON[d.getMonth()]}`
}

function dayKey(s: string) {
  const d = new Date(s)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

export function GamesPage() {
  const [stage, setStage] = useState<StageFilter>('all')
  const { data: games, isLoading, error, refetch } = useGames({
    stage: stage === 'all' ? undefined : stage,
  })

  const byDay: { key: string; label: string; games: typeof games }[] = []
  games?.forEach((g) => {
    const k = dayKey(g.startsAt)
    let bucket = byDay.find((b) => b.key === k)
    if (!bucket) { bucket = { key: k, label: fmtDayLabel(g.startsAt), games: [] }; byDay.push(bucket) }
    bucket.games!.push(g)
  })

  return (
    <div className="px-4 pb-28 md:pb-10 max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between pt-6 mb-5">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-white">Jogos</h1>
          <p className="text-sm text-line-strong mt-0.5">
            {games ? `${games.length} partidas · dê seus palpites` : 'Carregando...'}
          </p>
        </div>
      </div>

      {/* Stage tabs — sticky */}
      <div className="sticky top-[60px] md:top-[68px] z-20 -mx-1 px-1 py-2 mb-2 bg-ink-950/80 backdrop-blur-md">
        <div className="flex gap-1 bg-ink-900 ring-1 ring-line p-1 rounded-xl">
          {TABS.map((t) => {
            const on = stage === t.value
            return (
              <button key={t.value} onClick={() => setStage(t.value)}
                style={on ? { background: 'var(--accent)', color: '#0a0f0d' } : undefined}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-transform ${on ? '' : 'text-line-strong hover:text-white'}`}>
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12"><LoadingSpinner /></div>
      )}

      {error && <ErrorMessage message="Erro ao carregar jogos" onRetry={() => refetch()} />}

      {games && games.length === 0 && (
        <div className="text-center py-12">
          <p className="text-line-strong text-sm">Nenhum jogo encontrado</p>
        </div>
      )}

      <div className="space-y-6">
        {byDay.map((day) => (
          <div key={day.key}>
            <div className="flex items-center gap-2 mb-3">
              <Icon name="calendar" className="w-3.5 h-3.5 text-line-strong" />
              <span className="text-[12px] font-bold text-line-strong uppercase tracking-wider">{day.label}</span>
              <span className="text-[11px] text-line-strong/60">· {day.games!.length} jogos</span>
            </div>
            <div className="space-y-3">
              {day.games!.map((g) => <GameCard key={g.id} game={g} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
