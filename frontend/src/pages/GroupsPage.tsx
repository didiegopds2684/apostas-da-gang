import { Link } from 'react-router-dom'
import { Plus, LogIn, Trophy, Users, ChevronRight, Crown } from 'lucide-react'
import { useMyGroups } from '../queries/useGroups'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'

export function GroupsPage() {
  const { data: groups, isLoading, error, refetch } = useMyGroups()

  return (
    <div className="px-4 py-6 pb-24 md:pb-6 max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Grupos</h1>
        <div className="flex gap-2">
          <Link
            to="/groups/join"
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl text-sm font-medium text-white transition-colors border border-white/10"
          >
            <LogIn className="h-4 w-4" />
            Entrar
          </Link>
          <Link
            to="/groups/new"
            className="flex items-center gap-1.5 bg-copa-green hover:bg-copa-green-dark px-3 py-2 rounded-xl text-sm font-medium text-white transition-colors"
          >
            <Plus className="h-4 w-4" />
            Criar
          </Link>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {error && <ErrorMessage message="Erro ao carregar grupos" onRetry={() => refetch()} />}

      {groups && groups.length === 0 && (
        <div className="text-center py-16 space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-900 mb-2">
            <Users className="h-8 w-8 text-gray-600" />
          </div>
          <p className="text-gray-400 font-medium">Você não está em nenhum grupo</p>
          <p className="text-sm text-gray-600">Crie um grupo ou entre com um código de convite</p>
          <div className="flex justify-center gap-3 pt-2">
            <Link to="/groups/new" className="btn-primary text-sm py-2.5 px-5">
              Criar grupo
            </Link>
            <Link to="/groups/join" className="btn-secondary text-sm py-2.5 px-5">
              Entrar com código
            </Link>
          </div>
        </div>
      )}

      {groups && groups.length > 0 && (
        <div className="space-y-3">
          {groups.map((group) => (
            <div key={group.id} className="card overflow-hidden">
              <Link to={`/groups/${group.id}`} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors">
                <div className="h-11 w-11 rounded-xl bg-copa-green/20 flex items-center justify-center flex-shrink-0">
                  <Trophy className="h-5 w-5 text-copa-green-light" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-white truncate">{group.name}</p>
                    {group.myRole === 'admin' && (
                      <Crown className="h-3.5 w-3.5 text-copa-yellow flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{group.memberCount} membros</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-600 flex-shrink-0" />
              </Link>
              <div className="border-t border-gray-800 px-4 py-2">
                <Link
                  to={`/groups/${group.id}/ranking`}
                  className="text-xs text-copa-green-light hover:text-copa-green font-medium transition-colors"
                >
                  Ver ranking →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
