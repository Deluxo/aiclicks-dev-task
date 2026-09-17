from collections.abc import Mapping
from functools import reduce
from itertools import starmap
from operator import itemgetter
from typing import Any

from returns.curry import curry, partial
from returns.pipeline import flow


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
