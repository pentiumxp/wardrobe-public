from __future__ import annotations

import json
import os
import re
import sqlite3
import xml.etree.ElementTree as ET
import zipfile
import hashlib
from pathlib import Path

from wardrobe_app.item_normalization import normalize_price_currency, normalize_price_text


NS = {"main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
DESKTOP_DIR = Path(
    os.environ.get("WARDROBE_DESKTOP_DIR", str(Path.home() / "OneDrive" / "Desktop"))
)


def _normalize_target(target: str) -> str:
    target = target.lstrip("/")
    return target if target.startswith("xl/") else f"xl/{target}"


def _column_index(cell_ref: str) -> int:
    letters = "".join(ch for ch in cell_ref if ch.isalpha())
    index = 0
    for ch in letters:
        index = index * 26 + (ord(ch.upper()) - 64)
    return index - 1


def _parse_shared_strings(archive: zipfile.ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in archive.namelist():
        return []
    root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
    strings = []
    for item in root.findall("main:si", NS):
        strings.append("".join(node.text or "" for node in item.findall(".//main:t", NS)))
    return strings


def _read_sheet_rows(archive: zipfile.ZipFile, path: str, shared_strings: list[str]) -> list[list[str]]:
    root = ET.fromstring(archive.read(path))
    rows: list[list[str]] = []
    for row in root.findall(".//main:sheetData/main:row", NS):
        values: dict[int, str] = {}
        for cell in row.findall("main:c", NS):
            ref = cell.attrib.get("r", "")
            cell_index = _column_index(ref)
            cell_type = cell.attrib.get("t")
            value_node = cell.find("main:v", NS)
            inline_node = cell.find("main:is", NS)
            value = ""
            if cell_type == "s" and value_node is not None and value_node.text:
                value = shared_strings[int(value_node.text)]
            elif cell_type == "inlineStr" and inline_node is not None:
                value = "".join(node.text or "" for node in inline_node.findall(".//main:t", NS))
            elif value_node is not None and value_node.text:
                value = value_node.text
            values[cell_index] = value
        if values:
            max_index = max(values)
            rows.append([values.get(index, "") for index in range(max_index + 1)])
    return rows


def read_workbook(path: Path) -> dict[str, list[dict[str, str]]]:
    sheets: dict[str, list[dict[str, str]]] = {}
    with zipfile.ZipFile(path) as archive:
        shared_strings = _parse_shared_strings(archive)
        workbook_root = ET.fromstring(archive.read("xl/workbook.xml"))
        rels_root = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        relationships = {rel.attrib["Id"]: _normalize_target(rel.attrib["Target"]) for rel in rels_root}
        for sheet in workbook_root.findall("main:sheets/main:sheet", NS):
            name = sheet.attrib["name"]
            rel_id = sheet.attrib["{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"]
            target = relationships[rel_id]
            rows = _read_sheet_rows(archive, target, shared_strings)
            if not rows:
                sheets[name] = []
                continue
            header = rows[0]
            records = []
            for row in rows[1:]:
                record = {}
                for index, key in enumerate(header):
                    if key:
                        record[key] = row[index] if index < len(row) else ""
                records.append(record)
            sheets[name] = records
    return sheets


def _pick(record: dict[str, str], *names: str) -> str:
    for name in names:
        if name in record and str(record[name]).strip():
            return str(record[name]).strip()
    return ""


def _looks_like_watch_status(value: str) -> bool:
    normalized = str(value or "").strip().lower()
    return normalized in {
        "active",
        "museum",
        "for sale",
        "display",
        "service pending",
        "pre-order",
        "preorder",
        "order",
        "archived",
    }


def _to_float(value: str) -> float | None:
    value = str(value).strip()
    if not value:
        return None
    try:
        return float(value)
    except ValueError:
        return None


def _to_int(value: str) -> int:
    value = str(value).strip()
    if not value:
        return 0
    try:
        return int(float(value))
    except ValueError:
        return 0


def _normalize_name_key(value: str) -> str:
    return re.sub(r"[\s_\-]+", "", str(value or "").strip().lower())


def _pick_sheet(workbook: dict[str, list[dict[str, str]]], *names: str) -> list[dict[str, str]]:
    for name in names:
        if name in workbook:
            return workbook[name]
    normalized_targets = {_normalize_name_key(name) for name in names}
    for actual_name, rows in workbook.items():
        if _normalize_name_key(actual_name) in normalized_targets:
            return rows
    return []


def _to_bool(value: str) -> bool:
    normalized = str(value or "").strip().lower()
    if normalized in {"1", "true", "t", "yes", "y", "是", "有", "需要", "需", "带", "打底"}:
        return True
    if normalized in {"0", "false", "f", "no", "n", "否", "无", "不", "不用", "没有", "未", "none"}:
        return False
    return False


def _is_home_mode(value: str) -> bool:
    normalized = str(value or "").strip().lower()
    return "home" in normalized or "居家" in normalized


def _current_year_delta(wear_date: str) -> int:
    matched = re.search(r"(20\d{2})", str(wear_date or ""))
    if not matched:
        return 0
    return 1 if int(matched.group(1)) == 2026 else 0


def _find_daily_update(conn: sqlite3.Connection, wear_date: str, owner: str = "") -> sqlite3.Row | None:
    normalized_owner = str(owner or "").strip()
    if normalized_owner:
        return conn.execute(
            "SELECT * FROM wearcount_daily_updates WHERE wear_date = ? AND COALESCE(owner, '') = ? ORDER BY id DESC LIMIT 1",
            (wear_date, normalized_owner),
        ).fetchone()
    return conn.execute(
        "SELECT * FROM wearcount_daily_updates WHERE wear_date = ? ORDER BY id DESC LIMIT 1",
        (wear_date,),
    ).fetchone()


def _recompute_item_last_worn_on(conn: sqlite3.Connection, item_ids: list[int]) -> None:
    for item_id in {int(value) for value in item_ids if value is not None}:
        row = conn.execute(
            """
            SELECT MAX(outfits.wear_date) AS last_worn_on
            FROM outfit_items
            JOIN outfits ON outfits.id = outfit_items.outfit_id
            WHERE outfit_items.item_id = ?
            """,
            (item_id,),
        ).fetchone()
        conn.execute(
            "UPDATE items SET last_worn_on = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (row["last_worn_on"] if row else None, item_id),
        )


def _outfit_rollup(conn: sqlite3.Connection, item_ids: list[int]) -> tuple[float | None, str]:
    avg_relax_values: list[float] = []
    temp_ranges: list[tuple[float, float]] = []
    for item_id in item_ids:
        item = conn.execute("SELECT * FROM items WHERE id = ?", (item_id,)).fetchone()
        if item is None:
            continue
        if item["relax_index"] is not None and item["layer_role"] != "Watch":
            avg_relax_values.append(float(item["relax_index"]))
        if item["temp_min"] is not None and item["temp_max"] is not None:
            temp_ranges.append((float(item["temp_min"]), float(item["temp_max"])))
    avg_relax = round(sum(avg_relax_values) / len(avg_relax_values), 2) if avg_relax_values else None
    avg_temp_label = ""
    if temp_ranges:
        mins = [value for value, _ in temp_ranges]
        maxs = [value for _, value in temp_ranges]
        avg_temp_label = f"{sum(mins) / len(mins):.1f}-{sum(maxs) / len(maxs):.1f}"
    return avg_relax, avg_temp_label


def _wear_delta_for_item(role: str, has_base_layer: bool, wear_mode: str) -> float:
    normalized_role = str(role or "").strip()
    if normalized_role in {"Watch", "Footwear", "Accessory"}:
        return 0.0
    base = 1.0
    if normalized_role in {"Inner", "Middle", "Bottom"} and not has_base_layer:
        base = 2.0
    if _is_home_mode(wear_mode):
        base *= 0.5
    return float(base)


def _normalize_wearcount_role(role: object) -> str:
    normalized = str(role or "").strip()
    if not normalized:
        return ""
    mapping = {
        "Outer": "Outer",
        "Middle": "Middle",
        "Inner": "Inner",
        "Bottom": "Bottom",
        "Footwear": "Footwear",
        "Accessory": "Accessory",
        "Watch": "Watch",
    }
    return mapping.get(normalized, "")


def _parse_forecast_temp_range(value: object) -> tuple[str, float | None, float | None, float | None]:
    text = str(value or "").strip()
    if not text:
        return "", None, None, None
    normalized = (
        text.replace("～", "-")
        .replace("~", "-")
        .replace("–", "-")
        .replace("—", "-")
        .replace("至", "-")
    )
    range_match = re.search(r"(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)", normalized)
    if range_match:
        low = float(range_match.group(1))
        high = float(range_match.group(2))
        if high < low:
            low, high = high, low
        return text, (low + high) / 2.0, low, high
    matches = re.findall(r"\d+(?:\.\d+)?", normalized)
    if not matches:
        return text, None, None, None
    temp_value = float(matches[0])
    return text, temp_value, temp_value, temp_value


def _payload_hash(payload: dict) -> str:
    raw = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def import_wearcount_new(conn: sqlite3.Connection, path: Path) -> dict:
    workbook = read_workbook(path)
    daily_rows = _pick_sheet(workbook, "DAILY_LOG", "Daily_Log", "DailyLog")
    item_rows = _pick_sheet(workbook, "ITEMS", "Items", "ITEM_LIST", "明细")
    if not daily_rows:
        raise ValueError("wearcount_new_missing_daily_log")
    if not item_rows:
        raise ValueError("wearcount_new_missing_items")

    daily_record = daily_rows[0]
    wear_date = _pick(daily_record, "Date", "wear_date", "Wear_Date", "日期")
    if not wear_date:
        raise ValueError("wearcount_new_missing_wear_date")

    location = _pick(
        daily_record,
        "City",
        "city",
        "城市",
        "Location",
        "location",
        "Loc",
        "inventory_loc",
    )
    wear_mode = _pick(
        daily_record,
        "Wear_Mode",
        "wear_mode",
        "模式",
        "Mode",
    ) or "normal"
    scene_tag = _pick(
        daily_record,
        "Scene",
        "scene",
        "SceneTag",
        "scene_tag",
    ) or wear_mode
    forecast, forecast_value, forecast_low, forecast_high = _parse_forecast_temp_range(_pick(
        daily_record,
        "Forecast_Temp",
        "forecast_temp",
        "Forecast",
        "forecast",
        "Avg_Temp",
        "avg_temp",
        "Temperature",
        "temperature",
        "Temp",
        "temp",
    ))
    notes = _pick(daily_record, "Notes", "notes", "备注")
    owner = _pick(daily_record, "Owner", "owner", "归属", "所属") or "徐欣"

    resolved_items: list[dict] = []
    missing_codes: list[str] = []
    for record in item_rows:
        code = _pick(record, "Code", "货号", "Item_Code")
        if not code:
            continue
        item = _find_item_by_code(conn, code)
        if item is None:
            missing_codes.append(code)
            continue
        raw_role = _pick(record, "Role", "LayerRole", "layer_role", "角色")
        role = _normalize_wearcount_role(raw_role)
        if not role:
            role = _normalize_wearcount_role(item["layer_role"])
        if not role:
            role = str(raw_role or item["layer_role"] or "").strip()
        has_base_layer = _to_bool(_pick(record, "Has_Base_Layer", "Base_Layer", "HasBaseLayer", "有打底", "是否打底"))
        wear_delta = _wear_delta_for_item(role, has_base_layer, wear_mode)
        resolved_items.append(
            {
                "item_id": int(item["id"]),
                "code": code,
                "role": role or str(item["layer_role"] or ""),
                "has_base_layer": has_base_layer,
                "wear_delta": wear_delta,
                "total_delta": 1,
                "year_delta": _current_year_delta(wear_date),
            }
        )

    if not resolved_items:
        raise ValueError("wearcount_new_no_valid_items")

    payload_for_hash = {
        "wear_date": wear_date,
        "location": location,
        "wear_mode": wear_mode,
        "scene_tag": scene_tag,
        "forecast": forecast,
        "notes": notes,
        "owner": owner,
        "items": sorted(
            [
                {
                    "code": entry["code"],
                    "role": entry["role"],
                    "has_base_layer": 1 if entry["has_base_layer"] else 0,
                }
                for entry in resolved_items
            ],
            key=lambda entry: (entry["role"], entry["code"]),
        ),
    }
    payload_hash = _payload_hash(payload_for_hash)

    existing_update = _find_daily_update(conn, wear_date, owner)
    if existing_update is not None and str(existing_update["payload_hash"] or "") == payload_hash:
        summary = {
            "type": "wearcount_new",
            "source": str(path),
            "wear_date": wear_date,
            "updated_items": 0,
            "missing_codes": missing_codes[:20],
            "missing_count": len(missing_codes),
            "skipped_duplicate": True,
            "merged_existing_date": True,
        }
        conn.execute(
            "INSERT INTO imports (import_type, source_path, summary_json) VALUES (?, ?, ?)",
            ("wearcount_new", str(path), json.dumps(summary, ensure_ascii=False)),
        )
        conn.commit()
        return summary

    affected_item_ids: list[int] = []
    if existing_update is not None:
        previous_rows = conn.execute(
            "SELECT * FROM wearcount_daily_update_items WHERE daily_update_id = ?",
            (int(existing_update["id"]),),
        ).fetchall()
        for row in previous_rows:
            affected_item_ids.append(int(row["item_id"]))
            conn.execute(
                """
                UPDATE items
                SET wear_maintenance = MAX(COALESCE(wear_maintenance, 0) - ?, 0),
                    wear_total = MAX(COALESCE(wear_total, 0) - ?, 0),
                    wear_year = MAX(COALESCE(wear_year, 0) - ?, 0),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """,
                (
                    float(row["wear_delta"] or 0),
                    int(row["total_delta"] or 0),
                    int(row["year_delta"] or 0),
                    int(row["item_id"]),
                ),
            )
        conn.execute(
            """
            UPDATE wearcount_daily_updates
            SET city = ?, wear_mode = ?, notes = ?, source_path = ?, payload_hash = ?, owner = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (location, wear_mode, notes, str(path), payload_hash, owner, int(existing_update["id"])),
        )
        daily_update_id = int(existing_update["id"])
        conn.execute("DELETE FROM wearcount_daily_update_items WHERE daily_update_id = ?", (daily_update_id,))
    else:
        cursor = conn.execute(
            """
            INSERT INTO wearcount_daily_updates (wear_date, city, wear_mode, notes, source_path, payload_hash, owner)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (wear_date, location, wear_mode, notes, str(path), payload_hash, owner),
        )
        daily_update_id = int(cursor.lastrowid)

    for entry in resolved_items:
        affected_item_ids.append(int(entry["item_id"]))
        conn.execute(
            """
            INSERT INTO wearcount_daily_update_items (
                daily_update_id, item_id, code, role, has_base_layer, wear_delta, total_delta, year_delta
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                daily_update_id,
                int(entry["item_id"]),
                entry["code"],
                entry["role"],
                1 if entry["has_base_layer"] else 0,
                float(entry["wear_delta"]),
                int(entry["total_delta"]),
                int(entry["year_delta"]),
            ),
        )
        conn.execute(
            """
            UPDATE items
            SET wear_maintenance = COALESCE(wear_maintenance, 0) + ?,
                wear_total = COALESCE(wear_total, 0) + ?,
                wear_year = COALESCE(wear_year, 0) + ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (
                float(entry["wear_delta"]),
                int(entry["total_delta"]),
                int(entry["year_delta"]),
                int(entry["item_id"]),
            ),
        )

    conn.execute(
        """
        INSERT INTO outfits (
            wear_date, city, inventory_loc, owner, wear_mode, scene_tag, temp_value, temp_low, temp_high, notes, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(wear_date, owner) DO UPDATE SET
            city = excluded.city,
            inventory_loc = excluded.inventory_loc,
            wear_mode = excluded.wear_mode,
            scene_tag = excluded.scene_tag,
            temp_value = excluded.temp_value,
            temp_low = excluded.temp_low,
            temp_high = excluded.temp_high,
            notes = excluded.notes,
            updated_at = CURRENT_TIMESTAMP
        """,
        (wear_date, location, location, owner, wear_mode, scene_tag, forecast_value, forecast_low, forecast_high, notes),
    )
    outfit = conn.execute(
        "SELECT id FROM outfits WHERE wear_date = ? AND COALESCE(owner, '') = ? ORDER BY id DESC LIMIT 1",
        (wear_date, owner),
    ).fetchone()
    outfit_id = int(outfit["id"])
    conn.execute("DELETE FROM outfit_items WHERE outfit_id = ?", (outfit_id,))
    for entry in resolved_items:
        conn.execute(
            "INSERT OR IGNORE INTO outfit_items (outfit_id, item_id, role) VALUES (?, ?, ?)",
            (outfit_id, int(entry["item_id"]), entry["role"]),
        )
    avg_relax, avg_temp_label = _outfit_rollup(conn, [int(entry["item_id"]) for entry in resolved_items])
    forecast_text = str(forecast or "").strip()
    if forecast_text:
        avg_temp_label = forecast_text
    conn.execute(
        """
        UPDATE outfits
        SET avg_relax = ?,
            temp_value = ?,
            temp_low = ?,
            temp_high = ?,
            avg_temp_label = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """,
        (avg_relax, forecast_value, forecast_low, forecast_high, avg_temp_label, outfit_id),
    )

    _recompute_item_last_worn_on(conn, affected_item_ids)

    summary = {
        "type": "wearcount_new",
        "source": str(path),
        "wear_date": wear_date,
        "updated_items": len(resolved_items),
        "missing_codes": missing_codes[:20],
        "missing_count": len(missing_codes),
        "skipped_duplicate": False,
        "merged_existing_date": existing_update is not None,
    }
    conn.execute(
        "INSERT INTO imports (import_type, source_path, summary_json) VALUES (?, ?, ?)",
        ("wearcount_new", str(path), json.dumps(summary, ensure_ascii=False)),
    )
    conn.commit()
    return summary


def import_wardrobe(conn: sqlite3.Connection, path: Path) -> dict:
    workbook = read_workbook(path)
    imported = 0
    skipped = 0
    for sheet_name, records in workbook.items():
        if sheet_name.startswith("_"):
            continue
        for record in records:
            code = _pick(record, "货号", "Code")
            section = _pick(record, "Section", "Item")
            brand = _pick(record, "品牌", "Brand")
            if not code or not section or not brand:
                skipped += 1
                continue
            conn.execute(
                """
                INSERT INTO items (
                    code, brand, section, loc, owner, layer_role, outer_type, scene_tag,
                    relax_index, temp_min, temp_max, standalone_min, standalone_max,
                    primary_color, secondary_color, official_desc, price_original,
                    price_original_currency, price_cny, series, size, acquired_at, official_color_code, material,
                    care, notes, source_sheet, status, updated_at
                )
                VALUES (
                    :code, :brand, :section, :loc, :owner, :layer_role, :outer_type, :scene_tag,
                    :relax_index, :temp_min, :temp_max, :standalone_min, :standalone_max,
                    :primary_color, :secondary_color, :official_desc, :price_original,
                    :price_original_currency, :price_cny, :series, :size, :acquired_at, :official_color_code, :material,
                    :care, :notes, :source_sheet, :status, CURRENT_TIMESTAMP
                )
                ON CONFLICT(code) DO UPDATE SET
                    brand=excluded.brand,
                    section=excluded.section,
                    loc=excluded.loc,
                    owner=excluded.owner,
                    layer_role=excluded.layer_role,
                    outer_type=excluded.outer_type,
                    scene_tag=excluded.scene_tag,
                    relax_index=excluded.relax_index,
                    temp_min=excluded.temp_min,
                    temp_max=excluded.temp_max,
                    standalone_min=excluded.standalone_min,
                    standalone_max=excluded.standalone_max,
                    primary_color=excluded.primary_color,
                    secondary_color=excluded.secondary_color,
                    official_desc=excluded.official_desc,
                    price_original=excluded.price_original,
                    price_original_currency=excluded.price_original_currency,
                    price_cny=excluded.price_cny,
                    series=excluded.series,
                    size=excluded.size,
                    acquired_at=excluded.acquired_at,
                    official_color_code=excluded.official_color_code,
                    material=excluded.material,
                    care=excluded.care,
                    notes=excluded.notes,
                    source_sheet=excluded.source_sheet,
                    status=excluded.status,
                    updated_at=CURRENT_TIMESTAMP
                """,
                {
                    "code": code,
                    "brand": brand,
                    "section": section,
                    "loc": _pick(record, "Loc"),
                    "owner": _pick(record, "Owner") or "徐欣",
                    "layer_role": _pick(record, "LayerRole"),
                    "outer_type": _pick(record, "Outer_Type"),
                    "scene_tag": _pick(record, "SceneTag"),
                    "relax_index": _to_float(_pick(record, "Relax_Index")),
                    "temp_min": _to_float(_pick(record, "Temp_Min")),
                    "temp_max": _to_float(_pick(record, "Temp_Max")),
                    "standalone_min": _to_float(_pick(record, "Standalone_Min")),
                    "standalone_max": _to_float(_pick(record, "Standalone_Max")),
                    "primary_color": _pick(record, "主色系"),
                    "secondary_color": _pick(record, "第二色系"),
                    "official_desc": _pick(record, "官网描述", "官方描述（中国大陆官网）", "官方描述"),
                    "price_original": normalize_price_text(_pick(record, "原始价格")),
                    "price_original_currency": normalize_price_currency(_pick(record, "原始货币", "原始币种"), _pick(record, "原始价格")),
                    "price_cny": normalize_price_text(_pick(record, "人民币价格")),
                    "series": _pick(record, "系列"),
                    "size": _pick(record, "尺码"),
                    "acquired_at": _pick(record, "入库时间"),
                    "official_color_code": _pick(record, "官方色号"),
                    "material": _pick(record, "材质"),
                    "care": _pick(record, "洗涤方式"),
                    "notes": _pick(record, "说明"),
                    "source_sheet": sheet_name,
                    "status": "Active",
                },
            )
            imported += 1
    conn.commit()
    summary = {"type": "wardrobe", "source": str(path), "imported": imported, "skipped": skipped}
    conn.execute(
        "INSERT INTO imports (import_type, source_path, summary_json) VALUES (?, ?, ?)",
        ("wardrobe", str(path), json.dumps(summary, ensure_ascii=False)),
    )
    conn.commit()
    return summary


def import_watch_catalog(conn: sqlite3.Connection, path: Path) -> dict:
    workbook = read_workbook(path)
    imported = 0
    skipped = 0
    for sheet_name, records in workbook.items():
        if sheet_name.startswith("_"):
            continue
        for record in records:
            code = _pick(record, "Ref", "Code", "货号")
            raw_status = _pick(record, "状态", "Status", "status")
            raw_section = _pick(record, "Section")
            raw_name = _pick(record, "name", "Name", "名称")
            legacy_section_shifted = not raw_status and raw_name and _looks_like_watch_status(raw_section)
            section = (raw_name if legacy_section_shifted else (raw_name or raw_section))
            status = raw_status or (raw_section if legacy_section_shifted else "") or "Active"
            if not code or not section:
                skipped += 1
                continue
            price_value = _pick(record, "购买价格", "价格", "Price")
            description = _pick(record, "中文说明", "name", "说明")
            conn.execute(
                """
                INSERT INTO items (
                    code, brand, section, loc, owner, layer_role, outer_type, scene_tag,
                    relax_index, temp_min, temp_max, standalone_min, standalone_max,
                    primary_color, secondary_color, official_desc, price_original,
                    price_original_currency, price_cny, series, size, acquired_at, official_color_code, material,
                    care, notes, source_sheet, status, updated_at
                )
                VALUES (
                    :code, :brand, :section, :loc, :owner, 'Watch', '',
                    :scene_tag, NULL, NULL, NULL, NULL, NULL, '', '', :official_desc,
                    :price_original, :price_original_currency, :price_cny, '', '', :acquired_at, '',
                    :material, '', :notes, :source_sheet, :status, CURRENT_TIMESTAMP
                )
                ON CONFLICT(code) DO UPDATE SET
                    brand=excluded.brand,
                    section=excluded.section,
                    loc=excluded.loc,
                    owner=excluded.owner,
                    layer_role='Watch',
                    outer_type='',
                    scene_tag=excluded.scene_tag,
                    official_desc=excluded.official_desc,
                    price_original=excluded.price_original,
                    price_original_currency=excluded.price_original_currency,
                    price_cny=excluded.price_cny,
                    acquired_at=excluded.acquired_at,
                    material=excluded.material,
                    notes=excluded.notes,
                    source_sheet=excluded.source_sheet,
                    status=excluded.status,
                    updated_at=CURRENT_TIMESTAMP
                """,
                {
                    "code": code,
                    "brand": _pick(record, "品牌", "Brand") or "Watch",
                    "section": section,
                    "loc": _pick(record, "Loc") or "SH",
                    "owner": _pick(record, "Owner") or "徐欣",
                    "scene_tag": _pick(record, "SceneTag") or "Watch",
                    "official_desc": description,
                    "price_original": normalize_price_text(price_value),
                    "price_original_currency": normalize_price_currency(_pick(record, "原始货币", "原始币种", "Currency"), price_value),
                    "price_cny": normalize_price_text(price_value),
                    "acquired_at": _pick(record, "购买日期", "入库时间"),
                    "material": _pick(record, "材质"),
                    "notes": _pick(record, "机芯"),
                    "source_sheet": sheet_name,
                    "status": status,
                },
            )
            imported += 1
    conn.commit()
    summary = {"type": "watch", "source": str(path), "imported": imported, "skipped": skipped}
    conn.execute(
        "INSERT INTO imports (import_type, source_path, summary_json) VALUES (?, ?, ?)",
        ("watch", str(path), json.dumps(summary, ensure_ascii=False)),
    )
    conn.commit()
    return summary


def import_image_index(conn: sqlite3.Connection, path: Path) -> dict:
    workbook = read_workbook(path)
    records = workbook.get("IMAGE_INDEX", [])
    imported = 0
    for record in records:
        code = _pick(record, "Code", "货号")
        if not code:
            continue
        item = conn.execute("SELECT id FROM items WHERE code = ?", (code,)).fetchone()
        if item is None:
            continue
        conn.execute("DELETE FROM photos WHERE item_id = ? AND source_tag = 'image_index'", (item["id"],))
        image_fields = sorted(key for key in record if key.startswith("Img_"))
        order = 1
        for field_name in image_fields:
            file_name = _pick(record, field_name)
            if not file_name:
                continue
            conn.execute(
                """
                INSERT INTO photos (item_id, file_name, original_name, sort_order, view_tag, source_tag)
                VALUES (?, ?, ?, ?, ?, 'image_index')
                """,
                (item["id"], file_name, file_name, order, field_name.lower()),
            )
            imported += 1
            order += 1
    conn.commit()
    summary = {"type": "image_index", "source": str(path), "imported": imported}
    conn.execute(
        "INSERT INTO imports (import_type, source_path, summary_json) VALUES (?, ?, ?)",
        ("image_index", str(path), json.dumps(summary, ensure_ascii=False)),
    )
    conn.commit()
    return summary


def _upsert_minimal_item(conn: sqlite3.Connection, code: str, brand: str, item_name: str, role: str) -> int:
    existing = conn.execute("SELECT id FROM items WHERE code = ?", (code,)).fetchone()
    if existing:
        return int(existing["id"])
    conn.execute(
        """
        INSERT INTO items (code, brand, section, owner, layer_role, status, source_sheet)
        VALUES (?, ?, ?, '徐欣', ?, 'Active', 'WearCount')
        """,
        (code, brand or "Unknown", item_name or code, role),
    )
    conn.commit()
    return int(conn.execute("SELECT id FROM items WHERE code = ?", (code,)).fetchone()["id"])


def _delete_wearcount_only_items(conn: sqlite3.Connection) -> int:
    cursor = conn.execute("DELETE FROM items WHERE source_sheet = 'WearCount'")
    conn.commit()
    return int(cursor.rowcount or 0)


def _find_item_by_code(conn: sqlite3.Connection, code: str) -> sqlite3.Row | None:
    code = str(code).strip()
    if not code:
        return None
    exact = conn.execute("SELECT * FROM items WHERE code = ?", (code,)).fetchone()
    if exact is not None:
        return exact
    prefix_matches = conn.execute(
        "SELECT * FROM items WHERE code LIKE ? ORDER BY LENGTH(code) ASC, code ASC",
        (f"{code}%",),
    ).fetchall()
    if len(prefix_matches) == 1:
        return prefix_matches[0]
    return None


def _find_item_by_section(conn: sqlite3.Connection, section: str) -> sqlite3.Row | None:
    section = str(section).strip()
    if not section:
        return None
    matches = conn.execute(
        "SELECT * FROM items WHERE section = ? ORDER BY id ASC",
        (section,),
    ).fetchall()
    if len(matches) == 1:
        return matches[0]
    return None


def _reset_featured_looks(conn: sqlite3.Connection) -> None:
    conn.execute("DELETE FROM featured_look_items")
    conn.execute("DELETE FROM featured_looks")
    conn.commit()


def import_featured_looks(conn: sqlite3.Connection, path: Path) -> dict:
    workbook = read_workbook(path)
    _reset_featured_looks(conn)
    imported = 0
    linked_items = 0
    missing_links: list[dict[str, str]] = []
    slot_specs = [
        ("anchor", "Anchor_Code", "Anchor_Section", 10),
        ("inner", "Inner_Code", "", 20),
        ("middle", "Mid_Code", "", 30),
        ("outer", "Outer_Code", "", 40),
        ("bottom", "Bottom_Code", "", 50),
        ("footwear", "Footwear_Code", "", 60),
        ("watch", "Watch_Ref", "", 70),
    ]

    for sheet_name in ("LOOK_MASTER", "ARCHIVE"):
        for record in workbook.get(sheet_name, []):
            look_id = _pick(record, "LookID")
            if not look_id:
                continue
            status = _pick(record, "Status") or ("Archived" if sheet_name == "ARCHIVE" else "Active")
            conn.execute(
                """
                INSERT INTO featured_looks (
                    look_id, anchor_type, anchor_code, anchor_section, use_case, priority, status,
                    temp_min, temp_max, scene_tag_target, relax_center, relax_span,
                    material_line, notes, source_sheet, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                """,
                (
                    look_id,
                    _pick(record, "Anchor_Type"),
                    _pick(record, "Anchor_Code"),
                    _pick(record, "Anchor_Section"),
                    _pick(record, "Use_Case"),
                    _pick(record, "Priority"),
                    status,
                    _to_float(_pick(record, "Temp_Min")),
                    _to_float(_pick(record, "Temp_Max")),
                    _pick(record, "SceneTag_Target"),
                    _to_float(_pick(record, "Relax_Center")),
                    _to_float(_pick(record, "Relax_Span")),
                    _pick(record, "Material_Line"),
                    _pick(record, "Notes"),
                    sheet_name,
                ),
            )
            featured_look_id = int(
                conn.execute("SELECT id FROM featured_looks WHERE look_id = ?", (look_id,)).fetchone()["id"]
            )
            imported += 1

            for slot, code_field, section_field, display_order in slot_specs:
                source_code = _pick(record, code_field)
                source_section = _pick(record, section_field) if section_field else ""
                if not source_code and not source_section:
                    continue
                item = _find_item_by_code(conn, source_code) if source_code else None
                if item is None and source_section:
                    item = _find_item_by_section(conn, source_section)
                conn.execute(
                    """
                    INSERT INTO featured_look_items (
                        featured_look_id, item_id, slot, source_code, source_section, display_order
                    )
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (
                        featured_look_id,
                        int(item["id"]) if item is not None else None,
                        slot,
                        source_code,
                        source_section,
                        display_order,
                    ),
                )
                if item is not None:
                    linked_items += 1
                else:
                    missing_links.append(
                        {
                            "look_id": look_id,
                            "slot": slot,
                            "source_code": source_code,
                            "source_section": source_section,
                        }
                    )

    conn.commit()
    summary = {
        "type": "featured_looks",
        "source": str(path),
        "imported": imported,
        "linked_items": linked_items,
        "missing_links": missing_links[:20],
        "missing_count": len(missing_links),
    }
    conn.execute(
        "INSERT INTO imports (import_type, source_path, summary_json) VALUES (?, ?, ?)",
        ("featured_looks", str(path), json.dumps(summary, ensure_ascii=False)),
    )
    conn.commit()
    return summary


def import_wearcount(conn: sqlite3.Connection, path: Path) -> dict:
    workbook = read_workbook(path)
    removed_legacy_items = _delete_wearcount_only_items(conn)
    updated_items = 0
    skipped_missing_items = 0
    role_map = {
        "Outer": "Outer",
        "Middle": "Middle",
        "Inner": "Inner",
        "Bottom": "Bottom",
        "Footwear": "Footwear",
        "Accessory": "Accessory",
        "Watch": "Watch",
    }
    for sheet_name, records in workbook.items():
        if sheet_name.startswith("_") or sheet_name == "DAILY_LOG":
            continue
        role = role_map.get(sheet_name)
        if not role:
            continue
        for record in records:
            code = _pick(record, "Code", "货号")
            item_name = _pick(record, "Item", "Section")
            brand = _pick(record, "Brand", "品牌")
            if not code:
                continue
            item = _find_item_by_code(conn, code)
            if item is None:
                skipped_missing_items += 1
                continue
            item_id = int(item["id"])
            conn.execute(
                """
                UPDATE items
                SET wear_maintenance = ?,
                    wear_total = ?,
                    wear_year = ?,
                    maint_count = ?,
                    wear_threshold = ?,
                    status = COALESCE(NULLIF(?, ''), status),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """,
                (
                    _to_float(_pick(record, "Wear")) or 0,
                    _to_int(_pick(record, "Total")),
                    _to_int(_pick(record, "2026")),
                    _to_int(_pick(record, "Maint")),
                    _to_float(_pick(record, "Thr")) or 0,
                    _pick(record, "Status"),
                    item_id,
                ),
            )
            updated_items += 1

    logs_imported = 0
    for record in workbook.get("DAILY_LOG", []):
        wear_date = _pick(record, "Date")
        if not wear_date:
            continue
        owner = _pick(record, "Owner", "owner", "归属", "所属") or "徐欣"
        conn.execute(
            """
            INSERT INTO outfits (
                wear_date, city, inventory_loc, owner, wear_mode, avg_relax, avg_temp_label, notes, updated_at
            )
            VALUES (?, ?, '', ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(wear_date, owner) DO UPDATE SET
                city=excluded.city,
                wear_mode=excluded.wear_mode,
                avg_relax=excluded.avg_relax,
                avg_temp_label=excluded.avg_temp_label,
                notes=excluded.notes,
                updated_at=CURRENT_TIMESTAMP
            """,
            (
                wear_date,
                _pick(record, "City"),
                owner,
                _pick(record, "Wear_Mode") or "normal",
                _to_float(_pick(record, "Avg_Relax")),
                _pick(record, "Avg_Temp"),
                _pick(record, "Notes"),
            ),
        )
        outfit = conn.execute(
            "SELECT id FROM outfits WHERE wear_date = ? AND COALESCE(owner, '') = ? ORDER BY id DESC LIMIT 1",
            (wear_date, owner),
        ).fetchone()
        outfit_id = int(outfit["id"])
        conn.execute("DELETE FROM outfit_items WHERE outfit_id = ?", (outfit_id,))
        by_role = {
            "Inner": _pick(record, "Inner_Codes"),
            "Middle": _pick(record, "Middle_Codes"),
            "Outer": _pick(record, "Outer_Codes"),
            "Bottom": _pick(record, "Bottom_Codes"),
            "Footwear": _pick(record, "Footwear_Codes"),
            "Accessory": _pick(record, "Accessory_Codes"),
            "Watch": _pick(record, "Watch_Refs"),
        }
        for role_name, code_blob in by_role.items():
            codes = [value.strip() for value in code_blob.split("|") if value.strip()]
            for code in codes:
                item = _find_item_by_code(conn, code)
                if item is None:
                    skipped_missing_items += 1
                    continue
                item_id = int(item["id"])
                conn.execute(
                    "INSERT OR IGNORE INTO outfit_items (outfit_id, item_id, role) VALUES (?, ?, ?)",
                    (outfit_id, item_id, role_name),
                )
                conn.execute("UPDATE items SET last_worn_on = ? WHERE id = ?", (wear_date, item_id))
        logs_imported += 1
    conn.commit()
    summary = {
        "type": "wearcount",
        "source": str(path),
        "removed_legacy_items": removed_legacy_items,
        "updated_items": updated_items,
        "skipped_missing_items": skipped_missing_items,
        "logs_imported": logs_imported,
    }
    conn.execute(
        "INSERT INTO imports (import_type, source_path, summary_json) VALUES (?, ?, ?)",
        ("wearcount", str(path), json.dumps(summary, ensure_ascii=False)),
    )
    conn.commit()
    return summary


def bootstrap_from_desktop(conn: sqlite3.Connection) -> list[dict]:
    return []
