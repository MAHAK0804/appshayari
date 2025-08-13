package com.shayariapp

import android.app.Activity
import android.os.Process
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class KillAppModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "KillApp"
    }

    @ReactMethod
    fun killApp() {
        val activity: Activity? = currentActivity
        activity?.finishAffinity() // Close all activities
        Process.killProcess(Process.myPid()) // Kill process
        System.exit(0) // Exit JVM
    }
}
