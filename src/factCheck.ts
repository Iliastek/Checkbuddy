import type { CheckResult } from './types'

// ---------------------------------------------------------------------------
// Verbindung zum Backend.
//
// checkLink() ruft den eigenen Server auf (POST /api/check). Der Server holt
// den Video-Inhalt (yt-dlp), transkribiert ihn (Whisper) und prüft ihn (GPT)
// und gibt das Ergebnis im CheckResult-Format zurück.
// ---------------------------------------------------------------------------

export async function checkLink(url: string): Promise<CheckResult> {
  const res = await fetch('/api/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })

  if (!res.ok) {
    // Fehlermeldung des Servers durchreichen, falls vorhanden.
    let message = 'Der Fakten-Check ist fehlgeschlagen.'
    try {
      const data = await res.json()
      if (data?.error) message = data.error
    } catch {
      // ignorieren – Standardmeldung verwenden
    }
    throw new Error(message)
  }

  return (await res.json()) as CheckResult
}

// Plattform-Erkennung, Link-Validierung und Labels liegen in ./platform
// (geteilt mit dem Server) und werden hier zur Bequemlichkeit re-exportiert.
export { detectPlatform, looksLikeUrl, VERDICT_LABEL, PLATFORM_LABEL } from './platform'
