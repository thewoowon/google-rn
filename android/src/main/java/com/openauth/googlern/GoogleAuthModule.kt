package com.openauth.googlern

import android.net.Uri
import androidx.browser.customtabs.CustomTabsIntent
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.security.SecureRandom
import java.util.*

@ReactModule(name = GoogleAuthModule.NAME)
class GoogleAuthModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var clientId: String? = null
    private var redirectUri: String? = null
    private var scopes: List<String> = listOf("openid", "profile", "email")
    private var pendingPromise: Promise? = null
    private var pendingState: String? = null

    override fun getName(): String = NAME

    /**
     * Extract the client ID number from full format or return as-is if already in short format
     * @param clientId Full format (xxx.apps.googleusercontent.com) or short format (xxx)
     * @return Short format client ID (xxx)
     */
    private fun extractClientIdNumber(clientId: String): String {
        return clientId.replace(".apps.googleusercontent.com", "")
    }

    @ReactMethod
    fun configure(config: ReadableMap, promise: Promise) {
        try {
            clientId = config.getString("clientId")
            if (clientId == null) {
                promise.reject("CONFIG_ERROR", "clientId is required")
                return
            }

            // Extract client ID number (handles both full and short formats)
            val clientIdNumber = extractClientIdNumber(clientId!!)
            redirectUri = if (config.hasKey("redirectUri")) {
                config.getString("redirectUri")
            } else {
                "com.googleusercontent.apps.$clientIdNumber:/oauth2callback"
            }

            if (config.hasKey("scopes")) {
                val scopesArray = config.getArray("scopes")
                scopes = (0 until (scopesArray?.size() ?: 0)).map { 
                    scopesArray?.getString(it) ?: "" 
                }
            }

            promise.resolve(
                Arguments.createMap().apply {
                    putBoolean("success", true)
                }
            )
        } catch (e: Exception) {
            promise.reject("CONFIG_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun signIn(promise: Promise) {
        val localClientId = clientId
        if (localClientId == null) {
            promise.reject("NOT_CONFIGURED", "Google Auth not configured. Call configure() first.")
            return
        }

        pendingPromise = promise
        pendingState = generateRandomString(32)
        val nonce = generateRandomString(32)

        // Extract client ID number for redirect URI
        val clientIdNumber = extractClientIdNumber(localClientId)
        val scope = scopes.joinToString(" ")
        val localRedirectUri = redirectUri ?: "com.googleusercontent.apps.$clientIdNumber:/oauth2callback"

        val authUrl = Uri.parse("https://accounts.google.com/o/oauth2/v2/auth").buildUpon()
            .appendQueryParameter("client_id", localClientId)
            .appendQueryParameter("redirect_uri", localRedirectUri)
            .appendQueryParameter("response_type", "code")
            .appendQueryParameter("scope", scope)
            .appendQueryParameter("state", pendingState)
            .appendQueryParameter("nonce", nonce)
            .appendQueryParameter("access_type", "offline")
            .appendQueryParameter("prompt", "consent")
            .build()

        try {
            val activity = reactApplicationContext.currentActivity
            if (activity == null) {
                promise.reject("NO_ACTIVITY", "No current activity")
                return
            }

            val customTabsIntent = CustomTabsIntent.Builder().build()
            customTabsIntent.launchUrl(activity, authUrl)
        } catch (e: Exception) {
            promise.reject("LAUNCH_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun signOut(promise: Promise) {
        try {
            promise.resolve(
                Arguments.createMap().apply {
                    putBoolean("success", true)
                }
            )
        } catch (e: Exception) {
            promise.reject("SIGNOUT_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun getCurrentUser(promise: Promise) {
        // Return null - JS layer handles this with TokenManager
        promise.resolve(null)
    }

    @ReactMethod
    fun handleOpenURL(url: String, promise: Promise) {
        val uri = Uri.parse(url)
        val state = uri.getQueryParameter("state")
        val code = uri.getQueryParameter("code")
        val error = uri.getQueryParameter("error")

        val currentPromise = pendingPromise
        if (currentPromise == null) {
            promise.reject("NO_PENDING_AUTH", "No pending authentication")
            return
        }

        if (state != pendingState) {
            currentPromise.reject("STATE_MISMATCH", "State parameter mismatch")
            pendingPromise = null
            return
        }

        if (error != null) {
            currentPromise.reject("AUTH_ERROR", error)
            pendingPromise = null
            return
        }

        if (code == null) {
            currentPromise.reject("NO_CODE", "No authorization code received")
            pendingPromise = null
            return
        }

        // Exchange code for tokens
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val result = exchangeCodeForTokens(code)
                withContext(Dispatchers.Main) {
                    currentPromise.resolve(result)
                    pendingPromise = null
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    currentPromise.reject("TOKEN_EXCHANGE_ERROR", e.message, e)
                    pendingPromise = null
                }
            }
        }

        promise.resolve(true)
    }

    private suspend fun exchangeCodeForTokens(code: String): WritableMap {
        val localClientId = clientId ?: throw Exception("Client ID not configured")
        // Extract client ID number for redirect URI
        val clientIdNumber = extractClientIdNumber(localClientId)
        val localRedirectUri = redirectUri ?: "com.googleusercontent.apps.$clientIdNumber:/oauth2callback"

        val url = URL("https://oauth2.googleapis.com/token")
        val connection = url.openConnection() as HttpURLConnection
        
        try {
            connection.requestMethod = "POST"
            connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded")
            connection.doOutput = true

            val postData = "code=$code&client_id=$localClientId&redirect_uri=$localRedirectUri&grant_type=authorization_code"
            
            OutputStreamWriter(connection.outputStream).use { writer ->
                writer.write(postData)
                writer.flush()
            }

            val responseCode = connection.responseCode
            if (responseCode != HttpURLConnection.HTTP_OK) {
                throw Exception("Token exchange failed with code: $responseCode")
            }

            val response = BufferedReader(InputStreamReader(connection.inputStream)).use { reader ->
                reader.readText()
            }

            val jsonResponse = JSONObject(response)
            val accessToken = jsonResponse.getString("access_token")

            // Get user info
            val userInfo = getUserInfo(accessToken)

            return Arguments.createMap().apply {
                putString("accessToken", jsonResponse.optString("access_token", ""))
                putString("refreshToken", jsonResponse.optString("refresh_token", ""))
                putInt("expiresIn", jsonResponse.optInt("expires_in", 3600))
                putString("idToken", jsonResponse.optString("id_token", ""))
                putString("tokenType", jsonResponse.optString("token_type", "Bearer"))
                putMap("user", userInfo)
            }
        } finally {
            connection.disconnect()
        }
    }

    private fun getUserInfo(accessToken: String): WritableMap {
        val url = URL("https://www.googleapis.com/oauth2/v2/userinfo")
        val connection = url.openConnection() as HttpURLConnection
        
        try {
            connection.setRequestProperty("Authorization", "Bearer $accessToken")
            
            val response = BufferedReader(InputStreamReader(connection.inputStream)).use { reader ->
                reader.readText()
            }

            val json = JSONObject(response)

            return Arguments.createMap().apply {
                putString("id", json.optString("id", ""))
                putString("email", json.optString("email", ""))
                putBoolean("emailVerified", json.optBoolean("verified_email", false))
                putString("name", json.optString("name", ""))
                putString("givenName", json.optString("given_name", ""))
                putString("familyName", json.optString("family_name", ""))
                putString("photoUrl", json.optString("picture", ""))
                putString("locale", json.optString("locale", ""))
            }
        } finally {
            connection.disconnect()
        }
    }

    private fun generateRandomString(length: Int): String {
        val random = SecureRandom()
        val bytes = ByteArray(length)
        random.nextBytes(bytes)
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes).substring(0, length)
    }

    companion object {
        const val NAME = "GoogleAuthModule"
    }
}
