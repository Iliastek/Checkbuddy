import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import OpenAI from 'openai'
import { PORT, MODEL } from './config'
import { runFactCheck } from './pipeline'

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
    return res.status(400).json({ error: 'Please provide a valid link.' })
  }

  try {
    res.json(await runFactCheck(client, url))
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'An unknown error occurred while checking.'
    console.error('[check] Fehler:', message)
    res.status(500).json({ error: message })
  }
})

app.listen(PORT, () => {
  console.log(`\n✓ Checkbuddy-Server läuft auf http://localhost:${PORT}  (Modell: ${MODEL})\n`)
})
