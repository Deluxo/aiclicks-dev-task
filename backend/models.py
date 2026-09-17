from pydantic import BaseModel, Field
from typing import Literal, Optional
from datetime import date, datetime


# Request models

class MentionFilters(BaseModel):
    model: Optional[Literal["chatgpt", "claude", "gemini", "perplexity"]] = None
    sentiment: Optional[Literal["positive", "neutral", "negative"]] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None


class MentionsRequest(BaseModel):
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=25, ge=1)
    filters: MentionFilters = MentionFilters()


class TrendsRequest(BaseModel):
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    group_by: str = "day"  # "day" or "week"


# Response models

class Mention(BaseModel):
    id: str
    query_text: str
    model: str
    mentioned: bool
    position: Optional[int] = None
    sentiment: Optional[str] = None
    citation_url: Optional[str] = None
    created_at: datetime


class MentionsResponse(BaseModel):
    data: list[Mention]
    total: int
    page: int
    per_page: int


class TrendPoint(BaseModel):
    date: str
    total: int
    mentioned: int


class TrendsResponse(BaseModel):
    data: list[TrendPoint]
