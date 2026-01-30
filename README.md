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
