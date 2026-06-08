import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Avatar } from '../ui/Avatar'
import { Icon } from '../ui/Icon'

const NAV = [
  { to: '/dashboard', icon: 'home' as const, label: 'Início' },
  { to: '/games', icon: 'ball' as const, label: 'Jogos' },
  { to: '/groups', icon: 'users' as const, label: 'Grupos' },
  { to: '/profile', icon: 'user' as const, label: 'Perfil' },
]

function isActive(pathname: string, to: string) {
  if (to === '/dashboard') return pathname === '/dashboard' || pathname === '/'
  return pathname.startsWith(to)
}

export function Navbar() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) return null

  const activeNav = NAV.find((n) => isActive(location.pathname, n.to))?.to ?? '/dashboard'

  return (
    <>
      {/* Desktop top bar */}
      <header className="hidden md:flex sticky top-0 z-30 items-center justify-between px-7 h-[68px] bg-ink-950/85 backdrop-blur-xl border-b border-line">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <span className="relative grid place-items-center w-9 h-9 rounded-xl bg-pitch-500 text-ink-950 shadow-[0_4px_16px_-4px_#10c97e]">
            <Icon name="ball" className="w-5 h-5" strokeWidth={2} />
          </span>
          <span className="font-display font-extrabold text-white text-lg leading-none">
            Bolão<span className="text-pitch-500">26</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 bg-ink-900/60 ring-1 ring-line rounded-2xl p-1">
          {NAV.map((n) => {
            const on = isActive(location.pathname, n.to)
            return (
              <Link key={n.to} to={n.to}
                style={on ? { background: 'var(--accent)', color: '#0a0f0d' } : undefined}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-transform ${on ? '' : 'text-line-strong hover:text-white'}`}>
                <Icon name={n.icon} className="w-4 h-4" />
                {n.label}
              </Link>
            )
          })}
        </nav>

        <Link to="/profile" className="flex items-center gap-2.5 hover:opacity-85 transition">
          <span className="text-sm font-medium text-white">{user.name.split(' ')[0]}</span>
          <Avatar name={user.name} avatarUrl={user.avatarUrl} size="sm" ring />
        </Link>
      </header>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-[60px] bg-ink-950/85 backdrop-blur-xl border-b border-line">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="grid place-items-center w-8 h-8 rounded-xl bg-pitch-500 text-ink-950">
            <Icon name="ball" className="w-4 h-4" strokeWidth={2} />
          </span>
          <span className="font-display font-extrabold text-white leading-none">
            Bolão<span className="text-pitch-500">26</span>
          </span>
        </Link>
        <Link to="/profile">
          <Avatar name={user.name} avatarUrl={user.avatarUrl} size="sm" ring />
        </Link>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-ink-950/90 backdrop-blur-xl border-t border-line"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center justify-around py-1.5">
          {NAV.map((n) => {
            const active = isActive(location.pathname, n.to)
            return (
              <Link key={n.to} to={n.to}
                style={active ? { color: 'var(--accent)' } : undefined}
                className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-transform ${active ? '' : 'text-line-strong'}`}>
                <Icon name={n.icon} className="w-[22px] h-[22px]" strokeWidth={active ? 2.2 : 1.9} fill={active && n.icon === 'ball'} />
                <span className="text-[10px] font-semibold">{n.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
