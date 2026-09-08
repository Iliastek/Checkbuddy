import type { Verdict } from '../types'
import { VERDICT_LABEL } from '../factCheck'
import { VERDICT_STYLE } from '../verdictStyles'

interface Props {
  verdict: Verdict
  size?: 'sm' | 'md'
}

/** Monochromes Etikett für eine Bewertung (Wahr / Irreführend / Falsch / …). */
export default function VerdictBadge({ verdict, size = 'sm' }: Props) {
  const style = VERDICT_STYLE[verdict]
  const sizing = size === 'md' ? 'text-sm px-3.5 py-1' : 'text-xs px-3 py-1'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizing} ${style.badge}`}
    >
      <span aria-hidden>{style.icon}</span>
      {VERDICT_LABEL[verdict]}
    </span>
  )
}
