import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCreateGroup } from '../queries/useGroups'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

export function CreateGroupPage() {
  const [name, setName] = useState('')
  const navigate = useNavigate()
  const mutation = useCreateGroup()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim().length < 3) {
      toast.error('Nome deve ter pelo menos 3 caracteres')
      return
    }
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
    <div className="px-4 py-6 pb-24 md:pb-6 max-w-md mx-auto animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      <h1 className="text-2xl font-bold text-white mb-6">Criar grupo</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Nome do grupo
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Bolão da Firma"
            maxLength={50}
            className="input-field text-base"
            autoFocus
          />
          <p className="text-xs text-gray-600 mt-1.5">{name.length}/50 caracteres</p>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending || name.trim().length < 3}
          className="w-full btn-primary py-4 text-base"
        >
          {mutation.isPending ? <LoadingSpinner size="sm" /> : 'Criar grupo'}
        </button>
      </form>
    </div>
  )
}
