import { Link } from 'react-router-dom'
import { Trophy, Gamepad2, Users, ChevronRight, Target } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useGames } from '../queries/useGames'
import { useMyGroups } from '../queries/useGroups'
import { Avatar } from '../components/ui/Avatar'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { isPredictionOpen } from '../utils/dateUtils'
import type { Game } from '../types/api'

function NextGameCard({ games }: { games: Game[] }) {
  const nextWithoutPrediction = games.find(
    (g) => g.status === 'NS' && g.myPrediction === null && isPredictionOpen(g.startsAt),
  )

  if (!nextWithoutPrediction) {
    return (
      <div className="card p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-copa-green/20 flex items-center justify-center">
          <Target className="h-5 w-5 text-copa-green-light" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Todos os palpites feitos!</p>
          <p className="text-xs text-gray-500">Aguardando os jogos</p>
        </div>
      </div>
    )
  }

  return (
    <Link to={`/games/${nextWithoutPrediction.id}`} className="card p-4 flex items-center gap-3 hover:border-gray-700 transition-colors">
      <div className="h-10 w-10 rounded-xl bg-copa-yellow/10 flex items-center justify-center">
        <span className="text-lg">⚽</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-0.5">Próximo sem palpite</p>
        <p className="text-sm font-semibold text-white truncate">
          {nextWithoutPrediction.homeTeam} × {nextWithoutPrediction.awayTeam}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 text-gray-600 flex-shrink-0" />
    </Link>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const { data: games, isLoading: gamesLoading } = useGames()
  const { data: groups } = useMyGroups()

  if (!user) return null

  const firstName = user.name.split(' ')[0]
  const totalPredictions = games?.filter((g) => g.myPrediction !== null).length ?? 0
  const totalGames = games?.length ?? 0
  const pendingGames = games?.filter(
    (g) => g.status === 'NS' && g.myPrediction === null && isPredictionOpen(g.startsAt),
  ).length ?? 0

  return (
    <div className="px-4 py-6 pb-24 md:pb-6 max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Avatar name={user.name} avatarUrl={user.avatarUrl} size="lg" />
        <div>
          <p className="text-gray-400 text-sm">Olá,</p>
          <h1 className="text-2xl font-bold text-white">{firstName} 👋</h1>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3 text-center">
          <p className="text-2xl font-black text-copa-green-light">{totalPredictions}</p>
          <p className="text-xs text-gray-500 mt-0.5">palpites</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-2xl font-black text-copa-yellow">{pendingGames}</p>
          <p className="text-xs text-gray-500 mt-0.5">pendentes</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-2xl font-black text-white">{groups?.length ?? 0}</p>
          <p className="text-xs text-gray-500 mt-0.5">grupos</p>
        </div>
      </div>

      {/* Next game without prediction */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Ação necessária</h2>
        {gamesLoading ? (
          <div className="card p-4 flex items-center justify-center">
            <LoadingSpinner size="sm" />
          </div>
        ) : games ? (
          <NextGameCard games={games} />
        ) : null}
      </div>

      {/* Quick access */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Acesso rápido</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/games"
            className="card p-4 flex flex-col gap-3 hover:border-gray-700 transition-colors active:scale-[0.98]"
          >
            <div className="h-10 w-10 rounded-xl bg-copa-green/20 flex items-center justify-center">
              <Gamepad2 className="h-5 w-5 text-copa-green-light" />
            </div>
            <div>
              <p className="font-semibold text-white">Jogos</p>
              <p className="text-xs text-gray-500">
                {gamesLoading ? '...' : `${totalGames} jogos`}
              </p>
            </div>
          </Link>

          <Link
            to="/groups"
            className="card p-4 flex flex-col gap-3 hover:border-gray-700 transition-colors active:scale-[0.98]"
          >
            <div className="h-10 w-10 rounded-xl bg-copa-yellow/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-copa-yellow" />
            </div>
            <div>
              <p className="font-semibold text-white">Grupos</p>
              <p className="text-xs text-gray-500">
                {groups?.length ? `${groups.length} grupo${groups.length > 1 ? 's' : ''}` : 'Nenhum ainda'}
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* My groups ranking shortcut */}
      {groups && groups.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Meus grupos</h2>
          <div className="space-y-2">
            {groups.map((group) => (
              <Link
                key={group.id}
                to={`/groups/${group.id}/ranking`}
                className="card p-4 flex items-center gap-3 hover:border-gray-700 transition-colors"
              >
                <div className="h-9 w-9 rounded-xl bg-gray-800 flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-copa-yellow" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{group.name}</p>
                  <p className="text-xs text-gray-500">{group.memberCount} membros</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-600 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
