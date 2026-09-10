import { createReadStream } from 'node:fs'
import type OpenAI from 'openai'
import { cleanTranscript, scoreText } from './content'

/**
 * Transkribiert eine Audiodatei mit OpenAI Whisper zu Text.
 * (Whisper-Limit: max. 25 MB pro Datei – für kurze Reels/TikToks unkritisch.)
 *
 * Whispers automatische Spracherkennung versagt bei manchen Clips komplett
 * (z.B. „erkennt“ Javanisch und liefert Kauderwelsch). Deshalb probieren wir
 * die wahrscheinlichen Sprachen gezielt durch, säubern jedes Ergebnis und
 * nehmen das inhaltlich reichhaltigste.
 *
 * temperature: 0 reduziert zusätzlich das Halluzinieren bei Audio ohne Sprache.
 */
export async function transcribeAudio(
  client: OpenAI,
  audioPath: string,
  languages: string[],
): Promise<{ text: string; language: string }> {
  let best = ''
  let bestScore = -1
  let bestLanguage = languages[0] ?? 'en'

  for (const language of languages) {
    const res = await client.audio.transcriptions.create({
      file: createReadStream(audioPath),
      model: 'whisper-1',
      temperature: 0,
      language,
    })
    const cleaned = cleanTranscript(res.text ?? '')
    const score = scoreText(cleaned)
    console.log(`[transcribe] Sprache "${language}": ${score} verschiedene Wörter`)
    if (score > bestScore) {
      bestScore = score
      best = cleaned
      bestLanguage = language
    }
  }

  return { text: best, language: bestLanguage }
}
