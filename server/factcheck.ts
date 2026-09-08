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
Dir wird das Transkript (und ggf. Titel/Beschreibung) eines Videos gegeben.

Deine Aufgabe:
1. Extrahiere die zentralen überprüfbaren BEHAUPTUNGEN aus dem Inhalt (keine Meinungen, keine reine Unterhaltung).
2. Bewerte jede Behauptung einzeln mit einem Urteil:
   - "true": belegbar korrekt
   - "misleading": im Kern etwas Wahres, aber verzerrt, übertrieben oder aus dem Kontext gerissen
   - "false": nachweislich falsch
   - "unverifiable": nicht überprüfbar / keine belastbare Faktenbasis
3. Begründe jedes Urteil in 1-2 Sätzen sachlich.
4. Gib, wenn möglich, seriöse Quellen an (Titel + URL). Erfinde KEINE URLs. Wenn du keine sichere Quelle kennst, lass die Quellenliste leer.
5. Fälle ein Gesamturteil über das Video und einen Vertrauens-Score von 0 (komplett irreführend) bis 100 (voll vertrauenswürdig).

Antworte ausschließlich auf Deutsch. Sei vorsichtig: Lieber "unverifiable" als eine erfundene Gewissheit.`

const VERDICTS: Verdict[] = ['true', 'misleading', 'false', 'unverifiable']

/** Prüft ein Transkript mit einem OpenAI-Modell und liefert strukturierte Ergebnisse. */
export async function factCheck(
  client: OpenAI,
  opts: { transcript: string; title?: string; description?: string; model: string },
): Promise<FactCheckOutput> {
  const context = [
    opts.title ? `Titel: ${opts.title}` : null,
    opts.description ? `Beschreibung: ${opts.description}` : null,
    `Transkript:\n${opts.transcript}`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const completion = await client.chat.completions.create({
    model: opts.model,
    temperature: 0.2,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: context },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
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
                required: ['statement', 'verdict', 'explanation', 'sources'],
              },
            },
          },
          required: ['overallVerdict', 'overallSummary', 'trustScore', 'claims'],
        },
      },
    },
  })

  const content = completion.choices[0]?.message?.content
  if (!content) {
    throw new Error('Das Modell hat keine Antwort geliefert.')
  }
  return JSON.parse(content) as FactCheckOutput
}
