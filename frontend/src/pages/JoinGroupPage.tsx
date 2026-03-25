import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { useJoinGroup } from '../queries/useGroups'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

export function JoinGroupPage() {
  const [code, setCode] = useState('')
  const navigate = useNavigate()
  const mutation = useJoinGroup()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (code.length !== 6) {
      toast.error('Código deve ter 6 caracteres')
      return
    }
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
    <div className="px-4 py-6 pb-24 md:pb-6 max-w-md mx-auto animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      <h1 className="text-2xl font-bold text-white mb-2">Entrar em grupo</h1>
      <p className="text-sm text-gray-500 mb-6">
        Digite o código de 6 caracteres compartilhado pelo administrador do grupo.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Código de convite
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
            placeholder="XK92AB"
            maxLength={6}
            className="input-field text-2xl font-mono text-center tracking-[0.5em] uppercase"
            autoFocus
          />
          <p className="text-xs text-gray-600 mt-1.5 text-center">{code.length}/6 caracteres</p>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending || code.length !== 6}
          className="w-full btn-primary py-4 text-base"
        >
          {mutation.isPending ? <LoadingSpinner size="sm" /> : 'Entrar no grupo'}
        </button>
      </form>
    </div>
  )
}
