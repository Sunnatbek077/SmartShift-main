"""A tiny in-memory stand-in for the supabase-py Client, just enough of the
postgrest chainable query API (.table().select().eq()...execute()) to unit
test the service layer without a real Supabase project or network access.
"""
import uuid
from copy import deepcopy


class _Result:
    def __init__(self, data):
        self.data = data


class _Query:
    def __init__(self, store: dict, table: str):
        self._store = store
        self._table = table
        self._filters = []
        self._order_by = None
        self._order_desc = False
        self._single = False
        self._mode = None
        self._payload = None
        self._select_related = None

    def select(self, cols="*"):
        self._mode = self._mode or "select"
        if "!inner" in cols:
            self._select_related = cols
        return self

    def insert(self, row):
        self._mode = "insert"
        self._payload = row
        return self

    def update(self, fields):
        self._mode = "update"
        self._payload = fields
        return self

    def delete(self):
        self._mode = "delete"
        return self

    def upsert(self, rows, on_conflict=None):
        self._mode = "upsert"
        self._payload = rows if isinstance(rows, list) else [rows]
        self._on_conflict = on_conflict
        return self

    def eq(self, col, val):
        self._filters.append(("eq", col, val))
        return self

    def ilike(self, col, val):
        self._filters.append(("ilike", col, val))
        return self

    def in_(self, col, vals):
        self._filters.append(("in", col, vals))
        return self

    def order(self, col, desc=False):
        self._order_by = col
        self._order_desc = desc
        return self

    def maybe_single(self):
        self._single = True
        return self

    def _matches(self, row):
        for kind, col, val in self._filters:
            if kind == "eq" and row.get(col) != val:
                return False
            if kind == "ilike" and str(row.get(col, "")).lower() != str(val).lower():
                return False
            if kind == "in" and row.get(col) not in val:
                return False
        return True

    def execute(self):
        rows = self._store.setdefault(self._table, [])

        if self._mode == "insert":
            new_rows = self._payload if isinstance(self._payload, list) else [self._payload]
            created = []
            for r in new_rows:
                row = deepcopy(r)
                row.setdefault("id", str(uuid.uuid4()))
                rows.append(row)
                created.append(deepcopy(row))
            return _Result(created)

        if self._mode == "upsert":
            keys = (self._on_conflict or "id").split(",")
            created = []
            for r in self._payload:
                existing = next(
                    (row for row in rows if all(row.get(k) == r.get(k) for k in keys)), None
                )
                if existing:
                    existing.update(r)
                    created.append(deepcopy(existing))
                else:
                    row = deepcopy(r)
                    row.setdefault("id", str(uuid.uuid4()))
                    rows.append(row)
                    created.append(deepcopy(row))
            return _Result(created)

        matched = [r for r in rows if self._matches(r)]

        if self._mode == "update":
            for r in matched:
                r.update(self._payload)
            return _Result([deepcopy(r) for r in matched])

        if self._mode == "delete":
            remaining = [r for r in rows if not self._matches(r)]
            self._store[self._table] = remaining
            return _Result([deepcopy(r) for r in matched])

        # select
        if self._order_by:
            matched = sorted(matched, key=lambda r: r.get(self._order_by) or "", reverse=self._order_desc)

        if self._select_related:
            # naive join support for results.select("*,users!inner(...)&users.teacher_id=eq...")
            # not needed for current tests; return matched as-is.
            pass

        if self._single:
            return _Result(deepcopy(matched[0]) if matched else None)
        return _Result([deepcopy(r) for r in matched])


class FakeSupabase:
    def __init__(self):
        self._store: dict = {}

    def table(self, name: str) -> _Query:
        return _Query(self._store, name)

    def seed(self, table: str, rows: list):
        self._store[table] = [deepcopy(r) for r in rows]
