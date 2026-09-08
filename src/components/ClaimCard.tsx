import type { Claim } from '../types'
import { VERDICT_STYLE } from '../verdictStyles'
import VerdictBadge from './VerdictBadge'

interface Props {
  claim: Claim
  index: number
}

/** Karte für eine einzelne Behauptung: Aussage, Urteil, Einschätzung, echte Belege + Quellen. */
export default function ClaimCard({ claim, index }: Props) {
  const accent = VERDICT_STYLE[claim.verdict].accent
  return (
    <li
      className={`cb-fade-in border border-black/15 border-l-4 ${accent} bg-white p-4`}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {/* Behauptung aus dem Video + Urteil */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <p className="font-medium">„{claim.statement}“</p>
        <VerdictBadge verdict={claim.verdict} />
      </div>

      {/* KI-Einschätzung */}
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
        Einschätzung
      </p>
      <p className="text-sm leading-relaxed text-neutral-700">{claim.explanation}</p>

      {/* Hervorgehobene echte Belege aus der Websuche */}
      {claim.evidence && (
        <div className="mt-3 border-l-2 border-black bg-neutral-100 px-3 py-2">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
            Belege aus dem Web
          </p>
          <p className="whitespace-pre-line text-sm leading-relaxed text-black">
            {claim.evidence}
          </p>
        </div>
      )}

      {/* Quellen, nummeriert */}
      {claim.sources.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
            Quellen
          </p>
          <ol className="space-y-1">
            {claim.sources.map((source, i) => (
              <li key={source.url + i} className="flex gap-2 text-sm">
                <span className="text-neutral-400">[{i + 1}]</span>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="border-b border-black/30 text-neutral-700 transition hover:border-black hover:text-black"
                >
                  {source.title} ↗
                </a>
              </li>
            ))}
          </ol>
        </div>
      )}
    </li>
  )
}
