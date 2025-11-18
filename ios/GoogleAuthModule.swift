//
//  GoogleAuthModule.swift
//  thewoowonGoogleRN
//
//  Created by thewoowon
//  Copyright © 2024. All rights reserved.
//

import Foundation
import AuthenticationServices
import React

@objc(GoogleAuthModule)
class GoogleAuthModule: RCTEventEmitter {

    private var authSession: ASWebAuthenticationSession?
    private var clientId: String?
    private var redirectUri: String?
    private var scopes: [String] = ["openid", "profile", "email"]

    // MARK: - Helper Methods

    /// Extract the client ID number from full format or return as-is if already in short format
    /// - Parameter clientId: Full format (xxx.apps.googleusercontent.com) or short format (xxx)
    /// - Returns: Short format client ID (xxx)
    private func extractClientIdNumber(_ clientId: String) -> String {
        return clientId.replacingOccurrences(of: ".apps.googleusercontent.com", with: "")
    }

    // MARK: - Configuration
    
    @objc
    func configure(_ config: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let clientId = config["clientId"] as? String else {
            reject("CONFIG_ERROR", "clientId is required", nil)
            return
        }

        // Extract client ID number (handles both full and short formats)
        let clientIdNumber = extractClientIdNumber(clientId)
        self.clientId = clientId
        self.redirectUri = config["redirectUri"] as? String ?? "com.googleusercontent.apps.\(clientIdNumber):/oauth2callback"

        if let scopesArray = config["scopes"] as? [String] {
            self.scopes = scopesArray
        }

        resolve(["success": true])
    }
    
    // MARK: - Sign In
    
    @objc
    func signIn(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let clientId = self.clientId else {
            reject("NOT_CONFIGURED", "Google Auth not configured. Call configure() first.", nil)
            return
        }

        let state = generateRandomString(length: 32)
        let nonce = generateRandomString(length: 32)

        // Extract client ID number for URL scheme
        let clientIdNumber = extractClientIdNumber(clientId)

        // Build authorization URL
        let scope = scopes.joined(separator: " ")
        let redirectUri = self.redirectUri ?? "com.googleusercontent.apps.\(clientIdNumber):/oauth2callback"

        var components = URLComponents(string: "https://accounts.google.com/o/oauth2/v2/auth")!
        components.queryItems = [
            URLQueryItem(name: "client_id", value: clientId),
            URLQueryItem(name: "redirect_uri", value: redirectUri),
            URLQueryItem(name: "response_type", value: "code"),
            URLQueryItem(name: "scope", value: scope),
            URLQueryItem(name: "state", value: state),
            URLQueryItem(name: "nonce", value: nonce),
            URLQueryItem(name: "access_type", value: "offline"),
            URLQueryItem(name: "prompt", value: "consent")
        ]

        guard let authURL = components.url else {
            reject("URL_ERROR", "Failed to create authorization URL", nil)
            return
        }

        DispatchQueue.main.async {
            self.authSession = ASWebAuthenticationSession(
                url: authURL,
                callbackURLScheme: "com.googleusercontent.apps.\(clientIdNumber)"
            ) { [weak self] callbackURL, error in
                guard let self = self else { return }
                
                if let error = error {
                    if (error as NSError).code == ASWebAuthenticationSessionError.canceledLogin.rawValue {
                        reject("CANCELLED", "User cancelled the login", nil)
                    } else {
                        reject("AUTH_ERROR", error.localizedDescription, error)
                    }
                    return
                }
                
                guard let callbackURL = callbackURL else {
                    reject("NO_CALLBACK", "No callback URL received", nil)
                    return
                }
                
                self.handleCallback(callbackURL: callbackURL, state: state, resolve: resolve, reject: reject)
            }
            
            self.authSession?.presentationContextProvider = self
            self.authSession?.prefersEphemeralWebBrowserSession = false
            self.authSession?.start()
        }
    }
    
    // MARK: - Sign Out
    
    @objc
    func signOut(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        // Clear any stored credentials
        // For web-based OAuth, we just acknowledge the sign out
        resolve(["success": true])
    }
    
    // MARK: - Get Current User
    
    @objc
    func getCurrentUser(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        // This would require storing user info locally
        // For now, return null - the JS layer handles this with TokenManager
        resolve(NSNull())
    }
    
    // MARK: - Private Helpers
    
    private func handleCallback(callbackURL: URL, state: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard let components = URLComponents(url: callbackURL, resolvingAgainstBaseURL: false),
              let queryItems = components.queryItems else {
            reject("PARSE_ERROR", "Failed to parse callback URL", nil)
            return
        }
        
        var params: [String: String] = [:]
        for item in queryItems {
            if let value = item.value {
                params[item.name] = value
            }
        }
        
        // Verify state
        guard let returnedState = params["state"], returnedState == state else {
            reject("STATE_MISMATCH", "State parameter mismatch", nil)
            return
        }
        
        // Get authorization code
        guard let code = params["code"] else {
            if let error = params["error"] {
                reject("AUTH_ERROR", error, nil)
            } else {
                reject("NO_CODE", "No authorization code received", nil)
            }
            return
        }
        
        // Exchange code for tokens
        exchangeCodeForTokens(code: code, resolve: resolve, reject: reject)
    }
    
    private func exchangeCodeForTokens(code: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard let clientId = self.clientId else {
            reject("NOT_CONFIGURED", "Client ID not configured", nil)
            return
        }

        // Extract client ID number for redirect URI
        let clientIdNumber = extractClientIdNumber(clientId)
        let redirectUri = self.redirectUri ?? "com.googleusercontent.apps.\(clientIdNumber):/oauth2callback"
        
        var request = URLRequest(url: URL(string: "https://oauth2.googleapis.com/token")!)
        request.httpMethod = "POST"
        request.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")
        
        let body = [
            "code": code,
            "client_id": clientId,
            "redirect_uri": redirectUri,
            "grant_type": "authorization_code"
        ]
        
        request.httpBody = body.percentEncoded()
        
        let task = URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
            if let error = error {
                reject("NETWORK_ERROR", error.localizedDescription, error)
                return
            }
            
            guard let data = data else {
                reject("NO_DATA", "No data received", nil)
                return
            }
            
            do {
                if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] {
                    if let errorMsg = json["error"] as? String {
                        reject("TOKEN_ERROR", errorMsg, nil)
                        return
                    }
                    
                    self?.getUserInfo(tokenResponse: json, resolve: resolve, reject: reject)
                }
            } catch {
                reject("PARSE_ERROR", "Failed to parse token response", error)
            }
        }
        
        task.resume()
    }
    
    private func getUserInfo(tokenResponse: [String: Any], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard let accessToken = tokenResponse["access_token"] as? String else {
            reject("NO_ACCESS_TOKEN", "No access token in response", nil)
            return
        }
        
        var request = URLRequest(url: URL(string: "https://www.googleapis.com/oauth2/v2/userinfo")!)
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        
        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                reject("USERINFO_ERROR", error.localizedDescription, error)
                return
            }
            
            guard let data = data else {
                reject("NO_DATA", "No user info data received", nil)
                return
            }
            
            do {
                if let userInfo = try JSONSerialization.jsonObject(with: data) as? [String: Any] {
                    let result: [String: Any] = [
                        "accessToken": tokenResponse["access_token"] ?? "",
                        "refreshToken": tokenResponse["refresh_token"] ?? "",
                        "expiresIn": tokenResponse["expires_in"] ?? 3600,
                        "idToken": tokenResponse["id_token"] ?? "",
                        "tokenType": tokenResponse["token_type"] ?? "Bearer",
                        "user": [
                            "id": userInfo["id"] ?? "",
                            "email": userInfo["email"] ?? "",
                            "emailVerified": userInfo["verified_email"] ?? false,
                            "name": userInfo["name"] ?? "",
                            "givenName": userInfo["given_name"] ?? "",
                            "familyName": userInfo["family_name"] ?? "",
                            "photoUrl": userInfo["picture"] ?? "",
                            "locale": userInfo["locale"] ?? ""
                        ]
                    ]
                    
                    resolve(result)
                }
            } catch {
                reject("PARSE_ERROR", "Failed to parse user info", error)
            }
        }
        
        task.resume()
    }
    
    private func generateRandomString(length: Int) -> String {
        let letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        return String((0..<length).map{ _ in letters.randomElement()! })
    }
    
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    @objc
    override func supportedEvents() -> [String]! {
        return []
    }
}

// MARK: - ASWebAuthenticationPresentationContextProviding

extension GoogleAuthModule: ASWebAuthenticationPresentationContextProviding {
    func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        return UIApplication.shared.windows.first { $0.isKeyWindow } ?? ASPresentationAnchor()
    }
}

// MARK: - Dictionary Extension

extension Dictionary {
    func percentEncoded() -> Data? {
        return map { key, value in
            let escapedKey = "\(key)".addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
            let escapedValue = "\(value)".addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
            return "\(escapedKey)=\(escapedValue)"
        }
        .joined(separator: "&")
        .data(using: .utf8)
    }
}
