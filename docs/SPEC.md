# MagAnon – spec (draft)

## Data captured
Per sample (1 Hz default):
- timestamp (ms)
- lat, lon, accuracy_m
- altitude_m (optional)
- heading_deg (optional)
- magnetic_uT (preferred) or fallback: heading only
- device/platform coarse info
- session_id (random UUID, rotates)

## Privacy
- No user accounts
- Session id rotates
- Optional: client-side spatial jitter for public view

## Processing
- Baseline per session: rolling median
- anomaly = magnetic_uT - baseline
- Aggregate for map: H3 hex bins

## API (initial)
- POST /api/samples (bulk)
- GET /api/tiles (future)
