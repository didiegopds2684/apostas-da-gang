import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useGame } from '../queries/useGames'
import { GameCard } from '../components/game/GameCard'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { formatDateTime } from '../utils/dateUtils'

export function GameDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: game, isLoading, error, refetch } = useGame(id!)

  return (
    <div className="px-4 py-6 pb-24 md:pb-6 max-w-2xl mx-auto animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {error && <ErrorMessage message="Jogo não encontrado" onRetry={() => refetch()} />}

      {game && (
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-bold text-white">
              {game.homeTeam} × {game.awayTeam}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {game.groupLabel || game.stage} · {formatDateTime(game.startsAt)}
            </p>
          </div>
          <GameCard game={game} />
        </div>
      )}
    </div>
  )
}
