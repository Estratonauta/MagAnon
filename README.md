# MagAnon

Anonymous, crowd-sourced magnetic field + location mapping (**Android-first**, Pixel 9 target).

## Status
Early scaffold. Goal:
- collect location + magnetic field + heading on-device (Android)
- optionally keep recording in the background (foreground service)
- store sessions locally (JSONL) and upload anonymously (opt-in)
- show aggregated anomalies on a map

## Platform notes
- **Android:** primary target. Uses a Capacitor Android plugin for magnetometer + rotation vector + GPS.
- **Web:** runs as a UI/demo, but does not have reliable access to raw magnetometer data.
- **iOS:** de-emphasized for now.

## Repo layout
- `app/` React UI (Capacitor)
- `server/` API stub (to be replaced with Postgres/PostGIS later)
- `docs/` specs + build notes

## Roadmap (MVP)
1. Android plugin: magnetometer + heading + GPS → JSONL sessions.
2. Record UI: start/stop, sample rate, accuracy gate, background toggle.
3. Upload in batches; store raw + session manifest.
4. Map view (hexbin/heatmap) of anomaly.

## License
- Code: MIT
- Public data pool: ODbL 1.0 (see docs/DATA_LICENSE.md)

## Web demo (GitHub Pages)
Once Pages is enabled in the repo settings, the web demo will be at:
https://estratonauta.github.io/MagAnon/

## Android APK
See `docs/ANDROID_APK.md`.
