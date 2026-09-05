import type { Claim } from '../types'
import { VERDICT_STYLE } from '../verdictStyles'
import VerdictBadge from './VerdictBadge'

interface Props {
  claim: Claim
  index: number
}

/** Karte für eine einzelne Behauptung samt Bewertung, Begründung und Quellen. */
export default function ClaimCard({ claim, index }: Props) {
  const accent = VERDICT_STYLE[claim.verdict].accent
  return (
    <li
      className={`cb-fade-in rounded-xl border-l-4 ${accent} bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <p className="font-medium text-slate-800 dark:text-slate-100">„{claim.statement}“</p>
        <VerdictBadge verdict={claim.verdict} />
      </div>

      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {claim.explanation}
      </p>

      {claim.sources.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {claim.sources.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            >
              <span aria-hidden>🔗</span>
              {source.title}
            </a>
          ))}
        </div>
      )}
    </li>
  )
}
