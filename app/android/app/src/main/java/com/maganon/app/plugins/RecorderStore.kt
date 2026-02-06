package com.maganon.app.plugins

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.io.File

object RecorderStore {
  private const val DIR_NAME = "maganon"
  private const val SESSIONS_DIR = "sessions"
  private const val ACTIVE_FILE = "active_session.json"

  private fun baseDir(context: Context): File {
    val d = File(context.filesDir, DIR_NAME)
    if (!d.exists()) d.mkdirs()
    return d
  }

  fun sessionsDir(context: Context): File {
    val d = File(baseDir(context), SESSIONS_DIR)
    if (!d.exists()) d.mkdirs()
    return d
  }

  fun activeFile(context: Context): File = File(baseDir(context), ACTIVE_FILE)

  fun writeActive(context: Context, status: RecorderStatus) {
    val o = JSONObject()
    o.put("recording", status.recording)
    o.put("background", status.background)
    o.put("sessionId", status.sessionId)
    o.put("sampleCount", status.sampleCount)
    o.put("lastAccuracyM", status.lastAccuracyM)
    o.put("lastTsMs", status.lastTsMs)
    activeFile(context).writeText(o.toString())
  }

  fun clearActive(context: Context) {
    val f = activeFile(context)
    if (f.exists()) f.delete()
  }

  fun getStatus(context: Context): RecorderStatus {
    // If in-process recorder is active, it will overwrite this file frequently.
    val f = activeFile(context)
    if (!f.exists()) {
      return RecorderStatus(false, false, null, 0, null, null)
    }
    return try {
      val o = JSONObject(f.readText())
      RecorderStatus(
        recording = o.optBoolean("recording", false),
        background = o.optBoolean("background", false),
        sessionId = o.optString("sessionId", null),
        sampleCount = o.optInt("sampleCount", 0),
        lastAccuracyM = if (o.has("lastAccuracyM") && !o.isNull("lastAccuracyM")) o.getDouble("lastAccuracyM").toFloat() else null,
        lastTsMs = if (o.has("lastTsMs") && !o.isNull("lastTsMs")) o.getLong("lastTsMs") else null,
      )
    } catch (_: Exception) {
      RecorderStatus(false, false, null, 0, null, null)
    }
  }

  fun exportLastSession(context: Context, format: String): ExportResult? {
    val status = getStatus(context)
    val sessionId = status.sessionId
    if (sessionId.isNullOrEmpty()) return null

    val sessionDir = File(sessionsDir(context), sessionId)
    val manifest = File(sessionDir, "manifest.json")
    val jsonl = File(sessionDir, "samples.jsonl")
    if (!sessionDir.exists()) return null

    return when (format.lowercase()) {
      "manifest" -> {
        if (!manifest.exists()) return null
        ExportResult("manifest", manifest.absolutePath, "application/json")
      }
      "json" -> {
        // Create a single JSON file (may be large). Best-effort.
        if (!manifest.exists() || !jsonl.exists()) return null
        val out = File(sessionDir, "session.json")
        val root = JSONObject()
        root.put("manifest", JSONObject(manifest.readText()))
        val samples = JSONArray()
        jsonl.forEachLine { line ->
          if (line.isNotBlank()) {
            try { samples.put(JSONObject(line)) } catch (_: Exception) {}
          }
        }
        root.put("samples", samples)
        out.writeText(root.toString())
        ExportResult("json", out.absolutePath, "application/json")
      }
      else -> {
        if (!jsonl.exists()) return null
        ExportResult("jsonl", jsonl.absolutePath, "application/x-ndjson")
      }
    }
  }
}
