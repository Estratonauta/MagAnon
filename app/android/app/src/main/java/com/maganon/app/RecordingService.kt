package com.maganon.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.maganon.app.plugins.Recorder
import com.maganon.app.plugins.RecorderStatus
import com.maganon.app.plugins.RecorderStore

class RecordingService : Service() {
  private var recorder: Recorder? = null

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onCreate() {
    super.onCreate()
    createNotificationChannel()
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    val sampleHz = intent?.getIntExtra(EXTRA_SAMPLE_HZ, 1) ?: 1
    val minAcc = intent?.getFloatExtra(EXTRA_MIN_ACCURACY_M, 50f) ?: 50f

    startForeground(NOTIF_ID, buildNotification())

    if (recorder == null) {
      recorder = Recorder(applicationContext)
      recorder!!.start(sampleHz = sampleHz, minAccuracyM = minAcc, background = true)
      val status = RecorderStore.getStatus(applicationContext)
      RecorderStore.writeActive(applicationContext, status.copy(background = true))
    }

    return START_STICKY
  }

  override fun onDestroy() {
    try {
      recorder?.stop()
    } catch (_: Exception) {}
    recorder = null
    super.onDestroy()
  }

  private fun buildNotification(): Notification {
    return NotificationCompat.Builder(this, CHANNEL_ID)
      .setContentTitle("MagAnon recording")
      .setContentText("Collecting magnetometer + GPS samples")
      .setSmallIcon(R.mipmap.ic_launcher)
      .setOngoing(true)
      .setCategory(NotificationCompat.CATEGORY_SERVICE)
      .build()
  }

  private fun createNotificationChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val mgr = getSystemService(NotificationManager::class.java)
    val channel = NotificationChannel(
      CHANNEL_ID,
      "MagAnon recording",
      NotificationManager.IMPORTANCE_LOW
    )
    mgr.createNotificationChannel(channel)
  }

  companion object {
    const val EXTRA_SAMPLE_HZ = "sampleHz"
    const val EXTRA_MIN_ACCURACY_M = "minAccuracyM"

    private const val CHANNEL_ID = "maganon_recording"
    private const val NOTIF_ID = 5001
  }
}
