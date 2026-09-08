import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import OpenAI from 'openai'
import type { CheckResult } from '../src/types'
import { detectPlatform } from '../src/platform'
import { extractAudio } from './extract'
import { transcribeAudio } from './transcribe'
import { factCheck } from './factcheck'
import { buildAnalysisInput } from './content'

const PORT = Number(process.env.PORT ?? 3001)
const MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o'
// Sprachen, die Whisper durchprobiert (Auto-Erkennung ist unzuverlässig).
const WHISPER_LANGUAGES = (process.env.WHISPER_LANGUAGES ?? 'de,en')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) {
  console.error(
    '\n⚠️  OPENAI_API_KEY fehlt. Lege eine .env-Datei an (siehe .env.example) und trage deinen Key ein.\n',
  )
  process.exit(1)
}

const client = new OpenAI({ apiKey })
const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, model: MODEL })
})

app.post('/api/check', async (req, res) => {
  const url: unknown = req.body?.url
  if (typeof url !== 'string' || !url.trim()) {
    return res.status(400).json({ error: 'Bitte einen gültigen Link angeben.' })
  }

  let cleanup: (() => Promise<void>) | null = null
  try {
    // 1) Audio + Metadaten aus dem Link holen.
    console.log(`[check] Extrahiere Inhalt: ${url}`)
    const extracted = await extractAudio(url)
    cleanup = extracted.cleanup

    // 2) Audio -> Text (Whisper).
    console.log('[check] Transkribiere Audio…')
    const rawTranscript = await transcribeAudio(client, extracted.audioPath, WHISPER_LANGUAGES)

    // Prüfbaren Inhalt zusammenstellen (Sprache + Beschreibung, Müll rausfiltern).
    const input = buildAnalysisInput(rawTranscript, extracted.description)

    // Kein prüfbarer Inhalt: ehrliche Rückmeldung statt Fehler oder „0/100“.
    if (!input) {
      console.log('[check] Kein prüfbarer Inhalt gefunden.')
      const empty: CheckResult = {
        url,
        platform: detectPlatform(url),
        transcript: '',
        overallVerdict: 'unverifiable',
        overallSummary:
          'In diesem Video wurde kein gesprochener Inhalt und keine Beschreibung gefunden, die sich prüfen lässt. Vermutlich enthält es nur Musik, Sound oder Text im Bild – Letzteres kann Checkbuddy aktuell noch nicht lesen.',
        trustScore: 0,
        claims: [],
      }
      return res.json(empty)
    }

    // 3) Inhalt prüfen (GPT).
    console.log(
      `[check] Prüfe Behauptungen… (Sprache: ${input.hasSpeech ? 'ja' : 'nein'}, Beschreibung: ${input.hasCaption ? 'ja' : 'nein'})`,
    )
    const analysis = await factCheck(client, {
      content: input.prompt,
      title: extracted.title,
      model: MODEL,
    })

    const result: CheckResult = {
      url,
      platform: detectPlatform(url),
      transcript: input.analyzed,
      ...analysis,
    }
    console.log('[check] Fertig.')
    res.json(result)
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Beim Prüfen ist ein unbekannter Fehler aufgetreten.'
    console.error('[check] Fehler:', message)
    res.status(500).json({ error: message })
  } finally {
    if (cleanup) await cleanup().catch(() => {})
  }
})

app.listen(PORT, () => {
  console.log(`\n✓ Checkbuddy-Server läuft auf http://localhost:${PORT}  (Modell: ${MODEL})\n`)
})
