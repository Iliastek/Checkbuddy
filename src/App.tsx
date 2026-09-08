import { useState } from 'react'
import type { CheckResult } from './types'
import { checkLink } from './factCheck'
import { usePoints, POINTS_PER_CHECK } from './usePoints'
import LinkForm from './components/LinkForm'
import ResultView from './components/ResultView'

export default function App() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CheckResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [flash, setFlash] = useState(0) // löst den "+10"-Effekt aus
  const { points, addPoints, level } = usePoints()

  async function handleCheck(url: string) {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await checkLink(url)
      setResult(res)
      addPoints() // Belohnung fürs Fact-Checken
      setFlash((f) => f + 1)
    } catch {
      setError('Beim Prüfen ist etwas schiefgelaufen. Bitte erneut versuchen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="mx-auto max-w-xl px-4 py-8 sm:py-12">
        {/* Kopf mit Punkte-Anzeige */}
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--heading)]">Checkbuddy</h1>
            <p className="mt-1 text-sm text-[var(--text)]">
              Reel oder TikTok einfügen – wir prüfen die Behauptungen für dich.
            </p>
          </div>

          {/* Punkte-Chip */}
          <div className="relative shrink-0">
            <div className="rounded-full bg-white px-5 py-2 text-center shadow-[0_10px_24px_-12px_rgba(70,41,122,0.4)]">
              <div className="font-bold leading-tight text-[var(--primary)]">{points}</div>
              <div className="text-[10px] text-[var(--muted)]">Level {level}</div>
            </div>
            {flash > 0 && (
              <span
                key={flash}
                className="cb-pop pointer-events-none absolute -bottom-5 right-2 text-sm font-bold text-emerald-500"
              >
                +{POINTS_PER_CHECK}
              </span>
            )}
          </div>
        </header>

        {/* Eingabe-Karte */}
        <div className="cb-card p-5 sm:p-6">
          <LinkForm onCheck={handleCheck} loading={loading} />
          <p className="mt-4 rounded-xl bg-[var(--accent-soft)] px-4 py-2.5 text-xs leading-relaxed text-[var(--text)]">
            Der Inhalt wird geladen, transkribiert und per KI mit Websuche geprüft – das kann bis
            zu einer Minute dauern. Für jede Prüfung gibt es {POINTS_PER_CHECK} Punkte. KI-Bewertungen
            können Fehler enthalten.
          </p>
        </div>

        {error && (
          <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-center text-rose-600">{error}</p>
        )}

        {result && <ResultView result={result} />}

        {!result && !loading && !error && (
          <div className="mt-10 text-center text-sm text-[var(--muted)]">
            Noch kein Ergebnis – füge oben einen Link ein und sammle deine ersten Punkte.
          </div>
        )}
      </div>
    </div>
  )
}
