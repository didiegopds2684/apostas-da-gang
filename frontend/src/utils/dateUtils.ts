const DEADLINE_MS = 5 * 60 * 1000

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  })
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })
}

export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)} · ${formatTime(date)}`
}

export function isPredictionOpen(startsAt: string): boolean {
  return Date.now() < new Date(startsAt).getTime() - DEADLINE_MS
}

export function timeUntilKickoff(startsAt: string): string {
  const ms = new Date(startsAt).getTime() - Date.now()
  if (ms <= 0) return 'Iniciado'
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `em ${days} dia${days > 1 ? 's' : ''}`
  }
  if (hours > 0) return `em ${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`
  return `em ${minutes}min`
}
