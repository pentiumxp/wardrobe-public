from __future__ import annotations

from decimal import Decimal, InvalidOperation
import re
import unicodedata


def _text(value: object) -> str:
    if value is None:
        return ""
    return str(value).strip()


def _key(value: object) -> str:
    return re.sub(r"\s+", " ", _text(value)).strip().casefold()


BRAND_ALIASES = {
    "vc": "Vacheron Constantin",
    "江诗丹顿": "Vacheron Constantin",
    "vacheron constantin": "Vacheron Constantin",
    "vacheron constantin 江诗丹顿": "Vacheron Constantin",
    "江诗丹顿 vacheron constantin": "Vacheron Constantin",
}


def normalize_item_brand(value: object) -> str:
    brand = _text(value)
    key = _key(brand)
    if not key:
        return ""
    alias = BRAND_ALIASES.get(key)
    if alias:
        return alias
    if "江诗丹顿" in brand and "vacheron" in key and "constantin" in key:
        return "Vacheron Constantin"
    return brand


def normalize_price_text(value: object) -> str:
    text = _text(value)
    if not text:
        return ""
    normalized = unicodedata.normalize("NFKC", text)
    match = re.search(r"[-+]?\d[\d,]*(?:\.\d+)?", normalized)
    if not match:
        return normalized.strip()
    raw_number = match.group(0).replace(",", "")
    try:
        amount = Decimal(raw_number)
    except InvalidOperation:
        return normalized.strip()
    suffix = normalized[match.end():].lstrip()
    if suffix.startswith("万"):
        amount *= Decimal("10000")
    plain = format(amount, "f")
    if "." in plain:
        plain = plain.rstrip("0").rstrip(".")
    return "0" if plain == "-0" else plain


def normalize_price_currency(value: object, price_value: object = None) -> str:
    explicit = _currency_code_from_text(value)
    if explicit:
        return explicit
    return _currency_code_from_text(price_value)


def _currency_code_from_text(value: object) -> str:
    text = _text(value)
    if not text:
        return ""
    normalized = unicodedata.normalize("NFKC", text)
    upper = normalized.upper()
    compact = re.sub(r"\s+", "", upper)
    checks = [
        ("HKD", ("HKD", "HK$", "港币", "港幣", "港元")),
        ("TWD", ("TWD", "NT$", "台币", "台幣", "新台币", "新台幣")),
        ("USD", ("USD", "US$", "美元")),
        ("EUR", ("EUR", "€", "欧元", "歐元")),
        ("GBP", ("GBP", "£", "英镑", "英鎊")),
        ("CHF", ("CHF", "SFR", "瑞郎", "瑞士法郎")),
        ("SGD", ("SGD", "S$", "新币", "新幣", "新加坡元")),
        ("JPY", ("JPY", "円", "日元", "日币", "日幣")),
        ("CNY", ("CNY", "RMB", "人民币", "人民幣", "￥", "¥", "元")),
    ]
    for code, aliases in checks:
        if any(alias.upper() in upper or alias.upper() in compact for alias in aliases):
            return code
    if re.fullmatch(r"[A-Z]{3}", compact):
        return compact
    return ""
