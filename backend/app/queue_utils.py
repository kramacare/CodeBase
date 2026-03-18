from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from datetime import datetime, date
from app.database.models import TodayToken, HistoryToken, TokenStatus
from typing import Optional

async def ensure_daily_reset(db: AsyncSession, clinic_id: str):
    """
    Ensure today_tokens only contains today's data for a specific clinic.
    Move old data to history if needed.
    """
    today = date.today()
    
    # Check if there are any old tokens for this clinic (not today)
    old_tokens_query = select(TodayToken).where(
        (TodayToken.clinic_id == clinic_id) &
        (func.date(TodayToken.date) < today)
    )
    old_tokens = await db.execute(old_tokens_query)
    old_tokens_list = old_tokens.scalars().all()
    
    # Move old tokens to history
    for token in old_tokens_list:
        history_token = HistoryToken(
            clinic_id=token.clinic_id,
            patient_name=token.patient_name,
            patient_number=token.patient_number,
            token_number=token.token_number,
            date=token.date,
            completed_at=datetime.now()
        )
        db.add(history_token)
    
    # Delete old tokens from today_tokens
    if old_tokens_list:
        await db.execute(
            delete(TodayToken).where(
                (TodayToken.clinic_id == clinic_id) &
                (func.date(TodayToken.date) < today)
            )
        )
    
    await db.commit()

async def get_next_token_number(db: AsyncSession, clinic_id: str) -> int:
    """
    Get the next token number for today for a specific clinic.
    """
    today = date.today()
    
    # Get the highest token number for today for this clinic
    result = await db.execute(
        select(func.coalesce(func.max(TodayToken.token_number), 0))
        .where(
            (TodayToken.clinic_id == clinic_id) &
            (func.date(TodayToken.date) == today)
        )
    )
    
    max_token = result.scalar()
    return (max_token or 0) + 1

async def get_current_serving_token(db: AsyncSession, clinic_id: str) -> Optional[TodayToken]:
    """
    Get the currently serving token for a clinic.
    """
    result = await db.execute(
        select(TodayToken)
        .where(
            (TodayToken.clinic_id == clinic_id) &
            (TodayToken.status == TokenStatus.SERVING)
        )
        .order_by(TodayToken.token_number.desc())
    )
    return result.scalar_one_or_none()

async def get_next_waiting_token(db: AsyncSession, clinic_id: str) -> Optional[TodayToken]:
    """
    Get the next waiting token for a clinic.
    """
    result = await db.execute(
        select(TodayToken)
        .where(
            (TodayToken.clinic_id == clinic_id) &
            (TodayToken.status == TokenStatus.WAITING)
        )
        .order_by(TodayToken.token_number.asc())
        .limit(1)  # Ensure only one result
    )
    return result.scalar_one_or_none()

async def get_patients_ahead_count(db: AsyncSession, clinic_id: str, current_token: int) -> int:
    """
    Get count of patients waiting before the current token.
    """
    result = await db.execute(
        select(func.count(TodayToken.id))
        .where(
            (TodayToken.clinic_id == clinic_id) &
            (TodayToken.status == TokenStatus.WAITING) &
            (TodayToken.token_number < current_token)
        )
    )
    return result.scalar() or 0

async def get_waiting_patients(db: AsyncSession, clinic_id: str):
    """
    Get all waiting patients for a clinic.
    """
    result = await db.execute(
        select(TodayToken)
        .where(
            (TodayToken.clinic_id == clinic_id) &
            (TodayToken.status == TokenStatus.WAITING)
        )
        .order_by(TodayToken.token_number.asc())
    )
    return result.scalars().all()

async def get_total_patients_today(db: AsyncSession, clinic_id: str) -> int:
    """
    Get total patients for today for a clinic.
    """
    today = date.today()
    result = await db.execute(
        select(func.count(TodayToken.id))
        .where(
            (TodayToken.clinic_id == clinic_id) &
            (func.date(TodayToken.date) == today)
        )
    )
    return result.scalar() or 0
