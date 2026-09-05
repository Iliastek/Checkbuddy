import type { Verdict } from './types'

/** Farb- und Icon-Zuordnung pro Bewertung – an einer Stelle gepflegt. */
interface VerdictStyle {
  /** Tailwind-Klassen für Badge-Hintergrund/Text. */
  badge: string
  /** Farbiger Rand/Akzent links an der Claim-Karte. */
  accent: string
  /** Emoji-Icon als schnelles visuelles Signal. */
  icon: string
}

export const VERDICT_STYLE: Record<Verdict, VerdictStyle> = {
  true: {
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
    accent: 'border-emerald-400',
    icon: '✓',
  },
  misleading: {
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
    accent: 'border-amber-400',
    icon: '!',
  },
  false: {
    badge: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300',
    accent: 'border-red-400',
    icon: '✕',
  },
  unverifiable: {
    badge: 'bg-slate-200 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300',
    accent: 'border-slate-400',
    icon: '?',
  },
}

/** Farbe des Vertrauens-Scores je nach Höhe. */
export function scoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-500'
  if (score >= 40) return 'text-amber-500'
  return 'text-red-500'
}
