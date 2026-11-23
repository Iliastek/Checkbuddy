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

/** Holt Titel/Beschreibung aus den Metadaten – optional, scheitert still. */
async function fetchMetadata(url: string): Promise<{ title?: string; description?: string }> {
  try {
    const stdout = await runYtDlp(['--no-playlist', '--dump-json', '--skip-download', url])
    const meta = JSON.parse(stdout)
    return { title: meta.title, description: meta.description }
  } catch {
    // Metadaten sind optional – wenn das scheitert, geht es ohne weiter.
    return {}
  }
}

/** Lädt das Video (eine Datei mit Bild + echtem Ton) nach `dir` und gibt den Pfad zurück. */
async function downloadVideo(url: string, dir: string): Promise<string> {
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
    throw new Error('The video could not be downloaded.')
  }
  return join(dir, video)
}

/** Zieht die Tonspur als mp3 aus dem Video (ffmpeg) und gibt den Pfad zurück. */
async function extractAudioTrack(videoPath: string, dir: string): Promise<string> {
  const audioPath = join(dir, 'audio.mp3')
  await execFileAsync(
    'ffmpeg',
    ['-y', '-i', videoPath, '-vn', '-acodec', 'libmp3lame', '-q:a', '5', audioPath],
    { maxBuffer: 1024 * 1024 * 20 },
  )
  return audioPath
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
    const { title, description } = await fetchMetadata(url)
    // 2) Video herunterladen.
    const videoPath = await downloadVideo(url, dir)
    // 3) Tonspur aus dem Video ziehen.
    const audioPath = await extractAudioTrack(videoPath, dir)

    return { audioPath, videoPath, cleanup, title, description }
  } catch (err) {
    await cleanup()
    throw err
  }
}
