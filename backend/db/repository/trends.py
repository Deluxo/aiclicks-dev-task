import aiosqlite
from collections.abc import Mapping
from typing import Any
from db.sql import op_gte, op_lte, to_sql_where_conditions_and_params, to_where_str
from models import TrendPoint
from returns.pipeline import flow


TREND_GROUP_BY = {
    "day": "date(created_at)",
    "week": "date(created_at, '-' || ((strftime('%w', created_at) + 6) % 7) || ' days')",
}


async def fetch_mentions_trends_page(
    db: aiosqlite.Connection,
    filters: Mapping[str, Any]
) -> list[TrendPoint]:
    where_conditions, params = to_sql_where_conditions_and_params(
        dict(filter(lambda kv: kv[0] != "group_by", filters.items())),
        {
            "date_from": op_gte("date(created_at)"),
            "date_to": op_lte("date(created_at)"),
        },
    )

    return flow(
        await (await db.execute(
            f"SELECT {TREND_GROUP_BY[filters.get('group_by', 'day')]}, COUNT(*), SUM(mentioned) FROM mentions "
            f"{to_where_str(where_conditions)} GROUP BY 1 ORDER BY 1 ASC",
            params,
        )).fetchall(),
        lambda data: map(
            lambda row: TrendPoint(date=row[0], total=row[1], mentioned=row[2]),
            data,
        ),
        list,
    )
