package com.anonymous.ccapp

import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.content.FileProvider
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File
import java.io.FileInputStream
import java.security.MessageDigest

class ApkInstallerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "ApkInstaller"

    @ReactMethod
    fun canRequestPackageInstalls(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val canInstall = reactContext.packageManager.canRequestPackageInstalls()
                promise.resolve(canInstall)
            } else {
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.reject("PERMISSION_CHECK_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun openInstallPermissionSettings(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val intent = Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES).apply {
                    data = Uri.parse("package:${reactContext.packageName}")
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                reactContext.startActivity(intent)
                promise.resolve(true)
            } else {
                promise.resolve(false)
            }
        } catch (e: Exception) {
            promise.reject("SETTINGS_OPEN_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun installApk(filePath: String, promise: Promise) {
        try {
            val cleanPath = if (filePath.startsWith("file://")) {
                filePath.substring(7)
            } else {
                filePath
            }

            val apkFile = File(cleanPath)
            if (!apkFile.exists()) {
                promise.reject("FILE_NOT_FOUND", "APK file does not exist at path: $cleanPath")
                return
            }

            val apkUri: Uri = FileProvider.getUriForFile(
                reactContext,
                "${reactContext.packageName}.fileprovider",
                apkFile
            )

            val installIntent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(apkUri, "application/vnd.android.package-archive")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }

            reactContext.startActivity(installIntent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("INSTALL_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun getApkSha256(filePath: String, promise: Promise) {
        Thread {
            try {
                val cleanPath = if (filePath.startsWith("file://")) {
                    filePath.substring(7)
                } else {
                    filePath
                }

                val apkFile = File(cleanPath)
                if (!apkFile.exists()) {
                    promise.reject("FILE_NOT_FOUND", "APK file does not exist at path: $cleanPath")
                    return@Thread
                }

                val digest = MessageDigest.getInstance("SHA-256")
                FileInputStream(apkFile).use { fis ->
                    val buffer = ByteArray(8192)
                    var bytesRead: Int
                    while (fis.read(buffer).also { bytesRead = it } != -1) {
                        digest.update(buffer, 0, bytesRead)
                    }
                }

                val hashBytes = digest.digest()
                val hexString = StringBuilder()
                for (b in hashBytes) {
                    val hex = Integer.toHexString(0xff and b.toInt())
                    if (hex.length == 1) hexString.append('0')
                    hexString.append(hex)
                }

                promise.resolve(hexString.toString().lowercase())
            } catch (e: Exception) {
                promise.reject("HASH_ERROR", e.message, e)
            }
        }.start()
    }

    @ReactMethod
    fun getAppVersion(promise: Promise) {
        try {
            val pInfo = reactContext.packageManager.getPackageInfo(reactContext.packageName, 0)
            val versionCode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                pInfo.longVersionCode.toInt()
            } else {
                @Suppress("DEPRECATION")
                pInfo.versionCode
            }

            val map = Arguments.createMap().apply {
                putInt("versionCode", versionCode)
                putString("versionName", pInfo.versionName ?: "1.0.0")
            }

            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("VERSION_ERROR", e.message, e)
        }
    }
}
