const COLORS = [
  '#10c97e', '#2ad2c9', '#5b8cff', '#f5b417', '#ff5a7a',
  '#a78bfa', '#fb923c', '#34d399', '#60a5fa', '#f472b6',
]

function nameToColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return COLORS[Math.abs(hash) % COLORS.length]
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

const DIM: Record<string, number> = { xs: 24, sm: 32, md: 40, lg: 56, xl: 72 }
const FS: Record<string, number> = { xs: 9, sm: 12, md: 14, lg: 18, xl: 24 }

interface Props {
  name: string
  avatarUrl?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  ring?: boolean
  className?: string
}

export function Avatar({ name, avatarUrl, size = 'md', ring = false, className = '' }: Props) {
  const color = nameToColor(name)
  const dim = DIM[size]
  const fs = FS[size]

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        referrerPolicy="no-referrer"
        className={`rounded-full object-cover shrink-0 ${className}`}
        style={{
          width: dim,
          height: dim,
          boxShadow: ring ? `0 0 0 2px ${color}` : `0 0 0 1.5px color-mix(in oklab, ${color} 40%, transparent)`,
        }}
      />
    )
  }

  return (
    <span
      className={`grid place-items-center rounded-full font-display font-bold shrink-0 ${className}`}
      style={{
        width: dim,
        height: dim,
        fontSize: fs,
        background: `color-mix(in oklab, ${color} 26%, #0f1613)`,
        color,
        boxShadow: ring ? `0 0 0 2px ${color}` : `inset 0 0 0 1.5px color-mix(in oklab, ${color} 45%, transparent)`,
      }}
    >
      {getInitials(name)}
    </span>
  )
}
