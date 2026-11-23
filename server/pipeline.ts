import type OpenAI from 'openai'
import type { CheckResult } from '../src/types'
import { detectPlatform } from '../src/platform'
import { MODEL, WHISPER_LANGUAGES } from './config'
import { extractAudio } from './extract'
import { transcribeAudio } from './transcribe'
import { factCheck } from './factcheck'
import { buildAnalysisInput } from './content'
import { computeTrustScore, deriveOverallVerdict } from './scoring'

// Kompletter Fakten-Check für einen Link: extrahieren → transkribieren →
// filtern → prüfen → scoren. Echte Fehler werden geworfen; temporäre Dateien
// werden in jedem Fall aufgeräumt.
export async function runFactCheck(client: OpenAI, url: string): Promise<CheckResult> {
  let cleanup: (() => Promise<void>) | null = null
  try {
    // 1) Audio + Metadaten aus dem Link holen.
    console.log(`[check] Extrahiere Inhalt: ${url}`)
    const extracted = await extractAudio(url)
    cleanup = extracted.cleanup

    // 2) Audio -> Text (Whisper). Liefert auch die erkannte Sprache.
    console.log('[check] Transkribiere Audio…')
    const transcription = await transcribeAudio(client, extracted.audioPath, WHISPER_LANGUAGES)

    // Prüfbaren Inhalt zusammenstellen (Sprache + Beschreibung, Müll rausfiltern).
    const input = buildAnalysisInput(transcription.text, extracted.description)

    // Kein prüfbarer Inhalt: ehrliche Rückmeldung statt Fehler oder „0/100“.
    if (!input) {
      console.log('[check] Kein prüfbarer Inhalt gefunden.')
      const empty: CheckResult = {
        url,
        platform: detectPlatform(url),
        transcript: '',
        overallVerdict: 'unverifiable',
        overallSummary:
          'No spoken content or description could be found in this video that can be checked. It probably only contains music, sound or on-screen text – the latter cannot be read by Checkbuddy yet.',
        trustScore: 0,
        claims: [],
      }
      return empty
    }

    // 3) Inhalt prüfen (GPT).
    console.log(
      `[check] Prüfe Behauptungen… (Sprache: ${input.hasSpeech ? 'ja' : 'nein'}, Beschreibung: ${input.hasCaption ? 'ja' : 'nein'})`,
    )
    const analysis = await factCheck(client, {
      content: input.prompt,
      title: extracted.title,
      model: MODEL,
      // Bei echter Sprache die erkannte Videosprache mitgeben → Quellen in dieser Sprache.
      contentLanguage: input.hasSpeech ? transcription.language : undefined,
    })

    // Vertrauens-Score und Gesamturteil selbst berechnen (nachvollziehbar,
    // konsistent) – nicht vom Modell raten lassen.
    const trustScore = computeTrustScore(analysis.claims)
    const overallVerdict = deriveOverallVerdict(analysis.claims, trustScore)

    const result: CheckResult = {
      url,
      platform: detectPlatform(url),
      transcript: input.analyzed,
      overallVerdict,
      overallSummary: analysis.overallSummary,
      trustScore,
      claims: analysis.claims,
    }
    console.log(`[check] Fertig. Score ${trustScore}/100 (${overallVerdict}).`)
    return result
  } finally {
    if (cleanup) await cleanup().catch(() => {})
  }
}
