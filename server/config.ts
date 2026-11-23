// Zentrale Server-Konfiguration (Werte aus .env mit Defaults).

export const PORT = Number(process.env.PORT ?? 3001)
export const MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o'
// Sprachen, die Whisper durchprobiert (Auto-Erkennung ist unzuverlässig).
export const WHISPER_LANGUAGES = (process.env.WHISPER_LANGUAGES ?? 'de,en')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
