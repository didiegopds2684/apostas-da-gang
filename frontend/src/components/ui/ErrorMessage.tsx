import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
  message?: string
  onRetry?: () => void
}

export function ErrorMessage({ message = 'Algo deu errado', onRetry }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <AlertCircle className="h-10 w-10 text-red-400" />
      <p className="text-gray-400 text-sm">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-ghost text-sm flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Tentar novamente
        </button>
      )}
    </div>
  )
}
