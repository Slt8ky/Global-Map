# Project Documentation 📄

## 📝 Project Overview
A cross-platform real-time location sharing application built for Web and Android. Users log in via Google OAuth, share live GPS coordinates, and view all online participants as interactive markers synced instantly across every connected device.

## 📸 Project Screenshots
![alt text](<Screenshot 2026-06-03 052044-1.png>)

## 🛠️ Technology Stack
- Frontend: **Next.js**, **React**, **TypeScript**
- Mobile Bridge: **CapacitorJS** (Web → Android 📱)
- Auth & Realtime DB: **Supabase** (Google OAuth + realtime subscription ⚡)
- Map: **GPS** + Map SDK 🗺️
- Package Manager: **pnpm**

## ✨ Core Features
- Cross-platform: **✅ Web** + **✅ Android APK**
- **Real-time** user **GPS location sync** & **dynamic map markers 📍**
- **Google OAuth login 🔐** for **web** & **Android** via `app://` deep link
- **Auto update marker position** immediately on location change

## 🤝 Client Interaction
- Tap/click map markers to view user details and center map 🎯
- Location data synced instantly across all connected clients via **Supabase Realtime**

## 📋 Development Workflow
1. Initialize **Next.js** + **Supabase project**
2. Implement **GPS positioning logic** (Web Native API / Capacitor Native for Android)
3. Build **realtime location broadcast** & **marker rendering engine**
4. Integrate **Capacitor** and **configure Android deep link scheme**
5. Test routing & cross-platform OAuth redirect flow

## 📚 Key Learnings
- Next.js Client Component rules to avoid **infinite render / static rendering bugs**
- Capacitor Android configuration & custom `intent-filter` deep link setup
- Supabase OAuth + realtime event-driven architecture ⚙️
- Scheme conflict fix: `app://`(Android deep link) vs `http://`(Web routing) during router push navigation

## 🚧 Existing Issues & Improvements Plan
### Current gaps ❌
- No dedicated **sign-out** function after login
- User name / location visibility not configurable

### Future improvements 🚀
- Add complete **login / sign-out page**
- Add privacy toggle: hide/show username & GPS location 👀
- Optimize marker update logic to cut down redundant component re-renders

## ⚙️ Project Startup Guide
### 1. Environment setup
`pnpm i`
`cp .env.example .env.local`
Fill all required secret keys inside .env.local

### 2. Run Web Dev Mode 💻
`pnpm dev`

### 3. Build for Web Production 🌐
`pnpm i`
Prepare SSL cert (cert + key file)
Comment export output in project config
`pnpm build`
`pnpm start`

### 4. Build Android APK 📱
`pnpm i`  
Configure .env.local  
Enable export output in config  
`pnpm build`  
`pnpm cap add android`  
`pnpm cap sync`  

Add below intent-filter into AndroidManifest.xml activity tag:
```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW"/>
    <category android:name="android.intent.category.DEFAULT"/>
    <category android:name="android.intent.category.BROWSABLE"/>
    <data android:scheme="app"/>
</intent-filter>
```

`pnpm cap open android`  
Build final APK inside Android Studio

### 5. Install APK
Install app.apk on Android device and launch!

> [!TIP]
> Click any map marker to auto-center and auto-position the map view onto selected user location 🎯

> [!NOTE]
> To reset authentication state when encountering login abnormal issues:
> - Web: Clear browser cookies & site local storage then reload page
> - Android APK: Clear app storage from device system settings and restart application