# MagAnon – spec (draft)

## Data captured
Per sample (1 Hz default):
- `ts_ms`
- `lat`, `lon`, `accuracy_m`
- `altitude_m` (optional)
- `heading_deg` (optional)
- `magnetic_uT` (preferred) and/or `magnetic_vec_uT` (optional)
- coarse device/platform info (optional)
- `session_id` (random, rotates)

Canonical schema: see [`SAMPLE_SCHEMA.md`](./SAMPLE_SCHEMA.md).

## Privacy
- No user accounts.
- **Upload is opt-in**: by default, sessions stay on-device (exportable by the user).
- Session IDs rotate and should not be tied to stable identifiers.
- Avoid collecting PII. Keep device metadata coarse.
- Optional (future): client-side spatial jitter for public view.

## Public data license (ODbL)
Uploaded samples are contributed to the shared/public database under **ODbL v1.0**.

UI wording guideline:
- Use a clear checkbox or toggle.
- Make it explicit that opting in contributes the data under ODbL.

See [`DATA_LICENSE.md`](./DATA_LICENSE.md).

## Processing
- Baseline per session: rolling median
- anomaly = magnetic_uT - baseline
- Aggregate for map: H3 hex bins

## API (initial)
- `POST /api/samples` (bulk; requires `opt_in: true`)
- `GET /api/tiles` (future)
