// Zentrale Datentypen für Checkbuddy.
// Diese Form gibt später auch das echte Backend zurück – die UI muss sich
// dann nicht ändern.

/** Bewertung einer einzelnen Behauptung bzw. des Gesamturteils. */
export type Verdict = 'true' | 'misleading' | 'false' | 'unverifiable'

/** Eine überprüfte Quelle. */
export interface Source {
  title: string
  url: string
}

/** Eine einzelne aus dem Video extrahierte Behauptung. */
export interface Claim {
  /** Die Aussage, wie sie im Video getroffen wurde. */
  statement: string
  verdict: Verdict
  /** Kurze KI-Einschätzung, warum diese Bewertung. */
  explanation: string
  /**
   * Konkrete, per Websuche gefundene Fakten/Statistiken, die das Urteil stützen.
   * Wird in der UI getrennt von der KI-Einschätzung hervorgehoben. Kann leer sein.
   */
  evidence: string
  /** Wie sicher sich die KI beim Urteil ist (0–100). Fließt in den Vertrauens-Score ein. */
  confidence: number
  sources: Source[]
}

/** Von welcher Plattform stammt der Link. */
export type Platform = 'tiktok' | 'instagram' | 'youtube' | 'unknown'

/** Das komplette Ergebnis eines Fakten-Checks. */
export interface CheckResult {
  url: string
  platform: Platform
  /** Kurzer, aus dem Video gezogener Inhaltstext (im Prototyp simuliert). */
  transcript: string
  /** Gesamturteil über das ganze Video. */
  overallVerdict: Verdict
  overallSummary: string
  /** Vertrauens-Score 0–100 (100 = voll vertrauenswürdig). */
  trustScore: number
  claims: Claim[]
}
