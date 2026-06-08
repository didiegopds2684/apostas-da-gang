import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useCreateGroup } from '../queries/useGroups'
import { Icon } from '../components/ui/Icon'

const EMOJIS = ['🔥', '⚽', '🏆', '💼', '🏡', '🍻', '⭐', '🎯', '👑', '🚀']

export function CreateGroupPage() {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🔥')
  const navigate = useNavigate()
  const mutation = useCreateGroup()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim().length < 3) { toast.error('Nome deve ter pelo menos 3 caracteres'); return }
    try {
      const group = await mutation.mutateAsync(name.trim())
      toast.success('Grupo criado!')
      navigate(`/groups/${group.id}`)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(msg || 'Erro ao criar grupo')
    }
  }

  return (
    <div className="px-4 py-6 pb-28 md:pb-10 max-w-md mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-line-strong hover:text-white mb-5 transition text-sm font-medium">
        <Icon name="arrow-left" className="w-4 h-4" /> Voltar
      </button>

      <h1 className="font-display font-extrabold text-3xl text-white mb-1">Criar grupo</h1>
      <p className="text-sm text-line-strong mb-6">Convide os amigos e dispute o bolão</p>

      <form onSubmit={handleSubmit}>
        <div className="rounded-2xl bg-ink-900 ring-1 ring-line p-5 space-y-5">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-line-strong">Ícone</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {EMOJIS.map((e) => (
                <button key={e} type="button" onClick={() => setEmoji(e)}
                  style={emoji === e ? { boxShadow: 'inset 0 0 0 2px var(--accent)', background: 'color-mix(in oklab, var(--accent) 15%, #1b2722)' } : undefined}
                  className={`w-11 h-11 rounded-xl grid place-items-center text-xl transition-transform ${emoji === e ? '' : 'bg-ink-800 ring-1 ring-line hover:ring-line-strong'}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-line-strong">Nome do grupo</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Galera do Futebol" maxLength={28}
              className="mt-2 w-full bg-ink-950 ring-1 ring-line focus:ring-pitch-500 rounded-xl px-4 py-3 text-white placeholder-line-strong/50 outline-none transition" />
            <p className="text-[11px] text-line-strong/60 mt-1">{name.length}/28</p>
          </div>
          <button type="submit" disabled={mutation.isPending || name.trim().length < 3}
            className="w-full py-3.5 rounded-xl font-display font-bold bg-[var(--accent)] text-ink-950 hover:brightness-110 active:scale-[0.98] transition disabled:opacity-35 disabled:cursor-not-allowed">
            {mutation.isPending ? 'Criando...' : 'Criar grupo'}
          </button>
        </div>
      </form>
    </div>
  )
}
