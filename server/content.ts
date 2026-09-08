// Hilfsfunktionen, um zu entscheiden, WAS geprüft werden soll.
// Whisper liefert bei Videos ohne echte Sprache oft leeren oder halluzinierten
// Text (z.B. nur Emojis oder dasselbe Wort in Endlosschleife). Solcher Text
// ist kein prüfbarer Inhalt und wird hier herausgefiltert.

// Bekannte Whisper-Halluzinationen: Untertitel-Credits, die Whisper bei
// Audio ohne klare Sprache „erfindet“ (Trainingsdaten aus Untertiteln).
const HALLUCINATION_PATTERNS: RegExp[] = [
  /amara\.org/i,
  /untertitel(ung)?\b/i,
  /untertitel im auftrag/i,
  /subtitl(e|es|ing)\b.*(by|community)/i,
  /thanks? for watching/i,
  /copyright wdr|zdf|ndr|swr|ard/i,
]

/**
 * Räumt ein Whisper-Transkript auf:
 * - entfernt Sätze, die bekannte Halluzinations-Credits sind
 * - fasst unmittelbar wiederholte Sätze zusammen (Whisper-Endlosschleifen)
 */
export function cleanTranscript(text: string): string {
  const sentences = text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean)

  const cleaned: string[] = []
  for (const s of sentences) {
    if (HALLUCINATION_PATTERNS.some((re) => re.test(s))) continue
    // aufeinanderfolgende Duplikate überspringen
    if (cleaned[cleaned.length - 1]?.toLowerCase() === s.toLowerCase()) continue
    cleaned.push(s)
  }
  return cleaned.join(' ').trim()
}

/** Grobe Inhalts-„Reichhaltigkeit“: Anzahl unterschiedlicher Wörter. Für Ranking. */
export function scoreText(text: string): number {
  const words = text.toLowerCase().match(/\p{L}+/gu) ?? []
  return new Set(words).size
}

/** Prüft, ob ein Text echten, prüfbaren Inhalt enthält (und kein Whisper-Müll ist). */
export function isMeaningfulText(text: string): boolean {
  const t = text.trim()
  if (!t) return false

  // Mindestens ein paar echte Buchstaben (Emojis/Satzzeichen zählen nicht).
  const letters = (t.match(/\p{L}/gu) ?? []).length
  if (letters < 10) return false

  // Stumpfe Wiederholung erkennen (typische Whisper-Halluzination):
  // wenn sehr viele Wörter, aber kaum unterschiedliche.
  const words = t.toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length >= 6) {
    const unique = new Set(words)
    if (unique.size / words.length < 0.25) return false
  }

  return true
}

export interface AnalysisInput {
  /** Der Text, der tatsächlich geprüft wird (für die Anzeige „Erkannter Inhalt“). */
  analyzed: string
  /** Für den Fact-Check aufbereiteter Kontext (Sprache + Beschreibung). */
  prompt: string
  /** Woraus sich der Inhalt speist – für eine ehrliche Rückmeldung. */
  hasSpeech: boolean
  hasCaption: boolean
}

/**
 * Baut aus (ggf. unbrauchbarem) Transkript und der Video-Beschreibung den
 * Inhalt zusammen, der geprüft werden soll. Gibt null zurück, wenn es nichts
 * Prüfbares gibt.
 */
export function buildAnalysisInput(
  rawTranscript: string,
  description: string | undefined,
): AnalysisInput | null {
  const speech = isMeaningfulText(rawTranscript) ? rawTranscript.trim() : ''
  const caption = (description ?? '').trim()
  const hasCaption = isMeaningfulText(caption)

  if (!speech && !hasCaption) return null

  const parts: string[] = []
  if (speech) parts.push(`Gesprochener Inhalt (Transkript):\n${speech}`)
  if (hasCaption) parts.push(`Bildunterschrift / Beschreibung des Videos:\n${caption}`)

  return {
    analyzed: speech || caption,
    prompt: parts.join('\n\n'),
    hasSpeech: Boolean(speech),
    hasCaption,
  }
}
