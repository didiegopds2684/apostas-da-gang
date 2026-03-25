import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

export function LoginPage() {
  const { user, loading, signIn } = useAuth()
  const [signingIn, setSigningIn] = useState(false)

  if (loading) {
    return (
      <div className="flex h-svh items-center justify-center bg-gray-950">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (user) return <Navigate to="/dashboard" replace />

  async function handleSignIn() {
    setSigningIn(true)
    try {
      await signIn()
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      if (code === 'auth/popup-blocked') {
        toast.error('Permita popups para fazer login')
      } else {
        toast.error('Erro ao fazer login. Tente novamente.')
      }
    } finally {
      setSigningIn(false)
    }
  }

  return (
    <div className="min-h-svh bg-gray-950 flex flex-col items-center justify-center px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-copa-green/10 via-transparent to-copa-yellow/5 pointer-events-none" />

      <div className="relative w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-copa-green mb-4 shadow-lg shadow-copa-green/30">
            <span className="text-4xl">⚽</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-1">
            Bolão <span className="text-copa-yellow">Copa 2026</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Faça seus palpites e dispute com amigos
          </p>
        </div>

        {/* Feature list */}
        <div className="space-y-2 mb-8">
          {[
            '⚽  Palpite em todos os jogos da Copa',
            '🏆  Rankingcom seus amigos',
            '📊  Pontuação em tempo real',
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 text-sm text-gray-300">
              {item}
            </div>
          ))}
        </div>

        {/* Sign in button */}
        <button
          onClick={handleSignIn}
          disabled={signingIn}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 active:scale-95 text-gray-900 font-semibold py-4 rounded-2xl transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-base"
        >
          {signingIn ? (
            <LoadingSpinner size="sm" className="border-gray-400 border-t-gray-900" />
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          {signingIn ? 'Entrando...' : 'Entrar com Google'}
        </button>

        <p className="text-center text-xs text-gray-600 mt-6">
          Copa do Mundo · Junho–Julho 2026
        </p>
      </div>
    </div>
  )
}
