# Plague D Studio

> A poor man's studio musician for people with songs in their heads. [^_^]

Plague D Studio is a private browser-based songwriting workspace for turning rough recordings into playable ideas, useful demos, and eventually sellable song packages.

You bring the feeling, lyrics, taste, and destination. The studio helps with the tedious bits: listening, finding notes, shaping tab, organizing tracks, and getting an idea into a form somebody else can hear.

`Private project / early build / built for songwriting in progress`

## What it does now

- Upload audio with a visible file picker or drag and drop.
- Play, pause, seek, and read the real duration of a recording.
- Analyze a recording in the browser with an experimental single-pitch detector.
- Turn detected notes into an aligned six-string guitar tab grid.
- Export the current tab as a text file.
- Save and restore a full session locally with IndexedDB.
- Save a portable `.plague-session.json` session manifest.
- Keep lyrics, tuner controls, project identity, and transcription preview in one workspace.

## The bigger idea

This is not meant to replace the songwriter. It is meant to be the extra pair of hands that makes the gap between idea and demo smaller.

The long-term studio should help with:

- Multiple stems and multiple guitar tracks
- Rhythm, lead, clean, distorted, acoustic, doubled, and harmony guitars
- Per-track mute, solo, gain, tuning, and transcription targets
- Editable notes, tab, chords, and chord progressions
- Live guitar IntelliSense while playing
- Lyric phrasing, rhyme, syllable, and connective-line suggestions
- Song sections, arrangement notes, and alternate takes
- Mastering-style preview selection and before/after comparisons
- Exportable demo packages for collaborators or buyers

## Try it locally

From the project folder:

```powershell
python -m http.server 8765
```

Then open:

<http://localhost:8765/index.html>

The build checklist is here:

<http://localhost:8765/TODO.html>

## Quick test

1. Click **Choose audio file**.
2. Select a WAV, MP3, or M4A recording.
3. Click **Transcribe recording**.
4. Listen back and compare the generated tab with what you played.
5. Export the tab or save the session.

The `smoke riff.mp3` fixture is a useful test for a recognizable riff. A clean, consistent single-note recording gives the current detector its best chance.

## Honest limits

The current transcription pass is experimental and monophonic. It can find approximate pitches, but it is not yet reliable for chords, fast playing, distortion, rhythm, or full arrangements. The tuner and lyrics surfaces are also early prototypes.

High-quality mastering, polyphonic transcription, chord recognition, and live guitar detection will need stronger DSP, a proven audio library, or a model/backend service.

## Project notes

- `index.html` - studio interface and layout
- `styles.css` - visual system and responsive styling
- `app.js` - audio, transcription, tab, saving, and export behavior
- `HANDOFF.md` - engineering context and next implementation slices
- `TODO.html` - interactive build checklist
- `plague_logo.png` - brand asset

## Status

Private, actively evolving, and intentionally honest about the rough edges.

```text
rough idea -> recording -> notes -> tab -> arrangement -> demo -> song package
				      ^
			      Plague D Studio
```

Made for songs that are not finished yet. That is where the good trouble starts. [:-)]