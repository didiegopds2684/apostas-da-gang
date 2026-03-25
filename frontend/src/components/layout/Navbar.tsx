import { Link, useLocation } from 'react-router-dom'
import { Home, Gamepad2, Users, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Avatar } from '../ui/Avatar'
import { cn } from '../../utils/cn'

const navLinks = [
  { to: '/dashboard', icon: Home, label: 'Início' },
  { to: '/games', icon: Gamepad2, label: 'Jogos' },
  { to: '/groups', icon: Users, label: 'Grupos' },
]

export function Navbar() {
  const { user, signOut } = useAuth()
  const location = useLocation()

  if (!user) return null

  return (
    <>
      {/* Top bar — visible on desktop */}
      <header className="hidden md:flex sticky top-0 z-50 items-center justify-between px-6 py-4 bg-gray-950/95 backdrop-blur border-b border-gray-800">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">⚽</span>
          <span className="font-bold text-white text-lg">
            Bolão <span className="text-copa-yellow">Copa 2026</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                location.pathname.startsWith(to)
                  ? 'bg-copa-green/20 text-copa-green-light'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Avatar name={user.name} avatarUrl={user.avatarUrl} size="sm" />
            <span className="text-sm text-gray-300 max-w-[120px] truncate">{user.name.split(' ')[0]}</span>
          </Link>
          <button
            onClick={signOut}
            className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Bottom nav — mobile */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-gray-950/95 backdrop-blur border-t border-gray-800 pb-safe">
        <div className="flex items-center justify-around py-2">
          {navLinks.map(({ to, icon: Icon, label }) => {
            const active = location.pathname.startsWith(to)
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex flex-col items-center gap-1 px-5 py-1.5 rounded-xl transition-colors min-w-[64px]',
                  active ? 'text-copa-green-light' : 'text-gray-500',
                )}
              >
                <Icon className={cn('h-5 w-5', active && 'drop-shadow-[0_0_6px_rgba(0,135,63,0.8)]')} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            )
          })}
          <Link
            to="/profile"
            className={cn(
              'flex flex-col items-center gap-1 px-5 py-1.5 rounded-xl transition-colors min-w-[64px]',
              location.pathname === '/profile' ? 'text-copa-green-light' : 'text-gray-500',
            )}
          >
            <Avatar name={user.name} avatarUrl={user.avatarUrl} size="sm" className="ring-0" />
            <span className="text-[10px] font-medium">Perfil</span>
          </Link>
        </div>
      </nav>
    </>
  )
}
