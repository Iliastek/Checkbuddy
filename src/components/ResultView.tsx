import type { CheckResult } from '../types'
import { PLATFORM_LABEL } from '../factCheck'
import VerdictBadge from './VerdictBadge'
import ClaimCard from './ClaimCard'

interface Props {
  result: CheckResult
}

/** Komplette Ergebnis-Ansicht: Gesamturteil + Score + einzelne Behauptungen. */
export default function ResultView({ result }: Props) {
  return (
    <section className="cb-fade-in mt-8 space-y-6">
      {/* Gesamturteil */}
      <div className="border border-black p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="mb-2 text-xs uppercase tracking-wide text-neutral-500">
              {PLATFORM_LABEL[result.platform]} · Gesamturteil
            </p>
            <VerdictBadge verdict={result.overallVerdict} size="md" />
            <p className="mt-3 text-neutral-800">{result.overallSummary}</p>
          </div>

          {/* Vertrauens-Score */}
          <div className="shrink-0 border-l border-black/15 pl-4 text-right">
            <span className="block text-3xl font-bold leading-none">{result.trustScore}</span>
            <span className="text-xs text-neutral-500">/ 100 Vertrauen</span>
          </div>
        </div>

        {/* Simuliertes Transkript */}
        <div className="mt-4 border-t border-black/10 pt-3 text-sm text-neutral-600">
          <span className="font-semibold text-black">Erkannter Inhalt: </span>
          <span className="italic">{result.transcript}</span>
        </div>
      </div>

      {/* Einzelne Behauptungen */}
      <div>
        <h2 className="mb-3 text-xs uppercase tracking-wide text-neutral-500">
          Geprüfte Behauptungen ({result.claims.length})
        </h2>
        <ul className="space-y-3">
          {result.claims.map((claim, i) => (
            <ClaimCard key={i} claim={claim} index={i} />
          ))}
        </ul>
      </div>
    </section>
  )
}
