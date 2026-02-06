import { Capacitor, registerPlugin } from '@capacitor/core'

export type RecorderStatus = {
  recording: boolean
  background: boolean
  sessionId?: string | null
  sampleCount: number
  lastAccuracyM?: number | null
  lastTsMs?: number | null
}

export type ExportResult = {
  format: string
  path: string
  mime: string
}

export type StartRecordingOpts = {
  background: boolean
  sampleHz: number
  minAccuracyM: number
}

type MagSensorsPlugin = {
  startRecording(opts: StartRecordingOpts): Promise<void>
  stopRecording(): Promise<void>
  getStatus(): Promise<RecorderStatus>
  exportSession(opts: { format: string }): Promise<ExportResult>
}

const MagSensors = registerPlugin<MagSensorsPlugin>('MagSensors')

let mock: RecorderStatus = {
  recording: false,
  background: false,
  sessionId: null,
  sampleCount: 0,
  lastAccuracyM: null,
  lastTsMs: null,
}

let timer: number | null = null

export const Sensors = {
  isAvailable(): boolean {
    return Capacitor.isNativePlatform()
  },

  async startRecording(opts: StartRecordingOpts): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await MagSensors.startRecording(opts)
      return
    }

    // Web mock (no real sensors): bump sample counter at sampleHz.
    if (timer != null) return
    mock = {
      recording: true,
      background: false,
      sessionId: 'web-mock',
      sampleCount: 0,
      lastAccuracyM: 12,
      lastTsMs: Date.now(),
    }
    const periodMs = Math.max(50, Math.floor(1000 / Math.max(1, opts.sampleHz)))
    timer = window.setInterval(() => {
      mock.sampleCount += 1
      mock.lastTsMs = Date.now()
      mock.lastAccuracyM = 8 + Math.random() * 8
    }, periodMs)
  },

  async stopRecording(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await MagSensors.stopRecording()
      return
    }
    if (timer != null) {
      window.clearInterval(timer)
      timer = null
    }
    mock.recording = false
  },

  async getStatus(): Promise<RecorderStatus> {
    if (Capacitor.isNativePlatform()) {
      return await MagSensors.getStatus()
    }
    return mock
  },

  async exportSession(format: string): Promise<ExportResult> {
    if (Capacitor.isNativePlatform()) {
      return await MagSensors.exportSession({ format })
    }
    return { format, path: '', mime: 'application/octet-stream' }
  },
}
