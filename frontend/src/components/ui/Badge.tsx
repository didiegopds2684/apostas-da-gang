import { cn } from '../../utils/cn'

interface Props {
  points: number | null
  className?: string
}

export function PointsBadge({ points, className }: Props) {
  if (points === null) {
    return (
      <span className={cn('text-xs font-medium text-line-strong bg-ink-800 px-2 py-0.5 rounded-full', className)}>
        aguardando
      </span>
    )
  }

  if (points === 0) {
    return (
      <span className={cn('text-xs font-bold text-line-strong bg-ink-800 px-2 py-0.5 rounded-full ring-1 ring-line', className)}>
        0 pts
      </span>
    )
  }

  return (
    <span
      className={cn(
        'text-xs font-bold px-2 py-0.5 rounded-full ring-1',
        points === 3
          ? 'text-gold-400 bg-gold-500/10 ring-gold-500/30'
          : 'text-pitch-400 bg-pitch-500/10 ring-pitch-500/30',
        className,
      )}
    >
      +{points} pts
    </span>
  )
}
