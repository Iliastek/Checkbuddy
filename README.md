# Checkbuddy

Fakten-Check für Reels, TikToks & Shorts. Man fügt einen Link ein und Checkbuddy
holt den Video-Inhalt, transkribiert ihn und prüft die Behauptungen per KI.

## Wie es funktioniert

```
Link  →  [Backend]  →  yt-dlp (Audio laden)  →  Whisper (Text)  →  GPT (prüfen)  →  Ergebnis
```

- **Frontend:** React + TypeScript + Vite + Tailwind (schlichtes Schwarz-Weiß-Design)
- **Backend:** Express-Server mit einem Endpunkt `POST /api/check`
- **KI:** OpenAI (Whisper für die Transkription, GPT für den Fakten-Check)

> **Status:** Erste echte Version. Aktuell auf **TikTok** ausgelegt (Video hat keine
> Untertitel → Audio wird transkribiert). YouTube/Instagram funktionieren technisch
> ähnlich. Der Fakten-Check bewertet derzeit aus dem Modellwissen; **Websuche für
> echte Quellenprüfung ist der nächste Ausbauschritt.**

## Voraussetzungen

1. **Node.js** (v20+)
2. **yt-dlp** und **ffmpeg** (laden & konvertieren das Video-Audio):
   ```bash
   brew install yt-dlp ffmpeg
   ```
3. Ein **OpenAI API-Key**: https://platform.openai.com/api-keys

## Einrichten

```bash
npm install

# Key hinterlegen: .env.example kopieren und ausfüllen
cp .env.example .env
# dann in .env den OPENAI_API_KEY eintragen
```

## Starten

Frontend **und** Backend zusammen:

```bash
npm run dev:all
```

- Frontend: http://localhost:5173
- Backend:  http://localhost:3001

(Alternativ in zwei Terminals: `npm run dev` und `npm run server`.)

Weitere Befehle:

```bash
npm run build     # Typprüfung (Frontend + Server) und Produktions-Build
npm run preview   # Frontend-Build lokal ansehen
```

## Projektstruktur

```
src/                     # Frontend (React)
├── App.tsx              # Layout & Zustand
├── factCheck.ts         # ruft das Backend auf (POST /api/check)
├── platform.ts          # Link-/Plattform-Helfer (mit Server geteilt)
├── types.ts             # Datentypen (Ergebnisformat)
├── verdictStyles.ts     # Schwarz-Weiß-Stile pro Bewertung
└── components/          # LinkForm, ResultView, ClaimCard, VerdictBadge

server/                  # Backend (Express)
├── index.ts             # API-Endpunkt, führt die Pipeline aus
├── extract.ts           # yt-dlp: Audio + Metadaten aus dem Link
├── transcribe.ts        # OpenAI Whisper: Audio → Text
└── factcheck.ts         # OpenAI GPT: Text → strukturiertes Ergebnis
```

## Fahrplan

- [x] Prototyp: Weboberfläche mit simulierten Ergebnissen
- [x] Backend: Video-Inhalt aus Link extrahieren (yt-dlp + Whisper)
- [x] Echtes Fact-Checking per KI (OpenAI)
- [ ] Websuche zur echten Quellenprüfung
- [ ] Weitere Plattformen robust machen (Instagram, YouTube)
- [ ] „Transkript einfügen"-Fallback, falls ein Download blockiert wird
- [ ] Später: Mobile-App mit „Teilen"-Funktion aus TikTok/Instagram
