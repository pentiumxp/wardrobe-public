from __future__ import annotations

import sqlite3
from collections.abc import Sequence


def item_photo_rows(conn: sqlite3.Connection, item_id: int) -> list[sqlite3.Row]:
    return list(
        conn.execute(
            """
            SELECT
                id, item_id, file_name, original_name, sort_order, view_tag, source_tag, created_at, mime_type,
                1 AS has_blob,
                0 AS size_bytes
            FROM photos
            WHERE item_id = ?
            ORDER BY sort_order ASC, id ASC
            """,
            (int(item_id),),
        ).fetchall()
    )


def ordered_photo_ids(
    current_photo_ids: Sequence[int],
    *,
    photo_ids: Sequence[int] | None = None,
    first_photo_id: int | None = None,
) -> list[int]:
    current_ids = [int(photo_id) for photo_id in current_photo_ids]
    if not current_ids:
        raise ValueError("item_has_no_photos")
    current_set = set(current_ids)

    if first_photo_id is not None:
        target_id = int(first_photo_id)
        if target_id not in current_set:
            raise ValueError("photo_not_found")
        return [target_id, *[photo_id for photo_id in current_ids if photo_id != target_id]]

    if photo_ids is None:
        raise ValueError("photo_order_required")
    next_ids = [int(photo_id) for photo_id in photo_ids]
    if len(next_ids) != len(set(next_ids)):
        raise ValueError("duplicate_photo_id")
    if set(next_ids) != current_set:
        raise ValueError("photo_order_must_include_all_item_photos")
    return next_ids


def apply_item_photo_order(
    conn: sqlite3.Connection,
    item_id: int,
    photo_ids: Sequence[int],
) -> list[sqlite3.Row]:
    for sort_order, photo_id in enumerate(photo_ids, start=1):
        conn.execute(
            "UPDATE photos SET sort_order = ? WHERE item_id = ? AND id = ?",
            (sort_order, int(item_id), int(photo_id)),
        )
    return item_photo_rows(conn, int(item_id))
