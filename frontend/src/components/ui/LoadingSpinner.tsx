import { cn } from '../../utils/cn'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }

export function LoadingSpinner({ size = 'md', className }: Props) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-700 border-t-copa-green',
        sizes[size],
        className,
      )}
    />
  )
}

export function FullPageSpinner() {
  return (
    <div className="flex h-svh items-center justify-center bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-gray-500">Carregando...</p>
      </div>
    </div>
  )
}
