import { useState } from 'react'
import type { CheckResult } from './types'
import { checkLink } from './factCheck'
import { useStreak } from './useStreak'
import LinkForm from './components/LinkForm'
import ResultView from './components/ResultView'

export default function App() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CheckResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [flash, setFlash] = useState(0) // löst den "+1"-Streak-Effekt aus
  const { streak, registerCheck } = useStreak()

  async function handleCheck(url: string) {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await checkLink(url)
      setResult(res)
      const grew = registerCheck() // Streak fürs Fact-Checken aktualisieren
      if (grew) setFlash((f) => f + 1)
    } catch {
      setError('Beim Prüfen ist etwas schiefgelaufen. Bitte erneut versuchen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="mx-auto max-w-xl px-4 py-8 sm:py-12">
        {/* Kopf mit Streak-Anzeige */}
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--heading)]">Checkbuddy</h1>
            <p className="mt-1 text-sm text-[var(--text)]">
              Reel oder TikTok einfügen – wir prüfen die Behauptungen für dich.
            </p>
          </div>

          {/* Streak-Chip */}
          <div className="relative shrink-0">
            <div
              title={`${streak} Tag${streak === 1 ? '' : 'e'} Streak`}
              className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 shadow-[0_10px_24px_-12px_rgba(70,41,122,0.4)]"
            >
              <span aria-hidden>🔥</span>
              <span className="font-bold text-[var(--primary)]">{streak}</span>
            </div>
            {flash > 0 && (
              <span
                key={flash}
                className="cb-pop pointer-events-none absolute -bottom-5 right-2 text-sm font-bold text-emerald-500"
              >
                +1
              </span>
            )}
          </div>
        </header>

        {/* Eingabe-Karte */}
        <div className="cb-card p-5 sm:p-6">
          <LinkForm onCheck={handleCheck} loading={loading} />
          <p className="mt-4 rounded-xl bg-[var(--accent-soft)] px-4 py-2.5 text-xs leading-relaxed text-[var(--text)]">
            Der Inhalt wird geladen, transkribiert und per KI mit Websuche geprüft – das kann bis
            zu einer Minute dauern. KI-Bewertungen können Fehler enthalten.
          </p>
        </div>

        {error && (
          <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-center text-rose-600">{error}</p>
        )}

        {result && <ResultView result={result} />}

        {!result && !loading && !error && (
          <div className="mt-10 text-center text-sm text-[var(--muted)]">
            Noch kein Ergebnis – füge oben einen Link ein und starte deinen Streak.
          </div>
        )}
      </div>
    </div>
  )
}
