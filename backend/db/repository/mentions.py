import aiosqlite
from collections.abc import Mapping, Sequence
from typing import Any

from db.sql import op_gte, op_lte, to_sql_where_conditions_and_params, to_where_str, where_in
from models import Mention, TrendPoint
from returns.pipeline import flow


MENTIONS_OPS = {
    "model": where_in,
    "date_from": op_gte("created_at"),
    "date_to": op_lte("created_at"),
}

TREND_OPS = {
    "date_from": op_gte("date(created_at)"),
    "date_to": op_lte("date(created_at)"),
}

TREND_GROUP_BY = {
    "day": "date(created_at)",
    "week": "date(created_at, '-' || ((strftime('%w', created_at) + 6) % 7) || ' days')",
}

MENTIONS_COLUMNS = (
    "id", "query_text", "model", "mentioned", "position", "sentiment", "citation_url", "created_at",
)

MENTIONS_ORDER_BY = "created_at DESC"


def row_to_mention(row: Sequence[Any]) -> Mention:
    return Mention(
        id=row[0],
        query_text=row[1],
        model=row[2],
        mentioned=bool(row[3]),
        position=row[4],
        sentiment=row[5],
        citation_url=row[6],
        created_at=row[7],
    )


def build_mentions_query(
    filters: Mapping[str, Any],
    page: int,
    per_page: int
) -> tuple[str, dict[str, Any], int, int]:
    where_conditions, params = to_sql_where_conditions_and_params(filters, MENTIONS_OPS)
    return (
        to_where_str(where_conditions),
        params,
        per_page,
        (page - 1) * per_page,
    )


async def fetch_total(
    db: aiosqlite.Connection,
    where: str,
    params: dict[str, Any]
) -> int:
    total_row = await (await db.execute(f"SELECT COUNT(*) FROM mentions {where}", params)).fetchone()
    return total_row[0] if total_row else 0


async def fetch_rows(
    db: aiosqlite.Connection,
    where: str,
    params: dict[str, Any],
    limit: int,
    offset: int
) -> list[Mention]:
    sql = (
        f"SELECT {', '.join(MENTIONS_COLUMNS)} FROM mentions "
        f"{where} ORDER BY {MENTIONS_ORDER_BY} LIMIT :_limit_ OFFSET :_offset_"
    )
    rows = await (await db.execute(sql, {**params, "_limit_": limit, "_offset_": offset})).fetchall()
    return list(map(row_to_mention, rows))


async def fetch_mentions_page(
    db: aiosqlite.Connection,
    filters: Mapping[str, Any],
    page: int,
    per_page: int
) -> tuple[int, list[Mention]]:
    where, params, limit, offset = build_mentions_query(filters, page, per_page)

    return (
        await fetch_total(db, where, params),
        await fetch_rows(db, where, params, limit, offset)
    )


async def fetch_mentions_trends_page(
    db: aiosqlite.Connection,
    filters: Mapping[str, Any]
) -> list[TrendPoint]:
    where_conditions, params = to_sql_where_conditions_and_params(
        dict(filter(lambda kv: kv[0] != "group_by", filters.items())),
        TREND_OPS
    )

    return flow(
        await (await db.execute(
            f"SELECT {TREND_GROUP_BY[filters.get("group_by", "day")]}, COUNT(*), SUM(mentioned) FROM mentions "
            f"{to_where_str(where_conditions)} GROUP BY 1 ORDER BY 1 ASC",
            params
        )).fetchall(),
        lambda data: map(
            lambda row: TrendPoint(
                date=row[0],
                total=row[1],
                mentioned=row[2]
            ),
            data
        ),
        list
    )
