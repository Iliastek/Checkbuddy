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
      className={`cb-fade-in border border-black/15 border-l-4 ${accent} bg-white p-4`}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <p className="font-medium">„{claim.statement}“</p>
        <VerdictBadge verdict={claim.verdict} />
      </div>

      <p className="text-sm leading-relaxed text-neutral-700">{claim.explanation}</p>

      {claim.sources.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {claim.sources.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="border-b border-black/30 text-xs text-neutral-700 transition hover:border-black hover:text-black"
            >
              {source.title} ↗
            </a>
          ))}
        </div>
      )}
    </li>
  )
}
