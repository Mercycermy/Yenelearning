# Yene Teacher

Yene Teacher is an AI-powered language learning platform designed for Ethiopian children to learn Amharic, Ge'ez, and English through interactive stories, games, and an AI tutor.

## Features

- **Kid-Friendly Interface**: Designed for ages 4-12.
- **AI Tutor**: Interactive voice conversations with AI avatars using local language (Amharic).
- **Gamification**: Earn stars, badges, and track progress.
- **Multi-Language**: Support for Amharic, Ge'ez, and English.
- **Content Management**: Admin dashboard for parents and teachers.

## Project Structure

- `backend/`: NestJS API handling authentication, content, progress tracking, and AI integration.
- `admin-dashboard/`: (Upcoming) Next.js web dashboard for content management.

## Getting Started

### Backend

1.  Navigate to `backend/`
2.  Copy `.env.example` to `.env`
3.  Install dependencies: `npm install`
4.  Start the server: `npm run start:dev`

## Tech Stack

- **Backend**: NestJS, TypeORM, SQLite (Dev) / PostgreSQL (Prod)
- **AI**: Hugging Face Inference API (Mistral, MMS-TTS)
- **Frontend**: (Planned) Next.js, Flutter
### Admin credentials

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env` before starting the API. The password must contain at least 12 characters. No production credential is committed to the repository.
🚀 Step-by-Step Flutter Installation (Windows)
Since the automated download is slow, please follow these steps to install Flutter manually:

Download the SDK:
Go to clinical the Flutter Windows Download page.
Click the Flutter Windows 3.x.x stable.zip button to download the latest stable bundle.
Extract the Zip:
Once downloaded, extract the zip file to a folder like C:\src\flutter.
Warning: Do not install Flutter in a path that contains special characters or spaces (like C:\Program Files).
Update Path Environment Variable:
In the Windows Start menu, type 'env' and select Edit the system environment variables.
Click Environment Variables.
Under User variables, select Path and click Edit.
Click New and add the full path to flutter\bin (e.g., C:\src\flutter\bin).
Click OK on all windows.
Verify Installation:
Open a new terminal (Command Prompt or PowerShell).
Run flutter doctor to check for any missing dependencies.
Run the Mobile App:
In the terminal, navigate to your project: cd c:\Users\zuko\Documents\a\Yenelearning\mobile_app
Run flutter pub get to fetch dependencies.
Run flutter run -d chrome to start the app in your browser.
The Admin Dashboard (port 3000) and Backend (port 3001) are still running in the background for you.
