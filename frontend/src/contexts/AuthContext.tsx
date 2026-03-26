import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from '../lib/firebase'
import { api } from '../services/api'
import type { User } from '../types/api'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubscribe: () => void

    async function init() {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        console.log('[Auth] onAuthStateChanged fired, firebaseUser:', firebaseUser?.email ?? null)
        if (firebaseUser) {
          try {
            console.log('[Auth] Chamando /auth/verify...')
            const res = await api.post('/auth/verify')
            console.log('[Auth] /auth/verify respondeu:', res.data)
            setUser(res.data.user)
          } catch (err) {
            console.error('[Auth] Falha ao verificar token no backend:', err)
            setUser(null)
          }
        } else {
          setUser(null)
        }
        setLoading(false)
      })
    }

    init()
    return () => unsubscribe?.()
  }, [])

  async function signIn() {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  async function signOut() {
    await firebaseSignOut(auth)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
