import type OpenAI from 'openai'
import type { Claim, Verdict } from '../src/types'

/**
 * Der Teil des Ergebnisses, den das Modell liefert. Gesamturteil und
 * Vertrauens-Score werden NICHT vom Modell übernommen, sondern im Server aus
 * den einzelnen Behauptungen berechnet (siehe scoring.ts).
 */
export interface FactCheckOutput {
  overallSummary: string
  claims: Claim[]
}

const SYSTEM_PROMPT = `You are Checkbuddy, a careful fact-checker for short social-media videos (TikTok, Reels, Shorts).
You are given the content of a video (transcript and/or description). The content may be in English or German.

IMPORTANT: Actively use web search to check every claim against real, up-to-date sources.
Do NOT rely on your own knowledge alone.

Your task:
1. Extract the key VERIFIABLE claims (no opinions, no pure entertainment).
2. Research EVERY claim thoroughly via web search – with several queries if needed.
   Do not settle for a superficial assessment. Only label a claim "unverifiable" once you have
   really searched and found nothing solid.
   If a claim states concrete numbers, amounts, dosages or proportions, DO THE MATH and compare
   the result against the official reference/recommended values from your sources.
3. Rate each claim with one verdict:
   - "true": verifiably correct
   - "misleading": true at its core, but distorted, exaggerated or taken out of context
   - "false": demonstrably wrong
   - "unverifiable": cannot be verified / no solid factual basis
4. Fill these fields per claim, clearly separated:
   - "explanation": a short assessment (1-2 sentences) of why you gave this verdict.
   - "evidence": the CONCRETE facts/numbers/statistics from your sources (e.g. study results,
     official reference values, concrete calculations). Plain text, WITHOUT URLs in the text.
     Fill this field with concrete numbers/facts whenever possible. Only leave it empty if the
     web search really turns up nothing solid.
   - "sources": only REAL URLs you actually opened via web search. Never invent URLs.
     Prefer sources written in the SAME language as the video content – for German content,
     prefer reputable German-language sources (e.g. official German/European bodies, established
     German media). This is about the source language only; your written output stays English.
   - "confidence": how sure you are about this verdict, 0 (pure guess) to 100 (very sure).
     Use high values ONLY if you found real, solid sources. Stay low without sources.
5. "overallSummary": a short overall assessment in words (the numeric score is computed separately).

Always respond in ENGLISH, regardless of the video's language. Be careful: prefer "unverifiable"
over an invented certainty.`

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

/**
 * Prüft, ob eine Quelle-URL wirklich erreichbar ist (keine tote Domain / kein 404).
 * Bewusst per GET auf die echte Seite – manche Server melden bei HEAD fälschlich OK,
 * obwohl die Seite (per GET) ein 404 ist.
 */
async function isReachable(url: string): Promise<boolean> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 8000)
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: ctrl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CheckbuddyBot/1.0)' },
    })
    res.body?.cancel().catch(() => {}) // Body nicht laden – uns interessiert nur der Status
    // Alles unter 400 gilt als erreichbar; 4xx/5xx (v.a. 404) als tot.
    return res.status < 400
  } catch {
    return false // Netzwerkfehler/Timeout/tote Domain → nicht erreichbar
  } finally {
    clearTimeout(timer)
  }
}

/** Nur erreichbare URLs aus einer Menge behalten (parallel geprüft). */
async function reachableSet(urls: string[]): Promise<Set<string>> {
  const checks = await Promise.all(urls.map(async (u) => [u, await isReachable(u)] as const))
  return new Set(checks.filter(([, ok]) => ok).map(([u]) => u))
}

const LANGUAGE_NAME: Record<string, string> = { de: 'German', en: 'English' }

/** Prüft den aufbereiteten Video-Inhalt mit Websuche und liefert strukturierte Ergebnisse. */
export async function factCheck(
  client: OpenAI,
  opts: { content: string; title?: string; model: string; contentLanguage?: string },
): Promise<FactCheckOutput> {
  const langName = opts.contentLanguage ? LANGUAGE_NAME[opts.contentLanguage] : undefined
  const languageDirective = langName
    ? `The video is in ${langName}. Run your web searches with ${langName}-language queries and ` +
      `use ${langName}-language sources wherever possible. Only fall back to an English source ` +
      `(e.g. a scientific study) when no adequate ${langName}-language source exists. ` +
      `Only cite pages you actually opened and that really exist – never guess or construct URLs. ` +
      `Still write ALL of your output in English.`
    : null

  const context = [languageDirective, opts.title ? `Title: ${opts.title}` : null, opts.content]
    .filter(Boolean)
    .join('\n\n')

  const response = await client.responses.create({
    model: opts.model,
    tools: [{ type: 'web_search_preview', search_context_size: 'high' }],
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
            overallSummary: { type: 'string' },
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
                  confidence: { type: 'integer', minimum: 0, maximum: 100 },
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
                required: [
                  'statement',
                  'verdict',
                  'explanation',
                  'evidence',
                  'confidence',
                  'sources',
                ],
              },
            },
          },
          required: ['overallSummary', 'claims'],
        },
      },
    },
  })

  const text = response.output_text
  if (!text) {
    throw new Error('The model did not return a response.')
  }

  const parsed = JSON.parse(text) as FactCheckOutput

  // URLs säubern (Tracking-Parameter entfernen).
  for (const claim of parsed.claims) {
    claim.sources = claim.sources.map((s) => ({ ...s, url: cleanUrl(s.url) }))
  }

  // Quellen validieren: nur wirklich erreichbare Links behalten (keine toten/404).
  const allUrls = [...new Set(parsed.claims.flatMap((c) => c.sources.map((s) => s.url)))]
  const reachable = await reachableSet(allUrls)
  let dropped = 0
  for (const claim of parsed.claims) {
    const before = claim.sources.length
    claim.sources = claim.sources.filter((s) => reachable.has(s.url))
    dropped += before - claim.sources.length
  }
  if (dropped > 0) console.log(`[factcheck] ${dropped} nicht erreichbare Quelle(n) entfernt.`)

  return parsed
}
