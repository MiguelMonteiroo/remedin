package com.remedin

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.facebook.react.HeadlessJsTaskService
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager

class ReminderRescheduleReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    try {
      runCatching { AlarmAudioScheduler.cancelAll(context) }
      val serviceIntent = Intent(context, ReminderReconcileService::class.java)
      serviceIntent.putExtra("reason", intent.action ?: "device-event")
      context.startService(serviceIntent)
      HeadlessJsTaskService.acquireWakeLockNow(context)
    } catch (_: IllegalStateException) {
      WorkManager.getInstance(context).enqueue(OneTimeWorkRequestBuilder<ReminderReconcileWorker>().build())
    } catch (_: SecurityException) {
      WorkManager.getInstance(context).enqueue(OneTimeWorkRequestBuilder<ReminderReconcileWorker>().build())
    }
  }
}
