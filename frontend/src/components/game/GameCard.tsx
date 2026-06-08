import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { Game } from '../../types/api'
import { isPredictionOpen } from '../../utils/dateUtils'
import { Stepper } from '../ui/ScoreInput'
import { Icon } from '../ui/Icon'
import { api } from '../../services/api'

interface Props {
  game: Game
  compact?: boolean
  clickable?: boolean
}

function FlagImg({ src, name }: { src: string | null; name: string }) {
  if (src) {
    return (
      <img src={src} alt={name}
        className="w-10 h-10 rounded-full object-cover"
        style={{ boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.14)' }} />
    )
  }
  return (
    <div className="w-10 h-10 rounded-full bg-ink-700 grid place-items-center text-line-strong text-lg">⚽</div>
  )
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

function PointsPill({ points }: { points: number | null | undefined }) {
  if (points == null) return null
  const exact = points >= 3
  return (
    <span className={`inline-flex items-center gap-1 font-display font-extrabold text-sm px-2.5 py-1 rounded-lg ${
      exact ? 'bg-gold-500/15 text-gold-400 ring-1 ring-gold-500/30'
        : points > 0 ? 'bg-pitch-500/15 text-pitch-400 ring-1 ring-pitch-500/25'
        : 'bg-white/5 text-line-strong'}`}>
      {exact && <Icon name="star" className="w-3.5 h-3.5" />}
      +{points} pts
    </span>
  )
}

function fmtTime(s: string) {
  const d = new Date(s)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function GameCard({ game, compact = false, clickable = true }: Props) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const open = isPredictionOpen(game.startsAt)
  const ft = game.status === 'FT'
  const live = game.status === 'LIVE'

  const [home, setHome] = useState(game.myPrediction != null ? String(game.myPrediction.homeScore) : '')
  const [away, setAway] = useState(game.myPrediction != null ? String(game.myPrediction.awayScore) : '')
  const [editing, setEditing] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const hasPred = game.myPrediction != null
  const dirty = home !== (hasPred ? String(game.myPrediction!.homeScore) : '') ||
                away !== (hasPred ? String(game.myPrediction!.awayScore) : '')
  const showForm = open && (editing || !hasPred)

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/predictions', {
        gameId: game.id,
        homeScore: parseInt(home),
        awayScore: parseInt(away),
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] })
      setEditing(false)
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 1600)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(msg || 'Erro ao salvar palpite')
    },
  })

  function handleSave() {
    if (home === '' || away === '') { toast.error('Preencha o placar dos dois times'); return }
    mutation.mutate()
  }

  return (
    <div className={`group relative rounded-2xl bg-ink-900 ring-1 ring-line overflow-hidden transition
      ${live ? 'shadow-[0_0_0_1px_rgba(255,90,95,.25),0_8px_30px_-12px_rgba(255,90,95,.4)]' : 'hover:ring-line-strong'}`}>
      {live && <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-live to-transparent" />}

      {/* Header row */}
      <button onClick={() => clickable && navigate(`/games/${game.id}`)}
        className="w-full flex items-center justify-between px-4 pt-3 text-left">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-line-strong truncate">
          {game.groupLabel || game.stage}
        </span>
        <div className="flex items-center gap-2">
          <StatusBadge status={game.status} />
          {!live && !ft && (
            <span className="text-[11px] text-line-strong tabular-nums">{fmtTime(game.startsAt)}</span>
          )}
        </div>
      </button>

      {/* Teams + score */}
      <button onClick={() => clickable && navigate(`/games/${game.id}`)} className="w-full flex items-center gap-2 px-4 py-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <FlagImg src={game.homeFlag} name={game.homeTeam} />
          <span className="font-display font-bold text-white truncate text-[15px]">{game.homeTeam}</span>
        </div>
        <div className="shrink-0 px-2">
          {ft || live ? (
            <div className="flex items-center gap-2 font-score font-bold text-3xl tabular-nums leading-none">
              <span className={live ? 'text-live' : 'text-white'}>{game.homeScore}</span>
              <span className="text-line-strong text-xl">:</span>
              <span className={live ? 'text-live' : 'text-white'}>{game.awayScore}</span>
            </div>
          ) : (
            <span className="font-display font-bold text-line-strong text-sm">×</span>
          )}
        </div>
        <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
          <span className="font-display font-bold text-white truncate text-[15px] text-right">{game.awayTeam}</span>
          <FlagImg src={game.awayFlag} name={game.awayTeam} />
        </div>
      </button>

      {/* Prediction footer */}
      <div className="border-t border-line px-4 py-3">
        {showForm ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Stepper value={home} onChange={setHome} />
              <span className="font-score text-line-strong text-2xl pt-1">:</span>
              <Stepper value={away} onChange={setAway} />
            </div>
            <div className="flex flex-col gap-1.5 items-end">
              <button onClick={handleSave} disabled={home === '' || away === '' || mutation.isPending || (hasPred && !dirty)}
                className="px-4 py-2.5 rounded-xl font-display font-bold text-sm bg-[var(--accent)] text-ink-950 hover:brightness-110 active:scale-95 transition disabled:opacity-35 disabled:cursor-not-allowed">
                {mutation.isPending ? '...' : hasPred ? 'Atualizar' : 'Salvar palpite'}
              </button>
              {hasPred && editing && (
                <button onClick={() => { setEditing(false); setHome(String(game.myPrediction!.homeScore)); setAway(String(game.myPrediction!.awayScore)) }}
                  className="text-[11px] text-line-strong hover:text-white transition">Cancelar</button>
              )}
            </div>
          </div>
        ) : open && hasPred ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-line-strong">Seu palpite</span>
              <span className={`font-score font-bold text-lg tabular-nums ${justSaved ? 'text-pitch-400' : 'text-white'}`}>
                {game.myPrediction!.homeScore} : {game.myPrediction!.awayScore}
              </span>
              {justSaved && <span className="text-[11px] text-pitch-400 font-semibold animate-fade-in">salvo ✓</span>}
            </div>
            <button onClick={() => setEditing(true)}
              className="text-xs font-semibold text-[var(--accent)] hover:brightness-110 transition">Editar</button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-line-strong">
              {ft ? <Icon name="lock" className="w-3.5 h-3.5" /> : <Icon name="clock" className="w-3.5 h-3.5" />}
              <span className="text-xs">
                {hasPred
                  ? <>Seu palpite: <span className="font-score font-bold text-white">{game.myPrediction!.homeScore} : {game.myPrediction!.awayScore}</span></>
                  : live ? 'Palpite travado' : 'Sem palpite'}
              </span>
            </div>
            {ft && hasPred && <PointsPill points={game.myPrediction!.points} />}
            {live && hasPred && <span className="text-[11px] text-live font-semibold uppercase tracking-wide">valendo</span>}
          </div>
        )}
      </div>
    </div>
  )
}
