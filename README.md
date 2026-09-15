# Plague D Studio

Plague D Studio is a browser-based songwriting workspace for turning recordings into workable guitar ideas, lyrics, tab, and future production notes.

## Current MVP

- Upload audio by file picker or drag and drop.
- Play, pause, seek, and read the real duration of an uploaded recording.
- Run a browser-only single-pitch analysis pass and generate approximate guitar tab.
- Keep generated tab aligned across all six strings.
- Export the current tab as a text file.
- Save and restore the current session locally with IndexedDB.
- Save a portable `.plague-session.json` manifest through the browser Save As dialog.
- Use the guitar tuner string controls and navigation shortcuts already present in the UI.

## Run locally

From this folder, start a static server:

```powershell
python -m http.server 8765
```

Open <http://localhost:8765/index.html>.

Opening `index.html` directly also works for basic UI use, but an HTTP server is more reliable for browser audio and file handling.

## Test workflow

1. Click **Choose audio file** and select a WAV, MP3, or M4A file.
2. Click **Transcribe recording**.
3. Review the generated approximate tab.
4. Use playback to compare the result with the recording.
5. Use **Export tab** or **Save session**.

The bundled `smoke riff.mp3` and `Destruction-Written-Withn.wav` files are useful test inputs.

## Important limitations

The current detector is monophonic and experimental. It can identify approximate single pitches, but it is not yet a reliable polyphonic guitar, chord, rhythm, or distortion transcription engine. The current lyrics and tuner displays are still lightweight prototype surfaces.

## Direction

The longer-term product is a small songwriting studio: multiple stems and guitar tracks, tuning-aware transcription, editable tab, chord progression support, lyric assistance, preview selection, mastering presets, before/after comparison, and exportable song packages.