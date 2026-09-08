import { createReadStream } from 'node:fs'
import type OpenAI from 'openai'

/**
 * Transkribiert eine Audiodatei mit OpenAI Whisper zu Text.
 * (Whisper-Limit: max. 25 MB pro Datei – für kurze Reels/TikToks unkritisch.)
 */
export async function transcribeAudio(client: OpenAI, audioPath: string): Promise<string> {
  const result = await client.audio.transcriptions.create({
    file: createReadStream(audioPath),
    model: 'whisper-1',
  })
  return result.text.trim()
}
