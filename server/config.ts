// Zentrale Server-Konfiguration (Werte aus .env mit Defaults).

export const PORT = Number(process.env.PORT ?? 3001)
export const MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o'
// Sprachen, die Whisper durchprobiert (Auto-Erkennung ist unzuverlässig).
export const WHISPER_LANGUAGES = (process.env.WHISPER_LANGUAGES ?? 'de,en')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

// Quellen-Prüfung (factcheck.ts): so lange wird auf eine Quelle gewartet.
export const REACHABILITY_TIMEOUT_MS = 8000

// Externe CLIs (extract.ts): max. Größe der Konsolenausgabe und Anzahl Versuche.
export const YTDLP_MAX_BUFFER = 20 * 1024 * 1024
export const FFMPEG_MAX_BUFFER = 20 * 1024 * 1024
export const YTDLP_ATTEMPTS = 3

// Scoring (scoring.ts): Behauptungen mit echten Quellen zählen so viel stärker.
export const SOURCE_WEIGHT_FACTOR = 1.5
