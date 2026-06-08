import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useJoinGroup } from '../queries/useGroups'
import { Icon } from '../components/ui/Icon'

export function JoinGroupPage() {
  const [code, setCode] = useState('')
  const navigate = useNavigate()
  const mutation = useJoinGroup()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (code.length !== 6) { toast.error('Código deve ter 6 caracteres'); return }
    try {
      const group = await mutation.mutateAsync(code)
      toast.success(`Você entrou em "${group.name}"!`)
      navigate(`/groups/${group.id}`)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(msg || 'Código inválido')
    }
  }

  return (
    <div className="px-4 py-6 pb-28 md:pb-10 max-w-md mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-line-strong hover:text-white mb-5 transition text-sm font-medium">
        <Icon name="arrow-left" className="w-4 h-4" /> Voltar
      </button>

      <h1 className="font-display font-extrabold text-3xl text-white mb-1">Entrar em um grupo</h1>
      <p className="text-sm text-line-strong mb-6">Digite o código de convite que recebeu</p>

      <form onSubmit={handleSubmit}>
        <div className="rounded-2xl bg-ink-900 ring-1 ring-line p-5 space-y-5">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-line-strong">Código de convite</label>
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="COPA26" maxLength={6} autoFocus
              className="mt-2 w-full bg-ink-950 ring-1 ring-line focus:ring-pitch-500 rounded-xl px-4 py-4 text-center font-score font-bold text-2xl tracking-[0.3em] text-white placeholder-line-strong/40 outline-none transition" />
            <p className="text-[11px] text-line-strong/60 mt-1 text-center">{code.length}/6 caracteres</p>
          </div>
          <button type="submit" disabled={mutation.isPending || code.length !== 6}
            className="w-full py-3.5 rounded-xl font-display font-bold bg-[var(--accent)] text-ink-950 hover:brightness-110 active:scale-[0.98] transition disabled:opacity-35 disabled:cursor-not-allowed">
            {mutation.isPending ? 'Entrando...' : 'Entrar no grupo'}
          </button>
        </div>
      </form>
    </div>
  )
}
