# Yene Teacher — Mobile App (React Native)

Expo + TypeScript port of the Flutter `mobile_app` (backup kept in `../mobile_app_flutter`).

## Stack

- Expo SDK 57 + Expo Router
- TypeScript
- AsyncStorage (prefs / auth)
- expo-speech (TTS)
- Poppins via `@expo-google-fonts/poppins`

## Run

```bash
cd mobile_app
npm install
npm start
```

Then press `a` for Android, `i` for iOS, or `w` for web.

## Screens (parity with Flutter)

| Route | Screen |
|-------|--------|
| `/` | Auth gate |
| `/login` | Parent sign in |
| `/register` | Parent sign up |
| `/welcome` | Pick buddy + language |
| `/dashboard` | Kid home |
| `/words` | Word lessons |
| `/tutor` | AI tutor chat + TTS |
| `/stories` | Story list |
| `/story-reader` | Story pages |
| `/games` | Games list |
| `/knowledge` | Knowledge grid |
| `/knowledge/[id]` | Knowledge detail |
| `/parent` | Parent gate (clears auth) |
| `/parent-dashboard` | Parent space |

## API

Base URL: `https://yene-backend.onrender.com/api` (same as Flutter).
