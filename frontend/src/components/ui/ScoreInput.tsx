import { Icon } from './Icon'

interface StepperProps {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}

export function Stepper({ value, onChange, disabled = false }: StepperProps) {
  const n = value === '' ? null : Number(value)
  const set = (next: number) => {
    if (disabled) return
    onChange(String(Math.max(0, Math.min(20, next))))
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button type="button" onClick={() => set((n ?? 0) + 1)} disabled={disabled}
        className="w-9 h-7 grid place-items-center rounded-lg bg-white/5 hover:bg-white/12 active:scale-90 text-white/70 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed">
        <Icon name="chevron-up" className="w-4 h-4" />
      </button>
      <div className="w-14 h-14 grid place-items-center rounded-xl bg-ink-950 ring-1 ring-line font-score font-bold text-3xl tabular-nums leading-none"
        style={{ color: n == null ? 'rgba(255,255,255,.25)' : 'var(--accent)' }}>
        {n == null ? '–' : n}
      </div>
      <button type="button" onClick={() => set((n ?? 0) - 1)} disabled={disabled}
        className="w-9 h-7 grid place-items-center rounded-lg bg-white/5 hover:bg-white/12 active:scale-90 text-white/70 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed">
        <Icon name="chevron-down" className="w-4 h-4" />
      </button>
    </div>
  )
}

export function ScoreInput({ homeScore, awayScore, onHomeChange, onAwayChange, disabled }: {
  homeScore: string
  awayScore: string
  onHomeChange: (v: string) => void
  onAwayChange: (v: string) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <Stepper value={homeScore} onChange={onHomeChange} disabled={disabled} />
      <span className="font-score text-line-strong text-2xl pt-1">:</span>
      <Stepper value={awayScore} onChange={onAwayChange} disabled={disabled} />
    </div>
  )
}
