# Vegas One (`vegasone.games`) - Firebase Push Notifications Setup Guide

This guide walks you through setting up Firebase Cloud Messaging (FCM) for Web, Android APK, and iOS push notifications.

---

## 1. Firebase Console Project Setup
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and name it `Vegas One` (or `vegas-one-casino`).
3. (Optional) Enable Google Analytics and click **Create Project**.

---

## 2. Server-Side Push (Admin Broadcasts)
To allow the Vegas One admin panel to broadcast push notifications:
1. In Firebase Console, go to **Project Settings** (gear icon top left) > **Service accounts**.
2. Select **Node.js** and click **Generate new private key**.
3. A JSON file will download (e.g., `vegas-one-firebase-adminsdk-xxxxx.json`).
4. Rename this file to:
   ```bash
   firebase-service-account.json
   ```
5. Place this file in the root directory of the Vegas One project:
   ```
   /Users/apple/Desktop/vegas_one/firebase-service-account.json
   ```
6. On your Hostinger VPS, ensure this file is placed at the same root directory.

---

## 3. Android App Configuration (`google-services.json`)
For the Android APK:
1. In Firebase Console, click **Add app** and choose the **Android** icon.
2. Enter the Android package name:
   ```
   com.vegasone.app
   ```
3. Enter App nickname: `Vegas One`.
4. Click **Register app**.
5. Download **`google-services.json`**.
6. Place this file in:
   ```
   android/app/google-services.json
   ```

---

## 4. iOS App Configuration (`GoogleService-Info.plist`)
For the iOS app:
1. In Firebase Console, click **Add app** and choose the **Apple (iOS)** icon.
2. Enter iOS bundle ID:
   ```
   com.vegasone.app
   ```
3. Download **`GoogleService-Info.plist`**.
4. Open the iOS project in Xcode (`npm run ios:open`) and drag `GoogleService-Info.plist` into the `App` directory.

---

## 5. Web Browser Push (VAPID Key)
1. In Firebase Console, go to **Project Settings** > **Cloud Messaging** tab.
2. Under **Web configuration**, click **Generate key pair**.
3. Copy the public key (VAPID Key) to your environment if you wish to customize Web Push certificates.

---

## 6. Testing Push Notifications
1. Log into the Vegas One Admin Panel (`/admin`) as Super Admin (`admin@vegasone.games`).
2. Navigate to the **Promo & Push** tab.
3. Enter a title and message (e.g. `⚡ FLASH DROP: 10 Free SC Added!`).
4. Click **Send Push Broadcast**. All registered player devices and browser sessions will receive the notification instantly!
