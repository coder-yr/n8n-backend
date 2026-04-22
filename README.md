# AI Viral Content Engine

Production-ready SaaS starter that discovers viral content patterns, generates AI-powered content, schedules daily generation, tracks analytics, and improves prompts using feedback loops.

## Stack

- Backend: Node.js, Express, Supabase (Postgres), BullMQ, Redis, node-cron, Groq API
- Frontend: Next.js App Router, Tailwind CSS, Axios, React Query, Recharts
- Auth: JWT

## Project Structure

```text
backend/
  src/
    controllers/
    routes/
    services/
    models/
    queues/
    workers/
    utils/
    config/
    middlewares/
    validators/
frontend/
  app/
  components/
  lib/
```

## Features Implemented

- JWT signup/login with user-specific data isolation
- Modular content engine:
  - fetchPosts
  - normalizeData
  - viralScoring
  - selectTopContent
  - AI insights and generation (Groq)
- Queue system via BullMQ (`content-engine`) with jobs:
  - `runPipeline`
  - `generateContent`
- Dedicated worker process for queued jobs
- Scheduler (`node-cron`) for daily auto-generation at user-selected time
- Models: User, Content, Schedule
- API routes:
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `POST /api/content/run`
  - `GET /api/content/history`
  - `GET /api/content/export.csv`
  - `POST /api/schedule`
  - `GET /api/schedule`
  - `POST /api/analytics/update`
  - `GET /api/analytics`
  - `GET /api/status`
- Feedback loop: top-performing content is injected into generation prompts
- Plan limits:
  - Free: 5 generations/day
  - Pro: unlimited
- Security:
  - dotenv
  - request validation (zod)
  - rate limiting
  - centralized error middleware
- Frontend pages:
  - `/login`
  - `/signup`
  - `/dashboard`
- Dashboard actions:
  - Run content engine
  - Copy generated content
  - Download history as CSV
  - Schedule daily generation
  - View analytics chart

## Local Setup

## 1) Start dependencies

- Supabase project configured with required tables
- Redis running locally

## 2) Backend setup

```bash
cd backend
npm install
npm run dev
```

Required backend `.env` values:

```bash
PORT=5000
SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=replace-with-strong-secret
REDIS_URL=redis://localhost:6379
GROQ_API_KEY=your-groq-key
GROQ_MODEL=llama-3.1-8b-instant
USE_SYNC_PIPELINE=true
```

Optional worker in another terminal:

```bash
cd backend
npm run worker
```

## 3) Frontend setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Frontend: `http://localhost:3000`
Backend: `http://localhost:5000`

## Queue + Pipeline Notes

- For full async production behavior (recommended):
  - keep `USE_SYNC_PIPELINE=false`
  - run API and worker separately
  - ensure Redis is running
- For quick local testing without worker:
  - set `USE_SYNC_PIPELINE=true`

## Deployment

- Backend: Render or Railway
  - Add Supabase credentials, Redis, and env vars
  - Run two services/processes:
    - `npm start` (API)
    - `npm run worker` (queue worker)
- Frontend: Vercel
  - Set `NEXT_PUBLIC_API_URL` to backend URL

## Bonus Extension Hooks

This starter already includes CSV export and content copy workflows. You can extend it with:

- PDF export endpoint/component
- notifications (email/slack/webhook)
- dark/light theme toggle
