import { useState } from 'react'
import { Lock, Trophy } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { Game } from '../../types/api'
import { isPredictionOpen, formatDateTime, timeUntilKickoff } from '../../utils/dateUtils'
import { ScoreInput } from '../ui/ScoreInput'
import { PointsBadge } from '../ui/Badge'
import { api } from '../../services/api'
import { cn } from '../../utils/cn'

interface Props {
  game: Game
  compact?: boolean
}

function TeamFlag({ name, flag, align }: { name: string; flag: string | null; align: 'left' | 'right' }) {
  return (
    <div className={cn('flex flex-col items-center gap-1.5 flex-1', align === 'right' && '')}>
      {flag ? (
        <img src={flag} alt={name} className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-700" />
      ) : (
        <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-lg">
          ⚽
        </div>
      )}
      <span className="text-xs font-semibold text-gray-300 text-center leading-tight max-w-[80px]">
        {name}
      </span>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'LIVE') {
    return (
      <span className="flex items-center gap-1 text-xs font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/30">
        <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
        AO VIVO
      </span>
    )
  }
  if (status === 'FT') {
    return (
      <span className="text-xs font-medium text-copa-green-light bg-copa-green/10 px-2 py-0.5 rounded-full border border-copa-green/20">
        Encerrado
      </span>
    )
  }
  return null
}

export function GameCard({ game, compact = false }: Props) {
  const queryClient = useQueryClient()
  const open = isPredictionOpen(game.startsAt)

  const [homeInput, setHomeInput] = useState(
    game.myPrediction !== null ? String(game.myPrediction.homeScore) : '',
  )
  const [awayInput, setAwayInput] = useState(
    game.myPrediction !== null ? String(game.myPrediction.awayScore) : '',
  )

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/predictions', {
        gameId: game.id,
        homeScore: parseInt(homeInput),
        awayScore: parseInt(awayInput),
      })
      return res.data
    },
    onSuccess: () => {
      toast.success('Palpite salvo!')
      queryClient.invalidateQueries({ queryKey: ['games'] })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(msg || 'Erro ao salvar palpite')
    },
  })

  function handleSave() {
    if (homeInput === '' || awayInput === '') {
      toast.error('Preencha o placar dos dois times')
      return
    }
    mutation.mutate()
  }

  const hasPrediction = game.myPrediction !== null
  const isFinished = game.status === 'FT'
  const isLive = game.status === 'LIVE'

  return (
    <div className={cn('card p-4 transition-all hover:border-gray-700', compact && 'p-3')}>
      {/* Stage + time */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 truncate max-w-[60%]">
          {game.groupLabel || game.stage}
        </span>
        <div className="flex items-center gap-2">
          <StatusBadge status={game.status} />
          <span className="text-xs text-gray-500">{formatDateTime(game.startsAt)}</span>
        </div>
      </div>

      {/* Teams + score */}
      <div className="flex items-center gap-3 mb-4">
        <TeamFlag name={game.homeTeam} flag={game.homeFlag} align="left" />

        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          {isFinished || isLive ? (
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-white">{game.homeScore ?? '-'}</span>
              <span className="text-gray-600 font-bold">:</span>
              <span className="text-3xl font-black text-white">{game.awayScore ?? '-'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-gray-600">VS</span>
            </div>
          )}
          {!isFinished && !isLive && (
            <span className="text-xs text-gray-600">{timeUntilKickoff(game.startsAt)}</span>
          )}
        </div>

        <TeamFlag name={game.awayTeam} flag={game.awayFlag} align="right" />
      </div>

      {/* Prediction area */}
      <div className="border-t border-gray-800 pt-3">
        {open ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-gray-500">Seu palpite</span>
              {hasPrediction && (
                <span className="text-xs text-copa-green-light font-medium">
                  {game.myPrediction!.homeScore} × {game.myPrediction!.awayScore} (salvo)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <ScoreInput
                homeScore={homeInput}
                awayScore={awayInput}
                onHomeChange={setHomeInput}
                onAwayChange={setAwayInput}
              />
              <button
                onClick={handleSave}
                disabled={mutation.isPending}
                className={cn(
                  'h-12 px-3 rounded-xl text-xs font-bold transition-all active:scale-95',
                  hasPrediction
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-copa-green hover:bg-copa-green-dark text-white',
                  mutation.isPending && 'opacity-50 cursor-not-allowed',
                )}
              >
                {mutation.isPending ? '...' : hasPrediction ? 'Editar' : 'Salvar'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-500">
              {!isFinished ? (
                <>
                  <Lock className="h-3.5 w-3.5" />
                  <span className="text-xs">Prazo encerrado</span>
                </>
              ) : (
                <>
                  <Trophy className="h-3.5 w-3.5 text-copa-yellow" />
                  <span className="text-xs text-gray-400">
                    {hasPrediction
                      ? `Seu palpite: ${game.myPrediction!.homeScore} × ${game.myPrediction!.awayScore}`
                      : 'Sem palpite'}
                  </span>
                </>
              )}
            </div>
            {hasPrediction && <PointsBadge points={game.myPrediction!.points} />}
          </div>
        )}
      </div>
    </div>
  )
}
