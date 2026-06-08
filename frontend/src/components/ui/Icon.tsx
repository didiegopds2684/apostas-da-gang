type IconName =
  | 'home' | 'ball' | 'users' | 'trophy' | 'user' | 'chevron-up' | 'chevron-down'
  | 'chevron-right' | 'arrow-left' | 'lock' | 'clock' | 'star' | 'plus' | 'login'
  | 'logout' | 'copy' | 'share' | 'crown' | 'fire' | 'target' | 'calendar' | 'bell'
  | 'check' | 'flash' | 'refresh' | 'arrow-up' | 'arrow-down' | 'minus' | 'x' | 'medal'

const PATHS: Record<IconName, React.ReactNode> = {
  home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></>,
  ball: <><circle cx="12" cy="12" r="9" /><path d="m12 7 3 2.2-1.1 3.5h-3.8L9 9.2 12 7Z" /></>,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0" /><path d="M16 5.2a3.2 3.2 0 0 1 0 6M17 20a5.5 5.5 0 0 0-3-4.9" /></>,
  trophy: <><path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" /><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3" /><path d="M12 13v4M9 21h6M10 17h4" /></>,
  user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
  'chevron-up': <path d="m6 14 6-6 6 6" />,
  'chevron-down': <path d="m6 10 6 6 6-6" />,
  'chevron-right': <path d="m9 6 6 6-6 6" />,
  'arrow-left': <><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></>,
  lock: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  star: <path d="m12 3 2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.9 6.7 19.6l1-5.8L3.5 9.7l5.9-.9L12 3Z" />,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  login: <><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><path d="M10 17l5-5-5-5M15 12H3" /></>,
  logout: <><path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></>,
  copy: <><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></>,
  share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5 8.6 10.5" /></>,
  crown: <path d="M3 7l4 4 5-6 5 6 4-4-2 12H5L3 7Z" />,
  fire: <path d="M12 3c1 3-1 4-1 6 0 1.5 1 2 1 2s1-.5 1-2c2 1.5 3 3.5 3 6a4 4 0 0 1-8 0c0-3 2-4 2-7 0-2 1-3 1-5Z" />,
  target: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" /></>,
  calendar: <><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M4 9h16M8 3v4M16 3v4" /></>,
  bell: <><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" /><path d="M10 20a2 2 0 0 0 4 0" /></>,
  check: <path d="m5 12 5 5L20 6" />,
  flash: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />,
  refresh: <><path d="M21 12a9 9 0 1 1-2.6-6.4" /><path d="M21 4v5h-5" /></>,
  'arrow-up': <path d="M12 19V5M5 12l7-7 7 7" />,
  'arrow-down': <path d="M12 5v14M5 12l7 7 7-7" />,
  minus: <path d="M5 12h14" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  medal: <><circle cx="12" cy="14" r="6" /><path d="M9 8 7 3h4l1 3M15 8l2-5h-4l-1 3" /></>,
}

interface IconProps {
  name: IconName
  className?: string
  strokeWidth?: number
  fill?: boolean
}

export function Icon({ name, className = 'w-5 h-5', strokeWidth = 1.9, fill = false }: IconProps) {
  const paths = PATHS[name]
  if (!paths) return null
  const solid = ['star', 'fire', 'crown', 'flash', 'ball'].includes(name) && fill
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true"
      fill={solid ? 'currentColor' : 'none'} stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {paths}
    </svg>
  )
}
