import type { Verdict } from './types'

/** Rein monochrome Zuordnung pro Bewertung (schwarz/weiß/grau). */
interface VerdictStyle {
  /** Klassen für das Badge – unterschieden über gefüllt vs. umrandet. */
  badge: string
  /** Linker Akzentrand an der Claim-Karte. */
  accent: string
  /** Text-Symbol als schnelles Signal. */
  icon: string
}

export const VERDICT_STYLE: Record<Verdict, VerdictStyle> = {
  // Falsch = gefüllt schwarz (stärkstes Warnsignal).
  false: {
    badge: 'bg-black text-white',
    accent: 'border-black',
    icon: '✕',
  },
  // Wahr = schwarze Umrandung.
  true: {
    badge: 'border border-black text-black',
    accent: 'border-black',
    icon: '✓',
  },
  // Irreführend = grau gefüllt.
  misleading: {
    badge: 'bg-neutral-200 text-black',
    accent: 'border-neutral-500',
    icon: '!',
  },
  // Nicht überprüfbar = gestrichelte graue Umrandung.
  unverifiable: {
    badge: 'border border-dashed border-neutral-400 text-neutral-500',
    accent: 'border-neutral-300',
    icon: '?',
  },
}
