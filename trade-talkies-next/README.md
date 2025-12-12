# Trade Talkies (Next.js Monolith)

This is a port of the Trade Talkies MERN stack application to a monolithic Next.js 14+ application.

## Features
- **Unified Architecture**: Frontend and Backend in a single Next.js app.
- **Real-time Chat**: Powered by Socket.io running on a custom Next.js server.
- **Database**: MongoDB via Prisma ORM.
- **Authentication**: Firebase Auth with Next.js Middleware protection.

## Prerequisites
- Node.js 18+
- MongoDB Atlas Cluster
- Firebase Project

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env` and fill in your credentials.
   ```bash
   cp .env.example .env
   ```

3. **Database Setup**
   Generate Prisma client and push schema to DB.
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Access the app at `http://localhost:3000`.

## Deployment (Docker)

Since Vercel Serverless does not support persistent Socket.io connections, this app is designed to be deployed via Docker (e.g., on Railway, Fly.io, or a VPS).

1. **Build Docker Image**
   ```bash
   docker build -t trade-talkies .
   ```

2. **Run Container**
   ```bash
   docker run -p 3000:3000 --env-file .env trade-talkies
   ```

## Project Structure
- `app/`: Next.js App Router pages and API routes.
- `components/`: React components (UI, Features).
- `lib/`: Utilities (DB, Firebase, Socket).
- `prisma/`: Database schema.
- `server.ts`: Custom server entry point for Socket.io.
