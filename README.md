# AI Wealth Advisor — IDBI Bank Hackathon

An AI-powered digital wealth advisor that analyzes a customer's spending, income, savings, and goals to deliver personalized, conversational financial guidance — presented through an animated AI avatar ("Arya").

## Live Demo

| | |
|---|---|
| **App** | https://idbi-wealth-advisor.vercel.app |
| **Login** | `rahul@demo.com` / `demo123` |
| **Backend API** | https://backend-production-1f50c.up.railway.app/api |
| **AI service** | https://ai-service-production-358f.up.railway.app |

## Features

- **AI Financial Advisor (Arya)** — conversational chat with context-aware, personalized financial advice
- **Spending Analytics** — expense categorization, monthly trends, income vs. expense breakdown
- **Financial Health Score** — 0–100 composite score (savings rate, emergency fund, debt ratio, investment diversity)
- **Goal Planning** — set goals (car, house, vacation, retirement) with feasibility and required-savings calculations
- **Investment Recommendations** — SIP/ELSS/PPF/NPS/Index Fund suggestions based on risk profile, income, and goals
- **Smart Notifications** — proactive alerts (overspending, savings milestones, low emergency fund)

## Architecture

```
Next.js Frontend  →  Spring Boot Backend  →  PostgreSQL, Redis
                              │
                              └──→  Python FastAPI (AI Service)  →  LLM (flatkey.ai / Groq)
```

The LLM is only ever called from the AI service, which the backend proxies to — the frontend never talks to it directly.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts, React Query
- **Backend**: Spring Boot 3.2 (Java 21), Spring Security + JWT, Spring Data JPA, Flyway
- **AI Service**: Python FastAPI, OpenAI-compatible client
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Deployment**: Vercel (frontend) · Railway (backend + AI service, Docker) · Neon (Postgres) · Upstash (Redis) — all free tier

## Running Locally

Requires Docker and Docker Compose.

```bash
cp .env.example .env
# fill in LLM_API_KEY (and optionally GROQ_API_KEY) in .env
docker compose up -d --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8080/api |
| AI service | http://localhost:8000 |

Login with the same demo credentials: `rahul@demo.com` / `demo123`.

> If ports 5432/6379/8080/3000/8000 are already in use by other local services, adjust the host-side port mappings in `docker-compose.yml` (only the host side — internal container-to-container networking is unaffected).

## Deploying Your Own Copy

1. **Postgres** — create a free project on [Neon](https://neon.tech); use the pooled connection string.
2. **Redis** — create a free database on [Upstash](https://upstash.com); requires TLS (`rediss://`).
3. **Backend + AI service** — deploy `backend/` and `ai-service/` as separate services on [Railway](https://railway.app) (each has its own Dockerfile). Set env vars per `.env.example`, plus `SPRING_DATA_REDIS_SSL=true` for the backend since Upstash requires TLS.
4. **Frontend** — deploy `frontend/` to [Vercel](https://vercel.com), setting `NEXT_PUBLIC_API_URL` to the deployed backend's `/api` URL (this is baked in at build time, so set it before the first build).
5. Update the backend's `CORS_ORIGINS` to the deployed frontend URL once you have it.

## Project Structure

```
backend/       Spring Boot API (controller → service → repository → entity)
ai-service/    FastAPI AI orchestration layer (routers → services → prompts)
frontend/      Next.js app (app router, feature-based components)
```
