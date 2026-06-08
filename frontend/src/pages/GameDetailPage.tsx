import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useGame } from '../queries/useGames'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Icon } from '../components/ui/Icon'
import { Stepper } from '../components/ui/ScoreInput'
import { isPredictionOpen } from '../utils/dateUtils'
import { api } from '../services/api'

function FlagImg({ src, name, size = 'xl' }: { src: string | null; name: string; size?: 'sm' | 'xl' }) {
  const dim = size === 'xl' ? 'w-[76px] h-[76px]' : 'w-7 h-7'
  if (src) {
    return <img src={src} alt={name} className={`${dim} rounded-full object-cover`}
      style={{ boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.14)' }} />
  }
  return <div className={`${dim} rounded-full bg-ink-700 grid place-items-center text-2xl`}>⚽</div>
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'LIVE') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-live bg-live/10 px-2 py-0.5 rounded-full ring-1 ring-live/30 uppercase tracking-wide">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-live opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-live" />
        </span>
        Ao vivo
      </span>
    )
  }
  if (status === 'FT') {
    return <span className="text-[11px] font-semibold text-line-strong bg-white/5 px-2 py-0.5 rounded-full uppercase tracking-wide">Encerrado</span>
  }
  return <span className="text-[11px] font-semibold text-pitch-400 bg-pitch-500/10 px-2 py-0.5 rounded-full ring-1 ring-pitch-500/20 uppercase tracking-wide">Aberto</span>
}

function fmtTime(s: string) {
  const d = new Date(s)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function GameDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: game, isLoading, error, refetch } = useGame(id!)

  const [home, setHome] = useState('')
  const [away, setAway] = useState('')
  const [saved, setSaved] = useState(false)

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/predictions', {
        gameId: id,
        homeScore: parseInt(home),
        awayScore: parseInt(away),
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 1600)
      toast.success('Palpite salvo!')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(msg || 'Erro ao salvar palpite')
    },
  })

  // Sync local state with loaded prediction
  const pred = game?.myPrediction
  const initHome = pred ? String(pred.homeScore) : ''
  const initAway = pred ? String(pred.awayScore) : ''
  const currentHome = home !== '' ? home : initHome
  const currentAway = away !== '' ? away : initAway
  const open = game ? isPredictionOpen(game.startsAt) : false
  const ft = game?.status === 'FT'
  const live = game?.status === 'LIVE'

  return (
    <div className="px-4 py-6 pb-28 md:pb-10 max-w-2xl mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-line-strong hover:text-white mb-5 transition text-sm font-medium">
        <Icon name="arrow-left" className="w-4 h-4" /> Voltar
      </button>

      {isLoading && <div className="flex justify-center py-12"><LoadingSpinner /></div>}
      {error && <ErrorMessage message="Jogo não encontrado" onRetry={() => refetch()} />}

      {game && (
        <>
          {/* Scoreboard hero */}
          <div className="relative overflow-hidden rounded-3xl ring-1 ring-line bg-ink-900 mb-5">
            <div className="absolute inset-0 stadium-bg" />
            <div className="relative px-5 py-7">
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-line-strong">
                  {game.groupLabel || game.stage}
                </span>
                <span className="text-line-strong/40">·</span>
                <StatusBadge status={game.status} />
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col items-center gap-3 flex-1">
                  <FlagImg src={game.homeFlag} name={game.homeTeam} size="xl" />
                  <span className="font-display font-bold text-white text-center text-sm leading-tight">{game.homeTeam}</span>
                </div>
                <div className="flex flex-col items-center gap-1 px-1">
                  {ft || live ? (
                    <div className="flex items-center gap-3 font-score font-bold text-6xl tabular-nums leading-none">
                      <span className={live ? 'text-live' : 'text-white'}>{game.homeScore}</span>
                      <span className="text-line-strong text-3xl">:</span>
                      <span className={live ? 'text-live' : 'text-white'}>{game.awayScore}</span>
                    </div>
                  ) : (
                    <>
                      <span className="font-score font-bold text-5xl text-line-strong">×</span>
                      <span className="text-[11px] text-line-strong tabular-nums">{fmtTime(game.startsAt)}</span>
                    </>
                  )}
                  {ft && <span className="text-[11px] text-line-strong font-semibold uppercase tracking-wide mt-1">Final</span>}
                </div>
                <div className="flex flex-col items-center gap-3 flex-1">
                  <FlagImg src={game.awayFlag} name={game.awayTeam} size="xl" />
                  <span className="font-display font-bold text-white text-center text-sm leading-tight">{game.awayTeam}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Prediction editor */}
          {open && (
            <div className="rounded-2xl bg-ink-900 ring-1 ring-line p-5 mb-5">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="target" className="w-4 h-4 text-[var(--accent)]" />
                <h3 className="font-display font-bold text-white">Seu palpite</h3>
                {pred && <span className="text-[11px] text-pitch-400 font-semibold">salvo ✓</span>}
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <FlagImg src={game.homeFlag} name={game.homeTeam} size="sm" />
                    <Stepper value={currentHome} onChange={setHome} />
                  </div>
                  <span className="font-score text-line-strong text-3xl pb-1">:</span>
                  <div className="flex flex-col items-center gap-2">
                    <FlagImg src={game.awayFlag} name={game.awayTeam} size="sm" />
                    <Stepper value={currentAway} onChange={setAway} />
                  </div>
                </div>
                <button onClick={() => mutation.mutate()}
                  disabled={currentHome === '' || currentAway === '' || mutation.isPending}
                  className="px-5 py-3 rounded-xl font-display font-bold bg-[var(--accent)] text-ink-950 hover:brightness-110 active:scale-95 transition disabled:opacity-35 disabled:cursor-not-allowed">
                  {saved ? '✓ Salvo' : mutation.isPending ? '...' : pred ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </div>
          )}

          {/* Finished prediction result */}
          {ft && pred && (
            <div className="rounded-2xl bg-ink-900 ring-1 ring-line p-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-line-strong uppercase tracking-wide font-semibold mb-1">Seu palpite</p>
                <p className="font-score font-bold text-2xl text-white tabular-nums">{pred.homeScore} : {pred.awayScore}</p>
              </div>
              {pred.points != null && (
                <span className={`inline-flex items-center gap-1 font-display font-extrabold text-sm px-2.5 py-1 rounded-lg ${
                  pred.points >= 3 ? 'bg-gold-500/15 text-gold-400 ring-1 ring-gold-500/30'
                    : pred.points > 0 ? 'bg-pitch-500/15 text-pitch-400 ring-1 ring-pitch-500/25'
                    : 'bg-white/5 text-line-strong'}`}>
                  {pred.points >= 3 && <Icon name="star" className="w-3.5 h-3.5" />}
                  +{pred.points} pts
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
