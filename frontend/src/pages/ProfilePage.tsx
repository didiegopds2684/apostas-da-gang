import { LogOut, Mail, Trophy } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useGames } from '../queries/useGames'
import { useMyGroups } from '../queries/useGroups'
import { Avatar } from '../components/ui/Avatar'

export function ProfilePage() {
  const { user, signOut } = useAuth()
  const { data: games } = useGames()
  const { data: groups } = useMyGroups()

  if (!user) return null

  const totalPredictions = games?.filter((g) => g.myPrediction !== null).length ?? 0
  const exactScores = games?.filter((g) => g.myPrediction?.points === 3).length ?? 0
  const correctResults = games?.filter((g) => g.myPrediction?.points === 1).length ?? 0
  const totalPoints = games?.reduce((acc, g) => acc + (g.myPrediction?.points ?? 0), 0) ?? 0

  return (
    <div className="px-4 py-6 pb-24 md:pb-6 max-w-2xl mx-auto animate-fade-in">
      {/* Profile header */}
      <div className="card p-6 text-center mb-6">
        <Avatar name={user.name} avatarUrl={user.avatarUrl} size="xl" className="mx-auto mb-4" />
        <h1 className="text-xl font-bold text-white mb-1">{user.name}</h1>
        <div className="flex items-center justify-center gap-1.5 text-gray-500 text-sm">
          <Mail className="h-3.5 w-3.5" />
          {user.email}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Estatísticas</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="card p-4 text-center">
            <p className="text-3xl font-black text-copa-green-light">{totalPoints}</p>
            <p className="text-xs text-gray-500 mt-1">pontos totais</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-3xl font-black text-white">{totalPredictions}</p>
            <p className="text-xs text-gray-500 mt-1">palpites feitos</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-3xl font-black text-copa-yellow">{exactScores}</p>
            <p className="text-xs text-gray-500 mt-1">placares exatos</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-3xl font-black text-blue-400">{correctResults}</p>
            <p className="text-xs text-gray-500 mt-1">resultados certos</p>
          </div>
        </div>
      </div>

      {/* Groups */}
      {groups && groups.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Meus grupos</h2>
          <div className="space-y-2">
            {groups.map((group) => (
              <div key={group.id} className="card p-3 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-copa-green/20 flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-copa-green-light" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{group.name}</p>
                  <p className="text-xs text-gray-500">{group.memberCount} membros</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sign out */}
      <button
        onClick={signOut}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-400/10 transition-colors font-medium"
      >
        <LogOut className="h-4 w-4" />
        Sair da conta
      </button>
    </div>
  )
}
