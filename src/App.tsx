import { useState } from 'react'
import type { CheckResult } from './types'
import { checkLink } from './factCheck'
import LinkForm from './components/LinkForm'
import ResultView from './components/ResultView'

export default function App() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CheckResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCheck(url: string) {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await checkLink(url)
      setResult(res)
    } catch {
      setError('Beim Prüfen ist etwas schiefgelaufen. Bitte erneut versuchen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900 dark:from-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        {/* Kopf */}
        <header className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 text-3xl font-bold">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-2xl text-white shadow-md"
              aria-hidden
            >
              ✓
            </span>
            Checkbuddy
          </div>
          <p className="mx-auto max-w-md text-slate-500 dark:text-slate-400">
            Füge den Link zu einem Reel, TikTok oder Short ein – Checkbuddy prüft die
            Behauptungen im Video auf ihren Wahrheitsgehalt.
          </p>
        </header>

        <LinkForm onCheck={handleCheck} loading={loading} />

        {/* Prototyp-Hinweis */}
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-center text-xs text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20">
          ⚠️ Prototyp: Die Ergebnisse sind zur Demonstration simuliert und noch nicht echt
          geprüft.
        </p>

        {error && (
          <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-center text-red-600 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </p>
        )}

        {result && <ResultView result={result} />}

        {!result && !loading && (
          <div className="mt-12 text-center text-sm text-slate-400">
            Noch kein Ergebnis – füge oben einen Link ein und starte die Prüfung.
          </div>
        )}
      </div>
    </div>
  )
}
