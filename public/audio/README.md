# Optional cue track

The hero CTAs fire a cinematic cue. By default that cue is **synthesized at
runtime** in `src/lib/ambientAudio.js` — a cathedral organ stack, a rising
sus4→fifth→octave line and a ticking ostinato, built from oscillators and a
procedurally generated reverb impulse. Nothing is downloaded and nothing is
bundled.

If you want a real recording instead, drop it here:

```
public/audio/theme.mp3
```

The player fetches it the first time a visitor presses a hero CTA with sound
enabled. If the file is absent the fetch 404s and the synthesized cue plays —
so the site behaves identically either way, and no build step cares.

## Before you add one

**Use a track you hold the rights to.** This site deploys to a public URL, so
serving an audio file there is distribution. A commercial film score is not
licensed for that, however the file was obtained. Original music, a track you
commissioned, or something under a licence that permits web use (CC-BY, a
stock-music licence) is fine.

**Keep it small.** This is a button press, not a soundtrack. The player only
uses a short excerpt (see `THEME_EXCERPT`), but the whole file is fetched and
decoded, so an 18 MB extended upload costs every visitor 18 MB to hear seven
seconds. Export a trimmed, mono-if-possible MP3 at a modest bitrate — a few
hundred kB is plenty.

## Tuning the excerpt

`THEME_EXCERPT` in `src/lib/ambientAudio.js` controls which part plays:

| field     | meaning                                  |
| --------- | ---------------------------------------- |
| `start`   | seconds into the file the excerpt begins |
| `length`  | how long the excerpt runs                |
| `fadeIn`  | fade-up time, so it never clicks in      |
| `fadeOut` | fade-down time before it stops           |

The excerpt is routed through the same reverb bus as the synthesized cue, and
a second press replaces the first rather than stacking on top of it.
