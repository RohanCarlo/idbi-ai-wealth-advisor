from pydantic import BaseModel
from typing import Optional


class GoalContext(BaseModel):
    name: str
    current: float
    target: float
    deadline: str


class CategorySpend(BaseModel):
    name: str
    amount: float


class UserFinancialContext(BaseModel):
    name: str
    balance: float
    monthly_income: float
    monthly_expenses: float
    monthly_savings: float
    health_score: Optional[int] = None
    risk_tolerance: str = "MEDIUM"
    savings_rate: float = 0.0
    debt_ratio: float = 0.0
    emergency_fund_months: float = 0.0
    goals: list[GoalContext] = []
    top_categories: list[CategorySpend] = []


class ChatMessage(BaseModel):
    role: str  # USER or ASSISTANT
    content: str


class ChatRequest(BaseModel):
    user_context: UserFinancialContext
    conversation_history: list[ChatMessage] = []
    message: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    session_id: str


class InsightResponse(BaseModel):
    insights: list[str]


class RecommendationResponse(BaseModel):
    recommendations: list[dict]
