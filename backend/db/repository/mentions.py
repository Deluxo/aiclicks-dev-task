from db.sql import op_gte, op_lte, to_sql_where_conditions_and_params, to_where_str, where_in
from models import Mention


MENTIONS_OPS = {
    "model": where_in,
    "date_from": op_gte("created_at"),
    "date_to": op_lte("created_at"),
}

MENTIONS_COLUMNS = (
    "id", "query_text", "model", "mentioned", "position", "sentiment", "citation_url", "created_at",
)

MENTIONS_ORDER_BY = "created_at DESC"


def row_to_mention(row):
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


def build_mentions_query(filters, page, per_page):
    where_conditions, params = to_sql_where_conditions_and_params(filters, MENTIONS_OPS)
    return (
        to_where_str(where_conditions),
        params,
        per_page,
        (page - 1) * per_page,
    )


async def fetch_total(db, where, params):
    total_row = await (await db.execute(f"SELECT COUNT(*) FROM mentions {where}", params)).fetchone()
    return total_row[0]


async def fetch_rows(db, where, params, limit, offset):
    sql = (
        f"SELECT {', '.join(MENTIONS_COLUMNS)} FROM mentions "
        f"{where} ORDER BY {MENTIONS_ORDER_BY} LIMIT :_limit_ OFFSET :_offset_"
    )
    rows = await (await db.execute(sql, {**params, "_limit_": limit, "_offset_": offset})).fetchall()
    return list(map(row_to_mention, rows))


async def fetch_mentions_page(db, filters, page, per_page):
    where, params, limit, offset = build_mentions_query(filters, page, per_page)
    total = await fetch_total(db, where, params)
    rows = await fetch_rows(db, where, params, limit, offset)
    return (total, rows)
