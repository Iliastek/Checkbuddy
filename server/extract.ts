import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdtemp, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const execFileAsync = promisify(execFile)

/** Führt yt-dlp aus und wiederholt bei einem Fehlversuch (TikTok/yt-dlp hakt manchmal beim 1. Mal). */
async function runYtDlp(args: string[], attempts = 3): Promise<string> {
  let lastErr: unknown
  for (let i = 1; i <= attempts; i++) {
    try {
      const { stdout } = await execFileAsync('yt-dlp', args, { maxBuffer: 1024 * 1024 * 20 })
      return stdout
    } catch (err) {
      lastErr = err
      if (i < attempts) {
        console.warn(`[extract] yt-dlp Versuch ${i}/${attempts} fehlgeschlagen, neuer Versuch…`)
        await new Promise((r) => setTimeout(r, 800 * i))
      }
    }
  }
  throw lastErr
}

export interface ExtractedContent {
  /** Pfad zur extrahierten Audiodatei (mp3). */
  audioPath: string
  /** Pfad zur heruntergeladenen Videodatei (für spätere Bild-Analyse). */
  videoPath: string
  /** Aufräum-Funktion – löscht das temporäre Verzeichnis. */
  cleanup: () => Promise<void>
  /** Titel/Beschreibung aus den Metadaten, falls vorhanden. */
  title?: string
  description?: string
}

/**
 * Lädt mit yt-dlp das Video eines Links herunter und extrahiert daraus mit
 * ffmpeg die Tonspur als mp3.
 *
 * WICHTIG: Es wird bewusst das VIDEO geladen (Format "b" = eine Datei mit Bild
 * UND Ton), nicht die separate „audio only“-Spur. Bei TikTok ist die
 * „audio only“-Spur oft nur der Original-Sound/das benutzte Lied – die
 * eigentliche Stimme/Voiceover steckt nur im eingebetteten Video-Ton.
 *
 * Die URL wird als eigenes Argument an execFile übergeben (kein Shell-String),
 * damit keine Shell-Injection möglich ist.
 */
export async function extractAudio(url: string): Promise<ExtractedContent> {
  const dir = await mkdtemp(join(tmpdir(), 'checkbuddy-'))
  const cleanup = () => rm(dir, { recursive: true, force: true })

  try {
    // 1) Metadaten (Titel/Beschreibung) holen – hilft dem Fact-Check als Kontext.
    let title: string | undefined
    let description: string | undefined
    try {
      const stdout = await runYtDlp(['--no-playlist', '--dump-json', '--skip-download', url])
      const meta = JSON.parse(stdout)
      title = meta.title
      description = meta.description
    } catch {
      // Metadaten sind optional – wenn das scheitert, geht es ohne weiter.
    }

    // 2) Video herunterladen (eine Datei mit Bild + echtem Ton).
    await runYtDlp([
      '--no-playlist',
      '-f',
      'b/bv*+ba', // "b" = beste Einzeldatei mit Ton bevorzugt; sonst mergen
      '-o',
      join(dir, 'video.%(ext)s'),
      url,
    ])

    const files = await readdir(dir)
    const video = files.find((f) => /\.(mp4|webm|mkv|mov)$/i.test(f))
    if (!video) {
      throw new Error('Das Video konnte nicht heruntergeladen werden.')
    }
    const videoPath = join(dir, video)

    // 3) Tonspur aus dem Video ziehen (ffmpeg).
    const audioPath = join(dir, 'audio.mp3')
    await execFileAsync(
      'ffmpeg',
      ['-y', '-i', videoPath, '-vn', '-acodec', 'libmp3lame', '-q:a', '5', audioPath],
      { maxBuffer: 1024 * 1024 * 20 },
    )

    return { audioPath, videoPath, cleanup, title, description }
  } catch (err) {
    await cleanup()
    throw err
  }
}
