import { cn } from '../../utils/cn'

interface Props {
  homeScore: string
  awayScore: string
  onHomeChange: (v: string) => void
  onAwayChange: (v: string) => void
  disabled?: boolean
  className?: string
}

export function ScoreInput({ homeScore, awayScore, onHomeChange, onAwayChange, disabled, className }: Props) {
  function handleChange(val: string, setter: (v: string) => void) {
    const num = parseInt(val, 10)
    if (val === '' || (num >= 0 && num <= 20)) setter(val)
  }

  const inputClass = cn(
    'w-12 h-12 text-center text-xl font-bold rounded-xl border transition-colors',
    disabled
      ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'
      : 'bg-gray-800 border-copa-green/50 text-white focus:outline-none focus:border-copa-green focus:ring-1 focus:ring-copa-green',
  )

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <input
        type="number"
        min={0}
        max={20}
        value={homeScore}
        onChange={(e) => handleChange(e.target.value, onHomeChange)}
        disabled={disabled}
        className={inputClass}
        placeholder="0"
      />
      <span className="text-gray-500 font-bold text-lg">×</span>
      <input
        type="number"
        min={0}
        max={20}
        value={awayScore}
        onChange={(e) => handleChange(e.target.value, onAwayChange)}
        disabled={disabled}
        className={inputClass}
        placeholder="0"
      />
    </div>
  )
}
