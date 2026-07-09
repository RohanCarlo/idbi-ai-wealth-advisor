# AI Wealth Advisor (Avatar-Based)

## Hackathon Project Documentation

# Project Overview

## Vision

Build an AI-powered Digital Wealth Advisor that integrates into a banking application and provides personalized financial guidance through an intelligent conversational avatar.

The advisor should analyze customer spending behavior, income patterns, savings habits, financial goals, and investment preferences to deliver real-time, personalized recommendations.

Unlike a traditional chatbot, the system should behave like a professional financial advisor capable of understanding the user's financial situation and proactively suggesting improvements.

---

# Problem Statement

Current banking applications primarily display account balances and transaction history but fail to provide meaningful financial guidance.

Customers often struggle with:

* Understanding where their money goes
* Planning savings
* Managing expenses
* Selecting suitable investment options
* Achieving financial goals
* Building long-term wealth

This project solves that problem by introducing an AI-powered advisor capable of continuous financial analysis and personalized recommendations.

---

# Project Objectives

The application should:

* Analyze transaction history
* Understand spending behavior
* Track savings
* Calculate financial health
* Recommend investments
* Assist in goal planning
* Provide conversational financial advice
* Generate proactive financial insights
* Deliver recommendations through an AI Avatar

---

# Core Features

## 1. AI Financial Advisor

A conversational AI assistant that communicates naturally with the user.

Capabilities:

* Text conversation
* Voice support (future enhancement)
* Personalized financial advice
* Financial question answering
* Context-aware conversations
* Session memory

Example:

User:

> Can I afford a vacation next month?

AI:

> Based on your average monthly expenses, upcoming bills, and current savings, taking a ₹30,000 vacation next month would reduce your emergency fund below the recommended level. Consider postponing by one month or reducing the budget to ₹20,000.

---

## 2. Spending Analytics

Analyze all financial transactions.

Provide:

* Expense categorization
* Monthly spending trends
* Weekly reports
* Merchant analysis
* Overspending detection
* Budget comparison

---

## 3. Financial Health Score

Generate an overall financial wellness score.

Factors:

* Savings Rate
* Income Stability
* Emergency Fund
* Investment Diversity
* Debt Ratio
* Spending Discipline

Output:

Health Score (0–100)

Along with detailed explanations and improvement suggestions.

---

## 4. Goal Planning

Users can create financial goals.

Examples:

* Buy a Car
* Buy a House
* Vacation
* Higher Education
* Retirement

The AI should calculate:

* Required monthly savings
* Time to achieve goal
* Goal feasibility
* Suggested investment plan

---

## 5. Investment Recommendation

Recommend investments based on:

* Risk Profile
* Income
* Monthly Savings
* Existing Investments
* Financial Goals

Possible recommendations:

* SIP
* Mutual Funds
* Fixed Deposits
* Emergency Fund
* Bonds
* Index Funds

---

## 6. Smart Financial Insights

Generate AI-powered insights.

Examples:

"You spent 27% more on food this month."

"You saved ₹8,000 more than last month."

"You can comfortably invest ₹10,000 monthly."

"You may qualify for a home loan in approximately 18 months."

---

## 7. Notifications

Generate intelligent alerts.

Examples:

* Salary Credited
* Investment Reminder
* Overspending Alert
* Budget Limit Warning
* Savings Milestone
* Goal Achievement Progress

---

# High-Level Architecture

```
                Next.js Frontend

                       │

        REST APIs / WebSocket

                       │

             Spring Boot Backend

       Business Logic + Security

          │                 │

 PostgreSQL             Redis Cache

          │

     AI Processing Layer

          │

      Python FastAPI Service

          │

       LLM Provider

(Gemini / Groq / OpenRouter)
```

---

# Technology Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Shadcn UI
* React Query
* Chart.js / Recharts
* Framer Motion

---

## Backend

* Spring Boot
* Java 21
* Spring Security
* Spring Data JPA
* JWT Authentication
* Maven
* Swagger/OpenAPI

---

## Database

PostgreSQL

Primary persistent storage.

Stores:

* Users
* Accounts
* Transactions
* Goals
* Recommendations
* Chat History
* Financial Scores

---

## Cache

Redis

Stores:

* User Sessions
* Conversation Context
* Temporary Analytics
* AI Cache

---

## AI Service

Python FastAPI

Responsibilities:

* Financial scoring
* Recommendation generation
* Prompt building
* LLM orchestration
* AI analytics

---

## LLM

Preferred order:

1. Gemini Flash
2. Groq
3. OpenRouter

The LLM should never communicate directly with the frontend.

All requests must pass through the backend.

---

# System Modules

## Authentication

Responsibilities

* Login
* Registration
* JWT
* Refresh Token
* User Profile

---

## Transaction Module

Responsibilities

* Transaction CRUD
* Categorization
* Import Transactions
* Balance Calculation

---

## Analytics Module

Responsibilities

* Spending Analysis
* Monthly Reports
* Trends
* Category Insights

---

## Recommendation Module

Responsibilities

* Budget Recommendations
* Investment Suggestions
* Goal Recommendations
* Savings Advice

---

## AI Module

Responsibilities

* Chat
* Context Management
* Prompt Engineering
* Personalized Advice

---

## Notification Module

Responsibilities

* Push Notifications
* Financial Alerts
* Goal Updates

---

# Suggested Database Tables

* users
* accounts
* transactions
* categories
* goals
* investments
* financial_health_scores
* recommendations
* chat_messages
* notifications
* risk_profiles

---

# Backend Folder Structure

```
src/main/java

config/

controller/

service/

repository/

entity/

dto/

mapper/

security/

exception/

utils/

scheduler/
```

Business logic must remain inside the service layer.

Controllers should only validate requests and delegate processing.

---

# Frontend Folder Structure

```
src/

app/

components/

features/

hooks/

services/

contexts/

types/

utils/

styles/
```

Organize components by feature rather than by UI type.

---

# AI Service Folder Structure

```
app/

routers/

services/

models/

prompts/

agents/

utils/

config/
```

Prompt templates should be stored separately from business logic.

---

# Recommended API Endpoints

Authentication

```
POST /auth/register

POST /auth/login

POST /auth/refresh
```

Transactions

```
GET /transactions

POST /transactions

PUT /transactions/{id}

DELETE /transactions/{id}
```

Analytics

```
GET /analytics

GET /financial-score
```

Goals

```
GET /goals

POST /goals

PUT /goals/{id}
```

AI

```
POST /chat

GET /recommendations

GET /insights
```

Notifications

```
GET /notifications
```

---

# AI Processing Flow

```
User Request

↓

Load User Profile

↓

Load Financial Data

↓

Load Goals

↓

Load Financial Health Score

↓

Load Recent Transactions

↓

Build Prompt

↓

LLM

↓

Validate Response

↓

Return Recommendation

↓

Persist Chat History
```

---

# Coding Standards

## Backend

* Follow Clean Architecture principles.
* Keep controllers thin.
* Place business logic in services.
* Use DTOs for API contracts.
* Never expose entities directly.
* Use constructor-based dependency injection.
* Handle exceptions globally.

---

## Frontend

* Feature-based folder structure.
* Reusable UI components.
* Server state managed with React Query.
* Strict TypeScript usage.
* Responsive-first design.

---

## AI

* Keep prompts versioned.
* Separate prompt templates from orchestration.
* Cache repeated AI computations.
* Include structured financial context in every request.
* Never expose system prompts to the client.

---

# Security

* JWT Authentication
* BCrypt password hashing
* HTTPS
* Input validation
* Prompt injection protection
* Rate limiting
* Audit logging

---

# Deployment Strategy

## Frontend

Platform:

Vercel (Free)

---

## Backend

Platform:

Render (Free) or Koyeb Free Tier

Containerized using Docker.

---

## AI Service

Platform:

Railway or Render Free Tier

---

## PostgreSQL

Neon Free

or

Supabase Free

---

## Redis

Upstash Redis

Free Tier

---

## CI/CD

GitHub Actions

Workflow:

* Lint
* Test
* Build
* Docker Image
* Deploy

---

# Docker Strategy

Development environment:

```
docker-compose up
```

Services:

* frontend
* backend
* ai-service
* postgres
* redis

Production should use managed PostgreSQL and Redis services to minimize operational complexity.

---

# Development Phases

## Phase 1

* Project setup
* Authentication
* Database schema
* Docker environment

---

## Phase 2

* Transactions
* Analytics
* Dashboard
* Financial Score

---

## Phase 3

* AI Chat
* Recommendation Engine
* Goal Planning

---

## Phase 4

* Avatar Integration
* Notifications
* Deployment
* Demo Preparation

---

# Future Enhancements

* Voice Assistant
* Multilingual Support
* OCR for bank statements
* Live bank API integration
* Predictive cash flow forecasting
* Investment portfolio optimization
* Fraud detection
* Family finance management
* Personalized financial education

---

# Success Criteria

The project should demonstrate:

* Personalized AI-powered financial guidance.
* Real-time spending analytics.
* Financial health scoring.
* Goal-based financial planning.
* Conversational AI experience.
* Scalable, modular architecture.
* Production-quality code organization.
* Cloud-native deployment using low-cost or free infrastructure.

The final hackathon deliverable should feel like a next-generation banking assistant rather than a traditional banking dashboard, showcasing a seamless combination of analytics, conversational AI, and personalized financial intelligence.
