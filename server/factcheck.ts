import type OpenAI from 'openai'
import type { Claim, Verdict } from '../src/types'

/** Der Teil des Ergebnisses, den das Modell liefert (Rest setzt der Server). */
export interface FactCheckOutput {
  overallVerdict: Verdict
  overallSummary: string
  trustScore: number
  claims: Claim[]
}

const SYSTEM_PROMPT = `Du bist Checkbuddy, ein sorgfältiger Faktenprüfer für kurze Social-Media-Videos (TikTok, Reels, Shorts).
Dir wird der Inhalt eines Videos gegeben (Transkript und/oder Beschreibung).

WICHTIG: Nutze die Websuche aktiv, um jede Behauptung an echten, aktuellen Quellen zu prüfen.
Verlasse dich NICHT nur auf dein eigenes Wissen.

Deine Aufgabe:
1. Extrahiere die zentralen überprüfbaren BEHAUPTUNGEN (keine Meinungen, keine reine Unterhaltung).
2. Recherchiere jede Behauptung per Websuche.
3. Bewerte jede Behauptung mit einem Urteil:
   - "true": belegbar korrekt
   - "misleading": im Kern etwas Wahres, aber verzerrt, übertrieben oder aus dem Kontext gerissen
   - "false": nachweislich falsch
   - "unverifiable": nicht überprüfbar / keine belastbare Faktenbasis
4. Fülle pro Behauptung drei Felder klar getrennt:
   - "explanation": kurze eigene Einschätzung (1-2 Sätze), warum dieses Urteil.
   - "evidence": die KONKRETEN Fakten/Zahlen/Statistiken, die du per Websuche gefunden hast
     (z.B. Studienergebnisse, konkrete Werte). Klartext auf Deutsch, OHNE URLs im Text.
     Wenn du nichts Belastbares gefunden hast, lass dieses Feld leer.
   - "sources": nur ECHTE URLs, die du tatsächlich über die Websuche aufgerufen hast. Erfinde niemals URLs.
5. Fälle ein Gesamturteil und einen Vertrauens-Score von 0 (komplett irreführend) bis 100 (voll vertrauenswürdig).

Antworte ausschließlich auf Deutsch. Sei vorsichtig: Lieber "unverifiable" als eine erfundene Gewissheit.`

const VERDICTS: Verdict[] = ['true', 'misleading', 'false', 'unverifiable']

/** Entfernt Tracking-Müll aus URLs, den die Websuche manchmal anhängt. */
function cleanUrl(url: string): string {
  try {
    const u = new URL(url)
    for (const p of ['utm_source', 'utm_medium', 'utm_campaign']) u.searchParams.delete(p)
    return u.toString()
  } catch {
    return url
  }
}

/** Prüft den aufbereiteten Video-Inhalt mit Websuche und liefert strukturierte Ergebnisse. */
export async function factCheck(
  client: OpenAI,
  opts: { content: string; title?: string; model: string },
): Promise<FactCheckOutput> {
  const context = [opts.title ? `Titel: ${opts.title}` : null, opts.content]
    .filter(Boolean)
    .join('\n\n')

  const response = await client.responses.create({
    model: opts.model,
    tools: [{ type: 'web_search_preview' }],
    input: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: context },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'fact_check',
        strict: true,
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            overallVerdict: { type: 'string', enum: VERDICTS },
            overallSummary: { type: 'string' },
            trustScore: { type: 'integer', minimum: 0, maximum: 100 },
            claims: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  statement: { type: 'string' },
                  verdict: { type: 'string', enum: VERDICTS },
                  explanation: { type: 'string' },
                  evidence: { type: 'string' },
                  sources: {
                    type: 'array',
                    items: {
                      type: 'object',
                      additionalProperties: false,
                      properties: {
                        title: { type: 'string' },
                        url: { type: 'string' },
                      },
                      required: ['title', 'url'],
                    },
                  },
                },
                required: ['statement', 'verdict', 'explanation', 'evidence', 'sources'],
              },
            },
          },
          required: ['overallVerdict', 'overallSummary', 'trustScore', 'claims'],
        },
      },
    },
  })

  const text = response.output_text
  if (!text) {
    throw new Error('Das Modell hat keine Antwort geliefert.')
  }

  const parsed = JSON.parse(text) as FactCheckOutput
  // URLs säubern (Tracking-Parameter entfernen).
  for (const claim of parsed.claims) {
    claim.sources = claim.sources.map((s) => ({ ...s, url: cleanUrl(s.url) }))
  }
  return parsed
}
