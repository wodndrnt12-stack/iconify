"""
Iconify 전체 아이콘 데이터를 로컬 iconify_db.json으로 저장.
실행: python iconify_db.py
"""

import json
import time
import sys

# Windows cp949 콘솔 인코딩 문제 방지
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

try:
    import httpx
    def get(url):
        return httpx.get(url, timeout=30)
except ImportError:
    import requests
    class _Resp:
        def __init__(self, r): self._r = r
        def json(self): return self._r.json()
        @property
        def status_code(self): return self._r.status_code
    def get(url):
        return _Resp(requests.get(url, timeout=30))

BASE = "https://api.iconify.design"


def fetch_collections():
    resp = get(f"{BASE}/collections")
    if resp.status_code != 200:
        print(f"collections API 실패: {resp.status_code}", file=sys.stderr)
        sys.exit(1)
    return resp.json()  # { prefix: { name, total, ... } }


def fetch_collection(prefix):
    resp = get(f"{BASE}/collection?prefix={prefix}")
    if resp.status_code != 200:
        return None
    return resp.json()


def build_records(prefix, data):
    # 실제 API 응답 구조:
    # categories: { "Category Name": ["icon1", "icon2"] }
    # uncategorized: ["icon1", "icon2"]
    # hidden: ["icon1", "icon2"]
    # aliases: { "alias_name": "parent_name" }  ← 문자열 값

    categories_raw = data.get("categories", {})
    uncategorized = data.get("uncategorized", [])
    hidden = data.get("hidden", [])
    aliases_raw = data.get("aliases", {})

    # 아이콘 이름 → 카테고리 매핑
    icon_to_cats = {}
    for cat_name, icon_names in categories_raw.items():
        if isinstance(icon_names, list):
            for name in icon_names:
                icon_to_cats.setdefault(name, []).append(cat_name)

    # 전체 아이콘 이름 수집 (categories + uncategorized + hidden)
    all_icon_names = set()
    for icon_names in categories_raw.values():
        if isinstance(icon_names, list):
            all_icon_names.update(icon_names)
    all_icon_names.update(uncategorized if isinstance(uncategorized, list) else [])
    all_icon_names.update(hidden if isinstance(hidden, list) else [])

    records = []

    # 실제 아이콘
    for name in all_icon_names:
        records.append({
            "icon_id": f"{prefix}:{name}",
            "collection": prefix,
            "name": name,
            "tags": [],
            "categories": icon_to_cats.get(name, []),
            "aliases": [],
            "svg_url": f"{BASE}/{prefix}/{name}.svg",
        })

    # 별칭: aliases_raw 값이 문자열(parent 이름) 또는 딕셔너리 모두 처리
    for alias_name, alias_val in aliases_raw.items():
        if isinstance(alias_val, str):
            parent = alias_val
        elif isinstance(alias_val, dict):
            parent = alias_val.get("parent", "")
        else:
            continue
        records.append({
            "icon_id": f"{prefix}:{alias_name}",
            "collection": prefix,
            "name": alias_name,
            "tags": [],
            "categories": icon_to_cats.get(alias_name, []),
            "aliases": [f"{prefix}:{parent}"] if parent else [],
            "svg_url": f"{BASE}/{prefix}/{alias_name}.svg",
        })

    return records


def safe_str(s):
    """cp949 콘솔에서 출력 불가 문자를 ? 로 대체"""
    return s.encode(sys.stdout.encoding or 'utf-8', errors='replace').decode(sys.stdout.encoding or 'utf-8', errors='replace')


def main():
    print("컬렉션 목록 로딩 중...")
    collections = fetch_collections()
    prefixes = list(collections.keys())
    total_cols = len(prefixes)
    print(f"총 {total_cols}개 컬렉션 발견")

    all_records = []
    skipped = []

    for i, prefix in enumerate(prefixes, 1):
        col_info = collections[prefix]
        col_name = col_info.get("name", prefix) if isinstance(col_info, dict) else prefix
        col_name_safe = safe_str(col_name)
        print(f"[{i}/{total_cols}] {prefix} 처리중... ({col_name_safe})", end="", flush=True)

        data = fetch_collection(prefix)
        if data is None:
            # 재시도 1회
            time.sleep(0.5)
            data = fetch_collection(prefix)

        if data is None:
            print(" ⚠ 스킵")
            skipped.append(prefix)
            continue

        records = build_records(prefix, data)
        all_records.extend(records)
        print(f" → {len(records)}개 아이콘")

    output_path = "iconify_db.json"
    print(f"\n{output_path} 저장 중... ({len(all_records):,}개 레코드)")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_records, f, ensure_ascii=False, separators=(",", ":"))

    print(f"\n완료: 총 {total_cols}개 컬렉션, {len(all_records):,}개 아이콘 저장 → {output_path}")
    if skipped:
        print(f"스킵된 컬렉션 ({len(skipped)}개): {', '.join(skipped)}")


if __name__ == "__main__":
    main()
