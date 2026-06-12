from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

from wardrobe_app.item_normalization import normalize_price_currency, normalize_price_text


STAT_TOOL_RESOURCES: dict[str, tuple[str, ...]] = {
    "wardrobe.stats_overview": (
        "items",
        "wear_counts",
        "featured_looks",
        "wear_history",
        "primary_photo_thumbnails",
    ),
    "wardrobe.stats_inventory": ("items",),
    "wardrobe.stats_watch": ("items", "wear_counts"),
    "wardrobe.stats_wear": ("items", "wear_counts", "wear_history"),
    "wardrobe.stats_maintenance": ("items", "wear_counts"),
    "wardrobe.stats_history": ("wear_history",),
    "wardrobe.stats_featured_looks": ("featured_looks", "items"),
    "wardrobe.stats_photos": ("items", "primary_photo_thumbnails"),
    "wardrobe.stats_data_quality": ("items", "wear_counts", "primary_photo_thumbnails"),
}

STAT_TOOL_NAMES = tuple(STAT_TOOL_RESOURCES)


@dataclass(frozen=True)
class ResourceData:
    name: str
    rows: list[dict[str, Any]]
    meta: dict[str, Any]
    exists: bool
    warning: str | None = None


def run_stats_tool(
    name: str,
    runtime: Any,
    args: dict[str, Any],
    *,
    sync_result: dict[str, Any] | None = None,
    sync_error: dict[str, Any] | None = None,
) -> dict[str, Any]:
    handlers = {
        "wardrobe.stats_overview": stats_overview,
        "wardrobe.stats_inventory": stats_inventory,
        "wardrobe.stats_watch": stats_watch,
        "wardrobe.stats_wear": stats_wear,
        "wardrobe.stats_maintenance": stats_maintenance,
        "wardrobe.stats_history": stats_history,
        "wardrobe.stats_featured_looks": stats_featured_looks,
        "wardrobe.stats_photos": stats_photos,
        "wardrobe.stats_data_quality": stats_data_quality,
    }
    return handlers[name](runtime, args, sync_result=sync_result, sync_error=sync_error)


def stats_overview(
    runtime: Any,
    args: dict[str, Any],
    *,
    sync_result: dict[str, Any] | None = None,
    sync_error: dict[str, Any] | None = None,
) -> dict[str, Any]:
    items_resource = _load_resource(runtime, "items")
    wear_resource = _load_resource(runtime, "wear_counts")
    looks_resource = _load_resource(runtime, "featured_looks")
    history_resource = _load_resource(runtime, "wear_history")
    thumbnails_resource = _load_resource(runtime, "primary_photo_thumbnails")
    items = _merge_wear_counts(items_resource.rows, wear_resource.rows)
    quality = _quality_summary(items, thumbnails_resource.rows, top_n=_top_n(args))
    maintenance = Counter(_maintenance_level(item)["key"] for item in items)
    return {
        **_base_report(
            "overview",
            runtime,
            [items_resource, wear_resource, looks_resource, history_resource, thumbnails_resource],
            sync_result,
            sync_error,
        ),
        "items": {
            "total": len(items),
            "wardrobe": sum(1 for item in items if not _is_watch(item)),
            "watch": sum(1 for item in items if _is_watch(item)),
            "active": sum(1 for item in items if _status(item) in {"active", "激活", ""}),
            "ordered": sum(1 for item in items if _status(item) == "ordered"),
            "maintenance_state": sum(1 for item in items if _number(item.get("maintenance_state")) == 1),
        },
        "featured_looks": {"total": len(looks_resource.rows)},
        "wear_history": {"total": len(history_resource.rows)},
        "photos": _photo_totals(items, thumbnails_resource.rows),
        "maintenance": dict(sorted(maintenance.items())),
        "data_quality": {
            "issue_count": quality["issue_count"],
            "checks": quality["checks"],
        },
    }


def stats_inventory(
    runtime: Any,
    args: dict[str, Any],
    *,
    sync_result: dict[str, Any] | None = None,
    sync_error: dict[str, Any] | None = None,
) -> dict[str, Any]:
    resource = _load_resource(runtime, "items")
    rows = [
        item
        for item in resource.rows
        if _matches_item_filters(item, args, default_kind="wardrobe")
    ]
    group_by = _string_arg(args, "group_by", "brand")
    metric = _string_arg(args, "metric", "amount")
    return {
        **_base_report("inventory", runtime, [resource], sync_result, sync_error),
        **_inventory_result(rows, group_by=group_by, metric=metric, args=args),
    }


def stats_watch(
    runtime: Any,
    args: dict[str, Any],
    *,
    sync_result: dict[str, Any] | None = None,
    sync_error: dict[str, Any] | None = None,
) -> dict[str, Any]:
    items_resource = _load_resource(runtime, "items")
    wear_resource = _load_resource(runtime, "wear_counts")
    rows = [
        item
        for item in _merge_wear_counts(items_resource.rows, wear_resource.rows)
        if _matches_item_filters(item, args, default_kind="watch")
    ]
    group_by = _string_arg(args, "group_by", "brand")
    metric = _string_arg(args, "metric", "amount")
    return {
        **_base_report("watch", runtime, [items_resource, wear_resource], sync_result, sync_error),
        **_inventory_result(rows, group_by=group_by, metric=metric, args=args),
    }


def stats_wear(
    runtime: Any,
    args: dict[str, Any],
    *,
    sync_result: dict[str, Any] | None = None,
    sync_error: dict[str, Any] | None = None,
) -> dict[str, Any]:
    items_resource = _load_resource(runtime, "items")
    wear_resource = _load_resource(runtime, "wear_counts")
    history_resource = _load_resource(runtime, "wear_history")
    category = _string_arg(args, "category", _string_arg(args, "kind", "all")).lower()
    default_kind = category if category in {"wardrobe", "watch"} else None
    rows = [
        item
        for item in _merge_wear_counts(items_resource.rows, wear_resource.rows)
        if _matches_item_filters(item, args, default_kind=default_kind, filter_year=False)
    ]
    period = _string_arg(args, "period", "total")
    period_year = _wear_period_year(args) if period == "year" else None
    history_counts = _wear_history_counts_by_code(history_resource.rows, args, year=period_year) if period == "year" else {}
    if period == "year":
        for item in rows:
            history_count = history_counts.get(_code(item), 0)
            year_field = _number(item.get("wear_year")) or 0
            item["wear_history_count"] = history_count
            item["wear_year_field"] = year_field
            item["wear_effective"] = history_count if history_count > 0 else year_field
        rows = [item for item in rows if (_number(item.get("wear_effective")) or 0) > 0]
        wear_key = "wear_effective"
    else:
        wear_key = "wear_total"
    group_by = _string_arg(args, "group_by", "brand")
    groups = _group_numeric(rows, group_by, wear_key, top_n=_top_n(args))
    top_items = sorted(rows, key=lambda item: _number(item.get(wear_key)) or 0, reverse=True)[: _top_n(args)]
    report = _base_report("wear", runtime, [items_resource, wear_resource, history_resource], sync_result, sync_error)
    warnings = [*report.get("warnings", []), *_wear_stat_warnings(rows, period=period, history_resource=history_resource)]
    return {
        **report,
        "period": period,
        "year": period_year,
        "date_basis": "wear_date",
        "metric": wear_key,
        "total_wear": _round(sum(_number(item.get(wear_key)) or 0 for item in rows)),
        "wear_year_field_sum": _round(sum(_number(item.get("wear_year")) or 0 for item in rows)),
        "wear_history_count": _round(sum(_number(item.get("wear_history_count")) or 0 for item in rows)),
        "item_count": len(rows),
        "worn_item_count": sum(1 for item in rows if (_number(item.get(wear_key)) or 0) > 0),
        "never_worn_count": sum(1 for item in rows if (_number(item.get(wear_key)) or 0) <= 0),
        "warnings": warnings,
        "groups": groups,
        "top_items": [_item_brief(item, extra=[wear_key, "wear_year", "wear_history_count", "last_worn_on"]) for item in top_items],
    }


def stats_maintenance(
    runtime: Any,
    args: dict[str, Any],
    *,
    sync_result: dict[str, Any] | None = None,
    sync_error: dict[str, Any] | None = None,
) -> dict[str, Any]:
    items_resource = _load_resource(runtime, "items")
    wear_resource = _load_resource(runtime, "wear_counts")
    rows = [
        item
        for item in _merge_wear_counts(items_resource.rows, wear_resource.rows)
        if _matches_item_filters(item, args, default_kind=None)
    ]
    level_rows: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for item in rows:
        level_rows[_maintenance_level(item)["key"]].append(item)
    level_counts = {key: len(value) for key, value in sorted(level_rows.items())}
    due_items = [
        item
        for key in ("in_progress", "expired", "red", "orange")
        for item in sorted(level_rows.get(key, []), key=_maintenance_sort_key)
    ][: _top_n(args)]
    group_by = _string_arg(args, "group_by", "level")
    if group_by == "level":
        groups = [
            {"key": key, "count": count, "percent": _percent(count, len(rows))}
            for key, count in sorted(level_counts.items())
        ]
    else:
        groups = _group_count(rows, group_by, top_n=_top_n(args))
    return {
        **_base_report("maintenance", runtime, [items_resource, wear_resource], sync_result, sync_error),
        "item_count": len(rows),
        "level_counts": level_counts,
        "groups": groups,
        "due_items": [_item_brief(item, extra=["wear_maintenance", "wear_threshold"]) for item in due_items],
    }


def stats_history(
    runtime: Any,
    args: dict[str, Any],
    *,
    sync_result: dict[str, Any] | None = None,
    sync_error: dict[str, Any] | None = None,
) -> dict[str, Any]:
    resource = _load_resource(runtime, "wear_history")
    rows = [row for row in resource.rows if _matches_history_filters(row, args)]
    group_by = _string_arg(args, "group_by", "month")
    groups = _group_history(rows, group_by, top_n=_top_n(args))
    return {
        **_base_report("history", runtime, [resource], sync_result, sync_error),
        "record_count": len(rows),
        "groups": groups,
    }


def stats_featured_looks(
    runtime: Any,
    args: dict[str, Any],
    *,
    sync_result: dict[str, Any] | None = None,
    sync_error: dict[str, Any] | None = None,
) -> dict[str, Any]:
    looks_resource = _load_resource(runtime, "featured_looks")
    items_resource = _load_resource(runtime, "items")
    item_map = {_code(item): item for item in items_resource.rows if _code(item)}
    rows = [row for row in looks_resource.rows if _matches_plain_filters(row, args)]
    group_by = _string_arg(args, "group_by", "owner")
    if group_by in {"item", "code", "brand"}:
        groups = _group_look_participation(rows, item_map, group_by, top_n=_top_n(args))
    else:
        groups = _group_count(rows, group_by, top_n=_top_n(args))
    return {
        **_base_report("featured_looks", runtime, [looks_resource, items_resource], sync_result, sync_error),
        "look_count": len(rows),
        "with_photos": sum(1 for row in rows if _has_any_photo(row)),
        "groups": groups,
    }


def stats_photos(
    runtime: Any,
    args: dict[str, Any],
    *,
    sync_result: dict[str, Any] | None = None,
    sync_error: dict[str, Any] | None = None,
) -> dict[str, Any]:
    items_resource = _load_resource(runtime, "items")
    thumbnails_resource = _load_resource(runtime, "primary_photo_thumbnails")
    items = [item for item in items_resource.rows if _matches_item_filters(item, args, default_kind=None)]
    thumbnail_rows = thumbnails_resource.rows
    allowed = {str(row.get("cache_filename") or "") for row in thumbnail_rows if row.get("cache_filename")}
    cached_valid: list[dict[str, Any]] = []
    cache_missing: list[dict[str, Any]] = []
    cache_invalid: list[dict[str, Any]] = []
    for row in thumbnail_rows:
        filename = str(row.get("cache_filename") or "")
        if not filename:
            continue
        target = Path(runtime.photo_cache_dir) / filename
        status = _thumbnail_file_status(target)
        entry = {
            "code": row.get("code"),
            "photo_id": row.get("photo_id"),
            "cache_filename": filename,
            "local_path": str(target),
        }
        if status == "valid":
            cached_valid.append(entry)
        elif status == "missing":
            cache_missing.append(entry)
        else:
            entry["status"] = status
            cache_invalid.append(entry)
    stale_files = []
    photo_dir = Path(runtime.photo_cache_dir)
    if photo_dir.exists():
        for path in sorted(photo_dir.glob("*.jpg")):
            if path.name not in allowed:
                stale_files.append(str(path))
    no_photo = [item for item in items if not _item_has_photo(item)]
    with_photo = [item for item in items if _item_has_photo(item)]
    top_n = _top_n(args)
    return {
        **_base_report("photos", runtime, [items_resource, thumbnails_resource], sync_result, sync_error),
        "items": {
            "total": len(items),
            "with_photo": len(with_photo),
            "no_photo": len(no_photo),
        },
        "thumbnails": {
            "listed": len(thumbnail_rows),
            "cached_valid": len(cached_valid),
            "cache_missing": len(cache_missing),
            "cache_invalid": len(cache_invalid),
            "stale_local_files": len(stale_files),
        },
        "samples": {
            "no_photo": [_item_brief(item) for item in no_photo[:top_n]],
            "cache_missing": cache_missing[:top_n],
            "cache_invalid": cache_invalid[:top_n],
            "stale_local_files": stale_files[:top_n],
        },
    }


def stats_data_quality(
    runtime: Any,
    args: dict[str, Any],
    *,
    sync_result: dict[str, Any] | None = None,
    sync_error: dict[str, Any] | None = None,
) -> dict[str, Any]:
    items_resource = _load_resource(runtime, "items")
    wear_resource = _load_resource(runtime, "wear_counts")
    thumbnails_resource = _load_resource(runtime, "primary_photo_thumbnails")
    rows = [
        item
        for item in _merge_wear_counts(items_resource.rows, wear_resource.rows)
        if _matches_item_filters(item, args, default_kind=None)
    ]
    quality = _quality_summary(rows, thumbnails_resource.rows, top_n=_top_n(args))
    return {
        **_base_report(
            "data_quality",
            runtime,
            [items_resource, wear_resource, thumbnails_resource],
            sync_result,
            sync_error,
        ),
        **quality,
    }


def _load_resource(runtime: Any, name: str) -> ResourceData:
    path = Path(runtime.resource_cache_dir) / f"{name}.json"
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        return ResourceData(name=name, rows=[], meta={"path": str(path)}, exists=False, warning="resource_missing")
    except (OSError, json.JSONDecodeError):
        return ResourceData(name=name, rows=[], meta={"path": str(path)}, exists=False, warning="resource_invalid")
    if not isinstance(payload, dict):
        return ResourceData(name=name, rows=[], meta={"path": str(path)}, exists=True, warning="resource_not_object")
    rows = payload.get(name)
    if rows is None:
        rows = payload.get("data")
    if isinstance(rows, dict) and isinstance(rows.get("items"), list):
        rows = rows["items"]
    if not isinstance(rows, list):
        rows = []
    typed_rows = [row for row in rows if isinstance(row, dict)]
    meta = {
        "path": str(path),
        "owner": payload.get("owner"),
        "schema_version": payload.get("schema_version"),
        "checksum": payload.get("checksum"),
        "count": payload.get("count"),
        "generated_at": payload.get("generated_at"),
        "cached_at": payload.get("cached_at"),
    }
    return ResourceData(name=name, rows=typed_rows, meta=meta, exists=True)


def _base_report(
    report: str,
    runtime: Any,
    resources: list[ResourceData],
    sync_result: dict[str, Any] | None,
    sync_error: dict[str, Any] | None,
) -> dict[str, Any]:
    owner = next((resource.meta.get("owner") for resource in resources if resource.meta.get("owner")), None)
    schema_version = next(
        (resource.meta.get("schema_version") for resource in resources if resource.meta.get("schema_version")),
        None,
    )
    warnings = [
        {"resource": resource.name, "warning": resource.warning}
        for resource in resources
        if resource.warning
    ]
    if sync_error:
        warnings.append({"sync": "stale_or_offline_cache", **sync_error})
    return {
        "report": report,
        "workspace": str(runtime.workspace),
        "owner": owner,
        "schema_version": schema_version,
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "resources": {resource.name: resource.meta for resource in resources},
        "sync": _compact_sync(sync_result),
        "warnings": warnings,
    }


def _compact_sync(sync_result: dict[str, Any] | None) -> dict[str, Any] | None:
    if not sync_result:
        return None
    return {
        "manifest_status": sync_result.get("manifest_status"),
        "partial_sync": sync_result.get("partial_sync"),
        "changed_resources": sync_result.get("changed_resources") or [],
        "reused_resources": sync_result.get("reused_resources") or [],
    }


def _inventory_result(
    rows: list[dict[str, Any]],
    *,
    group_by: str,
    metric: str,
    args: dict[str, Any],
) -> dict[str, Any]:
    total_amount = sum(_price(item) for item in rows)
    if metric in {"wear_total", "wear_year"}:
        groups = _group_numeric(rows, group_by, metric, top_n=_top_n(args))
    elif metric == "count":
        groups = _group_count(rows, group_by, top_n=_top_n(args))
    else:
        groups = _group_numeric(rows, group_by, "amount", top_n=_top_n(args), value_func=_price)
    result: dict[str, Any] = {
        "metric": metric,
        "group_by": group_by,
        "totals": {
            "count": len(rows),
            "amount": _round(total_amount),
            "average_price": _round(total_amount / len(rows)) if rows else 0,
        },
        "groups": groups,
    }
    if _bool_arg(args.get("include_items")):
        result["items"] = [
            _item_brief(item, extra=["price_cny", "price_original", "price_original_currency", "acquired_at"])
            for item in rows[: _top_n(args)]
        ]
    return result


def _group_count(rows: list[dict[str, Any]], group_by: str, *, top_n: int) -> list[dict[str, Any]]:
    counts = Counter(_group_key(row, group_by) for row in rows)
    total = len(rows)
    return [
        {"key": key, "count": count, "percent": _percent(count, total)}
        for key, count in counts.most_common(top_n)
    ]


def _group_numeric(
    rows: list[dict[str, Any]],
    group_by: str,
    metric: str,
    *,
    top_n: int,
    value_func: Any | None = None,
) -> list[dict[str, Any]]:
    grouped: dict[str, dict[str, float]] = defaultdict(lambda: {"count": 0, "value": 0.0})
    total_value = 0.0
    for row in rows:
        value = float(value_func(row) if value_func else (_number(row.get(metric)) or 0))
        key = _group_key(row, group_by)
        grouped[key]["count"] += 1
        grouped[key]["value"] += value
        total_value += value
    result = [
        {
            "key": key,
            "count": int(data["count"]),
            metric: _round(data["value"]),
            "percent": _percent(data["value"], total_value),
        }
        for key, data in grouped.items()
    ]
    return sorted(result, key=lambda row: row.get(metric, 0), reverse=True)[:top_n]


def _group_history(rows: list[dict[str, Any]], group_by: str, *, top_n: int) -> list[dict[str, Any]]:
    counts: Counter[str] = Counter()
    for row in rows:
        if group_by == "month":
            key = (_date_value(row) or "")[:7] or "unknown"
        elif group_by == "date":
            key = _date_value(row) or "unknown"
        elif group_by in {"city", "location"}:
            key = _first_text(row, "city", "location", "place") or "unknown"
        elif group_by in {"scene", "scene_tag"}:
            key = _first_text(row, "scene_tag", "scene", "activity") or "unknown"
        elif group_by == "relax":
            key = str(_number(row.get("relax_index")) or _number(row.get("relax")) or "unknown")
        elif group_by in {"temperature", "temp"}:
            key = _temperature_band(_number(row.get("temp_value")) or _number(row.get("temperature")))
        else:
            key = _group_key(row, group_by)
        counts[key] += 1
    return [
        {"key": key, "count": count, "percent": _percent(count, len(rows))}
        for key, count in counts.most_common(top_n)
    ]


def _group_look_participation(
    looks: list[dict[str, Any]],
    item_map: dict[str, dict[str, Any]],
    group_by: str,
    *,
    top_n: int,
) -> list[dict[str, Any]]:
    counts: Counter[str] = Counter()
    for look in looks:
        for code in _look_item_codes(look):
            item = item_map.get(code, {})
            key = code if group_by in {"item", "code"} else _text(item.get("brand")) or "unknown"
            counts[key] += 1
    return [{"key": key, "count": count} for key, count in counts.most_common(top_n)]


def _quality_summary(
    items: list[dict[str, Any]],
    thumbnail_rows: list[dict[str, Any]],
    *,
    top_n: int,
) -> dict[str, Any]:
    thumbnail_codes = {_text(row.get("code")) for row in thumbnail_rows if _text(row.get("code"))}
    code_counts = Counter(_code(item) for item in items if _code(item))
    checks: dict[str, int] = {}
    samples: dict[str, list[dict[str, Any]]] = {}

    def collect(name: str, predicate: Any) -> None:
        matches = [item for item in items if predicate(item)]
        checks[name] = len(matches)
        samples[name] = [_item_brief(item) for item in matches[:top_n]]

    collect("missing_photo", lambda item: not _item_has_photo(item) and _code(item) not in thumbnail_codes)
    collect("missing_material", lambda item: not _text(item.get("material")))
    collect("missing_primary_color", lambda item: not _text(item.get("primary_color")))
    collect("missing_layer_role", lambda item: not _text(item.get("layer_role")))
    collect("missing_wear_threshold", lambda item: not _is_watch(item) and not (_number(item.get("wear_threshold")) or 0) > 0)
    collect("mixed_language_brand_bucket", _known_mixed_brand_bucket)
    duplicate_codes = [code for code, count in code_counts.items() if count > 1]
    checks["duplicate_code"] = len(duplicate_codes)
    samples["duplicate_code"] = [{"code": code, "count": code_counts[code]} for code in duplicate_codes[:top_n]]
    issue_count = sum(checks.values())
    return {
        "item_count": len(items),
        "issue_count": issue_count,
        "checks": checks,
        "samples": samples,
    }


def _merge_wear_counts(items: list[dict[str, Any]], wear_counts: list[dict[str, Any]]) -> list[dict[str, Any]]:
    wear_by_code = {_code(row): row for row in wear_counts if _code(row)}
    merged: list[dict[str, Any]] = []
    for item in items:
        row = dict(item)
        wear = wear_by_code.get(_code(item), {})
        for key in ("wear_total", "wear_year", "last_worn_on", "wear_maintenance"):
            if key in wear and row.get(key) in (None, ""):
                row[key] = wear[key]
        merged.append(row)
    return merged


def _matches_item_filters(
    item: dict[str, Any],
    args: dict[str, Any],
    *,
    default_kind: str | None,
    filter_year: bool = True,
) -> bool:
    filters = args.get("filters") if isinstance(args.get("filters"), dict) else {}
    kind = _text(filters.get("kind") or args.get("kind") or default_kind).lower()
    if kind == "watch" and not _is_watch(item):
        return False
    if kind == "wardrobe" and _is_watch(item):
        return False
    field_map = {
        "brand": ("brand",),
        "owner": ("owner", "Owner"),
        "loc": ("loc", "location"),
        "role": ("layer_role", "role"),
        "layer_role": ("layer_role", "role"),
        "channel": ("channel",),
        "status": ("status",),
    }
    for filter_key, item_keys in field_map.items():
        expected = filters.get(filter_key, args.get(filter_key))
        if expected in (None, ""):
            continue
        actual = _first_text(item, *item_keys)
        if actual.lower() != _text(expected).lower():
            return False
    year = filters.get("year", args.get("year"))
    if filter_year and year not in (None, "") and str(_date_year(item.get("acquired_at"))) != str(year):
        return False
    query = _text(filters.get("q", args.get("q"))).lower()
    if query:
        haystack = " ".join(_text(item.get(key)).lower() for key in ("code", "brand", "section", "display_name", "name"))
        if query not in haystack:
            return False
    return True


def _matches_history_filters(row: dict[str, Any], args: dict[str, Any]) -> bool:
    filters = args.get("filters") if isinstance(args.get("filters"), dict) else {}
    year = filters.get("year", args.get("year"))
    if year not in (None, "") and str((_date_value(row) or "")[:4]) != str(year):
        return False
    for key in ("city", "location", "scene", "scene_tag"):
        expected = filters.get(key, args.get(key))
        if expected in (None, ""):
            continue
        if _text(expected).lower() not in _first_text(row, key).lower():
            return False
    return True


def _matches_plain_filters(row: dict[str, Any], args: dict[str, Any]) -> bool:
    filters = args.get("filters") if isinstance(args.get("filters"), dict) else {}
    for key in ("owner", "scene", "scene_tag", "style", "brand"):
        expected = filters.get(key, args.get(key))
        if expected in (None, ""):
            continue
        if _text(expected).lower() not in _first_text(row, key).lower():
            return False
    return True


def _group_key(row: dict[str, Any], group_by: str) -> str:
    if group_by in {"owner"}:
        return _first_text(row, "owner", "Owner") or "unknown"
    if group_by in {"role", "layer_role"}:
        return _first_text(row, "layer_role", "role") or "unknown"
    if group_by in {"year", "acquired_year"}:
        return str(_date_year(row.get("acquired_at")) or "unknown")
    if group_by == "kind":
        return "watch" if _is_watch(row) else "wardrobe"
    if group_by == "level":
        return _maintenance_level(row)["key"]
    return _first_text(row, group_by) or "unknown"


def _maintenance_level(item: dict[str, Any]) -> dict[str, Any]:
    if _number(item.get("maintenance_state")) == 1:
        return {"key": "in_progress", "remaining": None, "priority": 0}
    threshold = _number(item.get("wear_threshold"))
    wear = _number(item.get("wear_maintenance")) or 0
    if not threshold or threshold <= 0:
        return {"key": "unset", "remaining": None, "priority": 5}
    remaining = round(threshold - wear, 1)
    if remaining <= 0:
        return {"key": "expired", "remaining": remaining, "priority": 1}
    if remaining <= 2:
        return {"key": "red", "remaining": remaining, "priority": 2}
    if remaining <= 4:
        return {"key": "orange", "remaining": remaining, "priority": 3}
    return {"key": "green", "remaining": remaining, "priority": 4}


def _maintenance_sort_key(item: dict[str, Any]) -> tuple[int, float]:
    level = _maintenance_level(item)
    remaining = level["remaining"]
    return int(level["priority"]), float(remaining if remaining is not None else 999999)


def _photo_totals(items: list[dict[str, Any]], thumbnail_rows: list[dict[str, Any]]) -> dict[str, Any]:
    with_photo = sum(1 for item in items if _item_has_photo(item))
    return {
        "with_photo": with_photo,
        "no_photo": len(items) - with_photo,
        "primary_thumbnail_rows": len(thumbnail_rows),
    }


def _item_has_photo(item: dict[str, Any]) -> bool:
    if isinstance(item.get("primary_photo"), dict):
        return True
    count = _number(item.get("photo_count"))
    return bool(count and count > 0)


def _has_any_photo(row: dict[str, Any]) -> bool:
    for key in ("photos", "photo_ids"):
        if isinstance(row.get(key), list) and row[key]:
            return True
    count = _number(row.get("photo_count"))
    return bool(count and count > 0)


def _look_item_codes(look: dict[str, Any]) -> list[str]:
    raw = look.get("items") or look.get("item_codes") or look.get("codes") or []
    codes: list[str] = []
    if isinstance(raw, list):
        for entry in raw:
            if isinstance(entry, dict):
                code = _code(entry)
            else:
                code = _text(entry)
            if code:
                codes.append(code)
    return codes


def _item_brief(item: dict[str, Any], *, extra: list[str] | None = None) -> dict[str, Any]:
    result = {
        "code": _code(item),
        "brand": item.get("brand"),
        "section": item.get("section") or item.get("display_name") or item.get("name"),
        "owner": item.get("owner") or item.get("Owner"),
        "layer_role": item.get("layer_role"),
    }
    for key in extra or []:
        if key in {"price_cny", "price_original"}:
            result[key] = normalize_price_text(item.get(key))
        elif key == "price_original_currency":
            result[key] = normalize_price_currency(item.get(key), item.get("price_original"))
        else:
            result[key] = item.get(key)
    return result


def _thumbnail_file_status(path: Path) -> str:
    try:
        raw = path.read_bytes()
    except FileNotFoundError:
        return "missing"
    except OSError:
        return "unreadable"
    if not raw:
        return "empty"
    if len(raw) >= 4 and raw.startswith(b"\xff\xd8") and raw.endswith(b"\xff\xd9"):
        return "valid"
    return "not_jpeg"


def _price(item: dict[str, Any]) -> float:
    for key in ("price_cny", "price", "price_original", "actual_price", "amount"):
        value = _number(item.get(key))
        if value is not None:
            return value
    return 0.0


def _number(value: Any) -> float | None:
    if isinstance(value, bool) or value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        cleaned = value.strip().replace(",", "")
        cleaned = re.sub(r"[^0-9.+-]", "", cleaned)
        if not cleaned or cleaned in {"-", "—", "–"}:
            return None
        try:
            return float(cleaned)
        except ValueError:
            return None
    return None


def _text(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def _first_text(row: dict[str, Any], *keys: str) -> str:
    for key in keys:
        value = _text(row.get(key))
        if value:
            return value
    return ""


def _string_arg(args: dict[str, Any], key: str, default: str) -> str:
    value = args.get(key)
    return _text(value) or default


def _bool_arg(value: Any, *, default: bool = False) -> bool:
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return bool(value)
    if isinstance(value, str):
        return value.strip().lower() in {"1", "true", "yes", "y", "on"}
    return default


def _top_n(args: dict[str, Any]) -> int:
    value = _number(args.get("top_n"))
    if value is None:
        return 20
    return max(1, min(int(value), 100))


def _code(item: dict[str, Any]) -> str:
    return _first_text(item, "code", "item_code", "sku")


def _status(item: dict[str, Any]) -> str:
    return _text(item.get("status")).lower()


def _is_watch(item: dict[str, Any]) -> bool:
    kind = _text(item.get("kind")).lower()
    role = _text(item.get("layer_role")).lower()
    category = _text(item.get("category")).lower()
    return kind == "watch" or role == "watch" or category == "watch"


def _date_year(value: Any) -> int | None:
    text = _text(value)
    if len(text) >= 4 and text[:4].isdigit():
        return int(text[:4])
    return None


def _date_value(row: dict[str, Any]) -> str:
    return _first_text(row, "wear_date", "worn_at", "date", "outfit_date", "created_at")


def _wear_period_year(args: dict[str, Any]) -> int:
    filters = args.get("filters") if isinstance(args.get("filters"), dict) else {}
    explicit = filters.get("year", args.get("year"))
    if explicit not in (None, ""):
        parsed = _date_year(str(explicit))
        if parsed is not None:
            return parsed
    return datetime.now().year


def _wear_history_counts_by_code(
    history_rows: list[dict[str, Any]],
    args: dict[str, Any],
    *,
    year: int | None,
) -> dict[str, int]:
    counts: dict[str, int] = defaultdict(int)
    history_args = dict(args)
    filters = dict(history_args.get("filters") or {})
    if year is not None:
        filters["year"] = year
        history_args["year"] = year
    history_args["filters"] = filters
    for row in history_rows:
        if not _matches_history_filters(row, history_args):
            continue
        for item in row.get("items") or []:
            if not isinstance(item, dict):
                continue
            code = _code(item)
            if code:
                counts[code] += 1
    return dict(counts)


def _wear_stat_warnings(rows: list[dict[str, Any]], *, period: str, history_resource: ResourceData) -> list[dict[str, Any]]:
    warnings: list[dict[str, Any]] = []
    if period != "year":
        return warnings
    history_total = sum(int(_number(item.get("wear_history_count")) or 0) for item in rows)
    year_total = sum(_number(item.get("wear_year")) or 0 for item in rows)
    if history_total != year_total:
        warnings.append(
            {
                "code": "wear_year_history_mismatch",
                "message": "wear_year_field_sum does not match wear_history_count for the selected year.",
                "wear_year_field_sum": _round(year_total),
                "wear_history_count": _round(history_total),
            }
        )
    if not history_resource.exists:
        warnings.append(
            {
                "code": "wear_history_resource_missing",
                "message": "wear_history resource is missing; annual wear output falls back to wear_year fields.",
            }
        )
    return warnings


def _temperature_band(value: float | None) -> str:
    if value is None:
        return "unknown"
    if value < 10:
        return "<10"
    if value < 18:
        return "10-17"
    if value < 25:
        return "18-24"
    if value < 30:
        return "25-29"
    return ">=30"


def _known_mixed_brand_bucket(item: dict[str, Any]) -> bool:
    brand = _text(item.get("brand")).lower()
    return "vacheron" in brand and "江诗丹顿" in brand


def _round(value: float) -> float:
    return round(float(value), 2)


def _percent(value: float, total: float) -> float:
    if not total:
        return 0.0
    return round(float(value) * 100 / float(total), 2)
