import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { useGroupRanking } from '../queries/useRanking'
import { useGroup } from '../queries/useGroups'
import { Avatar } from '../components/ui/Avatar'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { cn } from '../utils/cn'

const medals = ['🥇', '🥈', '🥉']

export function RankingPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: ranking, isLoading, error, refetch } = useGroupRanking(id!)
  const { data: group } = useGroup(id!)

  return (
    <div className="px-4 py-6 pb-24 md:pb-6 max-w-2xl mx-auto animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Ranking</h1>
          {group && <p className="text-sm text-gray-500">{group.name}</p>}
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 rounded-xl bg-gray-900 text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
          title="Atualizar"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {error && <ErrorMessage message="Erro ao carregar ranking" onRetry={() => refetch()} />}

      {ranking && (
        <>
          {/* Progress bar */}
          <div className="card p-4 mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-400">Jogos pontuados</span>
              <span className="font-semibold text-white">
                {ranking.totalGamesScored} de {ranking.totalGames}
              </span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-copa-green to-copa-yellow rounded-full transition-all duration-500"
                style={{ width: `${(ranking.totalGamesScored / Math.max(ranking.totalGames, 1)) * 100}%` }}
              />
            </div>
          </div>

          {/* Ranking list */}
          <div className="space-y-2">
            {ranking.ranking.map((entry) => (
              <div
                key={entry.userId}
                className={cn(
                  'card p-4 flex items-center gap-4 transition-all',
                  entry.isMe && 'border-copa-green/50 bg-copa-green/5',
                )}
              >
                {/* Position */}
                <div className="w-8 flex-shrink-0 text-center">
                  {entry.position <= 3 ? (
                    <span className="text-xl">{medals[entry.position - 1]}</span>
                  ) : (
                    <span className="text-lg font-bold text-gray-500">{entry.position}</span>
                  )}
                </div>

                {/* Avatar */}
                <Avatar name={entry.name} avatarUrl={entry.avatarUrl} size="md" />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className={cn('font-semibold truncate', entry.isMe ? 'text-copa-green-light' : 'text-white')}>
                      {entry.name.split(' ')[0]}
                    </p>
                    {entry.isMe && (
                      <span className="text-xs text-copa-green-light/70">(você)</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {entry.exactScores} exatos · {entry.correctResults} resultados
                  </p>
                </div>

                {/* Points */}
                <div className="text-right flex-shrink-0">
                  <p className={cn('text-xl font-black', entry.isMe ? 'text-copa-green-light' : 'text-white')}>
                    {entry.totalPoints}
                  </p>
                  <p className="text-xs text-gray-600">pts</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
