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
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        {/* Kopf */}
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Checkbuddy</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Link zu einem Reel, TikTok oder Short einfügen – Checkbuddy prüft die Behauptungen
            im Video.
          </p>
        </header>

        <LinkForm onCheck={handleCheck} loading={loading} />

        {/* Hinweis */}
        <p className="mt-4 border border-black/15 bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
          Der Inhalt wird heruntergeladen, transkribiert und per KI mit Websuche geprüft – das
          kann bis zu einer Minute dauern. KI-Bewertungen können Fehler enthalten.
        </p>

        {error && (
          <p className="mt-6 border border-black px-4 py-3 text-sm">{error}</p>
        )}

        {result && <ResultView result={result} />}

        {!result && !loading && (
          <div className="mt-10 border-t border-black/10 pt-6 text-sm text-neutral-500">
            Noch kein Ergebnis – oben einen Link einfügen und die Prüfung starten.
          </div>
        )}
      </div>
    </div>
  )
}
