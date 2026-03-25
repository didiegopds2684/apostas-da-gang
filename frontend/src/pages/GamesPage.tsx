import { useState } from 'react'
import { useGames } from '../queries/useGames'
import { GameCard } from '../components/game/GameCard'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { cn } from '../utils/cn'

type StageFilter = 'all' | 'group' | 'knockout'

const tabs: { label: string; value: StageFilter }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Grupos', value: 'group' },
  { label: 'Eliminatórias', value: 'knockout' },
]

export function GamesPage() {
  const [stage, setStage] = useState<StageFilter>('all')
  const [date, setDate] = useState('')

  const { data: games, isLoading, error, refetch } = useGames({
    stage: stage === 'all' ? undefined : stage,
    date: date || undefined,
  })

  return (
    <div className="px-4 py-6 pb-24 md:pb-6 max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-6">Jogos</h1>

      {/* Filters */}
      <div className="space-y-3 mb-6">
        {/* Stage tabs */}
        <div className="flex gap-2 bg-gray-900 p-1 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStage(tab.value)}
              className={cn(
                'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                stage === tab.value
                  ? 'bg-copa-green text-white shadow-sm'
                  : 'text-gray-400 hover:text-white',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Date filter */}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input-field text-sm"
        />
      </div>

      {/* Content */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {error && (
        <ErrorMessage
          message="Erro ao carregar jogos"
          onRetry={() => refetch()}
        />
      )}

      {games && games.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm">Nenhum jogo encontrado</p>
        </div>
      )}

      {games && games.length > 0 && (
        <div className="space-y-3">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  )
}
