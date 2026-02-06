export type RecordingSettings = {
  background: boolean
  sampleHz: number
  minAccuracyM: number
}

const KEY = 'maganon:recordingSettings'

export const defaultRecordingSettings: RecordingSettings = {
  background: false,
  sampleHz: 5,
  minAccuracyM: 50,
}

export function loadRecordingSettings(): RecordingSettings {
  const raw = localStorage.getItem(KEY)
  if (!raw) return defaultRecordingSettings
  try {
    const v = JSON.parse(raw) as Partial<RecordingSettings>
    return {
      background: Boolean(v.background ?? defaultRecordingSettings.background),
      sampleHz: Number(v.sampleHz ?? defaultRecordingSettings.sampleHz),
      minAccuracyM: Number(v.minAccuracyM ?? defaultRecordingSettings.minAccuracyM),
    }
  } catch {
    return defaultRecordingSettings
  }
}

export function saveRecordingSettings(s: RecordingSettings) {
  localStorage.setItem(KEY, JSON.stringify(s))
}
