import { cn } from '../../utils/cn'

interface Props {
  points: number | null
  className?: string
}

export function PointsBadge({ points, className }: Props) {
  if (points === null) {
    return (
      <span className={cn('text-xs font-medium text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full', className)}>
        aguardando
      </span>
    )
  }

  if (points === 0) {
    return (
      <span className={cn('text-xs font-bold text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full border border-gray-700', className)}>
        0 pts
      </span>
    )
  }

  return (
    <span
      className={cn(
        'text-xs font-bold px-2 py-0.5 rounded-full border',
        points === 3
          ? 'text-copa-yellow bg-copa-yellow/10 border-copa-yellow/30'
          : 'text-copa-green-light bg-copa-green/10 border-copa-green/30',
        className,
      )}
    >
      +{points} pts
    </span>
  )
}
