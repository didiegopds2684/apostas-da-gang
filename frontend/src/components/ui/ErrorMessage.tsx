import { Icon } from './Icon'

interface Props {
  message?: string
  onRetry?: () => void
}

export function ErrorMessage({ message = 'Algo deu errado', onRetry }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <Icon name="x" className="h-10 w-10 text-live" />
      <p className="text-line-strong text-sm">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="flex items-center gap-2 text-sm font-medium text-pitch-400 hover:text-pitch-500 transition">
          <Icon name="refresh" className="h-4 w-4" />
          Tentar novamente
        </button>
      )}
    </div>
  )
}
