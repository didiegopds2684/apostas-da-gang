import { useNavigate } from 'react-router-dom'
import { useMyGroups } from '../queries/useGroups'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Icon } from '../components/ui/Icon'

export function GroupsPage() {
  const navigate = useNavigate()
  const { data: groups, isLoading, error, refetch } = useMyGroups()

  return (
    <div className="px-4 py-6 pb-28 md:pb-10 max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-white">Grupos</h1>
          <p className="text-sm text-line-strong mt-0.5">Dispute o bolão com os amigos</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/groups/join')}
            className="flex items-center gap-1.5 bg-ink-900 ring-1 ring-line hover:ring-line-strong px-3 py-2 rounded-xl text-sm font-semibold text-white transition">
            <Icon name="login" className="w-4 h-4" />
            <span className="hidden sm:inline">Entrar</span>
          </button>
          <button onClick={() => navigate('/groups/new')}
            className="flex items-center gap-1.5 bg-[var(--accent)] text-ink-950 px-3 py-2 rounded-xl text-sm font-bold hover:brightness-110 active:scale-95 transition">
            <Icon name="plus" className="w-4 h-4" /> Criar
          </button>
        </div>
      </div>

      {isLoading && <div className="flex justify-center py-12"><LoadingSpinner /></div>}
      {error && <ErrorMessage message="Erro ao carregar grupos" onRetry={() => refetch()} />}

      {groups && groups.length === 0 && (
        <div className="text-center py-16 space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-ink-900 ring-1 ring-line mb-2">
            <Icon name="users" className="w-8 h-8 text-line-strong" />
          </div>
          <p className="text-white font-medium">Você não está em nenhum grupo</p>
          <p className="text-sm text-line-strong">Crie um grupo ou entre com um código de convite</p>
          <div className="flex justify-center gap-3 pt-2">
            <button onClick={() => navigate('/groups/new')}
              className="px-5 py-2.5 rounded-xl font-display font-bold text-sm bg-[var(--accent)] text-ink-950 hover:brightness-110 transition">
              Criar grupo
            </button>
            <button onClick={() => navigate('/groups/join')}
              className="px-5 py-2.5 rounded-xl font-display font-bold text-sm bg-ink-900 ring-1 ring-line text-white hover:ring-line-strong transition">
              Entrar com código
            </button>
          </div>
        </div>
      )}

      {groups && groups.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-3">
          {groups.map((g) => (
            <div key={g.id} className="rounded-2xl bg-ink-900 ring-1 ring-line overflow-hidden hover:ring-line-strong transition">
              <button onClick={() => navigate(`/groups/${g.id}`)} className="w-full text-left p-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-ink-800 grid place-items-center text-xl">🏆</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-display font-bold text-white truncate">{g.name}</p>
                      {g.myRole === 'admin' && <Icon name="crown" className="w-3.5 h-3.5 text-gold-400 shrink-0" fill />}
                    </div>
                    <p className="text-[11px] text-line-strong">{g.memberCount} membros</p>
                  </div>
                  <Icon name="chevron-right" className="w-4 h-4 text-line-strong" />
                </div>
              </button>
              <button onClick={() => navigate(`/groups/${g.id}/ranking`)}
                className="w-full border-t border-line px-4 py-2.5 text-xs font-semibold text-[var(--accent)] hover:bg-white/[0.03] transition flex items-center justify-center gap-1.5">
                <Icon name="trophy" className="w-3.5 h-3.5" /> Ver ranking completo
              </button>
            </div>
          ))}

          {/* Create card */}
          <button onClick={() => navigate('/groups/new')}
            className="rounded-2xl border-2 border-dashed border-line hover:border-[var(--accent)]/40 p-4 min-h-[120px] grid place-items-center text-line-strong hover:text-white transition group">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-ink-900 ring-1 ring-line grid place-items-center group-hover:ring-[var(--accent)]/40 transition">
                <Icon name="plus" className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold">Criar novo grupo</span>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
