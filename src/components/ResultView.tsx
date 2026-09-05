import type { CheckResult } from '../types'
import { PLATFORM_LABEL } from '../factCheck'
import { scoreColor } from '../verdictStyles'
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
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {PLATFORM_LABEL[result.platform]} · Gesamturteil
              </span>
              <VerdictBadge verdict={result.overallVerdict} size="md" />
            </div>
            <p className="text-slate-700 dark:text-slate-200">{result.overallSummary}</p>
          </div>

          {/* Vertrauens-Score */}
          <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 px-6 py-4 dark:bg-slate-900/50">
            <span className={`text-4xl font-bold ${scoreColor(result.trustScore)}`}>
              {result.trustScore}
            </span>
            <span className="text-xs font-medium text-slate-400">von 100 Vertrauen</span>
          </div>
        </div>

        {/* Simuliertes Transkript */}
        <div className="mt-5 rounded-lg bg-slate-50 p-3 text-sm italic text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
          <span className="font-semibold not-italic">Erkannter Inhalt: </span>
          {result.transcript}
        </div>
      </div>

      {/* Einzelne Behauptungen */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
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
