# 📱 Bhasha Setu — Mobile App (Expo Native)

100% Offline-First Mother-Tongue-Based Multilingual Education (MTB-MLE) Edge AI Suite for Android tablets and smartphones, powered by **Expo SDK 52** and **SQLite (`expo-sqlite`)**.

---

## 🚀 How to Run the Mobile App

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Start the Expo Development Server
```bash
npm start
# or
npx expo start -c
```

### 3. Open on Your Device
- **On Android / iOS:** Install the **Expo Go** app from Google Play Store or Apple App Store.
- Scan the QR code shown in the terminal.
- **On Android Emulator:** Press `a` in the terminal.
- **On iOS Simulator:** Press `i` in the terminal.

---

## 📦 How to Build Standalone Android APK (`.apk`)

To generate an installable standalone Android `.apk` file for testing on school tablets without Expo Go:

### 1. Install EAS CLI (if not already installed)
```bash
npm install -g eas-cli
```

### 2. Log in to your Expo account
```bash
eas login
```

### 3. Build Standalone APK
```bash
cd mobile
eas build -p android --profile preview
```
- EAS will build the APK in the cloud using the pre-configured [`eas.json`](./eas.json) and [`.easignore`](./easignore).
- Once finished, you will receive a direct download link for the `.apk` file ready to install on any Android phone or tablet.

### 4. Build Production Google Play Bundle (`.aab`)
```bash
eas build -p android --profile production
```

