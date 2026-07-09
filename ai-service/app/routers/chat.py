import uuid
from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatRequest, ChatResponse
from app.services.llm_service import llm_service
from app.prompts.financial_advisor import SYSTEM_PROMPT, build_chat_prompt

router = APIRouter()


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        context = build_chat_prompt(
            user_context=request.user_context.model_dump(),
            conversation_history=[m.model_dump() for m in request.conversation_history],
            user_message=request.message,
        )

        response_text = await llm_service.generate(
            system_prompt=SYSTEM_PROMPT,
            context=context,
            messages=[m.model_dump() for m in request.conversation_history],
            user_message=request.message,
        )

        session_id = request.session_id or str(uuid.uuid4())
        return ChatResponse(response=response_text, session_id=session_id)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
