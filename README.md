# MagAnon

Anonymous, crowd-sourced magnetic field + location mapping (iOS-first).

## Status
Early scaffold. Goal:
- collect location + magnetic field/heading at ~1 Hz on mobile
- upload anonymously to a shared pool
- show aggregated anomalies on a map

## iOS note
A pure Safari web app cannot reliably access raw magnetometer data on iOS.
For iOS-first reliability, this project is designed to run as a thin iOS wrapper (Capacitor) with a web UI.

## Repo layout
- `app/` web UI (PWA)
- `server/` API stub (to be replaced with Postgres/PostGIS later)
- `docs/` specs

## Roadmap (MVP)
1. iOS wrapper (Capacitor) exposes magnetometer + heading to the web UI.
2. Sampling UI (start/stop, 1 Hz, accuracy gates).
3. Upload in batches; store raw + session baseline.
4. Map view (hexbin/heatmap) of anomaly.

## License
MIT

## Web demo (GitHub Pages)
Once Pages is enabled in the repo settings, the web demo will be at:
https://estratonauta.github.io/MagAnon/
