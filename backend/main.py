import os
from collections.abc import Mapping
from contextlib import asynccontextmanager
from datetime import timedelta
from functools import reduce
from itertools import starmap
from operator import itemgetter
from typing import Any

import aiosqlite
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from returns.maybe import Maybe

from models import Mention, MentionsRequest, MentionsResponse
from returns.pipeline import flow

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

def where_op(operator, column, key, value):
    return f"{column or key} {operator} :_{key}_", {f"_{key}_": value}


def where_in(key, value):
    keys = list(map(lambda i: f"_{key}_{i}", range(len(value))))
    return (
        f"{key} IN ({', '.join(map(lambda k: f':{k}', keys))})",
        dict(zip(keys, value)),
    )


op_eq  = curry(partial(where_op, "="))
op_gt  = curry(partial(where_op, ">"))
op_gte = curry(partial(where_op, ">="))
op_lt  = curry(partial(where_op, "<"))
op_lte = curry(partial(where_op, "<="))

def merge_parts(acc, part):
    frags, params = acc
    frag, extra = part
    return ([*frags, frag], {**params, **extra})


def merge_all(parts):
    return reduce(merge_parts, parts, ([], {}))


def to_where_str(conditions):
    return f"WHERE {' AND '.join(conditions)}" if conditions else ""


def to_sql_where_conditions_and_params(
    filters: Mapping[str, Any] = {},
    op_map: Mapping[str, Any] = {},
) -> tuple[list[str], dict]:
    """Build SQL WHERE fragments and named params from filter values.

    Returns a pair of (where_conditions, parameters). Empty/None filter
    values are skipped, so the caller can safely join conditions with AND.

    op_map maps filter keys to spec functions; missing keys get plain '='.
    """
    def apply_spec(key, value):
        return op_map.get(key, op_eq(None))(key, value)

    return flow(
        filters,
        dict.items,
        partial(filter, itemgetter(1)),
        partial(starmap, apply_spec),
        merge_all,
    )


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/mentions", response_model=MentionsResponse)
async def list_mentions(request: MentionsRequest = MentionsRequest()):
    request = MentionsRequest(**request.model_dump())
    where_conditions, params = to_sql_where_conditions_and_params(
        request.filters.model_dump(mode="json"),
        {
            "model": where_in,
            "date_from": op_gte("created_at"),
            "date_to": op_lte("created_at"),
        },
    )

    where = to_where_str(where_conditions)

    return MentionsResponse(
        total=(await (await app.state.db.execute(f"SELECT COUNT(*) FROM mentions {where}", params)).fetchone())[0],
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

            (await (await app.state.db.execute(
                f"SELECT id, query_text, model, mentioned, position, sentiment, citation_url, created_at FROM mentions {where} ORDER BY created_at DESC LIMIT :_limit_ OFFSET :_offset_",
                {
                    **params,
                    '_limit_': request.per_page,
                    '_offset_': (request.page - 1) * request.per_page
                },
            )).fetchall())
        )),
    )
