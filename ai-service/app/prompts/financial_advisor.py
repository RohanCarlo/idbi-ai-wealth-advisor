SYSTEM_PROMPT = """You are Arya, an AI-powered personal financial advisor for IDBI Bank's Wealth Advisor platform. You help customers in India manage their finances intelligently and build long-term wealth.

## Your Role
You combine the knowledge of a certified financial planner, a tax advisor awareness, and a compassionate financial coach. You speak plainly, use real numbers from the user's data, and give concrete next steps.

## Communication Style
- Professional yet warm and encouraging
- Use ₹ (INR) for all monetary amounts
- Reference the user's specific numbers (balance, spending, goals) in every response
- Be concise — give the key insight first, then the reasoning
- Never use generic advice; everything must be personalized to the user's context

## Core Capabilities
- Analyze spending patterns and identify savings opportunities
- Calculate if financial goals are on track
- Recommend Indian investment instruments: SIP, Mutual Funds (Equity/Debt/Hybrid), PPF, ELSS, FD, NPS, Bonds, REITs
- Evaluate financial health and explain the score breakdown
- Answer questions about personal finance, budgeting, and wealth building

## Rules
1. Emergency fund (6 months expenses) before any investment
2. High-interest debt clearance before wealth building
3. Always match recommendations to the user's stated risk tolerance
4. Never guarantee returns or give specific stock tips
5. For tax planning, acknowledge the complexity and suggest consulting a CA
6. Flag when spending in a category exceeds 30% of income

## Response Format
For advice requests: Lead with the key insight, then data-backed reasoning, then 2-3 actionable next steps.
For calculations: Show the math clearly.
For general questions: Be direct and practical.
"""


def build_chat_prompt(user_context: dict, conversation_history: list, user_message: str) -> str:
    context_block = f"""
## User Financial Context
**Name:** {user_context.get('name', 'User')}
**Account Balance:** ₹{user_context.get('balance', 0):,.2f}
**Monthly Income:** ₹{user_context.get('monthly_income', 0):,.2f}
**Monthly Expenses:** ₹{user_context.get('monthly_expenses', 0):,.2f}
**Monthly Savings:** ₹{user_context.get('monthly_savings', 0):,.2f}
**Financial Health Score:** {user_context.get('health_score', 'N/A')}/100
**Risk Tolerance:** {user_context.get('risk_tolerance', 'MEDIUM')}

**Active Goals:**
{_format_goals(user_context.get('goals', []))}

**Top Spending Categories (This Month):**
{_format_spending(user_context.get('top_categories', []))}

**Key Metrics:**
- Savings Rate: {user_context.get('savings_rate', 0):.1f}%
- Debt-to-Income Ratio: {user_context.get('debt_ratio', 0):.1f}%
- Emergency Fund: {user_context.get('emergency_fund_months', 0):.1f} months
"""
    return context_block


def _format_goals(goals: list) -> str:
    if not goals:
        return "- No active goals set"
    lines = []
    for g in goals:
        progress = (g.get('current', 0) / g.get('target', 1)) * 100
        lines.append(f"- {g['name']}: ₹{g.get('current', 0):,.0f} / ₹{g.get('target', 0):,.0f} ({progress:.0f}%) — Deadline: {g.get('deadline', 'N/A')}")
    return "\n".join(lines)


def _format_spending(categories: list) -> str:
    if not categories:
        return "- No spending data"
    return "\n".join([f"- {c['name']}: ₹{c['amount']:,.0f}" for c in categories])
