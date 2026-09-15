# Plague D Studio Handoff

## Product intent

Give a songwriter a low-cost studio musician in the browser. The user brings the idea, lyrics, taste, and destination; the tool reduces the friction between rough recording and a usable demo or song package.

## Current code map

- `index.html`: page structure, upload area, transcription preview, lyrics panel, tuner panel, and responsive layout overrides.
- `styles.css`: dark editorial studio visual system and responsive styling.
- `app.js`: audio loading/playback, pitch detection, tab rendering, export, IndexedDB session persistence, and Save As manifest export.
- `plague_logo.png`: brand asset.
- `smoke riff.mp3`, `Destruction-Written-Withn.wav`: local audio fixtures.
- `Recording 2026-09-15 040821.mp4`: reference capture of the SoundCloud mastering flow.

## Verified behavior

- Local audio loads and reports real duration.
- Playback timeline updates and supports seeking.
- Browser analysis generated 32 approximate notes from the bundled WAV.
- Generated notes render across a six-string timing grid.
- Save and refresh restored the audio, project name, tab, lyrics, and duration.
- The visible file chooser opens the native browser picker.
- `node --check app.js` passes.

## Architecture decisions to preserve

Treat a project as a collection of tracks/stems rather than one audio file. Each track should eventually have a name, role, mute/solo state, gain, tuning, transcription result, and processing settings. Transcription should be able to target one guitar stem while mastering can target the mix.

## Next implementation slice

1. Add a stem-aware project model and multi-file upload.
2. Add per-track mute, solo, gain, and target-for-transcription controls.
3. Make tab notes directly editable and persist those edits.
4. Add timing-aware note events instead of only a pitch list.
5. Add chord and power-chord hypotheses with user corrections.
6. Build a mastering-style preview workflow: choose a 30-second section, find a dynamic-range sweet spot, compare original and processed previews, and export.

## Audio-processing boundary

The current browser pitch detector is intentionally lightweight. High-quality mastering, polyphonic transcription, chord recognition, and live guitar IntelliSense will need stronger DSP, a proven client library, or a backend/model service. Do not describe the current output as production-accurate transcription.

## GitHub handoff

Git was not available in the current Windows environment when this handoff was prepared, so no commit or push could be made here. Once Git is installed and a remote is configured, use:

```powershell
git add .
git commit -m "Document Plague D Studio MVP and roadmap"
git push -u origin main
```

Confirm the branch name and remote before pushing.