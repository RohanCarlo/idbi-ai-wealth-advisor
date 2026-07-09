from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import health, chat, analytics, recommendations

app = FastAPI(
    title="Wealth Advisor AI Service",
    description="AI processing layer for financial analysis and advice",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
app.include_router(recommendations.router, prefix="/recommendations", tags=["Recommendations"])
