package com.maganon.app.plugins

import com.getcapacitor.JSObject

data class RecorderStatus(
  val recording: Boolean,
  val background: Boolean,
  val sessionId: String?,
  val sampleCount: Int,
  val lastAccuracyM: Float?,
  val lastTsMs: Long?
) {
  fun toJS(): JSObject {
    val o = JSObject()
    o.put("recording", recording)
    o.put("background", background)
    o.put("sessionId", sessionId)
    o.put("sampleCount", sampleCount)
    o.put("lastAccuracyM", lastAccuracyM)
    o.put("lastTsMs", lastTsMs)
    return o
  }
}

data class ExportResult(
  val format: String,
  val path: String,
  val mime: String
)
