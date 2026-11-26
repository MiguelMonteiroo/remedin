package com.remedin

import android.content.Context
import android.content.Intent
import androidx.work.Worker
import androidx.work.WorkerParameters
import com.facebook.react.HeadlessJsTaskService
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

class ReminderReconcileWorker(
    context: Context,
    parameters: WorkerParameters,
) : Worker(context, parameters) {
  private class Completion {
    val latch = CountDownLatch(1)
    @Volatile var success = false
  }

  companion object {
    private val completions = ConcurrentHashMap<String, Completion>()

    fun complete(requestId: String, success: Boolean) {
      completions[requestId]?.let {
        it.success = success
        it.latch.countDown()
      }
    }
  }

  override fun doWork(): Result {
    val requestId = UUID.randomUUID().toString()
    val completion = Completion()
    completions[requestId] = completion
    return try {
        applicationContext.startService(
            Intent(applicationContext, ReminderReconcileService::class.java)
                .putExtra("requestId", requestId),
        )
        HeadlessJsTaskService.acquireWakeLockNow(applicationContext)
        if (completion.latch.await(90, TimeUnit.SECONDS) && completion.success) {
          Result.success()
        } else Result.retry()
      } catch (_: IllegalStateException) {
        Result.retry()
      } catch (_: SecurityException) {
        Result.retry()
      } catch (_: InterruptedException) {
        Thread.currentThread().interrupt()
        Result.retry()
      } finally {
        completions.remove(requestId)
      }
  }
}
