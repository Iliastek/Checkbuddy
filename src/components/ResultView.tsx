import { useState } from 'react'
import type { CheckResult } from '../types'
import { PLATFORM_LABEL } from '../factCheck'
import VerdictBadge from './VerdictBadge'
import ClaimCard from './ClaimCard'

interface Props {
  result: CheckResult
}

/** Komplette Ergebnis-Ansicht: Gesamturteil + Score + einzelne Behauptungen. */
export default function ResultView({ result }: Props) {
  const [showTranscript, setShowTranscript] = useState(false)

  return (
    <section className="cb-fade-in mt-6 space-y-4">
      {/* Gesamturteil */}
      <div className="cb-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
              {PLATFORM_LABEL[result.platform]} · Gesamturteil
            </p>
            <VerdictBadge verdict={result.overallVerdict} size="md" />
            <p className="mt-3 leading-relaxed text-[var(--text)]">{result.overallSummary}</p>
          </div>

          {/* Vertrauens-Score als runder Kreis – nur bei geprüften Behauptungen */}
          {result.claims.length > 0 && (
            <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full bg-[var(--accent-soft)]">
              <span className="text-2xl font-bold leading-none text-[var(--primary)]">
                {result.trustScore}
              </span>
              <span className="mt-0.5 text-[10px] text-[var(--muted)]">/ 100</span>
            </div>
          )}
        </div>

        {/* Erkannter Inhalt (Transkript) – einklappbar, nur wenn vorhanden */}
        {result.transcript && (
          <div className="mt-5 border-t border-black/5 pt-4 text-sm text-[var(--text)]">
            <button
              type="button"
              onClick={() => setShowTranscript((v) => !v)}
              aria-expanded={showTranscript}
              className="flex w-full items-center gap-2 text-left font-semibold text-[var(--heading)]"
            >
              <span aria-hidden className="inline-block w-3 text-[var(--muted)]">
                {showTranscript ? '▾' : '▸'}
              </span>
              Erkannter Inhalt
              <span className="ml-auto text-xs font-normal text-[var(--muted)]">
                {showTranscript ? 'ausblenden' : 'anzeigen'}
              </span>
            </button>
            {showTranscript && (
              <p className="mt-2 pl-5 italic leading-relaxed">{result.transcript}</p>
            )}
          </div>
        )}
      </div>

      {/* Einzelne Behauptungen */}
      {result.claims.length > 0 && (
        <div>
          <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Geprüfte Behauptungen ({result.claims.length})
          </h2>
          <ul className="space-y-3">
            {result.claims.map((claim, i) => (
              <ClaimCard key={i} claim={claim} index={i} />
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
