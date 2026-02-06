package com.maganon.app.plugins

import android.annotation.SuppressLint
import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Looper
import com.google.android.gms.location.*
import org.json.JSONObject
import java.io.File
import java.util.UUID
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.math.PI
import kotlin.math.atan2
import kotlin.math.sqrt

class Recorder(private val context: Context) : SensorEventListener {
  private val running = AtomicBoolean(false)

  private val sensorManager: SensorManager by lazy {
    context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
  }

  private val fusedLocationClient: FusedLocationProviderClient by lazy {
    LocationServices.getFusedLocationProviderClient(context)
  }

  private var sessionId: String? = null
  private var sessionDir: File? = null
  private var jsonlFile: File? = null
  private var sampleCount: Int = 0

  private var samplePeriodMs: Long = 1000
  private var minAccuracyM: Float = 50f

  private var lastEmitMs: Long = 0
  private var lastAccuracyM: Float? = null
  private var lastTsMs: Long? = null

  private var lastMag: FloatArray? = null
  private var lastRot: FloatArray? = null
  private var lastLat: Double? = null
  private var lastLon: Double? = null

  private var locationCallback: LocationCallback? = null

  fun start(sampleHz: Int, minAccuracyM: Float, background: Boolean = false) {
    if (!running.compareAndSet(false, true)) return

    this.samplePeriodMs = (1000.0 / sampleHz.coerceAtLeast(1)).toLong().coerceAtLeast(50)
    this.minAccuracyM = minAccuracyM

    val sid = UUID.randomUUID().toString()
    sessionId = sid
    val dir = File(RecorderStore.sessionsDir(context), sid)
    dir.mkdirs()
    sessionDir = dir

    jsonlFile = File(dir, "samples.jsonl")
    if (!jsonlFile!!.exists()) jsonlFile!!.createNewFile()

    val manifest = JSONObject()
    manifest.put("session_id", sid)
    manifest.put("started_at_ms", System.currentTimeMillis())
    manifest.put("platform", "android")
    manifest.put("background", background)
    File(dir, "manifest.json").writeText(manifest.toString())

    // Sensors
    val mag = sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD)
    val rot = sensorManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR)
    if (mag != null) sensorManager.registerListener(this, mag, SensorManager.SENSOR_DELAY_GAME)
    if (rot != null) sensorManager.registerListener(this, rot, SensorManager.SENSOR_DELAY_GAME)

    // Location
    startLocationUpdates()

    // Initial status write
    RecorderStore.writeActive(context, RecorderStatus(true, background, sid, 0, null, null))
  }

  fun stop() {
    if (!running.compareAndSet(true, false)) return

    try {
      sensorManager.unregisterListener(this)
    } catch (_: Exception) {}

    try {
      stopLocationUpdates()
    } catch (_: Exception) {}

    // Update manifest ended_at
    try {
      val dir = sessionDir
      val sid = sessionId
      if (dir != null && sid != null) {
        val mf = File(dir, "manifest.json")
        val o = JSONObject(mf.readText())
        o.put("ended_at_ms", System.currentTimeMillis())
        o.put("sample_count", sampleCount)
        mf.writeText(o.toString())
      }
    } catch (_: Exception) {}

    RecorderStore.clearActive(context)
  }

  override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}

  override fun onSensorChanged(event: SensorEvent?) {
    if (!running.get()) return
    if (event == null) return

    when (event.sensor.type) {
      Sensor.TYPE_MAGNETIC_FIELD -> lastMag = event.values.clone()
      Sensor.TYPE_ROTATION_VECTOR -> lastRot = event.values.clone()
    }

    maybeEmitSample()
  }

  private fun maybeEmitSample() {
    val now = System.currentTimeMillis()
    if (now - lastEmitMs < samplePeriodMs) return

    val lat = lastLat
    val lon = lastLon
    if (lat == null || lon == null) return

    lastEmitMs = now
    lastTsMs = now

    val mag = lastMag
    val rot = lastRot

    val sample = JSONObject()
    sample.put("session_id", sessionId)
    sample.put("ts_ms", now)
    sample.put("lat", lat)
    sample.put("lon", lon)
    lastAccuracyM?.let { sample.put("accuracy_m", it) }

    // Magnetic vector + magnitude
    if (mag != null && mag.size >= 3) {
      val mx = mag[0]
      val my = mag[1]
      val mz = mag[2]
      val vec = JSONObject()
      vec.put("x", mx)
      vec.put("y", my)
      vec.put("z", mz)
      sample.put("magnetic_vec_uT", vec)
      val magU = sqrt(mx * mx + my * my + mz * mz)
      sample.put("magnetic_uT", magU)
    }

    // Heading from rotation vector
    if (rot != null) {
      try {
        val R = FloatArray(9)
        SensorManager.getRotationMatrixFromVector(R, rot)
        val orient = FloatArray(3)
        SensorManager.getOrientation(R, orient)
        val azimuthRad = orient[0]
        var heading = (azimuthRad * 180.0 / PI).toFloat()
        if (heading < 0) heading += 360f
        sample.put("heading_deg", heading)
      } catch (_: Exception) {}
    }

    // QC flags (basic)
    val qc = JSONObject()
    val acc = lastAccuracyM
    qc.put("gps_ok", acc != null && acc <= minAccuracyM)
    qc.put("mag_ok", mag != null && mag.size >= 3 && (sqrt(mag[0]*mag[0] + mag[1]*mag[1] + mag[2]*mag[2]) in 1.0..2000.0))
    qc.put("rot_ok", rot != null)
    sample.put("qc", qc)

    // Persist JSONL
    try {
      jsonlFile?.appendText(sample.toString() + "\n")
      sampleCount += 1
    } catch (_: Exception) {}

    RecorderStore.writeActive(
      context,
      RecorderStatus(
        recording = true,
        background = false,
        sessionId = sessionId,
        sampleCount = sampleCount,
        lastAccuracyM = lastAccuracyM,
        lastTsMs = lastTsMs
      )
    )
  }

  @SuppressLint("MissingPermission")
  private fun startLocationUpdates() {
    val req = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 1000L)
      .setMinUpdateIntervalMillis(500L)
      .setWaitForAccurateLocation(false)
      .build()

    val cb = object : LocationCallback() {
      override fun onLocationResult(result: LocationResult) {
        val loc = result.lastLocation ?: return
        lastLat = loc.latitude
        lastLon = loc.longitude
        lastAccuracyM = if (loc.hasAccuracy()) loc.accuracy else null
      }
    }
    locationCallback = cb
    fusedLocationClient.requestLocationUpdates(req, cb, Looper.getMainLooper())
  }

  private fun stopLocationUpdates() {
    val cb = locationCallback
    if (cb != null) fusedLocationClient.removeLocationUpdates(cb)
    locationCallback = null
  }
}
