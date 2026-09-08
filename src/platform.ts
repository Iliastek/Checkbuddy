import type { Platform, Verdict } from './types'

// Reine Hilfsfunktionen ohne Browser-Abhängigkeiten – von Frontend UND
// Server (server/index.ts) gemeinsam genutzt.

/** Erkennt die Plattform anhand der URL. */
export function detectPlatform(url: string): Platform {
  const u = url.toLowerCase()
  if (u.includes('tiktok.com')) return 'tiktok'
  if (u.includes('instagram.com')) return 'instagram'
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube'
  return 'unknown'
}

/** Prüft grob, ob der Text wie ein Link aussieht. */
export function looksLikeUrl(value: string): boolean {
  const v = value.trim()
  if (!v) return false
  try {
    new URL(v.startsWith('http') ? v : `https://${v}`)
    return v.includes('.')
  } catch {
    return false
  }
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  true: 'Wahr',
  misleading: 'Irreführend',
  false: 'Falsch',
  unverifiable: 'Nicht überprüfbar',
}

export const PLATFORM_LABEL: Record<Platform, string> = {
  tiktok: 'TikTok',
  instagram: 'Instagram',
  youtube: 'YouTube',
  unknown: 'Unbekannte Quelle',
}
