import { cn } from '../../utils/cn'

interface Props {
  name: string
  avatarUrl?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-xl',
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function Avatar({ name, avatarUrl, size = 'md', className }: Props) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        referrerPolicy="no-referrer"
        className={cn('rounded-full object-cover ring-2 ring-gray-700', sizes[size], className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-full bg-copa-green flex items-center justify-center font-bold text-white ring-2 ring-copa-green/30',
        sizes[size],
        className,
      )}
    >
      {getInitials(name)}
    </div>
  )
}
