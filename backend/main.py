import os
from collections.abc import Mapping
from contextlib import asynccontextmanager
from datetime import timedelta
from functools import reduce
from typing import Any, Callable

import aiosqlite
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from returns.maybe import Maybe
from returns.pipeline import flow

from models import Mention, MentionsRequest, MentionsResponse
from returns.pipeline import pipe, flow

DB_PATH = os.path.join(os.path.dirname(__file__), "mentions.db")
import logging
logger = logging.getLogger(__name__)


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

from returns.curry import curry, partial

def column_to_where_param(operator: str, column: str) -> str:
    return f"{column} {operator} :_{column}_"

def sql_and(*items):
    return " AND ".join(items)

op_eq = partial(column_to_where_param, "=")
op_gte = partial(column_to_where_param, "<=")
op_gt = partial(column_to_where_param, "<")
op_lte = partial(column_to_where_param, ">=")
op_lt = partial(column_to_where_param, ">")

def to_sql_where_parts(
    filters: Mapping[str, Any] | None = None,
    op_map: Mapping[str, Callable[[str], str]] | None = None,
) -> tuple[list[str], dict[str, Any]]:
    """Build SQL WHERE fragments and named params from filter values.

    Returns a pair of (where_conditions, parameters). Empty/None filter
    values are skipped, so the caller can safely join conditions with AND.

    op_map maps column names to operator functions; columns not present
    fall back to op_eq.
    """
    ops = op_map or {}
    return reduce(
        lambda carry, item: (
            [*carry[0], ops.get(item[0], op_eq)(item[0])],
            {
                **carry[1],
                f"_{item[0]}_": item[1]
            }
        ) if item[1] else carry,
        (filters or {}).items(),
        ([], {}),
    )


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/mentions", response_model=MentionsResponse)
async def list_mentions(request: MentionsRequest = MentionsRequest()):
    request = MentionsRequest(**request.model_dump())
    db = app.state.db
    where_conditions, params = to_sql_where_parts(
        request.filters.model_dump(),
        {
            "date_from": op_gte,
            "date_to": op_lte,
        },
    )

    where = "WHERE " + " AND ".join(where_conditions) if where_conditions else ""

    logger.error(f"\n\n{where_conditions}\n")

    logger.error(f"\n\n{sql_and(*where_conditions)}\n")

    # where_(and_(
    #
    # ))
    #
    return MentionsResponse(
        total=(await (await db.execute(f"SELECT COUNT(*) FROM mentions {where}", params)).fetchone())[0],
        page=request.page,
        per_page=request.per_page,
        data=list(map(
            lambda row: Mention(
                id=row[0],
                query_text=row[1],
                model=row[2],
                mentioned=bool(row[3]),
                position=row[4],
                sentiment=row[5],
                citation_url=row[6],
                created_at=row[7]
            ),

            (await (await db.execute(
                f"SELECT id, query_text, model, mentioned, position, sentiment, citation_url, created_at FROM mentions {where} ORDER BY created_at DESC LIMIT :_limit_ OFFSET :_offset_",
                {
                    **params,
                    '_limit_': request.per_page,
                    '_offset_': (request.page - 1) * request.per_page
                },
            )).fetchall())
        )),
    )
