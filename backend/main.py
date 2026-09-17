from contextlib import asynccontextmanager
from db.repository.mentions import fetch_mentions_page
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import MentionsRequest, MentionsResponse
import aiosqlite
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "mentions.db")

@asynccontextmanager
async def lifespan(app: FastAPI):
    db = await aiosqlite.connect(DB_PATH)
    await db.execute("SELECT COUNT(*) FROM mentions")
    app.state.db = db
    yield
    await db.close()

app = FastAPI(title="Brand Mentions API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/mentions", response_model=MentionsResponse)
async def list_mentions(request: MentionsRequest = MentionsRequest()):
    total, rows = await fetch_mentions_page(
        app.state.db,
        request.filters.model_dump(mode="json"),
        request.page,
        request.per_page
    )
    return MentionsResponse(total=total, page=request.page, per_page=request.per_page, data=rows)
