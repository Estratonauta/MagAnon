package com.maganon.app.plugins

import android.content.Context
import android.content.Intent
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.PluginMethod
import com.maganon.app.RecordingService

@CapacitorPlugin(name = "MagSensors")
class MagSensorsPlugin : Plugin() {
  private val recorder: Recorder by lazy {
    Recorder(context = context.applicationContext)
  }

  @PluginMethod
  fun startRecording(call: PluginCall) {
    val background = call.getBoolean("background", false) ?: false
    val sampleHz = call.getInt("sampleHz", 1) ?: 1
    val minAccuracyM = (call.getDouble("minAccuracyM", 50.0) ?: 50.0).toFloat()

    if (background) {
      val intent = Intent(context, RecordingService::class.java)
      intent.putExtra(RecordingService.EXTRA_SAMPLE_HZ, sampleHz)
      intent.putExtra(RecordingService.EXTRA_MIN_ACCURACY_M, minAccuracyM)
      context.startForegroundService(intent)
      call.resolve()
      return
    }

    try {
      recorder.start(sampleHz = sampleHz, minAccuracyM = minAccuracyM)
      call.resolve()
    } catch (e: Exception) {
      call.reject("Failed to start recording: ${e.message}")
    }
  }

  @PluginMethod
  fun stopRecording(call: PluginCall) {
    // Stop both in-process recorder and background service if present.
    try {
      recorder.stop()
    } catch (_: Exception) {}

    try {
      val intent = Intent(context, RecordingService::class.java)
      context.stopService(intent)
    } catch (_: Exception) {}

    call.resolve()
  }

  @PluginMethod
  fun getStatus(call: PluginCall) {
    val status = RecorderStore.getStatus(context)
    call.resolve(status.toJS())
  }

  @PluginMethod
  fun exportSession(call: PluginCall) {
    val format = call.getString("format", "jsonl") ?: "jsonl"
    val res = RecorderStore.exportLastSession(context, format)
    if (res == null) {
      call.reject("No session available")
      return
    }
    val js = JSObject()
    js.put("format", res.format)
    js.put("path", res.path)
    js.put("mime", res.mime)
    call.resolve(js)
  }
}
