import type { Claim, Verdict } from '../src/types'

// Nachvollziehbares Bewertungssystem: Der Vertrauens-Score wird HIER berechnet
// (nicht vom Modell geraten), damit er konsistent ist und Sinn ergibt.
//
// Idee:
//  - Jedes Urteil gibt einen Basiswert (Übereinstimmung mit den Quellen):
//      wahr = stimmt mit Quellen überein  -> hoch
//      falsch = widerspricht den Quellen  -> niedrig
//  - Jede Behauptung bekommt ein GEWICHT, wie stark sie in den Gesamtscore zählt:
//      * höher, wenn echte Quellen vorhanden sind
//      * höher, je sicherer sich die KI beim Urteil ist (confidence)
//  - Gesamtscore = gewichteter Durchschnitt der Basiswerte.

const VERDICT_BASE: Record<Verdict, number> = {
  true: 100, // Aussage deckt sich mit den Quellen
  misleading: 40, // teils wahr, aber verzerrt/übertrieben
  false: 0, // widerspricht den Quellen
  unverifiable: 50, // keine belastbare Grundlage -> neutral
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

/** Gewicht einer Behauptung: Quellen + KI-Sicherheit erhöhen den Einfluss. */
function claimWeight(claim: Claim): number {
  // Confidence 0–100 -> mind. 5, damit eine Behauptung nie ganz 0 wiegt.
  const confidence = Math.max(clamp(claim.confidence ?? 50, 0, 100), 5) / 100
  // Mit echten Quellen zählt die Behauptung 1,5x so stark.
  const sourceFactor = claim.sources.length > 0 ? 1.5 : 1
  return confidence * sourceFactor
}

/** Berechnet den Vertrauens-Score (0–100) aus den einzelnen Behauptungen. */
export function computeTrustScore(claims: Claim[]): number {
  if (claims.length === 0) return 50 // nichts Prüfbares -> neutral

  let weightedSum = 0
  let weightTotal = 0
  for (const claim of claims) {
    const w = claimWeight(claim)
    weightedSum += VERDICT_BASE[claim.verdict] * w
    weightTotal += w
  }
  return Math.round(weightedSum / weightTotal)
}

/** Leitet das Gesamturteil konsistent aus Score und Urteilen ab. */
export function deriveOverallVerdict(claims: Claim[], score: number): Verdict {
  if (claims.length === 0) return 'unverifiable'
  // Wenn ALLE Behauptungen nicht überprüfbar sind, ist auch das Gesamturteil das.
  if (claims.every((c) => c.verdict === 'unverifiable')) return 'unverifiable'
  if (score >= 70) return 'true'
  if (score >= 40) return 'misleading'
  return 'false'
}
