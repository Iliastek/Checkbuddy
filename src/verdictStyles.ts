import type { Verdict } from './types'

/** Sanfte, pastellige Zuordnung pro Bewertung – passend zum weichen App-Look. */
interface VerdictStyle {
  /** Klassen für das farbige Badge. */
  badge: string
  /** Linker Akzentrand an der Claim-Karte. */
  accent: string
  /** Emoji/Symbol als schnelles Signal. */
  icon: string
}

export const VERDICT_STYLE: Record<Verdict, VerdictStyle> = {
  true: {
    badge: 'bg-emerald-100 text-emerald-700',
    accent: 'border-emerald-300',
    icon: '✓',
  },
  misleading: {
    badge: 'bg-amber-100 text-amber-700',
    accent: 'border-amber-300',
    icon: '!',
  },
  false: {
    badge: 'bg-rose-100 text-rose-600',
    accent: 'border-rose-300',
    icon: '✕',
  },
  unverifiable: {
    badge: 'bg-slate-100 text-slate-500',
    accent: 'border-slate-300',
    icon: '?',
  },
}
