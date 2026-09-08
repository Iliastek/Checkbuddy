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
      className={`cb-fade-in rounded-2xl border-l-4 ${accent} bg-white p-5 shadow-[0_10px_30px_-16px_rgba(70,41,122,0.35)]`}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {/* Behauptung aus dem Video + Urteil */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <p className="font-semibold text-[var(--heading)]">„{claim.statement}“</p>
        <VerdictBadge verdict={claim.verdict} />
      </div>

      {/* KI-Einschätzung */}
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
        Einschätzung
      </p>
      <p className="text-sm leading-relaxed text-[var(--text)]">{claim.explanation}</p>

      {/* Hervorgehobene echte Belege aus der Websuche */}
      {claim.evidence && (
        <div className="mt-3 rounded-xl bg-[var(--accent-soft)] px-4 py-3">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--primary)]">
            Belege aus dem Web
          </p>
          <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--heading)]">
            {claim.evidence}
          </p>
        </div>
      )}

      {/* Quellen, nummeriert */}
      {claim.sources.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
            Quellen
          </p>
          <ol className="space-y-1">
            {claim.sources.map((source, i) => (
              <li key={source.url + i} className="flex gap-2 text-sm">
                <span className="text-[var(--muted)]">[{i + 1}]</span>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-[var(--primary)] underline decoration-[var(--primary)]/30 underline-offset-2 transition hover:decoration-[var(--primary)]"
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
