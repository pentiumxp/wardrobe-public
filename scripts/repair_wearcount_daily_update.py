import argparse
import json

from wardrobe_app.db import connect
from wardrobe_app import server
from wardrobe_app.excel_import import (
    _normalize_wearcount_role,
    _recompute_item_last_worn_on,
    _wear_delta_for_item,
)


def _target_daily_update(conn, wear_date: str, code: str):
    return conn.execute(
        """
        SELECT wdu.*
        FROM wearcount_daily_updates wdu
        JOIN wearcount_daily_update_items wdui ON wdu.id = wdui.daily_update_id
        WHERE wdu.wear_date = ? AND wdui.code = ?
        ORDER BY wdu.id DESC
        LIMIT 1
        """,
        (wear_date, code),
    ).fetchone()


def _target_outfit(conn, wear_date: str, code: str):
    return conn.execute(
        """
        SELECT outfits.*
        FROM outfits
        JOIN outfit_items ON outfit_items.outfit_id = outfits.id
        JOIN items ON items.id = outfit_items.item_id
        WHERE outfits.wear_date = ? AND items.code = ?
        ORDER BY outfits.id DESC
        LIMIT 1
        """,
        (wear_date, code),
    ).fetchone()


def _resolved_entries(conn, daily_update_id: int, wear_mode: str):
    raw_rows = conn.execute(
        "SELECT * FROM wearcount_daily_update_items WHERE daily_update_id = ? ORDER BY id",
        (daily_update_id,),
    ).fetchall()
    resolved_entries = []
    for row in raw_rows:
        item = conn.execute("SELECT * FROM items WHERE id = ?", (int(row["item_id"]),)).fetchone()
        if item is None:
            continue
        raw_role = row["role"]
        role = _normalize_wearcount_role(raw_role)
        if not role:
            role = _normalize_wearcount_role(item["layer_role"])
        if not role:
            role = str(raw_role or item["layer_role"] or "").strip()
        has_base_layer = bool(row["has_base_layer"])
        resolved_entries.append(
            {
                "item_id": int(item["id"]),
                "item": item,
                "role": role,
                "has_base_layer": has_base_layer,
                "wear_delta": _wear_delta_for_item(role, has_base_layer, wear_mode),
                "total_delta": int(row["total_delta"] or 0),
                "year_delta": int(row["year_delta"] or 0),
            }
        )
    return resolved_entries


def _item_snapshot(conn, item_id: int):
    return conn.execute(
        """
        SELECT wear_maintenance, wear_total, wear_year, last_worn_on
        FROM items
        WHERE id = ?
        """,
        (item_id,),
    ).fetchone()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--wear-date", required=True)
    parser.add_argument("--code", required=True)
    parser.add_argument("--export", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    conn = connect()
    conn.row_factory = server.sqlite3.Row
    try:
        daily_update = _target_daily_update(conn, args.wear_date, args.code)
        if daily_update is None:
            raise SystemExit("target_daily_update_not_found")

        item = conn.execute("SELECT * FROM items WHERE code = ?", (args.code,)).fetchone()
        if item is None:
            raise SystemExit("target_item_not_found")

        outfit = _target_outfit(conn, args.wear_date, args.code)
        if outfit is None:
            raise SystemExit("target_outfit_not_found")

        before_daily_item = conn.execute(
            """
            SELECT role, has_base_layer, wear_delta, total_delta, year_delta
            FROM wearcount_daily_update_items
            WHERE daily_update_id = ? AND code = ?
            """,
            (int(daily_update["id"]), args.code),
        ).fetchone()
        before_item = _item_snapshot(conn, int(item["id"]))

        resolved_entries = _resolved_entries(
            conn,
            int(daily_update["id"]),
            str(daily_update["wear_mode"] or "normal"),
        )
        payload_hash = server._outfit_daily_update_payload_hash(
            str(daily_update["wear_date"] or ""),
            str(daily_update["city"] or ""),
            str(daily_update["wear_mode"] or "normal"),
            str(daily_update["notes"] or ""),
            str(daily_update["owner"] or ""),
            resolved_entries,
        )

        summary = {
            "daily_update_id": int(daily_update["id"]),
            "outfit_id": int(outfit["id"]),
            "before_daily_item": dict(before_daily_item),
            "before_item": dict(before_item),
            "dry_run": bool(args.dry_run),
        }
        if args.dry_run:
            target_entry = next((entry for entry in resolved_entries if entry["item"]["code"] == args.code), None)
            summary["resolved_target"] = {
                "role": target_entry["role"] if target_entry else None,
                "has_base_layer": 1 if target_entry and target_entry["has_base_layer"] else 0,
                "wear_delta": target_entry["wear_delta"] if target_entry else None,
            }
            print(json.dumps(summary, ensure_ascii=False))
            return

        affected_ids = []
        affected_ids.extend(server._subtract_daily_update_effects(conn, int(daily_update["id"])))
        affected_ids.extend(
            server._apply_outfit_daily_update_entries(
                conn,
                int(daily_update["id"]),
                str(daily_update["wear_date"]),
                resolved_entries,
            )
        )
        payload = {
            "wear_date": outfit["wear_date"],
            "city": outfit["city"],
            "inventory_loc": outfit["inventory_loc"],
            "owner": outfit["owner"],
            "wear_mode": outfit["wear_mode"],
            "scene_tag": outfit["scene_tag"],
            "temp_value": outfit["temp_value"],
            "temp_low": outfit["temp_low"],
            "temp_high": outfit["temp_high"],
            "notes": outfit["notes"],
        }
        server._replace_outfit_items_and_rollup(conn, int(outfit["id"]), payload, resolved_entries)
        conn.execute(
            """
            UPDATE wearcount_daily_updates
            SET payload_hash = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (payload_hash, int(daily_update["id"])),
        )
        _recompute_item_last_worn_on(conn, affected_ids)
        conn.commit()

        exports = {}
        if args.export:
            exports["wardrobe"] = server._export_wardrobe_workbooks(conn)
            exports["wearcount"] = server._export_wearcount_workbooks(conn)

        after_daily_item = conn.execute(
            """
            SELECT role, has_base_layer, wear_delta, total_delta, year_delta
            FROM wearcount_daily_update_items
            WHERE daily_update_id = ? AND code = ?
            """,
            (int(daily_update["id"]), args.code),
        ).fetchone()
        after_item = _item_snapshot(conn, int(item["id"]))
        after_outfit_role = conn.execute(
            "SELECT role FROM outfit_items WHERE outfit_id = ? AND item_id = ?",
            (int(outfit["id"]), int(item["id"])),
        ).fetchone()
        summary.update(
            {
                "after_daily_item": dict(after_daily_item),
                "after_item": dict(after_item),
                "after_outfit_role": after_outfit_role["role"] if after_outfit_role else None,
                "exports": exports,
            }
        )
        print(json.dumps(summary, ensure_ascii=False))
    finally:
        conn.close()


if __name__ == "__main__":
    main()
